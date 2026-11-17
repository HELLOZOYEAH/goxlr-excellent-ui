const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const { parse } = require("@vue/compiler-sfc");

// Exercise the actual SFC pointer handlers with a fake store; no daemon or audio commands.
const source = fs.readFileSync(path.join(__dirname, "../src/components/sections/device/DeviceHome.vue"), "utf8");
const script = parse(source).descriptor.script.content
  .replace(/^import[\s\S]*?;\r?$/gm, "")
  .replace("export default", "globalThis.component =");
function fixture(fit = 1) {
  const updates = [], pauses = [], resumes = [];
  // Child components are stripped with the imports; DeviceHome only needs the names to exist
  const context = { ScribbleScreen: {}, ColourSwatch: {}, DeviceViewChrome: {}, LogoX: {}, CustomScreenView: {}, dragWindow: () => {}, inApp: () => false, store: { pausePatchPath: p => pauses.push(p), resumePatchPath: p => resumes.push(p) } };
  vm.runInNewContext(script, context);
  const component = { ...context.component.methods, drag: null, fit,
    volume: () => 80, volumePath: f => "/volume/" + f,
    setVolume: (f, value) => updates.push([f, value]), select: () => {},
  };
  const track = { getBoundingClientRect: () => ({ height: 262 * fit, bottom: 362 * fit }), setPointerCapture: () => {} };
  const cap = { parentElement: track };
  const event = (y, onCap = true, pointerId = 1) => ({ clientY: y, button: 0, pointerId,
    currentTarget: track, target: { closest: () => onCap ? cap : null } });
  return { component, updates, pauses, resumes, event };
}

test("clicking the top of a track does not change volume, even when moved", () => {
  const f = fixture();
  f.component.faderDown(f.event(100, false), "A");
  f.component.faderMove(f.event(90, false), "A");
  f.component.faderUp(f.event(90, false), "A");
  assert.deepEqual(f.updates, []);
  assert.deepEqual(f.pauses, []);
  assert.equal(f.component.drag, null);
});

test("pressing or slightly moving on a cap sends no volume command", () => {
  const f = fixture();
  f.component.faderDown(f.event(220), "A");
  f.component.faderMove(f.event(218), "A");
  f.component.faderUp(f.event(218), "A");
  assert.deepEqual(f.updates, []);
  assert.deepEqual(f.pauses, []);
  assert.deepEqual(f.resumes, []);
});

test("dragging adjusts from the original level without jumping to the pointer", () => {
  const f = fixture();
  f.component.faderDown(f.event(220), "A");
  f.component.faderMove(f.event(200), "A");
  assert.deepEqual(f.updates, [["A", 105]]);
  assert.deepEqual(f.pauses, ["/volume/A"]);
  f.component.faderMove(f.event(230), "A");
  assert.deepEqual(f.updates.at(-1), ["A", 67.5]);
  f.component.faderUp(f.event(230), "A");
  assert.deepEqual(f.resumes, ["/volume/A"]);
  f.component.faderMove(f.event(180), "A");
  assert.equal(f.updates.length, 2);
});

test("unrelated pointers, faders and right clicks cannot move or end the drag", () => {
  const f = fixture();
  f.component.faderDown({ ...f.event(220), button: 2 }, "A");
  assert.equal(f.component.drag, null);
  f.component.faderDown(f.event(220), "A");
  f.component.faderMove(f.event(100, true, 2), "A");
  f.component.faderMove(f.event(100), "B");
  f.component.faderUp(f.event(100, true, 2), "A");
  f.component.faderUp(f.event(100), "B");
  assert.deepEqual(f.updates, []);
  assert.ok(f.component.drag);
  f.component.faderMove(f.event(200), "A");
  f.component.faderUp(f.event(200), "A");
  assert.deepEqual(f.updates, [["A", 105]]);
  assert.equal(f.component.drag, null);
});

test("scaled faders preserve relative drag distance without a volume jump", () => {
  const f = fixture(0.5);
  f.component.faderDown(f.event(110), "A");
  assert.deepEqual(f.updates, []);
  f.component.faderMove(f.event(100), "A");
  assert.deepEqual(f.updates, [["A", 105]]);
  f.component.faderUp(f.event(100), "A");
  assert.deepEqual(f.resumes, ["/volume/A"]);
});
