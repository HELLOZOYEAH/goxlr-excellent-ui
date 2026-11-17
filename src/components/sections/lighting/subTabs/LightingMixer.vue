<template>
  <div class="lightingPage">
    <h2 class="title">{{ $t('message.lighting.mixerTab.title') }}</h2>
    <p class="lede">{{ $t('message.lighting.mixerTab.lede') }}</p>

    <div class="layout">
      <!-- Live preview: each fader's screen and mute button as the device lights them -->
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
              <i class="chip" :style="{ background: `linear-gradient(#${faderColours(fader).colour_one}, #${faderColours(fader).colour_two})` }"></i>
              {{ i + 1 }} · {{ channelLabel(fader) }}
            </button>
          </div>
        </div>

        <div>
          <div class="lab">{{ $t('message.lighting.mixerTab.screen') }}</div>
          <div class="colourRow">
            <ColourSwatch id="mixer-screen" :value="screenColour(targets()[0])" :label="$t('message.lighting.mixerTab.backlight')"
                          :hint="$t('message.lighting.mixerTab.backlightHint')" @change="setScreenColour($event)"/>
            <button type="button" class="swap" :title="$t('message.lighting.mixerTab.matchFaderHint')" @click="matchFaderTop">
              {{ $t('message.lighting.mixerTab.matchFader') }}
            </button>
          </div>
        </div>

        <div>
          <div class="lab">{{ $t('message.lighting.faderLights.mute.title') }}</div>
          <div class="colourRow">
            <ColourSwatch id="mixer-mute-on" :value="currentMute().colours.colour_one" :label="$t('message.lighting.faderLights.mute.muted')"
                          :hint="$t('message.lighting.faderLights.mute.mutedHint')" @change="setMuteColours($event, currentMute().colours.colour_two)"/>
            <ColourSwatch id="mixer-mute-off" :value="currentMute().colours.colour_two" :label="$t('message.lighting.faderLights.mute.unmuted')"
                          :hint="$t('message.lighting.shared.offHint')" @change="setMuteColours(currentMute().colours.colour_one, $event)"/>
            <button type="button" class="swap" :title="$t('message.lighting.shared.swapHint')"
                    @click="setMuteColours(currentMute().colours.colour_two, currentMute().colours.colour_one)">⇅ {{ $t('message.lighting.faderLights.swap') }}
            </button>
          </div>
            <OffStyleCards sub :title="$t('message.lighting.faderLights.mute.offStyle')"
                         :model-value="currentMuteOffStyle()" @pick="setMuteOffStyle"/>
        </div>

        <p class="note">
          {{ $t('message.lighting.mixerTab.notePrefix') }}
          <a role="link" tabindex="0" @click="$emit('open-tab', 'configuration')"
             @keydown.enter="$emit('open-tab', 'configuration')">{{ $t('message.navigation.configuration') }}</a>.
        </p>

        <LightingSaveRow/>
      </section>
    </div>
  </div>
</template>

<script>
import ColourSwatch from "@/components/sections/lighting/elements/ColourSwatch.vue";
import {store} from "@/store";
import {websocket} from "@/util/sockets";
import {MuteButtonNamesForFader, ScribbleNames} from "@/util/mixerMapping";
import {shared} from "@/util/lightingColours";
import FaderStrips from "@/components/sections/lighting/elements/FaderStrips.vue";
import OffStyleCards from "@/components/sections/lighting/elements/OffStyleCards.vue";
import LightingSaveRow from "@/components/sections/lighting/elements/LightingSaveRow.vue";

// Lighting → Mixer: the screen above each fader and the mute button under it
export default {
  name: "LightingMixer",
  components: {ColourSwatch, FaderStrips, OffStyleCards, LightingSaveRow},
  emits: ["nav-updated", "open-tab"],

  data() {
    return {
      faders: ["A", "B", "C", "D"],
      target: "all",
    }
  },

  // Keeps the highlight on the device picture in step
  watch: {
    target() {
      this.$emit("nav-updated");
    },
  },

  methods: {
    getNodes() {
      return this.target === "all" ? [] : [this.target];
    },
    // Called by LightingTab when a fader is clicked on the device picture
    onChannelSelectionChange(fader) {
      this.target = fader;
      this.$emit("nav-updated");
    },
    device() {
      return store.getActiveDevice();
    },
    serial() {
      return store.getActiveSerial();
    },
    targets() {
      return this.target === "all" ? this.faders : [this.target];
    },
    toggleTarget(fader) {
      this.target = this.target === fader ? "all" : fader;
      this.$emit("nav-updated");
    },
    channel(fader) {
      return this.device().fader_status[fader].channel;
    },
    channelLabel(fader) {
      return this.$t(`message.channels.${this.channel(fader)}`);
    },

    faderColours(fader) {
      return this.device().lighting.faders[fader].colours;
    },
    screenColour(fader) {
      return this.device().lighting.simple[ScribbleNames[fader]].colour_one;
    },
    muteLighting(fader) {
      return this.device().lighting.buttons[MuteButtonNamesForFader[fader]];
    },
    currentMute() {
      return this.muteLighting(this.targets()[0]);
    },
    currentMuteOffStyle() {
      return shared(this.targets().map(f => this.muteLighting(f).off_style));
    },

    /* ---------- Changes ---------- */
    setScreenColour(colour) {
      this.targets().forEach(f => {
        this.device().lighting.simple[ScribbleNames[f]].colour_one = colour;
        websocket.send_command(this.serial(), {"SetSimpleColour": [ScribbleNames[f], colour]});
      });
    },
    // Each screen takes its own fader's top colour
    matchFaderTop() {
      this.targets().forEach(f => {
        const colour = this.device().lighting.faders[f].colours.colour_one;
        this.device().lighting.simple[ScribbleNames[f]].colour_one = colour;
        websocket.send_command(this.serial(), {"SetSimpleColour": [ScribbleNames[f], colour]});
      });
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
  },
}
</script>

<style scoped src="../elements/lightingPage.css"></style>
