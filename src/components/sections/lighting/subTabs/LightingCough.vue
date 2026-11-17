<template>
  <div class="lightingPage">
    <h2 class="title">{{ $t('message.lighting.coughTab.title') }}</h2>
    <p class="lede">{{ $t('message.lighting.coughTab.lede') }}</p>

    <div class="layout">
      <!-- Live preview: the two buttons as the device lights them right now -->
      <section class="preview" :aria-label="$t('message.lighting.faderLights.live')">
        <div class="previewHead">
          <span class="live">{{ $t('message.lighting.faderLights.live') }}</span>
          <span>{{ $t('message.lighting.shared.clickButton') }}</span>
        </div>
        <!-- Bleep and mic mute, drawn as on the Device page -->
        <div class="stage">
          <div class="device">
            <div class="zone">
              <div class="muteButtons">
                <button type="button" class="bleep" :class="{ selected: target === 'Bleep' }" :style="look('Bleep')"
                        :aria-pressed="target === 'Bleep'" :aria-label="$t('message.lighting.coughTab.bleep')"
                        @click="toggleTarget('Bleep')">!@#$?*
                </button>
                <button type="button" class="cough" :class="{ selected: target === 'Cough' }" :style="coughLook()"
                        :aria-pressed="target === 'Cough'" :aria-label="$t('message.lighting.coughTab.cough')"
                        @click="toggleTarget('Cough')">
                  <span><font-awesome-icon icon="fa-solid fa-microphone-slash"/></span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="previewNote">{{ stateText() }}</div>
      </section>

      <section class="controls">
        <div>
          <div class="lab">{{ $t('message.lighting.faderLights.applyTo') }}</div>
          <div class="seg" role="radiogroup" :aria-label="$t('message.lighting.faderLights.applyTo')">
            <button v-for="option in options" :key="option.id" type="button" role="radio"
                    :aria-checked="target === option.id" :class="{ on: target === option.id }" @click="target = option.id">
              <i v-if="option.id !== 'both'" class="chip" :style="{ background: '#' + lighting(option.id).colours.colour_one }"></i>
              {{ $t(option.label) }}
            </button>
          </div>
        </div>

        <ColourPairs :current="targets().map(b => [lighting(b).colours.colour_one, lighting(b).colours.colour_two])"
                     @pick="setColours"/>

        <div>
          <div class="lab">{{ $t('message.lighting.faderLights.colours') }}</div>
          <div class="colourRow">
            <ColourSwatch id="cough-on" :value="current().colours.colour_one" :label="$t('message.lighting.shared.on')"
                          :hint="$t('message.lighting.coughTab.onHint')" @change="setColours($event, current().colours.colour_two)"/>
            <ColourSwatch id="cough-off" :value="current().colours.colour_two" :label="$t('message.lighting.shared.off')"
                          :hint="$t('message.lighting.shared.offHint')" @change="setColours(current().colours.colour_one, $event)"/>
            <button type="button" class="swap" :title="$t('message.lighting.shared.swapHint')"
                    @click="setColours(current().colours.colour_two, current().colours.colour_one)">⇅ {{ $t('message.lighting.faderLights.swap') }}
            </button>
          </div>
            <OffStyleCards sub
                         :model-value="currentOffStyle()" @pick="setOffStyle"/>
        </div>

        <p class="note">{{ $t('message.lighting.coughTab.note') }}</p>

        <LightingSaveRow/>
      </section>
    </div>
  </div>
</template>

<script>
import ColourSwatch from "@/components/sections/lighting/elements/ColourSwatch.vue";
import {store} from "@/store";
import {websocket} from "@/util/sockets";
import {buttonLook, shared} from "@/util/lightingColours";
import OffStyleCards from "@/components/sections/lighting/elements/OffStyleCards.vue";
import ColourPairs from "@/components/sections/lighting/elements/ColourPairs.vue";
import LightingSaveRow from "@/components/sections/lighting/elements/LightingSaveRow.vue";

// Lighting → Cough: the Bleep button and the mic mute (Cough) button
export default {
  name: "LightingCough",
  components: {ColourSwatch, OffStyleCards, ColourPairs, LightingSaveRow},
  emits: ["nav-updated"],

  data() {
    return {
      target: "both",
      options: [
        {id: "both", label: "message.lighting.coughTab.both"},
        {id: "Bleep", label: "message.lighting.coughTab.bleep"},
        {id: "Cough", label: "message.lighting.coughTab.cough"},
      ],
    }
  },

  methods: {
    getNodes() {
      return [];
    },
    device() {
      return store.getActiveDevice();
    },
    lighting(button) {
      return this.device().lighting.buttons[button];
    },
    targets() {
      return this.target === "both" ? ["Bleep", "Cough"] : [this.target];
    },
    toggleTarget(button) {
      this.target = this.target === button ? "both" : button;
    },
    current() {
      return this.lighting(this.targets()[0]);
    },
    currentOffStyle() {
      return shared(this.targets().map(b => this.lighting(b).off_style));
    },
    isLit(button) {
      if (button === "Cough") return this.device().cough_button.state !== "Unmuted";
      return !!this.device().button_down?.Bleep;
    },
    colour(button) {
      const l = this.lighting(button);
      return buttonLook(l.colours.colour_one, l.colours.colour_two, l.off_style, this.isLit(button)).borderColor;
    },
    // As on the Device page: border and label in the colour the light shows
    look(button) {
      return {borderColor: this.colour(button), color: this.colour(button)};
    },
    // The cough button's outline is its background showing around the cut-corner face
    coughLook() {
      return {background: this.colour("Cough"), color: this.colour("Cough")};
    },
    stateText() {
      const t = (key) => this.$t(`message.lighting.shared.${key}`);
      return this.$t('message.lighting.coughTab.state', {
        cough: this.isLit("Cough") ? t('isOn') : t('isOff'),
        bleep: this.isLit("Bleep") ? t('isOn') : t('isOff'),
      });
    },
    setColours(one, two) {
      this.targets().forEach(b => {
        this.lighting(b).colours.colour_one = one;
        this.lighting(b).colours.colour_two = two;
        websocket.send_command(store.getActiveSerial(), {"SetButtonColours": [b, one, two]});
      });
    },
    setOffStyle(style) {
      this.targets().forEach(b => {
        this.lighting(b).off_style = style;
        websocket.send_command(store.getActiveSerial(), {"SetButtonOffStyle": [b, style]});
      });
    },
  },
}
</script>

<style scoped src="../elements/lightingPage.css"></style>
<style scoped src="../../device/deviceShell.css"></style>
<style scoped>
/* Only the mute buttons of the device body */
.device {
  padding: 30px 40px 26px;
}

.muteButtons {
  padding-top: 0;
  border-top: 0;
}

.bleep, .cough {
  cursor: pointer;
}
</style>
