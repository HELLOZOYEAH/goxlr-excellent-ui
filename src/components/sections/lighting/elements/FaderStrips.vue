<template>
  <div class="faders">
    <component :is="clickable ? 'button' : 'div'" v-for="(fader, i) in faders" :key="fader"
               :type="clickable ? 'button' : null" class="strip" :class="{ selected: selected === fader, clickable }"
               :aria-pressed="clickable ? selected === fader : null"
               :aria-label="$t('message.device.kinds.fader', { n: i + 1 })" @click="clickable && $emit('pick', fader)">
      <span class="screen" :style="screenStyle(fader)">
        <ScribbleScreen v-if="!isMini" :src="scribbleUrl(fader)"/>
        <template v-else>{{ channelLabel(fader) }}</template>
      </span>
      <span class="track">
        <span class="leds"><i v-for="n in ledCount" :key="n" :style="{ background: led(fader, 0, n - 1) }"></i></span>
        <span class="rod"></span>
        <span class="cap" :style="{ bottom: capBottom(fader) + 'px' }"></span>
        <span class="leds"><i v-for="n in ledCount" :key="n" :style="{ background: led(fader, 1, n - 1) }"></i></span>
      </span>
      <span class="mute" :style="muteStyle(fader)"><font-awesome-icon icon="fa-solid fa-volume-xmark"/></span>
      <small>{{ $t('message.device.kinds.fader', { n: i + 1 }) }}</small>
      <span class="noLevel" :class="{ shown: !ledOverride && isMeter(fader) && !hasLevel(fader) }">{{ $t('message.lighting.faderLights.noLevel') }}</span>
    </component>
  </div>
</template>

<script>
import {store} from "@/store";
import {getBaseHTTPAddress} from "@/util/sockets";
import {MuteButtonNamesForFader, ScribbleNames} from "@/util/mixerMapping";
import {isDeviceMini} from "@/util/util";
import {isMeterStyle, LED_COUNT, ledColour, mixColours} from "@/util/faderLeds";
import {liveMeters, useLiveMeters} from "@/util/liveMeters";
import {buttonLook} from "@/util/lightingColours";
import ScribbleScreen from "@/components/design/ScribbleScreen.vue";

const TRACK_HEIGHT = 200;
const CAP_HEIGHT = 44;

// The four faders as the device lights them right now: screen, LEDs bouncing with the sound, mute button.
// Shared by the Lighting tabs so every preview looks the same.
export default {
  name: "FaderStrips",
  components: {ScribbleScreen},
  props: {
    selected: {type: String, default: null},
    clickable: {type: Boolean, default: true},
    // (fader, side, index) => colour, to draw something else on the LEDs (the Global animation)
    ledOverride: {type: Function, default: null},
  },
  emits: ["pick"],

  data() {
    return {
      faders: ["A", "B", "C", "D"],
      ledCount: LED_COUNT,
      meters: liveMeters,
    }
  },

  computed: {
    isMini() {
      return isDeviceMini();
    },
  },

  mounted() {
    this.releaseMeters = useLiveMeters();
  },

  beforeUnmount() {
    this.releaseMeters?.();
  },

  methods: {
    device() {
      return store.getActiveDevice();
    },
    lighting(fader) {
      return this.device().lighting.faders[fader];
    },
    channel(fader) {
      return this.device().fader_status[fader].channel;
    },
    channelLabel(fader) {
      return this.$t(`message.channels.${this.channel(fader)}`);
    },
    isMeter(fader) {
      return isMeterStyle(this.lighting(fader).style);
    },
    hasLevel(fader) {
      return !!this.meters[this.channel(fader)];
    },
    volume(fader) {
      return this.device().levels.volumes[this.channel(fader)] / 255;
    },
    capBottom(fader) {
      return Math.round(this.volume(fader) * (TRACK_HEIGHT - CAP_HEIGHT));
    },
    led(fader, side, index) {
      if (this.ledOverride) return this.ledOverride(fader, side, index);
      const status = this.device().fader_status[fader];
      const meter = this.meters[this.channel(fader)];
      let scaled = null;
      if (meter) {
        const scale = status.mute_state === "MutedToAll" ? 0 : this.volume(fader);
        scaled = {level: meter.level * scale, peak: meter.peak * scale};
      }
      const colours = this.lighting(fader).colours;
      return ledColour({
        style: this.lighting(fader).style, top: colours.colour_one, bottom: colours.colour_two,
        index, position: this.volume(fader), meter: scaled,
      });
    },
    scribbleUrl(fader) {
      const s = this.device().fader_status[fader].scribble;
      const query = `?i=${s.file_name}&b=${s.bottom_text}&l=${s.left_text}&in=${s.inverted}`;
      return `${getBaseHTTPAddress()}files/scribble/${store.getActiveSerial()}/${fader}.png${query}`;
    },
    screenStyle(fader) {
      if (this.isMini) return {};
      const colour = this.device().lighting.simple[ScribbleNames[fader]].colour_one;
      return {background: mixColours(colour, "ffffff", 0.7)};
    },
    // As the device lights it: the first colour when muted, otherwise per the "not muted" style
    muteStyle(fader) {
      const l = this.device().lighting.buttons[MuteButtonNamesForFader[fader]];
      const muted = this.device().fader_status[fader].mute_state !== "Unmuted";
      const look = buttonLook(l.colours.colour_one, l.colours.colour_two, l.off_style, muted);
      return {borderColor: look.borderColor, color: look.color};
    },
  },
}
</script>

<style scoped>
.faders {
  display: flex;
  gap: 10px;
}

.strip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 6px 6px;
  border: 2px solid transparent;
  border-radius: 9px;
  background: none;
  color: #9aa4a0;
  font-family: inherit;
}

.strip.clickable {
  cursor: pointer;
}

.strip.clickable:hover {
  border-color: #3b413f;
}

.strip.selected {
  border-color: #3ee6d9;
  box-shadow: 0 0 16px rgba(62, 230, 217, .27);
}

.strip:focus-visible {
  outline: 2px solid #59b1b6;
}

.screen {
  width: 70px;
  height: 35px;
  overflow: hidden;
  border-radius: 3px;
  display: grid;
  place-items: center;
  background: #d9dedc;
  color: #141716;
  font-size: 10px;
  font-weight: 700;
}

.track {
  position: relative;
  width: 72px;
  height: 200px;
  display: flex;
  justify-content: space-between;
}

.leds {
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
}

.leds i {
  width: 12px;
  height: 11.5px;
  border-radius: 2px;
}

.rod {
  position: absolute;
  left: 50%;
  top: 4px;
  bottom: 4px;
  width: 4px;
  margin-left: -2px;
  border-radius: 2px;
  background: #0b0d0d;
}

.cap {
  position: absolute;
  left: 50%;
  width: 34px;
  height: 44px;
  margin-left: -17px;
  border-radius: 4px;
  background: linear-gradient(90deg, #8a908f, #d5d9d8 45%, #9aa09f 55%, #6c7271);
  box-shadow: 0 4px 8px rgba(0, 0, 0, .55);
}

.strip small {
  font-size: 11px;
}

.mute {
  width: 54px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 2px solid;
  border-radius: 3px;
  font-size: 15px;
}

.noLevel {
  min-height: 26px;
  max-width: 76px;
  font-size: 10px;
  line-height: 1.3;
  color: #6f7774;
  text-align: center;
  visibility: hidden;
}

.noLevel.shown {
  visibility: visible;
}
</style>
