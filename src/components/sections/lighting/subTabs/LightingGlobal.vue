<template>
  <div class="lightingPage">
    <h2 class="title">{{ $t('message.lighting.globalTab.title') }}</h2>
    <p class="lede">{{ $t('message.lighting.globalTab.lede') }}</p>

    <div class="layout">
      <!-- Preview: the GoXLR's lights with the animation playing, as an impression of the device -->
      <section class="preview" :aria-label="$t('message.lighting.faderLights.live')">
        <div class="previewHead">
          <span class="live">{{ $t('message.lighting.faderLights.live') }}</span>
          <span>{{ $t('message.lighting.globalTab.hint') }}</span>
        </div>
        <div class="logo" aria-hidden="true">GO<span :style="{ color: '#' + accent() }">X</span>LR</div>
        <FaderStrips :clickable="false" :led-override="mode() === 'None' ? null : animatedLed"/>
      </section>

      <section class="controls">
        <template v-if="supported()">
          <div>
            <div class="lab">{{ $t('message.lighting.globalTab.animation') }}</div>
            <div class="styles anims" role="radiogroup" :aria-label="$t('message.lighting.globalTab.animation')">
              <button v-for="anim in animations()" :key="anim" type="button" role="radio" class="styleCard"
                      :class="{ on: mode() === anim }" :aria-checked="mode() === anim" @click="setMode(anim)">
                <span class="mini leds"><i v-for="n in 8" :key="n" :style="{ background: miniLed(anim, n - 1) }"></i></span>
                <b>{{ $t(`message.lighting.globalTab.modes.${anim}.name`) }}</b>
                <span class="desc">{{ $t(`message.lighting.globalTab.modes.${anim}.desc`) }}</span>
              </button>
            </div>
          </div>

          <div v-if="mode() !== 'None'">
            <div class="lab">{{ $t('message.lighting.globalTab.tuning') }}</div>
            <div class="mrow">
              <label for="global-mod1">{{ $t('message.lighting.globalTab.mod1') }}</label>
              <input id="global-mod1" type="range" min="0" max="100" :value="mod1" :style="{ '--p': mod1 + '%' }"
                     @input="mod1 = +$event.target.value" @change="setMod('SetAnimationMod1', 'mod1', mod1)">
              <span class="val">{{ mod1 }}</span>
            </div>
            <div class="mrow" :class="{ off: !mod2Used() }">
              <label for="global-mod2">{{ $t('message.lighting.globalTab.mod2') }}</label>
              <input id="global-mod2" type="range" min="0" max="100" :value="mod2" :style="{ '--p': mod2 + '%' }"
                     :disabled="!mod2Used()" @input="mod2 = +$event.target.value" @change="setMod('SetAnimationMod2', 'mod2', mod2)">
              <span class="val">{{ mod2 }}</span>
            </div>
            <div class="waterRow" :class="{ off: !waterfallUsed() }">
              <span class="waterLabel">{{ $t('message.lighting.globalTab.waterfall') }}</span>
              <div v-if="waterfallUsed()" class="seg" role="radiogroup" :aria-label="$t('message.lighting.globalTab.waterfall')">
                <button v-for="dir in waterfalls" :key="dir" type="button" role="radio" :aria-checked="waterfall() === dir"
                        :class="{ on: waterfall() === dir }" @click="setWaterfall(dir)">{{ $t(`message.lighting.globalTab.water.${dir}`) }}
                </button>
              </div>
              <span v-else class="previewNote">{{ $t('message.lighting.globalTab.notUsed') }}</span>
            </div>
          </div>
        </template>
        <p v-else class="note">{{ $t('message.lighting.globalTab.unsupported') }}</p>

        <div>
          <div class="lab">{{ $t('message.lighting.faderLights.colours') }}</div>
          <div class="colourRow">
            <ColourSwatch id="global-accent" :value="accent()" :label="$t('message.lighting.globalTab.accent')"
                          :hint="$t('message.lighting.globalTab.accentHint')" @change="setAccent($event)"/>
          </div>
        </div>

        <div>
          <div class="lab">{{ $t('message.lighting.globalTab.paint') }}</div>
          <div class="colourRow">
            <ColourSwatch id="global-paint" :value="paintColour" :label="$t('message.lighting.globalTab.oneColour')"
                          :hint="$t('message.lighting.globalTab.oneColourHint')" @change="paintColour = $event"/>
            <button type="button" class="swap" @click="paint">{{ $t('message.lighting.globalTab.paintButton') }}</button>
          </div>
          <div class="sublab">{{ $t('message.lighting.globalTab.paintWarning') }}</div>
        </div>

        <p class="note">{{ $t('message.lighting.globalTab.note') }}</p>

        <LightingSaveRow/>
      </section>
    </div>
  </div>
</template>

<script>
import ColourSwatch from "@/components/sections/lighting/elements/ColourSwatch.vue";
import {store} from "@/store";
import {websocket} from "@/util/sockets";
import {isDeviceMini} from "@/util/util";
import {LED_COUNT, ledColour, mixColours} from "@/util/faderLeds";
import FaderStrips from "@/components/sections/lighting/elements/FaderStrips.vue";
import LightingSaveRow from "@/components/sections/lighting/elements/LightingSaveRow.vue";

const ANIMATIONS = ["None", "RetroRainbow", "RainbowBright", "RainbowDark", "Simple", "Ripple"];
const RAINBOW = ["FF4F6D", "FF8A3D", "F2C94C", "59D65C", "2FC4E8", "7C5CFF"];
const TICK_MS = 80;

// Lighting → Global: the light animation, the logo (Accent) light, and painting every light one colour
export default {
  name: "LightingGlobal",
  components: {ColourSwatch, FaderStrips, LightingSaveRow},
  emits: ["nav-updated"],

  data() {
    return {
      waterfalls: ["Up", "Down", "Off"],
      mod1: 0,
      mod2: 0,
      paintColour: "FFFFFF",
      tick: 0,
    }
  },

  mounted() {
    const animation = this.device().lighting.animation;
    this.mod1 = animation.mod1;
    this.mod2 = animation.mod2;
    this.paintColour = this.device().lighting.simple.Global.colour_one;
    const slow = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    this.timer = setInterval(() => !document.hidden && this.tick++, slow ? TICK_MS * 5 : TICK_MS);
  },

  beforeUnmount() {
    clearInterval(this.timer);
  },

  computed: {
    animationState() {
      return store.getActiveDevice().lighting.animation;
    },
  },

  watch: {
    // Follow changes made elsewhere (another window, Undo)
    animationState: {
      deep: true,
      handler(animation) {
        this.mod1 = animation.mod1;
        this.mod2 = animation.mod2;
      },
    },
  },

  methods: {
    getNodes() {
      return [];
    },
    device() {
      return store.getActiveDevice();
    },
    serial() {
      return store.getActiveSerial();
    },
    supported() {
      return this.device().lighting.animation.supported;
    },
    // Ripple isn't available on the Mini
    animations() {
      return isDeviceMini() ? ANIMATIONS.filter(a => a !== "Ripple") : ANIMATIONS;
    },
    mode() {
      return this.device().lighting.animation.mode;
    },
    waterfall() {
      return this.device().lighting.animation.waterfall_direction;
    },
    mod2Used() {
      return this.mode() === "RainbowBright" || this.mode() === "RainbowDark";
    },
    waterfallUsed() {
      return this.mode() !== "None" && this.mode() !== "RetroRainbow";
    },
    accent() {
      return this.device().lighting.simple.Accent.colour_one;
    },

    /* ---------- Drawing ---------- */
    // An impression of the animation (not the device's exact maths): LED `index` of `count` in column `col`
    animLed(anim, colours, col, index, count) {
      const direction = this.waterfall() === "Up" ? 1 : -1;
      const step = Math.floor(this.tick * (0.25 + this.mod1 / 80)) * direction;
      const hex = (c) => "#" + c;
      switch (anim) {
        case "RetroRainbow":
          return hex(RAINBOW[((col + Math.floor(this.tick / 6)) % 6 + 6) % 6]);
        case "RainbowBright":
        case "RainbowDark": {
          const spread = 1 + Math.round(this.mod2 / 25);
          const colour = RAINBOW[((Math.floor((index + col) / spread) - step) % 6 + 6) % 6];
          return anim === "RainbowDark" ? mixColours(colour, "151817", 0.45) : hex(colour);
        }
        case "Simple": {
          const phase = (Math.sin((index - step) / 2.5) + 1) / 2;
          return mixColours(colours.colour_two, colours.colour_one, phase);
        }
        case "Ripple": {
          const wave = ((step + col) % count + count) % count;
          return Math.abs(index - wave) < 2 ? hex(this.accent()) : hex(colours.colour_two);
        }
        default:
          return ledColour({style: "Gradient", top: colours.colour_one, bottom: colours.colour_two, index, count, position: 1, meter: null});
      }
    },
    // The fader LEDs while an animation plays
    animatedLed(fader, side, index) {
      const col = ["A", "B", "C", "D"].indexOf(fader) * 2 + side;
      return this.animLed(this.mode(), this.device().lighting.faders[fader].colours, col, index, LED_COUNT);
    },
    // The little demo column on each animation card, in the colours of fader 1
    miniLed(anim, index) {
      return this.animLed(anim, this.device().lighting.faders.A.colours, 0, index, 8);
    },

    /* ---------- Changes ---------- */
    setMode(mode) {
      this.device().lighting.animation.mode = mode;
      websocket.send_command(this.serial(), {"SetAnimationMode": mode});
    },
    setMod(command, field, value) {
      this.device().lighting.animation[field] = value;
      websocket.send_command(this.serial(), {[command]: value});
    },
    setWaterfall(direction) {
      this.device().lighting.animation.waterfall_direction = direction;
      websocket.send_command(this.serial(), {"SetAnimationWaterfall": direction});
    },
    setAccent(colour) {
      this.device().lighting.simple.Accent.colour_one = colour;
      websocket.send_command(this.serial(), {"SetSimpleColour": ["Accent", colour]});
    },
    // Sets every light on the device to one colour; Undo can bring the old colours back
    paint() {
      websocket.send_command(this.serial(), {"SetGlobalColour": this.paintColour});
    },
  },
}
</script>

<style scoped src="../elements/lightingPage.css"></style>
<style scoped>
.logo {
  align-self: center;
  font-family: var(--goxlr-title-font);
  font-weight: 700;
  font-size: 18px;
  letter-spacing: .22em;
  color: #c3ccc8;
}

/* The animation cards: three to a row, LED column like the Fader lights style cards */
.anims {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.styleCard .leds {
  flex-direction: column-reverse;
  gap: 2px;
}

.styleCard .leds i {
  width: 12px;
  height: 6px;
  border-radius: 1px;
}

/* Slider rows, as on the Mic page */
.mrow {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) 64px;
  align-items: center;
  gap: 14px;
  min-height: 40px;
  max-width: 520px;
}

.mrow label, .waterLabel {
  font-size: 13px;
  color: #9aa4a0;
}

.mrow input {
  -webkit-appearance: none;
  appearance: none;
  height: 22px;
  margin: 0;
  min-width: 0;
  background: transparent;
}

.mrow input::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, #59b1b6 var(--p), #3a413f var(--p));
}

.mrow input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 18px;
  margin-top: -7px;
  border: 2px solid #8b9592;
  border-radius: 3px;
  background: #c9d0cd;
}

.mrow input:focus-visible {
  outline: 2px solid #59b1b6;
}

.mrow .val {
  justify-self: end;
  width: 64px;
  padding: 6px 0;
  border-radius: 6px;
  background: #171b1a;
  font-size: 13px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.waterRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
}

.waterLabel {
  width: 110px;
}
</style>
