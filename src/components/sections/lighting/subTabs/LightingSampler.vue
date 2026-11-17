<template>
  <div class="lightingPage">
    <h2 class="title">{{ $t('message.lighting.samplerTab.title') }}</h2>
    <p class="lede">{{ $t('message.lighting.samplerTab.lede') }}</p>

    <div class="layout">
      <!-- Live preview: the bank buttons, the pads and Clear as the device lights them -->
      <section class="preview" :aria-label="$t('message.lighting.faderLights.live')">
        <div class="previewHead">
          <span class="live">{{ $t('message.lighting.faderLights.live') }}</span>
          <span>{{ $t('message.lighting.samplerTab.clickHint') }}</span>
        </div>
        <!-- The sampler part of the GoXLR, drawn as on the Device page -->
        <div class="stage">
          <div class="device">
            <div class="zone">
              <div class="samplerArea">
                <div class="banks">
                  <button v-for="bank in banks" :key="bank" type="button" class="bank" :class="{ selected: target === bank }"
                          :style="bankLook(bank)" :aria-pressed="target === bank"
                          :aria-label="$t('message.lighting.samplerTab.bank', { bank })" @click="toggleTarget(bank)">{{ bank }}
                  </button>
                </div>
                <div class="pads">
                  <span v-for="pad in pads" :key="pad.id" class="pad" :class="pad.css" :style="padLook(pad.id)"
                        :title="$t(`message.lighting.samplerTab.pads.${pad.id}`)"></span>
                  <span class="clear" :style="clearLook()">{{ $t('message.common.clear') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="previewNote">{{ $t('message.lighting.samplerTab.inUse', { bank: activeBank() }) }}</div>
      </section>

      <section class="controls">
        <div>
          <div class="lab">{{ $t('message.lighting.faderLights.applyTo') }}</div>
          <div class="seg" role="radiogroup" :aria-label="$t('message.lighting.faderLights.applyTo')">
            <button type="button" role="radio" :aria-checked="target === 'all'" :class="{ on: target === 'all' }"
                    @click="target = 'all'">{{ $t('message.lighting.samplerTab.allBanks') }}
            </button>
            <button v-for="bank in banks" :key="bank" type="button" role="radio" :aria-checked="target === bank"
                    :class="{ on: target === bank }" @click="target = bank">
              <i class="chip" :style="{ background: '#' + colours(bank).colour_one }"></i>
              {{ $t('message.lighting.samplerTab.bank', { bank }) }}
            </button>
          </div>
        </div>

        <ColourPairs :current="targets().map(b => [colours(b).colour_one, colours(b).colour_two])"
                     @pick="(one, two) => setColours(one, two, null)"/>

        <div>
          <div class="lab">{{ $t('message.lighting.faderLights.colours') }}</div>
          <div class="colourRow">
            <ColourSwatch id="sampler-on" :value="current().colour_one" :label="$t('message.lighting.shared.on')"
                          :hint="$t('message.lighting.samplerTab.onHint')" @change="setColours($event, current().colour_two, null)"/>
            <ColourSwatch id="sampler-off" :value="current().colour_two" :label="$t('message.lighting.shared.off')"
                          :hint="$t('message.lighting.samplerTab.offHint')" @change="setColours(current().colour_one, $event, null)"/>
            <ColourSwatch id="sampler-empty" :value="current().colour_three" :label="$t('message.lighting.samplerTab.emptyPads')"
                          :hint="$t('message.lighting.samplerTab.emptyHint')" @change="setEmpty($event)"/>
            <button type="button" class="swap" :title="$t('message.lighting.shared.swapHint')"
                    @click="setColours(current().colour_two, current().colour_one, null)">⇅ {{ $t('message.lighting.faderLights.swap') }}
            </button>
          </div>
            <OffStyleCards sub
                         :model-value="currentOffStyle()" @pick="setOffStyle"/>
        </div>

        <p class="note">{{ $t('message.lighting.samplerTab.note') }}</p>

        <LightingSaveRow/>
      </section>
    </div>
  </div>
</template>

<script>
import ColourSwatch from "@/components/sections/lighting/elements/ColourSwatch.vue";
import {store} from "@/store";
import {websocket} from "@/util/sockets";
import {buttonLook, dimColour, shared} from "@/util/lightingColours";
import OffStyleCards from "@/components/sections/lighting/elements/OffStyleCards.vue";
import ColourPairs from "@/components/sections/lighting/elements/ColourPairs.vue";
import LightingSaveRow from "@/components/sections/lighting/elements/LightingSaveRow.vue";

// Lighting → Sampler: the bank buttons A / B / C. The pads and Clear take the colours of the bank in use.
export default {
  name: "LightingSampler",
  components: {ColourSwatch, OffStyleCards, ColourPairs, LightingSaveRow},
  emits: ["nav-updated"],

  data() {
    return {
      banks: ["A", "B", "C"],
      pads: [{id: "TopLeft", css: "tl"}, {id: "TopRight", css: "tr"}, {id: "BottomLeft", css: "bl"}, {id: "BottomRight", css: "br"}],
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
    // The bank being edited, for the highlight on the device picture
    getNodes() {
      return this.target === "all" ? [] : ["SamplerSelect" + this.target];
    },
    device() {
      return store.getActiveDevice();
    },
    lighting(bank) {
      return this.device().lighting.sampler["SamplerSelect" + bank];
    },
    colours(bank) {
      return this.lighting(bank).colours;
    },
    targets() {
      return this.target === "all" ? this.banks : [this.target];
    },
    toggleTarget(bank) {
      this.target = this.target === bank ? "all" : bank;
    },
    // Called by LightingTab when a bank is clicked on the device picture
    onButtonSelectionChange(id) {
      this.target = id.replace("SamplerSelect", "");
    },
    current() {
      return this.colours(this.targets()[0]);
    },
    currentOffStyle() {
      return shared(this.targets().map(b => this.lighting(b).off_style));
    },

    /* ---------- Drawing ---------- */
    activeBank() {
      return this.device().sampler.active_bank;
    },
    hasSamples(pad) {
      return this.device().sampler.banks[this.activeBank()]?.[pad]?.samples.length > 0;
    },
    // As on the Device page: border and label in the colour the light shows
    bankLook(bank) {
      const l = this.lighting(bank);
      const colour = buttonLook(l.colours.colour_one, l.colours.colour_two, l.off_style, bank === this.activeBank()).borderColor;
      return {borderColor: colour, color: colour};
    },
    // Empty pads and Clear use 'colour three'; a very dark one is lifted to grey so it stays visible
    idleColour() {
      const three = this.colours(this.activeBank()).colour_three;
      const r = parseInt(three.substring(0, 2), 16), g = parseInt(three.substring(2, 4), 16), b = parseInt(three.substring(4, 6), 16);
      return (r < 125 && r === g && g === b) ? "rgba(125, 125, 125, 0.4)" : dimColour(three);
    },
    padLook(pad) {
      const c = this.colours(this.activeBank());
      if (!this.hasSamples(pad)) return {borderColor: this.idleColour()};
      return {borderColor: dimColour(c.colour_one, 0.7)};
    },
    clearLook() {
      const colour = this.device().sampler.clear_active ? "#" + this.colours(this.activeBank()).colour_one : this.idleColour();
      return {borderColor: colour, color: colour};
    },

    /* ---------- Changes ---------- */
    // `empty` = null keeps each bank's own empty-pad colour
    setColours(one, two, empty) {
      this.targets().forEach(b => {
        const c = this.colours(b);
        const three = empty ?? c.colour_three;
        c.colour_one = one;
        c.colour_two = two;
        c.colour_three = three;
        websocket.send_command(store.getActiveSerial(), {"SetSampleColour": ["SamplerSelect" + b, one, two, three]});
      });
    },
    setEmpty(colour) {
      this.targets().forEach(b => {
        const c = this.colours(b);
        c.colour_three = colour;
        websocket.send_command(store.getActiveSerial(), {"SetSampleColour": ["SamplerSelect" + b, c.colour_one, c.colour_two, colour]});
      });
    },
    setOffStyle(style) {
      this.targets().forEach(b => {
        this.lighting(b).off_style = style;
        websocket.send_command(store.getActiveSerial(), {"SetSampleOffStyle": ["SamplerSelect" + b, style]});
      });
    },
  },
}
</script>

<style scoped src="../elements/lightingPage.css"></style>
<style scoped src="../../device/deviceShell.css"></style>
<style scoped>
/* Only the sampler part of the device body */
.device {
  padding: 30px 34px 26px;
}

.bank {
  cursor: pointer;
}
</style>
