const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const { test } = require("node:test");
const { parse } = require("@vue/compiler-sfc");
const source = fs.readFileSync(path.join(__dirname, "../src/components/sections/mic/Denoise.vue"), "utf8");
const script = parse(source).descriptor.script.content.replace(/^import[\s\S]*?;\r?$/gm, "").replace("export default", "globalThis.component =");

const endpoints = [
  { id: "cable-a", name: "CABLE-A Input", kind: "SendOutput", available: true, reason: null },
  { id: "Game", name: "Game", kind: "MonitorReturn", available: true, reason: null },
];
const tick = () => new Promise(resolve => setImmediate(resolve));
const never = () => new Promise(() => {});

function denoise(config = {}, extra = {}) {
  return {
    config: { send_output: null, monitor_return: null, send_enabled: false, monitor_enabled: false, ...config },
    available: true, state: "Off", send_active: false, monitor_active: false,
    send_ready: !!config.send_output, monitor_ready: !!config.monitor_return,
    endpoints, error: null, ...extra,
  };
}

// Fake daemon. Per command it can: reject, stall until released, never answer, or stay "Starting".
// Commands always apply to the device they were sent to.
function fixture(devices) {
  const f = {
    devices, active: "one", commands: [],
    reject: null,        // command name -> error text
    stall: null,         // promise every command waits for
    hang: null,          // "command" | "status": that call never answers
    startingPolls: 0,    // status polls a Send enable stays "Starting" (Infinity = forever)
    offHangs: false,     // switching a branch OFF leaves it "Starting" and still on
  };
  const context = {
    setTimeout, clearTimeout,
    store: {
      getActiveSerial: () => f.active,
      getActiveDevice: () => f.devices[f.active],
      replaceData: response => Object.assign(f.devices, JSON.parse(JSON.stringify(response.Status.mixers))),
    },
    websocket: {
      async get_status() {
        if (f.hang === "status") return never();
        for (const device of Object.values(f.devices)) {
          const d = device.denoise;
          if (d && d.state === "Starting" && --f.startingPolls <= 0) {
            d.state = "Running";
            d.send_active = true;
          }
        }
        return { Status: { mixers: JSON.parse(JSON.stringify(f.devices)) } };
      },
      async send_command(serial, command) {
        f.commands.push({ serial, command: JSON.parse(JSON.stringify(command)) });
        if (f.hang === "command") return never();
        if (f.stall) await f.stall;
        const name = typeof command === "string" ? command : Object.keys(command)[0];
        if (f.reject && f.reject[name]) throw { Error: f.reject[name] };
        const d = f.devices[serial].denoise;
        if (command.SetDenoiseEnabled) {
          const [branch, on] = command.SetDenoiseEnabled;
          if (!on && f.offHangs) {
            d.state = "Starting";
            return "Ok";
          }
          if (branch === "Send" && on && f.startingPolls > 0) {
            d.state = "Starting";
            return "Ok";
          }
          if (branch === "Send") d.send_active = on && d.send_ready;
          if (branch === "Monitor") d.monitor_active = on && d.monitor_ready;
        }
        if (command.SetDenoiseConfig) {
          d.config = command.SetDenoiseConfig;
          d.send_ready = !!d.config.send_output;
          d.monitor_ready = !!d.config.monitor_return;
          d.send_active = false;
          d.monitor_active = false;
        }
        return "Ok";
      },
    },
  };
  vm.runInNewContext(script, context);
  const options = context.component;
  const c = { ...options.data(), $t: key => key, timeoutMs: 60, pollMs: 1 };
  for (const name of Object.keys(options.methods)) c[name] = options.methods[name].bind(c);
  // What Vue does when the active serial changes / the card goes away
  f.switchTo = serial => { f.active = serial; options.watch.activeSerial.call(c); };
  f.unmount = () => options.unmounted.call(c);
  f.component = c;
  f.state = serial => f.devices[serial || f.active].denoise;
  f.sent = () => f.commands.map(x => x.command);
  return f;
}

test("setup_required_stays_off", async () => {
  const f = fixture({ one: { denoise: denoise() } });
  await f.component.toggleDenoise("Monitor");
  assert.equal(f.component.setupOpen, true, "Clicking an unconfigured switch opens setup");
  await tick();
  await f.component.toggleDenoise("Send");
  const unconfigured = f.state();
  assert.equal(unconfigured.monitor_active, false);
  assert.equal(unconfigured.send_active, false);
  assert.equal(f.sent().some(c => c.SetDenoiseEnabled), false);
  assert.equal(f.component.rowText("Monitor"), "message.device.denoiseChooseReturn");
});

test("send_works_without_monitor_setup", async () => {
  const f = fixture({ one: { denoise: denoise({ send_output: "cable-a" }) } });
  await f.component.toggleDenoise("Send");
  const sendOnly = f.state();
  assert.equal(sendOnly.send_active, true);
  assert.equal(sendOnly.monitor_active, false);
  assert.equal(f.component.active("Send"), true);
  assert.equal(f.component.busy(), false);
  assert.deepEqual(f.sent(), [{ SetDenoiseEnabled: ["Send", true] }]);
});

test("rejection_does_not_flip_switch", async () => {
  const f = fixture({ one: { denoise: denoise({ send_output: "cable-a" }) } });
  f.reject = { SetDenoiseEnabled: "Send output is busy" };
  await f.component.toggleDenoise("Send");
  const afterRejectedEnable = f.state();
  assert.equal(afterRejectedEnable.send_active, false);
  assert.equal(f.component.active("Send"), false);
  assert.equal(f.component.error, "Send output is busy");
  assert.equal(f.component.busy(), false);
});

test("pending_blocks_duplicates", async () => {
  const f = fixture({ one: { denoise: denoise({ send_output: "cable-a" }) } });
  let release;
  f.stall = new Promise(resolve => release = resolve);
  const first = f.component.toggleDenoise("Send");
  assert.equal(f.component.busy(), true);
  await f.component.toggleDenoise("Send");
  await f.component.toggleDenoise("Send");
  release();
  await first;
  const duplicateEnableCommandCount = f.sent().filter(c => c.SetDenoiseEnabled).length;
  assert.equal(duplicateEnableCommandCount, 1);
  assert.equal(f.state().send_active, true);
});

test("one request per card: Monitor, Save and Refresh wait for Send", async () => {
  const f = fixture({ one: { denoise: denoise({ send_output: "cable-a", monitor_return: "Game" }) } });
  let release;
  f.stall = new Promise(resolve => release = resolve);
  const first = f.component.toggleDenoise("Send");
  await f.component.toggleDenoise("Monitor");
  await f.component.saveSetup();
  await f.component.refreshEndpoints();
  assert.deepEqual(f.sent(), [{ SetDenoiseEnabled: ["Send", true] }]);
  release();
  await first;
  f.stall = null;
  await f.component.toggleDenoise("Monitor");
  assert.equal(f.state().monitor_active, true, "Monitor works once Send has finished");
});

test("device_switch_ignores_old_reply", async () => {
  const f = fixture({
    one: { denoise: denoise({ send_output: "cable-a" }) },
    two: { denoise: denoise({ send_output: "cable-a" }) },
  });
  let release;
  f.stall = new Promise(resolve => release = resolve);
  f.reject = { SetDenoiseEnabled: "Old device failed" };
  const first = f.component.toggleDenoise("Send");
  f.switchTo("two");
  release();
  await first;
  const newDevice = f.state("two");
  assert.equal(newDevice.send_active, false);
  assert.equal(f.component.error, "", "An error from the old device is not shown on the new one");
  assert.equal(f.commands[0].serial, "one");
});

test("A -> B -> A: B works, form follows the device, and A's late reply changes nothing", async () => {
  const f = fixture({
    one: { denoise: denoise({ send_output: "cable-a" }) },
    two: { denoise: denoise({ send_output: "cable-b", monitor_return: "Game" }) },
  });
  f.component.openSetup();
  await tick();
  assert.equal(f.component.form.send_output, "cable-a");
  let release;
  f.stall = new Promise(resolve => release = resolve);
  const stuckOnA = f.component.toggleDenoise("Send");

  f.switchTo("two");
  assert.equal(f.component.busy(), false, "B is not blocked by A's request");
  assert.equal(f.component.setupOpen, false);
  assert.deepEqual(JSON.parse(JSON.stringify(f.component.form)), { send_output: "cable-b", monitor_return: "Game" });
  f.stall = null;
  await f.component.toggleDenoise("Monitor");
  assert.equal(f.state("two").monitor_active, true);
  assert.equal(f.commands.at(-1).serial, "two");

  f.switchTo("one");
  assert.equal(f.component.busy(), false);
  assert.equal(f.component.form.send_output, "cable-a");
  f.reject = { SetDenoiseEnabled: "Late failure from the first request" };
  release();
  await stuckOnA;
  assert.equal(f.component.error, "", "The old request's error is dropped");
  assert.equal(f.component.op, null, "The old request's finally does not touch the new state");
});

test("unmount drops replies that arrive afterwards", async () => {
  const f = fixture({ one: { denoise: denoise({ send_output: "cable-a" }) } });
  let release;
  f.stall = new Promise(resolve => release = resolve);
  f.reject = { SetDenoiseEnabled: "Too late" };
  const pending = f.component.toggleDenoise("Send");
  f.unmount();
  release();
  await pending;
  assert.equal(f.component.error, "");
});

test("old_backend_is_unavailable", async () => {
  const f = fixture({ one: {} });
  assert.equal(f.component.available(), false);
  await f.component.toggleDenoise("Send");
  await f.component.toggleDenoise("Monitor");
  f.component.openSetup();
  await f.component.saveSetup();
  assert.equal(f.commands.length, 0);
  assert.equal(f.component.setupOpen, false);
  assert.equal(f.component.active("Send"), false);
  assert.equal(f.component.active("Monitor"), false);
});

test("new backend still checking endpoints keeps switches off but allows refresh", async () => {
  const f = fixture({ one: { denoise: denoise({ send_output: "cable-a" }, { available: false }) } });
  await f.component.toggleDenoise("Send");
  assert.equal(f.sent().some(c => c.SetDenoiseEnabled), false);
  await f.component.refreshEndpoints();
  assert.deepEqual(f.sent(), ["RefreshDenoiseEndpoints"]);
});

test("saving_setup_does_not_enable_branches", async () => {
  const f = fixture({ one: { denoise: denoise() } });
  f.component.openSetup();
  await tick();
  assert.deepEqual(f.sent(), ["RefreshDenoiseEndpoints"], "Opening setup only refreshes the endpoint list");
  f.component.form = { send_output: "cable-a", monitor_return: "Game" };
  await f.component.saveSetup();
  const enableCommandsDuringSetup = f.sent().filter(c => c.SetDenoiseEnabled && c.SetDenoiseEnabled[1]);
  assert.equal(enableCommandsDuringSetup.length, 0);
  const saved = f.sent().find(c => c.SetDenoiseConfig).SetDenoiseConfig;
  assert.equal(saved.send_enabled, false);
  assert.equal(saved.monitor_enabled, false);
  assert.equal(f.state().send_active, false);
  assert.equal(f.state().monitor_active, false);
  const commands = f.sent();
  assert.equal(commands.some(c => c.SetRouter || c.SetVolume || c.SetGateActive), false);
});

test("changing a running branch's setup switches it off first", async () => {
  const f = fixture({ one: { denoise: denoise({ send_output: "cable-a", send_enabled: true }, { send_active: true }) } });
  f.component.form = { send_output: "cable-b", monitor_return: null };
  await f.component.saveSetup();
  assert.deepEqual(f.sent()[0], { SetDenoiseEnabled: ["Send", false] });
  assert.equal(f.sent()[1].SetDenoiseConfig.send_enabled, false);
  assert.equal(f.state().send_active, false);
});

test("a rejected OFF stops Save before SetDenoiseConfig", async () => {
  const f = fixture({ one: { denoise: denoise({ send_output: "cable-a" }, { send_active: true }) } });
  f.reject = { SetDenoiseEnabled: "Worker did not stop" };
  f.component.form = { send_output: "cable-b", monitor_return: null };
  await f.component.saveSetup();
  assert.equal(f.sent().some(c => c.SetDenoiseConfig), false);
  assert.equal(f.component.error, "Worker did not stop");
  assert.equal(f.component.busy(), false);
});

test("an OFF that stays Starting until the deadline stops Save before SetDenoiseConfig", async () => {
  const f = fixture({ one: { denoise: denoise({ send_output: "cable-a" }, { send_active: true }) } });
  f.offHangs = true;
  f.startingPolls = Infinity;
  f.component.form = { send_output: "cable-b", monitor_return: null };
  await f.component.saveSetup();
  assert.deepEqual(f.sent(), [{ SetDenoiseEnabled: ["Send", false] }]);
  assert.equal(f.component.error, "message.device.denoiseTimeout");
  assert.equal(f.component.op, null);
});

test("starting is not shown as on until the daemon reports running", async () => {
  const f = fixture({ one: { denoise: denoise({ send_output: "cable-a" }) } });
  f.startingPolls = 3;
  const run = f.component.toggleDenoise("Send");
  await tick();
  assert.equal(f.component.active("Send"), false);
  assert.equal(f.component.busy(), true);
  await f.component.toggleDenoise("Send");
  await run;
  assert.equal(f.state().state, "Running");
  assert.equal(f.component.active("Send"), true);
  assert.equal(f.sent().filter(c => c.SetDenoiseEnabled).length, 1);
});

test("starting that never ends times out, stays off and frees the card", async () => {
  const f = fixture({ one: { denoise: denoise({ send_output: "cable-a" }) } });
  f.startingPolls = Infinity;
  await f.component.toggleDenoise("Send");
  assert.equal(f.component.active("Send"), false);
  assert.equal(f.component.error, "message.device.denoiseTimeout");
  assert.equal(f.component.op, null);
});

test("a command that never answers times out and frees the card", async () => {
  const f = fixture({ one: { denoise: denoise({ send_output: "cable-a" }) } });
  f.hang = "command";
  const started = Date.now();
  await f.component.toggleDenoise("Send");
  assert.ok(Date.now() - started < 1000, "Gives up at the deadline");
  assert.equal(f.component.active("Send"), false);
  assert.equal(f.component.error, "message.device.denoiseTimeout");
  assert.equal(f.component.busy(), false);
  f.hang = null;
  await f.component.toggleDenoise("Send");
  assert.equal(f.state().send_active, true, "The card works again afterwards");
});

test("a status request that never answers times out and frees the card", async () => {
  const f = fixture({ one: { denoise: denoise({ send_output: "cable-a" }) } });
  f.hang = "status";
  await f.component.refreshEndpoints();
  assert.equal(f.component.error, "message.device.denoiseTimeout");
  assert.equal(f.component.busy(), false);
  await f.component.saveSetup();
  assert.equal(f.sent().filter(c => c.SetDenoiseConfig).length, 1, "Save still sends, then times out waiting for status");
  assert.equal(f.component.error, "message.device.denoiseTimeout");
});

test("active_branches_explain_megaphone_bypass_only_with_effective_fx", () => {
  const device = {
    effects: { is_enabled: true, current: { megaphone: { is_enabled: true, style: "Radio" } } },
    denoise: denoise({ send_output: "cable-a", monitor_return: "Game" }, { send_active: true, monitor_active: true }),
  };
  const f = fixture({ one: device });
  const text = "message.device.denoiseMegaphoneBypass";
  assert.equal(f.component.rowText("Send"), text);
  assert.equal(f.component.rowText("Monitor"), text);
  assert.equal(f.component.active("Send"), true, "Bypass keeps the chosen switch ON");
  device.denoise.monitor_active = false;
  assert.equal(f.component.rowText("Monitor"), "message.device.denoiseMonitorHint");
  device.effects.is_enabled = false;
  assert.equal(f.component.rowText("Send"), "message.device.denoiseSendHint");
  device.effects.is_enabled = true;
  device.effects.current.megaphone.is_enabled = false;
  assert.equal(f.component.rowText("Send"), "message.device.denoiseSendHint");
  delete device.effects;
  assert.equal(f.component.rowText("Send"), "message.device.denoiseSendHint");
});
