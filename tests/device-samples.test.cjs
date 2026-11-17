const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const { test } = require("node:test");
const { parse } = require("@vue/compiler-sfc");
const source = fs.readFileSync(path.join(__dirname, "../src/components/sections/device/DeviceHome.vue"), "utf8");
const script = parse(source).descriptor.script.content.replace(/^import[\s\S]*?;\r?$/gm, "").replace("export default", "globalThis.component =");
const audio = (name, size = 20) => ({ name, size });

function fixture() {
  const calls = [], uploads = [];
  const banks = {};
  for (const bank of ["A", "B", "C"]) {
    banks[bank] = {};
    for (const pad of ["TopLeft", "TopRight", "BottomLeft", "BottomRight"]) banks[bank][pad] = { samples: [] };
  }
  const sampler = { banks, processing_state: { progress: null, last_error: null } };
  const status = { mixers: { one: { sampler } } };
  const f = { calls, uploads, sampler, bank: "A", processing: null, onAdd: null, failUpload: "", failDecode: "", failRemove: false };
  const context = {
    ScribbleScreen: {}, ColourSwatch: {}, DeviceViewChrome: {}, LogoX: {}, CustomScreenView: {}, dragWindow: () => {}, inApp: () => false,
    store: { replaceData: () => {} },
    getBaseHTTPAddress: () => "/",
    setTimeout: resolve => resolve(),
    FormData: class { append(key, file) { this.file = file; } },
    fetch: async (url, request) => {
      assert.equal(url, "/sample-upload");
      const name = request.body.file.name;
      uploads.push(name);
      if (name === f.failUpload) throw Error("Upload failed");
      return { ok: true, json: async () => ({ name }) };
    },
    websocket: {
      async get_status() {
        calls.push("status");
        if (f.processing && --f.processing.polls === 0) {
          const { bank, pad, name } = f.processing;
          if (name === f.failDecode) sampler.processing_state.last_error = "Cannot decode this audio";
          else banks[bank][pad].samples.push({ name });
          sampler.processing_state.progress = null;
          f.processing = null;
        }
        return { Status: status };
      },
      async send_command(serial, command) {
        assert.equal(serial, "one");
        calls.push(JSON.parse(JSON.stringify(command)));
        if (command.ClearSampleProcessError) sampler.processing_state.last_error = null;
        if (command.AddSample) {
          assert.equal(f.processing, null, "The previous gain calculation must finish first");
          const [bank, pad, name] = command.AddSample;
          f.processing = { bank, pad, name, polls: 2 };
          sampler.processing_state.progress = 10;
          if (f.onAdd) f.onAdd();
        }
        if (command.RemoveSampleByIndex) {
          if (f.failRemove) throw Error("Removal failed");
          const [bank, pad, index] = command.RemoveSampleByIndex;
          banks[bank][pad].samples.splice(index, 1);
        }
      },
    },
  };
  vm.runInNewContext(script, context);
  f.component = { ...context.component.methods, selection: { kind: "pad", id: "TopLeft" },
    sampleImport: { busy: false, errors: [] }, sampleDeleteBusy: false, sampleError: "",
    serial: () => "one", activeBank: () => f.bank, $t: key => key,
  };
  return f;
}

test("multiple uploads wait for each gain calculation and keep the original bank/pad", async () => {
  const f = fixture();
  f.onAdd = () => { f.bank = "C"; f.component.selection.id = "BottomRight"; };
  await f.component.importSamples([audio("หนึ่ง.wav"), audio("two.mp3"), audio("three.flac")]);
  assert.deepEqual(f.uploads, ["หนึ่ง.wav", "two.mp3", "three.flac"]);
  assert.deepEqual(f.calls.filter(c => c.AddSample), [
    { AddSample: ["A", "TopLeft", "หนึ่ง.wav"] }, { AddSample: ["A", "TopLeft", "two.mp3"] }, { AddSample: ["A", "TopLeft", "three.flac"] },
  ]);
  assert.equal(f.sampler.banks.A.TopLeft.samples.length, 3);
  assert.equal(f.sampler.banks.C.BottomRight.samples.length, 0);
  assert.equal(f.component.sampleImport.added, 3);
  assert.equal(f.component.sampleImport.busy, false);
});

test("invalid/oversize files and upload errors are reported while later files still import", async () => {
  const f = fixture(); f.failUpload = "broken.wav";
  await f.component.importSamples([audio("notes.txt"), audio("large.wav", 129 * 1024 * 1024), audio("broken.wav"), audio("good.OGG")]);
  assert.deepEqual(f.uploads, ["broken.wav", "good.OGG"]);
  assert.equal(f.component.sampleImport.errors.length, 3);
  assert.equal(f.component.sampleImport.added, 1);
  assert.equal(f.component.sampleImport.done, 4);
  assert.equal(f.component.sampleImport.busy, false);
});

test("decode errors do not prevent the next file from importing", async () => {
  const f = fixture(); f.failDecode = "corrupt.wav";
  await f.component.importSamples([audio("corrupt.wav"), audio("good.wav")]);
  assert.equal(f.component.sampleImport.added, 1);
  assert.match(f.component.sampleImport.errors[0], /Cannot decode/);
  assert.deepEqual(f.sampler.banks.A.TopLeft.samples, [{ name: "good.wav" }]);
});

test("removing one indexed duplicate only removes it from the selected pad", async () => {
  const f = fixture();
  f.sampler.banks.A.TopLeft.samples = [{ name: "same.wav" }, { name: "same.wav" }, { name: "other.wav" }];
  f.sampler.banks.C.BottomRight.samples = [{ name: "same.wav" }];
  await f.component.removePadSample(1);
  assert.deepEqual(f.calls[0], { RemoveSampleByIndex: ["A", "TopLeft", 1] });
  assert.deepEqual(f.sampler.banks.A.TopLeft.samples, [{ name: "same.wav" }, { name: "other.wav" }]);
  assert.equal(f.sampler.banks.C.BottomRight.samples.length, 1);
  assert.equal(f.uploads.length, 0);
  assert.equal(f.component.sampleDeleteBusy, false);
});

test("removal errors preserve the list and release the busy state", async () => {
  const f = fixture(); f.failRemove = true;
  f.sampler.banks.A.TopLeft.samples = [{ name: "keep.wav" }];
  await f.component.removePadSample(0);
  assert.equal(f.component.sampleError, "Removal failed");
  assert.equal(f.sampler.banks.A.TopLeft.samples.length, 1);
  assert.equal(f.component.sampleDeleteBusy, false);
});
