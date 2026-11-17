const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const { test } = require("node:test");
const { parse } = require("@vue/compiler-sfc");
const source = fs.readFileSync(path.join(__dirname, "../src/components/sections/mixer/AppTray.vue"), "utf8");
const script = parse(source).descriptor.script.content.replace(/^import[\s\S]*?;\r?$/gm, "").replace("export default", "globalThis.component =");

const APP = (name, channel, playing = true) => ({ name, path: `C:\\${name}\\${name}.exe`, pids: [1], channel, device: "x", playing });

function tray(channel, list, failWith = null) {
  const moves = [], events = [];
  const appSounds = { list };
  const context = {
    APP_CHANNELS: ["System", "Game", "Music", "Chat", "Sample"],
    appName: app => app.name,
    appSounds,
    moveApp: async (p, c) => {
      moves.push([p, c]);
      if (failWith) throw new Error(failWith);
    },
  };
  vm.runInNewContext(script, context);
  const o = context.component;
  const c = { ...o.data(), channel, $t: (key, args) => key + (args ? JSON.stringify(args) : ""), $emit: (...e) => events.push(e) };
  for (const [name, fn] of Object.entries(o.methods)) c[name] = fn.bind(c);
  for (const [name, fn] of Object.entries(o.computed)) Object.defineProperty(c, name, { get: fn.bind(c) });
  const dropEvent = p => ({ dataTransfer: { getData: () => p } });
  return { c, moves, events, dropEvent };
}

test("a tray lists only the apps on its channel", () => {
  const { c } = tray("Music", [APP("Spotify", "Music"), APP("Steam", "Game"), APP("Player", null)]);
  assert.deepEqual(c.apps.map(a => a.name), ["Spotify"]);
  const { c: elsewhere } = tray(null, [APP("Spotify", "Music"), APP("Player", null)]);
  assert.deepEqual(elsewhere.apps.map(a => a.name), ["Player"]);
});

test("dropping an app from another channel moves it here", async () => {
  const spotify = APP("Spotify", "System");
  const { c, moves, events, dropEvent } = tray("Music", [spotify]);
  await c.drop(dropEvent(spotify.path));
  assert.deepEqual(moves, [[spotify.path, "Music"]]);
  assert.deepEqual(events, [["moved", "Spotify", "Music"]]);
});

test("dropping an app on its own channel, or an unknown drag, does nothing", async () => {
  const spotify = APP("Spotify", "Music");
  const { c, moves, dropEvent } = tray("Music", [spotify]);
  await c.drop(dropEvent(spotify.path));
  await c.drop(dropEvent("C:\\not\\listed.exe"));
  await c.drop(dropEvent(""));
  assert.equal(moves.length, 0);
});

test("the menu offers the other channels and Windows' default, never its own channel", () => {
  const { c } = tray("Music", []);
  const ids = c.targets.map(t => t.id);
  assert.deepEqual(ids, ["System", "Game", "Chat", "Sample", null]);
  const { c: elsewhere } = tray(null, []);
  assert.deepEqual(elsewhere.targets.map(t => t.id), ["System", "Game", "Music", "Chat", "Sample"]);
});

test("a failed move is reported with the reason", async () => {
  const steam = APP("Steam", "System");
  const { c, events } = tray("Game", [steam], "Windows refused to move process 1");
  await c.move(steam, "Game");
  assert.deepEqual(events, [["failed", "Steam", "Windows refused to move process 1"]]);
  assert.equal(c.menu, null);
});
