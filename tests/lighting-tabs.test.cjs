const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const { parse } = require("@vue/compiler-sfc");

// Run the Lighting tab SFC methods against a fake device; commands are recorded, nothing is sent.
const src = (file) => fs.readFileSync(path.join(__dirname, "../src", file), "utf8");
// Values made inside the vm have its own prototypes; compare plain copies
const plain = (value) => JSON.parse(JSON.stringify(value));
const strip = (code) => code.replace(/^import[\s\S]*?;\r?$/gm, "").replace(/^export (const|function)/gm, "$1");

const colours = {};
vm.runInNewContext(strip(src("util/lightingColours.js")) + "\nObject.assign(out, {PAIRS, OFF_STYLES, hexValue, dimColour, buttonLook, shared});",
  { out: colours });

function load(file, extra = {}) {
  const script = parse(src(file)).descriptor.script.content;
  const sent = [];
  // Child components are stripped with the imports; only their names need to exist
  const context = {
    OffStyleCards: {}, ColourPairs: {}, LightingSaveRow: {}, ColourSwatch: {}, LogoX: {},
    ...colours, ...extra,
    store: { getActiveDevice: () => device, getActiveSerial: () => "S1" },
    websocket: { send_command: (serial, command) => { sent.push(plain(command)); return Promise.resolve(); } },
  };
  vm.runInNewContext(strip(script).replace("export default", "globalThis.component ="), context);
  const definition = context.component;
  const component = { ...definition.methods, ...definition.data(), $t: (key, args) => key + (args ? JSON.stringify(args) : ""), $emit: () => {} };
  return { component, sent };
}

let device;
function freshDevice() {
  const button = (one, two, style = "Colour2") => ({ off_style: style, colours: { colour_one: one, colour_two: two } });
  device = {
    lighting: {
      buttons: {
        Bleep: button("111111", "222222"), Cough: button("333333", "444333", "Dimmed"),
        EffectSelect1: button("AA0000", "000011"), EffectSelect2: button("BB0000", "000022"),
        EffectSelect3: button("CC0000", "000033"), EffectSelect4: button("DD0000", "000044"),
        EffectSelect5: button("EE0000", "000055"), EffectSelect6: button("FF0000", "000066"),
        EffectMegaphone: button("010101", "020202"), EffectRobot: button("030303", "040404"),
        EffectHardTune: button("050505", "060606"), EffectFx: button("070707", "080808"),
      },
      encoders: {
        Reverb: { colour_one: "R1", colour_two: "R2", colour_three: "R3" },
        Pitch: { colour_one: "P1", colour_two: "P2", colour_three: "P3" },
        Echo: { colour_one: "E1", colour_two: "E2", colour_three: "E3" },
        Gender: { colour_one: "G1", colour_two: "G2", colour_three: "G3" },
      },
      sampler: {
        SamplerSelectA: { off_style: "Dimmed", colours: { colour_one: "A1", colour_two: "A2", colour_three: "A3" } },
        SamplerSelectB: { off_style: "Dimmed", colours: { colour_one: "B1", colour_two: "B2", colour_three: "B3" } },
        SamplerSelectC: { off_style: "Colour2", colours: { colour_one: "C1", colour_two: "C2", colour_three: "C3" } },
      },
    },
    cough_button: { state: "MutedToAll" },
    button_down: { Bleep: false },
    effects: {
      is_enabled: true, active_preset: "Preset2",
      current: { megaphone: { is_enabled: false }, robot: { is_enabled: true }, hard_tune: { is_enabled: false } },
    },
    sampler: { active_bank: "B", banks: { B: { TopLeft: { samples: [1] }, TopRight: { samples: [] } } } },
  };
}

test("a button lights in its first colour when on, and per its off style when off", () => {
  assert.equal(colours.buttonLook("FF0000", "00FF00", "Colour2", true).borderColor, "#FF0000");
  assert.equal(colours.buttonLook("FF0000", "00FF00", "Colour2", false).borderColor, "#00FF00");
  assert.equal(colours.buttonLook("FF0000", "00FF00", "Dimmed", false).borderColor, "rgba(255, 0, 0, 0.4)");
  assert.equal(colours.buttonLook("FF0000", "00FF00", "DimmedColour2", false).borderColor, "rgba(0, 255, 0, 0.4)");
  assert.equal(colours.shared(["a", "a"]), "a");
  assert.equal(colours.shared(["a", "b"]), null);
});

test("Cough: Both changes Bleep and mic mute, one target changes only that button", () => {
  freshDevice();
  const { component, sent } = load("components/sections/lighting/subTabs/LightingCough.vue");
  component.setOffStyle("DimmedColour2");
  assert.deepEqual(sent, [{ SetButtonOffStyle: ["Bleep", "DimmedColour2"] }, { SetButtonOffStyle: ["Cough", "DimmedColour2"] }]);
  sent.length = 0;
  component.target = "Cough";
  component.setColours("ABCDEF", "123456");
  assert.deepEqual(sent, [{ SetButtonColours: ["Cough", "ABCDEF", "123456"] }]);
  assert.equal(device.lighting.buttons.Bleep.colours.colour_one, "111111");
  assert.equal(component.isLit("Cough"), true);
  assert.equal(component.isLit("Bleep"), false);
});

test("Sampler: on / off colours keep each bank's own empty-pad colour", () => {
  freshDevice();
  const { component, sent } = load("components/sections/lighting/subTabs/LightingSampler.vue");
  component.setColours("FFFFFF", "000000", null);
  assert.deepEqual(sent, [
    { SetSampleColour: ["SamplerSelectA", "FFFFFF", "000000", "A3"] },
    { SetSampleColour: ["SamplerSelectB", "FFFFFF", "000000", "B3"] },
    { SetSampleColour: ["SamplerSelectC", "FFFFFF", "000000", "C3"] },
  ]);
  sent.length = 0;
  component.target = "C";
  component.setEmpty("101010");
  assert.deepEqual(sent, [{ SetSampleColour: ["SamplerSelectC", "FFFFFF", "000000", "101010"] }]);
  assert.deepEqual(plain(component.getNodes()), ["SamplerSelectC"]);
  assert.equal(component.hasSamples("TopLeft"), true);
  assert.equal(component.hasSamples("TopRight"), false);
});

test("Effects: knob colours change only the colour picked, preset nodes follow the target", () => {
  freshDevice();
  const { component, sent } = load("components/sections/lighting/subTabs/LightingEffects.vue",
    { KNOBS: [{ encoder: "Reverb" }, { encoder: "Pitch" }, { encoder: "Echo" }, { encoder: "Gender" }] });
  component.part = "knobs";
  component.target = 1;
  component.setEncoder({ colour_three: "FFFFFF" });
  assert.deepEqual(sent, [{ SetEncoderColour: ["Pitch", "P1", "P2", "FFFFFF"] }]);
  assert.deepEqual(plain(component.getNodes()), []);

  component.setActivePreset("Preset3");
  assert.equal(component.part, "presets");
  assert.deepEqual(plain(component.getNodes()), ["Preset3"]);
  assert.equal(component.presetLit(1), true);
  assert.equal(component.fxLit(1), true);   // Robot
  assert.equal(component.fxLit(3), true);   // FX
  assert.equal(component.fxLit(0), false);  // Megaphone
});

test("Effects: 'all' buttons in a part get the colours, other parts are left alone", () => {
  freshDevice();
  const { component, sent } = load("components/sections/lighting/subTabs/LightingEffects.vue",
    { KNOBS: [{ encoder: "Reverb" }, { encoder: "Pitch" }, { encoder: "Echo" }, { encoder: "Gender" }] });
  component.setPart("buttons");
  component.setButtonColours("ABABAB", "CDCDCD");
  assert.deepEqual(sent.map(c => c.SetButtonColours[0]), ["EffectMegaphone", "EffectRobot", "EffectHardTune", "EffectFx"]);
  assert.equal(device.lighting.buttons.EffectSelect1.colours.colour_one, "AA0000");
});
