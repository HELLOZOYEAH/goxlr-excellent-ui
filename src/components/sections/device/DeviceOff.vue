<template>
  <!-- The GoXLR from the home page, switched off: nothing lit, faders down, the screens asking for a device.
       Linked (the GoXLR is on another PC and GoXLR Link reaches it): the screens say where, the meters breathe. -->
  <div ref="fit" class="offFit" :class="{ openable: !!link }"
       :role="link ? 'button' : 'img'" :tabindex="link ? 0 : null"
       :aria-label="link ? $t('message.noDevice.openRemote', {host: hostLabel}) : $t('message.noDevice.title')"
       @click="open" @keydown.enter.prevent="open" @keydown.space.prevent="open">
    <section ref="device" class="device off" :class="{ linked: !!link }" :style="{ zoom: scale }" aria-hidden="true">
      <!-- Linked: the whole device opens the streaming PC's GoXLR app -->
      <div v-if="link" class="openHint">
        <span class="openPill"><font-awesome-icon icon="fa-solid fa-sliders"/>{{ $t('message.noDevice.openRemote', {host: hostLabel}) }}</span>
      </div>
      <div class="zone mixerZone">
        <div class="faders">
          <div v-for="(word, i) in screenWords" :key="i" class="faderColumn">
            <div class="screen offScreen"><span>{{ word }}</span></div>
            <div class="faderTrack">
              <div class="leds left"><span v-for="n in LED_COUNT" :key="n" :style="{ background: ledColour(i, n) }"></span></div>
              <div class="leds right"><span v-for="n in LED_COUNT" :key="n" :style="{ background: ledColour(i, n) }"></span></div>
              <div class="rail"></div>
              <div class="cap" style="bottom: 0"><span></span></div>
            </div>
            <span class="percent">--</span>
            <div class="mute" :style="offLine"><font-awesome-icon icon="fa-solid fa-volume-xmark"/></div>
          </div>
        </div>
        <span class="zoneLabel">{{ $t('message.navigation.mixer') }}</span>
      </div>

      <div class="zone middleZone">
        <div class="effectsArea">
          <div class="presets">
            <div v-for="n in 6" :key="n" class="preset" :style="offLine">{{ n }}</div>
          </div>
          <div class="knobArea">
            <div class="logo offLogo">GO<LogoX/>LR<small>EXCE<i>I</i><i>I</i>ENT</small></div>
            <div class="knobs">
              <div v-for="knob in KNOBS" :key="knob" class="knob">
                <span class="ring">
                  <span v-for="dot in dots" :key="dot.i" class="dot"
                        :style="{ left: dot.x + 'px', top: dot.y + 'px', background: OFF_DOT, transform: 'rotate(' + dot.a + 'deg)' }"></span>
                  <span class="cap"><span class="pointer" :style="{ background: OFF_DOT }"></span></span>
                </span>
                <span class="knobName">{{ $t(`message.effects.${knob}.title`) }}</span>
              </div>
            </div>
          </div>
        </div>
        <span class="zoneLabel">{{ $t('message.navigation.effects') }}</span>

        <div class="samplerArea">
          <div class="banks">
            <div v-for="bank in ['A', 'B', 'C']" :key="bank" class="bank" :style="offLine">{{ bank }}</div>
          </div>
          <div class="pads">
            <div v-for="pad in ['tl', 'tr', 'bl', 'br']" :key="pad" class="pad" :class="pad" :style="{ borderColor: offLine.borderColor }"></div>
            <div class="clear" :style="offLine">{{ $t('message.common.clear') }}</div>
          </div>
        </div>
        <span class="zoneLabel">{{ $t('message.navigation.sampler') }}</span>
      </div>

      <div class="zone rightZone">
        <div class="fxButtons">
          <div v-for="fx in FX" :key="fx.id" class="fx" :class="fx.css" :style="offLine">{{ fx.label }}</div>
        </div>
        <div class="muteButtons">
          <div class="bleep" :style="offLine">!@#$?*</div>
          <div class="cough" :style="{ background: OFF_LINE, color: OFF_LINE }">
            <span><font-awesome-icon icon="fa-solid fa-microphone-slash"/></span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import LogoX from "@/components/sections/device/LogoX.vue";

// Uses the same styles as DeviceHome (deviceShell.css) so it is the same device, just unlit.
const LED_COUNT = 15;
const KNOB_DOTS = 13;
const OFF_LED = "#1f2322";
const OFF_DOT = "#1d201f";
const OFF_LINE = "#3a3f3d";
// Linked: the device's own teal, dimmed, so it reads as "awake, but the GoXLR is elsewhere"
const LINK_LED = "#2f6f72";
const LINK_LINE = "#2f5a5c";
const BREATHE_MS = 120;
// Letters that fit on a scribble screen
const SCREEN_CHARS = 8;

export default {
  name: "DeviceOff",
  components: {LogoX},
  emits: ["open"],
  props: {
    // {host, ms} when GoXLR Link is linked to the GoXLR on another PC
    link: {type: Object, default: null},
  },

  data() {
    return {
      LED_COUNT, OFF_LED, OFF_DOT, OFF_LINE,
      KNOBS: ["reverb", "pitch", "echo", "gender"],
      FX: [
        {id: "megaphone", css: "small", label: "Megaphone"},
        {id: "robot", css: "small", label: "Robot"},
        {id: "hardtune", css: "small", label: "Hardtune"},
        {id: "fx", css: "large", label: "Fx"},
      ],
      scale: 1,
      observer: null,
      phase: 0,
      breather: null,
    }
  },

  computed: {
    screenWords() {
      if (!this.link) return ["NO", "GOXLR", "FOUND", "..."];
      let parts = this.hostLabel.split(/[-_\s.]+/).filter(Boolean);
      // One long name: half on each screen (HELLOS / OYEAH)
      if (parts.length === 1 && parts[0].length > SCREEN_CHARS) {
        const half = Math.ceil(parts[0].length / 2);
        parts = [parts[0].slice(0, half), parts[0].slice(half)];
      }
      const ms = this.link.ms == null ? "..." : `${Math.max(1, this.link.ms)} ms`;
      return ["LINKED", parts[0] || "LINK", parts.slice(1).join(" ") || "PC", ms];
    },
    hostLabel() {
      return this.link ? String(this.link.host || "").toUpperCase() : "";
    },
    offLine() {
      const line = this.link ? LINK_LINE : OFF_LINE;
      return {borderColor: line, color: line};
    },
    // Same ring of dots as the live knobs, all unlit
    dots() {
      const dots = [];
      for (let i = 0; i < KNOB_DOTS; i++) {
        const deg = 135 + i * 270 / (KNOB_DOTS - 1);
        const rad = deg * Math.PI / 180;
        dots.push({i, a: Math.round(deg + 90), x: Math.round(42 + 36 * Math.cos(rad)), y: Math.round(42 + 36 * Math.sin(rad))});
      }
      return dots;
    },
  },

  watch: {
    link: {
      immediate: true,
      handler(link) {
        clearInterval(this.breather);
        this.breather = null;
        const still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (link && !still) this.breather = setInterval(() => this.phase += 0.35, BREATHE_MS);
      },
    },
  },

  mounted() {
    // Shrink to fit narrow windows, never grow past full size
    this.observer = new ResizeObserver(this.refit);
    this.observer.observe(this.$refs.fit);
    this.refit();
  },

  unmounted() {
    if (this.observer) this.observer.disconnect();
    clearInterval(this.breather);
  },

  methods: {
    open() {
      if (this.link) this.$emit("open");
    },
    // Linked: a low, slow meter on each channel (not real audio, just a sign of life)
    ledColour(column, n) {
      if (!this.link) return OFF_LED;
      const level = Math.round(3 + 2.5 * Math.sin(this.phase + column * 1.3));
      return n <= level ? LINK_LED : OFF_LED;
    },
    refit() {
      const device = this.$refs.device;
      if (!device) return;
      const width = device.offsetWidth;
      if (width) this.scale = Math.min(1, this.$refs.fit.clientWidth / width);
    },
  },
}
</script>

<style scoped src="./deviceShell.css"></style>

<style scoped>
.offFit {
  display: grid;
  justify-items: center;
  width: 100%;
  filter: drop-shadow(0 22px 26px rgba(0, 0, 0, .45));
}

/* The live device uses <button>s, which centre their label; these are plain boxes */
.off .preset,
.off .bank,
.off .fx,
.off .clear,
.off .bleep,
.off .mute {
  display: grid;
  place-items: center;
  box-sizing: border-box;
}

.off .faderTrack,
.off .knob,
.off .pad,
.off .preset,
.off .bank,
.off .fx {
  cursor: default;
}

/* The scribble screens show a message instead of a channel picture */
.offScreen {
  display: grid;
  place-items: center;
  background: #0d0f0f;
  border: 1px solid #3a3f3d;
  box-shadow: none;
  cursor: default;
}

.offScreen span {
  font-family: var(--goxlr-title-font);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .08em;
  color: #7fd3d8;
  animation: waiting 2.4s ease-in-out infinite;
}

@keyframes waiting {
  0%, 100% { opacity: .9; }
  50% { opacity: .3; }
}

@media (prefers-reduced-motion: reduce) {
  .offScreen span {
    animation: none;
  }
}

.openable {
  cursor: pointer;
}

.openable:focus {
  outline: none;
}

.linked {
  position: relative;
}

.openHint {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-items: center;
  border: 2px solid #59b1b6;
  border-radius: inherit;
  background: rgba(14, 20, 20, .55);
  opacity: 0;
  transition: opacity .15s ease;
  pointer-events: none;
}

.openable:hover .openHint,
.openable:focus-visible .openHint {
  opacity: 1;
}

.openPill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  border: 1px solid #59b1b6;
  border-radius: 999px;
  background: #1d3a3c;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 17px;
}

@media (prefers-reduced-motion: reduce) {
  .openHint {
    transition: none;
  }
}

.linked .offScreen {
  border-color: #2f5a5c;
  background: #0f1c1d;
}

.linked .offScreen span {
  color: #9fe1cb;
  animation: none;
}

.linked .offLogo .logoX {
  color: #59b1b6;
}

.offLogo,
.offLogo .logoX {
  color: #4d5452;
}

.zoneLabel {
  cursor: default;
}
</style>
