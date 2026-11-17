<template>
  <div class="faderLights">
    <h2 class="title">{{ $t('message.lighting.faderLights.title') }}</h2>
    <p class="lede">{{ $t('message.lighting.faderLights.lede') }}</p>

    <div class="layout">
      <!-- Live preview: the four faders as the device lights them right now -->
      <section class="preview" :aria-label="$t('message.lighting.faderLights.live')">
        <div class="previewHead">
          <span class="live">{{ $t('message.lighting.faderLights.live') }}</span>
          <span>{{ $t('message.lighting.faderLights.clickHint') }}</span>
        </div>
        <FaderStrips :selected="target" @pick="toggleTarget"/>
      </section>

      <section class="controls">
        <div>
          <div class="lab">{{ $t('message.lighting.faderLights.applyTo') }}</div>
          <div class="seg" role="radiogroup" :aria-label="$t('message.lighting.faderLights.applyTo')">
            <button type="button" role="radio" :aria-checked="target === 'all'" :class="{ on: target === 'all' }"
                    @click="target = 'all'">{{ $t('message.lighting.faderLights.allFaders') }}
            </button>
            <button v-for="(fader, i) in faders" :key="fader" type="button" role="radio" :aria-checked="target === fader"
                    :class="{ on: target === fader }" @click="target = fader">
              <i class="chip" :style="{ background: `linear-gradient(#${colours(fader).colour_one}, #${colours(fader).colour_two})` }"></i>
              {{ i + 1 }} · {{ channelLabel(fader) }}
            </button>
          </div>
        </div>

        <div>
          <div class="lab">{{ $t('message.lighting.faderLights.style') }}</div>
          <div class="styles" role="radiogroup" :aria-label="$t('message.lighting.faderLights.style')">
            <button v-for="style in styles" :key="style" type="button" role="radio" class="styleCard"
                    :class="{ on: currentStyle() === style }" :aria-checked="currentStyle() === style"
                    @click="setStyle(style)">
              <span class="mini"><i v-for="n in 8" :key="n" :style="{ background: miniLed(style, n - 1) }"></i></span>
              <b>{{ $t(`message.lighting.faderLights.styles.${style}.name`) }}<span v-if="meterStyle(style)" class="tag">LIVE</span></b>
              <span class="desc">{{ $t(`message.lighting.faderLights.styles.${style}.desc`) }}</span>
            </button>
          </div>
        </div>

        <div>
          <div class="lab">{{ $t('message.lighting.faderLights.pairs') }}</div>
          <div class="pairs">
            <button v-for="pair in pairs" :key="pair.name" type="button" class="pair"
                    :class="{ on: isPair(pair) }" :title="pair.name" @click="setColours(pair.top, pair.bottom)">
              <i :style="{ background: `linear-gradient(#${pair.top}, #${pair.bottom})` }"></i>
              <span>{{ pair.name }}</span>
            </button>
          </div>
        </div>

        <div>
          <div class="lab">{{ $t('message.lighting.faderLights.colours') }}</div>
          <div class="colourRow">
            <ColourSwatch id="fader-lights-top" :value="current().colour_one" :label="$t('message.lighting.faderLights.top')"
                          :hint="$t('message.lighting.faderLights.topHint')" @change="setColours($event, current().colour_two)"/>
            <ColourSwatch id="fader-lights-bottom" :value="current().colour_two" :label="$t('message.lighting.faderLights.bottom')"
                          :hint="$t('message.lighting.faderLights.bottomHint')" @change="setColours(current().colour_one, $event)"/>
            <button type="button" class="swap" :title="$t('message.lighting.faderLights.swapHint')"
                    @click="setColours(current().colour_two, current().colour_one)">⇅ {{ $t('message.lighting.faderLights.swap') }}
            </button>
          </div>
        </div>

        <!-- The mute button under each fader -->
        <div>
          <div class="lab">{{ $t('message.lighting.faderLights.mute.title') }}</div>
          <div class="colourRow">
            <ColourSwatch id="fader-lights-mute-on" :value="currentMute().colours.colour_one" :label="$t('message.lighting.faderLights.mute.muted')"
                          :hint="$t('message.lighting.faderLights.mute.mutedHint')" @change="setMuteColours($event, currentMute().colours.colour_two)"/>
            <ColourSwatch id="fader-lights-mute-off" :value="currentMute().colours.colour_two" :label="$t('message.lighting.faderLights.mute.unmuted')"
                          :hint="$t('message.lighting.faderLights.mute.unmutedHint')" @change="setMuteColours(currentMute().colours.colour_one, $event)"/>
            <button type="button" class="swap" :title="$t('message.lighting.faderLights.mute.matchHint')" @click="matchFaderColours">
              {{ $t('message.lighting.faderLights.mute.match') }}
            </button>
          </div>
          <div class="sublab">{{ $t('message.lighting.faderLights.mute.offStyle') }}</div>
          <div class="seg" role="radiogroup" :aria-label="$t('message.lighting.faderLights.mute.offStyle')">
            <button v-for="option in offStyles()" :key="option.id" type="button" role="radio"
                    :aria-checked="currentMuteOffStyle() === option.id" :class="{ on: currentMuteOffStyle() === option.id }"
                    @click="setMuteOffStyle(option.id)">{{ option.label }}
            </button>
          </div>
        </div>

        <p class="note">{{ $t('message.lighting.faderLights.note') }}</p>

        <div class="saveRow">
          <button type="button" class="save" :disabled="!dirty.profile || saving" @click="save">
            {{ $t('message.lighting.faderLights.save') }}
          </button>
          <span class="note plain">{{ dirty.profile ? $t('message.lighting.faderLights.unsaved') : $t('message.lighting.faderLights.saved') }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import ColourSwatch from "@/components/sections/lighting/elements/ColourSwatch.vue";
import {store} from "@/store";
import {websocket} from "@/util/sockets";
import {getLightingInactiveOptions, MuteButtonNamesForFader} from "@/util/mixerMapping";
import {FADER_STYLES, isMeterStyle, ledColour} from "@/util/faderLeds";
import {profileDirty} from "@/util/profileDirty";
import {PAIRS} from "@/util/lightingColours";
import FaderStrips from "@/components/sections/lighting/elements/FaderStrips.vue";

const MINI_TICK_MS = 80;

// Lighting → Fader lights: the style and colours of the LEDs beside each fader, with a live preview
export default {
  name: "LightingFaderLights",
  components: {ColourSwatch, FaderStrips},
  emits: ["nav-updated"],

  data() {
    return {
      faders: ["A", "B", "C", "D"],
      styles: FADER_STYLES,
      pairs: PAIRS,
      target: "all",
      dirty: profileDirty,
      saving: false,
      tick: 0,
    }
  },

  mounted() {
    const slow = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    this.tickTimer = setInterval(() => this.tick++, slow ? MINI_TICK_MS * 5 : MINI_TICK_MS);
  },

  beforeUnmount() {
    clearInterval(this.tickTimer);
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
    lighting(fader) {
      return this.device().lighting.faders[fader];
    },
    colours(fader) {
      return this.lighting(fader).colours;
    },
    channel(fader) {
      return this.device().fader_status[fader].channel;
    },
    channelLabel(fader) {
      return this.$t(`message.channels.${this.channel(fader)}`);
    },
    targets() {
      return this.target === "all" ? this.faders : [this.target];
    },
    toggleTarget(fader) {
      this.target = this.target === fader ? "all" : fader;
    },
    // The fader whose settings the controls show (the first one when editing all)
    current() {
      return this.colours(this.targets()[0]);
    },
    currentStyle() {
      const styles = new Set(this.targets().map(f => this.lighting(f).style));
      return styles.size === 1 ? [...styles][0] : null;
    },
    meterStyle(style) {
      return isMeterStyle(style);
    },
    isPair(pair) {
      return this.targets().every(f => this.colours(f).colour_one === pair.top && this.colours(f).colour_two === pair.bottom);
    },

    /* ---------- Drawing ---------- */
    // The little demo column on each style card, in the current colours, with a pretend signal
    miniLed(style, index) {
      const c = this.current();
      // swings all the way up now and then, so the Meter card shows its top colour too
      const level = 0.35 + 0.65 * Math.abs(Math.sin(this.tick / 4));
      return ledColour({
        style, top: c.colour_one, bottom: c.colour_two, index, count: 8,
        position: 0.8, meter: {level, peak: 0},
      });
    },
    /* ---------- Mute buttons ---------- */
    muteLighting(fader) {
      return this.device().lighting.buttons[MuteButtonNamesForFader[fader]];
    },
    currentMute() {
      return this.muteLighting(this.targets()[0]);
    },
    currentMuteOffStyle() {
      const styles = new Set(this.targets().map(f => this.muteLighting(f).off_style));
      return styles.size === 1 ? [...styles][0] : null;
    },
    offStyles() {
      return getLightingInactiveOptions((key) => this.$t(key));
    },
    setMuteColours(one, two) {
      this.targets().forEach(f => {
        const lighting = this.muteLighting(f);
        lighting.colours.colour_one = one;
        lighting.colours.colour_two = two;
        websocket.send_command(this.serial(), {"SetButtonColours": [MuteButtonNamesForFader[f], one, two]});
      });
    },
    setMuteOffStyle(style) {
      this.targets().forEach(f => {
        this.muteLighting(f).off_style = style;
        websocket.send_command(this.serial(), {"SetButtonOffStyle": [MuteButtonNamesForFader[f], style]});
      });
    },
    // Each mute button takes its own fader's colours: bottom when muted, top when not
    matchFaderColours() {
      this.targets().forEach(f => {
        const fader = this.colours(f), lighting = this.muteLighting(f);
        lighting.colours.colour_one = fader.colour_two;
        lighting.colours.colour_two = fader.colour_one;
        websocket.send_command(this.serial(), {"SetButtonColours": [MuteButtonNamesForFader[f], fader.colour_two, fader.colour_one]});
      });
    },

    /* ---------- Changes ---------- */
    setStyle(style) {
      const targets = this.targets();
      targets.forEach(f => this.lighting(f).style = style);
      if (targets.length === this.faders.length) {
        websocket.send_command(this.serial(), {"SetAllFaderDisplayStyle": style});
      } else {
        websocket.send_command(this.serial(), {"SetFaderDisplayStyle": [targets[0], style]});
      }
    },
    setColours(top, bottom) {
      const targets = this.targets();
      targets.forEach(f => {
        this.colours(f).colour_one = top;
        this.colours(f).colour_two = bottom;
      });
      if (targets.length === this.faders.length) {
        websocket.send_command(this.serial(), {"SetAllFaderColours": [top, bottom]});
      } else {
        websocket.send_command(this.serial(), {"SetFaderColours": [targets[0], top, bottom]});
      }
    },
    save() {
      this.saving = true;
      websocket.send_command(this.serial(), {"SaveProfile": []}).finally(() => this.saving = false);
    },
  },
}
</script>

<style scoped>
.faderLights {
  padding: 4px 24px 32px;
  color: #e8ecea;
}

.title {
  margin: 18px 0 4px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 700;
  font-size: 20px;
}

.lede {
  margin: 0 0 16px;
  max-width: 70ch;
  color: #9aa4a0;
  line-height: 1.5;
}

.layout {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}

@media (max-width: 1000px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

/* ---------- Live preview ---------- */
.preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px 12px;
  border-radius: 12px;
  background: linear-gradient(#2a2f2e, #202423);
}

.previewHead {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 12px;
  color: #9aa4a0;
}

.live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.live::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3fd17a;
  box-shadow: 0 0 6px #3fd17a;
}

/* ---------- Controls ---------- */
.controls {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.lab {
  margin-bottom: 8px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  color: #c3ccc8;
}

.sublab {
  margin: 12px 0 8px;
  font-size: 12px;
  color: #9aa4a0;
}

.seg {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.seg button, .swap, .pair {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border: 1px solid #343a38;
  border-radius: 6px;
  background: #262b2a;
  color: #e8ecea;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
}

.seg button.on, .pair.on {
  border-color: #3ee6d9;
  background: #1d3333;
}

.seg .chip {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.styles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}

.styleCard {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid #343a38;
  border-radius: 10px;
  background: #262b2a;
  color: #e8ecea;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
}

.styleCard:hover {
  border-color: #4a5452;
}

.styleCard.on {
  border-color: #3ee6d9;
  background: #1d3333;
}

.styleCard .mini {
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
}

.styleCard .mini i {
  width: 12px;
  height: 6px;
  border-radius: 1px;
}

.styleCard b {
  font-family: var(--goxlr-title-font);
  letter-spacing: .08em;
  text-transform: uppercase;
  font-size: 14px;
}

.styleCard .desc {
  font-size: 12px;
  line-height: 1.35;
  color: #9aa4a0;
}

.tag {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 9px;
  background: rgba(62, 230, 217, .13);
  color: #3ee6d9;
  font-size: 10px;
  letter-spacing: .06em;
  vertical-align: 2px;
}

.pairs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pair i {
  width: 12px;
  height: 22px;
  border-radius: 3px;
}

.colourRow {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.colour {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid #343a38;
  border-radius: 8px;
  background: #262b2a;
  cursor: pointer;
}

.colour input {
  width: 34px;
  height: 26px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.colour small {
  display: block;
  font-size: 12px;
  color: #9aa4a0;
}

.note {
  max-width: 60ch;
  margin: 0;
  padding-left: 10px;
  border-left: 2px solid #3b413f;
  font-size: 12px;
  line-height: 1.5;
  color: #9aa4a0;
}

.note.plain {
  padding: 0;
  border: 0;
}

.saveRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.save {
  padding: 7px 14px;
  border: 1px solid #f0b429;
  border-radius: 6px;
  background: #3a2f12;
  color: #ffd77a;
  font-family: inherit;
  cursor: pointer;
}

.save:disabled {
  border-color: #343a38;
  background: #262b2a;
  color: #6f7774;
  cursor: default;
}

button:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}
</style>
