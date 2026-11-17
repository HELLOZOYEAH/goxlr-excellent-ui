<template>
  <div class="swatchWrap" ref="wrap">
    <button :id="id" type="button" class="colour" :class="variant" :aria-expanded="open" aria-haspopup="dialog" @click="toggle">
      <i class="chipColour" :style="{ background: '#' + value }"></i>
      <span>{{ label }}<small v-if="hint">{{ hint }}</small></span>
    </button>

    <!-- A colour picker in the app's own look (the browser's one doesn't match the theme) -->
    <div v-if="open" class="picker" :class="{ right: alignRight, up: openUp }" role="dialog" :aria-label="label" @keydown.esc.stop="close">
      <div class="sv" ref="sv" :style="{ background: `hsl(${hue}, 100%, 50%)` }"
           @pointerdown="svDown" @pointermove="svMove" @pointerup="commit" @pointercancel="commit">
        <span class="svMark" :style="{ left: sat * 100 + '%', top: (1 - val) * 100 + '%', background: '#' + draft }"></span>
      </div>
      <div class="hue" ref="hue" @pointerdown="hueDown" @pointermove="hueMove" @pointerup="commit" @pointercancel="commit">
        <span class="hueMark" :style="{ left: hue / 360 * 100 + '%' }"></span>
      </div>
      <div class="quick">
        <button v-for="c in quick" :key="c" type="button" class="quickColour" :class="{ on: c === draft }"
                :style="{ background: '#' + c }" :title="'#' + c" :aria-label="'#' + c" @click="pick(c)"></button>
      </div>
      <div class="hexRow">
        <i class="chipColour big" :style="{ background: '#' + draft }"></i>
        <label :for="id + '-hex'">HEX</label>
        <input :id="id + '-hex'" ref="hex" class="hex" maxlength="7" :value="'#' + draft" spellcheck="false"
               @keydown.enter="typed($event)" @change="typed($event)">
      </div>
    </div>
  </div>
</template>

<script>
// Quick picks that look good on the GoXLR's LEDs; black switches a light off
const QUICK = ["FFFFFF", "FF0000", "FF5A00", "FFC800", "8CFF00", "00FF6A", "00E5FF", "0070FF", "2A00FF", "A000FF", "FF00B4", "000000"];

const PICKER_WIDTH = 248;
const PICKER_HEIGHT = 340;

function toRgb(hex) {
  return [0, 2, 4].map(i => parseInt(hex.substring(i, i + 2), 16) / 255);
}

function toHex(r, g, b) {
  return [r, g, b].map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

function hsvToHex(h, s, v) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return toHex(f(5), f(3), f(1));
}

function hexToHsv(hex) {
  const [r, g, b] = toRgb(hex);
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return {h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max};
}

// A colour card (as on Fader lights) that opens a picker matching the app's theme.
// `value` and the `change` event are "RRGGBB" without the #. Dragging previews; letting go sends.
export default {
  name: "ColourSwatch",
  props: {
    id: {type: String, required: true},
    value: {type: String, required: true},
    label: {type: String, required: true},
    hint: {type: String, default: ""},
    // "card" as on the Lighting tabs, "chip" for the Device page panel, "inline" for a line of text
    variant: {type: String, default: "card"},
  },
  emits: ["change"],

  data() {
    return {open: false, hue: 0, sat: 0, val: 0, draft: "000000", drag: null, quick: QUICK, alignRight: false, openUp: false};
  },

  beforeUnmount() {
    document.removeEventListener("pointerdown", this.outside, true);
  },

  methods: {
    toggle() {
      this.open ? this.close() : this.show();
    },
    show() {
      this.load(this.value);
      // open towards the side with room, so the picker stays on screen
      const r = this.$refs.wrap.getBoundingClientRect();
      this.alignRight = r.left + PICKER_WIDTH > window.innerWidth - 8;
      this.openUp = r.bottom + PICKER_HEIGHT > window.innerHeight - 8 && r.top > PICKER_HEIGHT;
      this.open = true;
      document.addEventListener("pointerdown", this.outside, true);
    },
    close() {
      this.open = false;
      document.removeEventListener("pointerdown", this.outside, true);
    },
    outside(event) {
      if (!this.$refs.wrap?.contains(event.target)) this.close();
    },
    load(hex) {
      const hsv = hexToHsv(hex);
      // keep the hue when the colour is grey, so the square doesn't jump to red
      if (hsv.s > 0 && hsv.v > 0) this.hue = hsv.h;
      this.sat = hsv.s;
      this.val = hsv.v;
      this.draft = hex.toUpperCase();
    },
    update() {
      this.draft = hsvToHex(this.hue, this.sat, this.val);
    },
    send(hex) {
      if (hex !== this.value) this.$emit("change", hex);
    },
    pick(hex) {
      this.load(hex);
      this.send(hex);
    },
    typed(event) {
      const hex = event.target.value.replace("#", "").trim().toUpperCase();
      if (/^[0-9A-F]{6}$/.test(hex)) this.pick(hex);
      else event.target.value = "#" + this.draft;
    },

    /* ---------- Dragging ---------- */
    svDown(event) {
      this.drag = "sv";
      event.currentTarget.setPointerCapture(event.pointerId);
      this.svMove(event);
    },
    svMove(event) {
      if (this.drag !== "sv") return;
      const r = this.$refs.sv.getBoundingClientRect();
      this.sat = Math.max(0, Math.min(1, (event.clientX - r.left) / r.width));
      this.val = 1 - Math.max(0, Math.min(1, (event.clientY - r.top) / r.height));
      this.update();
    },
    hueDown(event) {
      this.drag = "hue";
      event.currentTarget.setPointerCapture(event.pointerId);
      this.hueMove(event);
    },
    hueMove(event) {
      if (this.drag !== "hue") return;
      const r = this.$refs.hue.getBoundingClientRect();
      this.hue = Math.max(0, Math.min(359.9, (event.clientX - r.left) / r.width * 360));
      this.update();
    },
    commit() {
      if (!this.drag) return;
      this.drag = null;
      this.send(this.draft);
    },
  },
}
</script>

<style scoped>
.swatchWrap {
  position: relative;
}

.colour {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid #343a38;
  border-radius: 8px;
  background: #262b2a;
  color: #e8ecea;
  font-family: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.colour:hover, .colour[aria-expanded=true] {
  border-color: #4a5452;
}

/* The Device page's colour buttons */
.colour.chip {
  gap: 8px;
  min-height: 40px;
  padding: 0 10px 0 6px;
  border: 0;
  border-radius: 6px;
  background: #3b413f;
  font-size: 13px;
  color: #c3ccc8;
}

.colour.chip .chipColour {
  width: 30px;
  height: 30px;
}

.colour.chip:hover, .colour.chip[aria-expanded=true] {
  box-shadow: inset 0 0 0 1px #59b1b6;
}

/* Just the swatch and its name, inside a line of other settings */
.colour.inline {
  gap: 8px;
  font-size: inherit;
  padding: 0;
  border: 0;
  background: none;
}

.colour.inline .chipColour {
  width: 28px;
  height: 22px;
}

.colour.inline:hover .chipColour, .colour.inline[aria-expanded=true] .chipColour {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .12), 0 0 0 2px #59b1b6;
}

.colour small {
  display: block;
  font-size: 12px;
  color: #9aa4a0;
}

.chipColour {
  width: 34px;
  height: 22px;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .12);
}

.chipColour.big {
  width: 28px;
  height: 28px;
}

.picker {
  position: absolute;
  z-index: 30;
  top: calc(100% + 6px);
  left: 0;
  width: 248px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid #343a38;
  border-radius: 10px;
  background: #232827;
  box-shadow: 0 12px 28px rgba(0, 0, 0, .55);
}

.picker.right {
  left: auto;
  right: 0;
}

.picker.up {
  top: auto;
  bottom: calc(100% + 6px);
}

.sv {
  position: relative;
  height: 150px;
  border-radius: 6px;
  cursor: crosshair;
  touch-action: none;
}

.sv::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 6px;
  background: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent);
}

.svMark {
  position: absolute;
  z-index: 1;
  width: 14px;
  height: 14px;
  margin: -7px 0 0 -7px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, .6);
  pointer-events: none;
}

.hue {
  position: relative;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
  cursor: pointer;
  touch-action: none;
}

.hueMark {
  position: absolute;
  top: -3px;
  width: 8px;
  height: 18px;
  margin-left: -4px;
  border: 2px solid #fff;
  border-radius: 3px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, .6);
  pointer-events: none;
}

.quick {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.quickColour {
  height: 22px;
  border: 1px solid #343a38;
  border-radius: 4px;
  cursor: pointer;
}

.quickColour.on {
  border-color: #3ee6d9;
  box-shadow: 0 0 0 1px #3ee6d9;
}

.hexRow {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hexRow label {
  font-family: var(--goxlr-title-font);
  letter-spacing: .14em;
  font-weight: 700;
  font-size: 12px;
  color: #c3ccc8;
}

.hex {
  flex: 1 1 auto;
  min-width: 0;
  padding: 6px 8px;
  border: 1px solid #343a38;
  border-radius: 6px;
  background: #171b1a;
  color: #e8ecea;
  font-family: inherit;
  font-size: 13px;
  text-transform: uppercase;
}

.hex:focus-visible, .colour:focus-visible, .quickColour:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}
</style>
