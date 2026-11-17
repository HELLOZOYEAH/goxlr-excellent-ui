<template>
  <div class="hwFader">
    <span class="tag">{{ $t('message.device.kinds.fader', { n: index }) }}<template v-if="output"> · {{ $t('message.mixer.output') }}</template></span>
    <div class="screen" :style="screenStyle">
      <ScribbleScreen v-if="!isMini" :src="scribbleUrl"/>
      <template v-else>{{ label }}</template>
    </div>

    <div class="track" role="slider" tabindex="0" :class="{ dragging: !!drag }"
         :aria-label="label" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="percent"
         @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up" @lostpointercapture="up"
         @keydown="key">
      <div class="leds left"><span v-for="i in ledCount" :key="i" :style="{ background: led(i - 1) }"></span></div>
      <div class="leds right"><span v-for="i in ledCount" :key="i" :style="{ background: led(i - 1) }"></span></div>
      <div class="rail"></div>
      <div class="cap" :style="{ bottom: capBottom + 'px' }"><span></span></div>
    </div>

    <span class="percent">{{ percent }}%</span>
    <button type="button" class="mute" :class="{ blink: mutedToAll }" :style="muteStyle" :aria-pressed="muted"
            :aria-label="$t('message.device.muteChannel', { channel: label })" @click="$emit('mute')">
      <font-awesome-icon icon="fa-solid fa-volume-xmark"/>
    </button>
  </div>
</template>

<script>
// One of the GoXLR's four faders drawn as on the device (Mixer page, "On your GoXLR"): scribble
// screen, LEDs lit by the profile's fader style and the live level, a cap you drag, the mute button.
// Same look and drag rules as the Device page; volume and mute go back to the parent.
import ScribbleScreen from "@/components/design/ScribbleScreen.vue";
import {store} from "@/store";
import {getBaseHTTPAddress} from "@/util/sockets";
import {LED_COUNT, ledColour, mixColours} from "@/util/faderLeds";
import {liveMeters} from "@/util/liveMeters";
import {MuteButtonNamesForFader, ScribbleNames} from "@/util/mixerMapping";
import {isDeviceMini} from "@/util/util";

const TRACK = 200, CAP = 46;

export default {
  name: "HardwareFader",
  components: {ScribbleScreen},
  emits: ["update", "hold", "mute"],
  props: {
    fader: {type: String, required: true},   // "A" - "D"
    label: {type: String, required: true},
    output: {type: Boolean, default: false},  // an output (Headphones, Line Out ...) sits on this fader
  },

  data() {
    return {ledCount: LED_COUNT, drag: null, meters: liveMeters}
  },

  computed: {
    device() {
      return store.getActiveDevice();
    },
    status() {
      return this.device.fader_status[this.fader];
    },
    index() {
      return ["A", "B", "C", "D"].indexOf(this.fader) + 1;
    },
    isMini() {
      return isDeviceMini();
    },
    volume() {
      return this.device.levels.volumes[this.status.channel];
    },
    percent() {
      return Math.round(this.volume / 255 * 100);
    },
    capBottom() {
      return Math.round(this.volume / 255 * (TRACK - CAP));
    },
    muted() {
      return this.status.mute_state !== "Unmuted";
    },
    mutedToAll() {
      return this.status.mute_state === "MutedToAll";
    },
    // Live level of the channel on this fader, scaled by the fader so it never rises past the cap
    meter() {
      const meter = this.meters[this.status.channel];
      if (!meter) return null;
      if (this.mutedToAll) return {level: 0, peak: 0};
      const scale = this.volume / 255;
      return {level: meter.level * scale, peak: meter.peak * scale};
    },
    scribbleUrl() {
      const s = this.status.scribble;
      const query = `?i=${s.file_name}&b=${s.bottom_text}&l=${s.left_text}&in=${s.inverted}`;
      return `${getBaseHTTPAddress()}files/scribble/${store.getActiveSerial()}/${this.fader}.png${query}`;
    },
    screenStyle() {
      if (this.isMini) return {};
      const colour = this.device.lighting.simple[ScribbleNames[this.fader]].colour_one;
      return {background: mixColours("#" + colour, "#ffffff", 0.7), boxShadow: `0 0 10px ${this.rgba(colour, 0.35)}`};
    },
    muteStyle() {
      const lighting = this.device.lighting.buttons[MuteButtonNamesForFader[this.fader]];
      const one = lighting.colours.colour_one, two = lighting.colours.colour_two;
      let colour = "#" + one;
      if (!this.muted) {
        colour = {Dimmed: this.rgba(one, 0.4), Colour2: "#" + two, DimmedColour2: this.rgba(two, 0.4)}[lighting.off_style] || colour;
      }
      return {borderColor: colour, color: colour};
    },
  },

  methods: {
    rgba(colour, alpha) {
      const [r, g, b] = [0, 2, 4].map(i => parseInt(colour.substring(i, i + 2), 16));
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    led(index) {
      const lighting = this.device.lighting.faders[this.fader];
      return ledColour({
        style: lighting.style, top: lighting.colours.colour_one, bottom: lighting.colours.colour_two,
        index, position: this.volume / 255, meter: this.meter,
      });
    },
    set(value) {
      this.$emit("update", Math.max(0, Math.min(255, Math.round(value))));
    },
    // Only grabbing the cap drags, as on the Device page
    down(event) {
      if (event.button !== 0 || this.drag) return;
      if (event.target.closest(".cap")?.parentElement !== event.currentTarget) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      const travel = event.currentTarget.getBoundingClientRect().height * (TRACK - CAP) / TRACK;
      this.drag = {pointerId: event.pointerId, y: event.clientY, volume: this.volume, travel, channel: this.status.channel, moved: false};
    },
    move(event) {
      const drag = this.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (this.status.channel !== drag.channel) {
        this.up(event);
        return;
      }
      const dy = drag.y - event.clientY;
      if (!drag.moved && Math.abs(dy) < 3) return;
      if (!drag.moved) {
        drag.moved = true;
        this.$emit("hold", true);
      }
      this.set(drag.volume + dy / drag.travel * 255);
    },
    up(event) {
      const drag = this.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (drag.moved) this.$emit("hold", false);
      this.drag = null;
    },
    key(event) {
      const step = {ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 25, PageDown: -25}[event.key];
      if (step === undefined) return;
      event.preventDefault();
      this.set(this.volume + step);
    },
  },
}
</script>

<style scoped>
.hwFader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.tag {
  font-size: 10px;
  letter-spacing: .08em;
  color: #9fe1cb;
  text-transform: uppercase;
  white-space: nowrap;
}

.screen {
  width: 64px;
  height: 32px;
  overflow: hidden;
  border-radius: 3px;
  background: #d9dedc;
  color: #141716;
  font-size: 11px;
  font-weight: 700;
  display: grid;
  place-items: center;
}

.track {
  position: relative;
  width: 64px;
  height: 200px;
  touch-action: none;
  user-select: none;
  outline: none;
}

.track:focus-visible {
  box-shadow: 0 0 0 2px #59b1b6;
  border-radius: 6px;
}

.track.dragging, .track.dragging .cap {
  cursor: grabbing;
}

.leds {
  position: absolute;
  top: 2px;
  bottom: 2px;
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
}

.leds.left {
  left: 3px;
}

.leds.right {
  right: 3px;
}

.leds span {
  display: block;
  width: 11px;
  height: 9px;
  border-radius: 1px;
}

.rail {
  position: absolute;
  left: 29px;
  top: 6px;
  bottom: 6px;
  width: 6px;
  border-radius: 3px;
  background: #0b0d0c;
  box-shadow: inset 0 0 3px #000;
}

.cap {
  position: absolute;
  left: 17px;
  width: 30px;
  height: 46px;
  border-radius: 4px;
  background: linear-gradient(180deg, #a3a8a6 0%, #6d7270 30%, #8d9290 48%, #505553 52%, #7a7f7d 70%, #4c5150 100%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.35);
  cursor: grab;
}

.cap span {
  position: absolute;
  left: 4px;
  right: 4px;
  top: 22px;
  height: 2px;
  background: #2a2e2d;
}

.percent {
  font-size: 12px;
  color: #9aa4a0;
}

.mute {
  width: 52px;
  height: 30px;
  border: 2px solid;
  border-radius: 3px;
  background: transparent;
  font-size: 15px;
  cursor: pointer;
}

.mute.blink {
  animation: blink 1s steps(2, start) infinite;
}

@keyframes blink {
  to {
    visibility: hidden;
  }
}
</style>
