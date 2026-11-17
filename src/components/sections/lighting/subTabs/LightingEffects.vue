<template>
  <div class="lightingPage">
    <h2 class="title">{{ $t('message.lighting.effectsTab.title') }}</h2>
    <p class="lede">{{ $t('message.lighting.effectsTab.lede') }}</p>

    <div class="layout">
      <!-- Live preview: preset buttons, knob rings and effect buttons as the device lights them -->
      <section class="preview" :aria-label="$t('message.lighting.faderLights.live')">
        <div class="previewHead">
          <span class="live">{{ $t('message.lighting.faderLights.live') }}</span>
          <span>{{ $t('message.lighting.effectsTab.clickHint') }}</span>
        </div>
        <!-- The effects part of the GoXLR, drawn as on the Device page -->
        <div class="stage">
          <div class="device">
            <div class="zone middleZone">
              <div class="effectsArea">
                <div class="presets">
                  <button v-for="(preset, i) in presets" :key="preset" type="button" class="preset"
                          :class="{ selected: isSelected('presets', i) }" :style="lightStyle(preset, presetLit(i))"
                          :aria-pressed="isSelected('presets', i)"
                          :aria-label="$t('message.lighting.effectsTab.preset', { n: i + 1 })" @click="pick('presets', i)">{{ i + 1 }}
                  </button>
                </div>
                <div class="knobArea">
                  <div class="logo">GO<LogoX :colour="'#' + device().lighting.simple.Accent.colour_one"/>LR<small>EXCE<i>I</i><i>I</i>ENT</small></div>
                  <div class="knobs">
                    <button v-for="(knob, i) in knobs" :key="knob.id" type="button" class="knob"
                            :class="{ selected: isSelected('knobs', i) }" :aria-pressed="isSelected('knobs', i)" @click="pick('knobs', i)">
                      <span class="ring">
                        <span v-for="dot in dots(knob)" :key="dot.i" class="dot"
                              :style="{ left: dot.x + 'px', top: dot.y + 'px', background: dot.colour, transform: 'rotate(' + dot.a + 'deg)', boxShadow: dot.glow }"></span>
                        <span class="cap">
                          <span class="pointer" :style="{ transform: 'rotate(' + rotation(knob) + 'deg)', background: '#' + encoder(i).colour_three }"></span>
                        </span>
                      </span>
                      <span class="knobName">{{ $t(`message.lighting.effects.encoders.encoders.${knob.i18n}`) }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="zone rightZone">
              <div class="fxButtons">
                <button v-for="(button, i) in fxButtons" :key="button.id" type="button" class="fx"
                        :class="[button.css, { selected: isSelected('buttons', i) }]" :style="lightStyle(button.id, fxLit(i))"
                        :aria-pressed="isSelected('buttons', i)" @click="pick('buttons', i)">
                  {{ $t(`message.lighting.effectsTab.buttonNames.${button.effect ?? 'fx'}`) }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="previewNote">{{ onNowText() }}</div>
      </section>

      <section class="controls">
        <div>
          <div class="lab">{{ $t('message.lighting.effectsTab.part') }}</div>
          <div class="seg" role="radiogroup" :aria-label="$t('message.lighting.effectsTab.part')">
            <button v-for="p in parts" :key="p" type="button" role="radio" :aria-checked="part === p"
                    :class="{ on: part === p }" @click="setPart(p)">{{ $t(`message.lighting.effectsTab.parts.${p}`) }}
            </button>
          </div>
        </div>

        <div>
          <div class="lab">{{ $t('message.lighting.faderLights.applyTo') }}</div>
          <div class="seg" role="radiogroup" :aria-label="$t('message.lighting.faderLights.applyTo')">
            <button type="button" role="radio" :aria-checked="target === 'all'" :class="{ on: target === 'all' }"
                    @click="target = 'all'">{{ $t(`message.lighting.effectsTab.all.${part}`) }}
            </button>
            <button v-for="(name, i) in names()" :key="name" type="button" role="radio" :aria-checked="target === i"
                    :class="{ on: target === i }" @click="target = i">
              <i class="chip" :style="{ background: '#' + chipColour(i) }"></i>{{ name }}
            </button>
          </div>
        </div>

        <!-- Knobs: three colours, always lit -->
        <template v-if="part === 'knobs'">
          <ColourPairs :current="targets().map(i => [encoder(i).colour_two, encoder(i).colour_one])"
                       @pick="(left, right) => setEncoder({colour_two: left, colour_one: right})"/>
          <div>
            <div class="lab">{{ $t('message.lighting.faderLights.colours') }}</div>
            <div class="colourRow">
              <ColourSwatch id="fx-knob-left" :value="currentEncoder().colour_two" :label="$t('message.lighting.effectsTab.left')"
                          :hint="$t('message.lighting.effectsTab.leftHint')" @change="setEncoder({colour_two: $event})"/>
              <ColourSwatch id="fx-knob-right" :value="currentEncoder().colour_one" :label="$t('message.lighting.effectsTab.right')"
                          :hint="$t('message.lighting.effectsTab.rightHint')" @change="setEncoder({colour_one: $event})"/>
              <ColourSwatch id="fx-knob-cap" :value="currentEncoder().colour_three" :label="$t('message.lighting.effectsTab.knob')"
                          :hint="$t('message.lighting.effectsTab.knobHint')" @change="setEncoder({colour_three: $event})"/>
              <button type="button" class="swap" :title="$t('message.lighting.shared.swapHint')"
                      @click="setEncoder({colour_one: currentEncoder().colour_two, colour_two: currentEncoder().colour_one})">⇅ {{ $t('message.lighting.faderLights.swap') }}
              </button>
            </div>
          </div>
          <p class="note">{{ $t('message.lighting.effectsTab.knobNote') }}</p>
        </template>

        <!-- Preset buttons / effect buttons: on, off and the off style -->
        <template v-else>
          <ColourPairs :current="targetButtons().map(b => [buttonLighting(b).colours.colour_one, buttonLighting(b).colours.colour_two])"
                       @pick="setButtonColours"/>
          <div>
            <div class="lab">{{ $t('message.lighting.faderLights.colours') }}</div>
            <div class="colourRow">
              <ColourSwatch id="fx-button-on" :value="currentButton().colours.colour_one" :label="$t('message.lighting.shared.on')"
                          :hint="$t(`message.lighting.effectsTab.onHint.${part}`)" @change="setButtonColours($event, currentButton().colours.colour_two)"/>
              <ColourSwatch id="fx-button-off" :value="currentButton().colours.colour_two" :label="$t('message.lighting.shared.off')"
                          :hint="$t('message.lighting.shared.offHint')" @change="setButtonColours(currentButton().colours.colour_one, $event)"/>
              <button type="button" class="swap" :title="$t('message.lighting.shared.swapHint')"
                      @click="setButtonColours(currentButton().colours.colour_two, currentButton().colours.colour_one)">⇅ {{ $t('message.lighting.faderLights.swap') }}
              </button>
            </div>
            <OffStyleCards sub :model-value="currentOffStyle()" @pick="setOffStyle"/>
          </div>
          <p class="note">{{ $t(`message.lighting.effectsTab.note.${part}`) }}</p>
        </template>

        <LightingSaveRow/>
      </section>
    </div>
  </div>
</template>

<script>
import ColourSwatch from "@/components/sections/lighting/elements/ColourSwatch.vue";
import {store} from "@/store";
import {websocket} from "@/util/sockets";
import {KNOB_DOTS, KNOBS, knobDotColours, knobPos} from "@/util/effectKnobs";
import {buttonLook, shared} from "@/util/lightingColours";
import OffStyleCards from "@/components/sections/lighting/elements/OffStyleCards.vue";
import ColourPairs from "@/components/sections/lighting/elements/ColourPairs.vue";
import LightingSaveRow from "@/components/sections/lighting/elements/LightingSaveRow.vue";
import LogoX from "@/components/sections/device/LogoX.vue";

const PRESETS = ["EffectSelect1", "EffectSelect2", "EffectSelect3", "EffectSelect4", "EffectSelect5", "EffectSelect6"];
const FX_BUTTONS = [
  {id: "EffectMegaphone", effect: "megaphone", css: "small"},
  {id: "EffectRobot", effect: "robot", css: "small"},
  {id: "EffectHardTune", effect: "hard_tune", css: "small"},
  {id: "EffectFx", effect: null, css: "large"},
];

// Lighting → Effects: preset buttons 1-6, the LED rings of the four knobs, and the effect buttons
export default {
  name: "LightingEffects",
  components: {ColourSwatch, OffStyleCards, ColourPairs, LightingSaveRow, LogoX},
  emits: ["nav-updated"],

  data() {
    return {
      parts: ["presets", "knobs", "buttons"],
      presets: PRESETS,
      knobs: KNOBS,
      fxButtons: FX_BUTTONS,
      part: "presets",
      target: "all",
    }
  },

  // Keeps the highlight on the device picture in step
  watch: {
    target() {
      this.$emit("nav-updated");
    },
    part() {
      this.$emit("nav-updated");
    },
  },

  methods: {
    // The preset being edited, for the highlight on the device picture
    getNodes() {
      return this.part === "presets" && this.target !== "all" ? ["Preset" + (this.target + 1)] : [];
    },
    device() {
      return store.getActiveDevice();
    },
    serial() {
      return store.getActiveSerial();
    },
    // Called by LightingTab when a preset is clicked on the device picture ("Preset1" … "Preset6")
    setActivePreset(preset) {
      this.part = "presets";
      this.target = parseInt(preset.replace("Preset", "")) - 1;
    },
    setPart(part) {
      this.part = part;
      this.target = "all";
    },
    pick(part, index) {
      if (this.part !== part) {
        this.part = part;
        this.target = index;
      } else {
        this.target = this.target === index ? "all" : index;
      }
    },
    isSelected(part, index) {
      return this.part === part && this.target === index;
    },
    names() {
      if (this.part === "presets") return PRESETS.map((_, i) => this.$t('message.lighting.effectsTab.preset', {n: i + 1}));
      if (this.part === "knobs") return KNOBS.map(k => this.$t(`message.lighting.effects.encoders.encoders.${k.i18n}`));
      return FX_BUTTONS.map(b => this.$t(`message.lighting.effectsTab.buttonNames.${b.effect ?? 'fx'}`));
    },
    // Indexes into the current part's list
    targets() {
      return this.target === "all" ? this.names().map((_, i) => i) : [this.target];
    },
    chipColour(index) {
      if (this.part === "knobs") return this.encoder(index).colour_two;
      return this.buttonLighting(this.partButtons()[index]).colours.colour_one;
    },

    /* ---------- Buttons ---------- */
    partButtons() {
      return this.part === "presets" ? PRESETS : FX_BUTTONS.map(b => b.id);
    },
    targetButtons() {
      return this.targets().map(i => this.partButtons()[i]);
    },
    buttonLighting(button) {
      return this.device().lighting.buttons[button];
    },
    currentButton() {
      return this.buttonLighting(this.targetButtons()[0]);
    },
    currentOffStyle() {
      return shared(this.targetButtons().map(b => this.buttonLighting(b).off_style));
    },
    presetLit(index) {
      return this.device().effects.active_preset === "Preset" + (index + 1);
    },
    fxLit(index) {
      const effects = this.device().effects;
      const effect = FX_BUTTONS[index].effect;
      return effect ? !!effects.current[effect].is_enabled : !!effects.is_enabled;
    },
    // As on the Device page: border and label in the colour the light shows
    lightStyle(button, lit) {
      const l = this.buttonLighting(button);
      const colour = buttonLook(l.colours.colour_one, l.colours.colour_two, l.off_style, lit).borderColor;
      return {borderColor: colour, color: colour};
    },
    onNowText() {
      const on = [];
      PRESETS.forEach((_, i) => this.presetLit(i) && on.push(this.$t('message.lighting.effectsTab.preset', {n: i + 1})));
      FX_BUTTONS.forEach((b, i) => this.fxLit(i) && on.push(this.$t(`message.lighting.effectsTab.buttonNames.${b.effect ?? 'fx'}`)));
      if (on.length === 0) return this.$t('message.lighting.effectsTab.onNowNone');
      if (on.length === 1) return this.$t('message.lighting.effectsTab.onNowOne', {name: on[0]});
      const list = on.slice(0, -1).join(", ");
      return this.$t('message.lighting.effectsTab.onNowMany', {list, last: on[on.length - 1]});
    },
    setButtonColours(one, two) {
      this.targetButtons().forEach(b => {
        const l = this.buttonLighting(b);
        l.colours.colour_one = one;
        l.colours.colour_two = two;
        websocket.send_command(this.serial(), {"SetButtonColours": [b, one, two]});
      });
    },
    setOffStyle(style) {
      this.targetButtons().forEach(b => {
        this.buttonLighting(b).off_style = style;
        websocket.send_command(this.serial(), {"SetButtonOffStyle": [b, style]});
      });
    },

    /* ---------- Knobs ---------- */
    encoder(index) {
      return this.device().lighting.encoders[KNOBS[index].encoder];
    },
    currentEncoder() {
      return this.encoder(this.targets()[0]);
    },
    // The LED ring, placed as on the Device page
    dots(knob) {
      return knobDotColours(this.device(), knob).map((dot, i) => {
        const deg = 135 + i * 270 / (KNOB_DOTS - 1);
        const rad = deg * Math.PI / 180;
        return {
          i, a: Math.round(deg + 90), colour: dot.colour,
          x: Math.round(42 + 36 * Math.cos(rad)), y: Math.round(42 + 36 * Math.sin(rad)),
          glow: dot.lit ? `0 0 4px ${dot.colour}` : "none",
        };
      });
    },
    rotation(knob) {
      return Math.round(-135 + knobPos(this.device(), knob) * 270);
    },
    // Changes only the given colours (colour_one = right, colour_two = left, colour_three = knob)
    setEncoder(change) {
      this.targets().forEach(i => {
        const e = this.encoder(i);
        Object.assign(e, change);
        websocket.send_command(this.serial(), {"SetEncoderColour": [KNOBS[i].encoder, e.colour_one, e.colour_two, e.colour_three]});
      });
    },
  },
}
</script>

<style scoped src="../elements/lightingPage.css"></style>
<style scoped src="../../device/deviceShell.css"></style>
<style scoped>
/* Only the effects part of the device body */
.device {
  padding: 26px 30px 22px;
}

.knob {
  cursor: pointer;
}
</style>
