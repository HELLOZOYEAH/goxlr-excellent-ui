<template>
  <div class="effectsPage">
    <div class="fxHead">
      <div class="fxTitle">
        <h2>{{ $t('message.navigation.effects') }}</h2>
        <p>{{ $t('message.device.effectsHint') }}</p>
      </div>
      <div class="fxActions">
        <button type="button" class="pill" @click="openLoad($event)">{{ $t('message.effects.preset.loadPreset') }}</button>
        <button type="button" class="pill" @click="openRename($event)">{{ $t('message.effects.preset.menuRename') }}</button>
        <button type="button" class="pill" @click="saveToLibrary($event)">{{ $t('message.effects.preset.menuSave') }}</button>
      </div>
    </div>

    <!-- Presets in a column on the left, knobs in a 2x2 square on the right (as on the hardware) -->
    <div class="topArea">
      <div class="presetColumn">
        <p class="groupLabel">{{ $t('message.navigation.presets') }}</p>
        <div class="presetCards" role="radiogroup" :aria-label="$t('message.effects.preset.title')">
          <button v-for="(preset, index) in effectPresets" :key="preset" type="button" role="radio" class="presetCard"
                  :class="{ active: isActive(preset) }" :aria-checked="isActive(preset)" @click="onEffectSelectionChange(preset)">
            <span class="presetNo">{{ $t('message.effects.preset.title') }} {{ index + 1 }}</span>
            <span class="presetName">{{ presetName(preset) }}</span>
          </button>
        </div>
      </div>

      <!-- The four encoders, big and draggable, with their style: Reverb | Pitch over Echo | Gender -->
      <div class="knobCards">
        <div v-for="knob in knobs" :key="knob.id" class="knobCard">
          <EffectKnob :knob="knob" :size="140" show-value/>
          <label class="styleSelect">
            <span>{{ $t('message.device.style') }}</span>
            <select :value="current(knob.effect).style" @change="setStyle(knob, $event.target.value)">
              <option v-for="style in knob.styles" :key="style" :value="style">{{ styleLabel(knob, style) }}</option>
            </select>
          </label>
          <template v-if="fineRows(knob).length">
            <button type="button" class="disclosure" :aria-expanded="isOpen(knob.id)" @click="toggleOpen(knob.id)">
              <span>{{ $t('message.device.fineControls') }}</span>
              <small>{{ $t('message.device.nMore', { n: fineRows(knob).length }) }}</small>
              <font-awesome-icon icon="fa-solid fa-chevron-down" class="chevron" :class="{ flipped: isOpen(knob.id) }"/>
            </button>
            <div v-if="isOpen(knob.id)" class="fineRows">
              <MicRow v-for="row in fineRows(knob)" :key="row.id" :id="'fx-' + knob.id + '-' + row.id" :label="row.label"
                      :min="row.min" :max="row.max" :value="row.value" :text="row.text" @update="v => setFine(knob, row.def, v)"/>
            </div>
          </template>
        </div>
      </div>

      <!-- The effect buttons, as on the device: click one and its settings open beside it -->
      <div class="voiceColumn">
        <div>
          <p class="groupLabel">{{ $t('message.device.voiceEffects') }}</p>
          <div class="fxPlate">
            <div class="fxButtons">
              <button v-for="fx in voiceFx" :key="fx.id" type="button" class="fx" :class="[fx.css, { selected: selectedFx === fx.id }]"
                      :style="fxStyle(fx)" :aria-pressed="fxOn(fx)" :aria-expanded="selectedFx === fx.id" @click="selectFx(fx)">{{ fxLabel(fx) }}
              </button>
            </div>
          </div>
        </div>

        <aside v-if="fxPanel" class="fxPanel" :aria-label="fxLabel(fxPanel)">
          <div class="panelHead">
            <span class="swatch" :style="{ background: '#' + fxLighting(fxPanel).colours.colour_one }"></span>
            <div>
              <div class="kind">{{ $t('message.device.kinds.fx') }}</div>
              <h2>{{ fxLabel(fxPanel) }}</h2>
            </div>
            <button type="button" class="closePanel" :aria-label="$t('message.device.closeSettings')"
                    :title="$t('message.device.closeSettings')" @click="selectedFx = null">
              <font-awesome-icon icon="fa-solid fa-xmark"/>
            </button>
          </div>
          <label class="toggleRow">
            <span>{{ $t('message.device.effectOn') }}</span>
            <input type="checkbox" :checked="fxOn(fxPanel)" @change="toggleFx(fxPanel)">
          </label>
          <label v-if="fxPanel.styles" class="styleSelect">
            <span>{{ $t('message.device.style') }}</span>
            <select :value="current(fxPanel.effect).style" @change="setStyle(fxPanel, $event.target.value)">
              <option v-for="style in fxPanel.styles" :key="style" :value="style">{{ styleLabel(fxPanel, style) }}</option>
            </select>
          </label>
          <div v-if="fxPanel.amountCommand" class="amount">
            <div class="amountTop"><label :for="'fx-' + fxPanel.id + '-amount'">{{ $t('message.device.amount') }}</label><span>{{ current(fxPanel.effect).amount }}%</span></div>
            <input :id="'fx-' + fxPanel.id + '-amount'" type="range" min="0" max="100" :value="current(fxPanel.effect).amount"
                   @input="setFxAmount(fxPanel, +$event.target.value)">
          </div>
          <template v-if="fxPanel.effect">
            <button type="button" class="disclosure" :aria-expanded="isOpen(fxPanel.id)" @click="toggleOpen(fxPanel.id)">
              <span>{{ $t('message.device.advanced') }}</span>
              <font-awesome-icon icon="fa-solid fa-chevron-down" class="chevron" :class="{ flipped: isOpen(fxPanel.id) }"/>
            </button>
            <div v-if="isOpen(fxPanel.id)" class="fineRows">
              <MicRow v-for="row in fineRows(fxPanel)" :key="row.id" :id="'fx-' + fxPanel.id + '-' + row.id" :label="row.label"
                      :min="row.min" :max="row.max" :value="row.value" :text="row.text" @update="v => setFine(fxPanel, row.def, v)"/>
              <label v-if="fxPanel.id === 'hardTune'" class="styleSelect">
                <span>{{ $t('message.effects.hardTune.source') }}</span>
                <select :value="current('hard_tune').source" @change="setHardTuneSource($event.target.value)">
                  <option v-for="source in hardTuneSources" :key="source" :value="source">{{ $t(`message.channels.${source}`) }}</option>
                </select>
              </label>
            </div>
          </template>
        </aside>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <AccessibleModal ref="renamePresetModal" id="renameEffect" :show_close="false">
    <template v-slot:title>{{ $t('message.effects.preset.renamePresetTitle') }}</template>
    <template v-slot:default>
      <ModalInput ref="newName" v-model="newPresetName"
                  :placeholder="$t('message.effects.preset.renamePresetPlaceholder')"
                  @on-enter="renamePreset();" />
    </template>
    <template v-slot:footer>
      <ModalButton ref="focusOk" @click="renamePreset();">{{ $t('message.effects.preset.renamePresetOk') }}</ModalButton>
      <ModalButton @click="$refs.renamePresetModal.closeModal(); this.newPresetName = ''">{{ $t('message.effects.preset.renamePresetCancel') }}</ModalButton>
    </template>
  </AccessibleModal>

  <AccessibleModal
      ref="select_preset_modal"
      id="select_preset"
      :show_footer="true"
  >
    <template v-slot:title>
      <span>{{ $t('message.effects.preset.loadPreset') }}</span>
      <button
          class="openButton"
          @click="openPresets"
          :aria-label="$t('message.effects.preset.accessibilityOpenPresetDirectory')"
      >
        <font-awesome-icon icon="fa-solid fa-folder"/>
      </button>
    </template>
    <ScrollingRadioList
        v-if="getPresetList().length > 0"
        max_height="300px"
        group="preset_list"
        :options="getPresetList()"
        :selected="getSelectedPreset()"
        @selection-changed="selectPreset"
    />
    <span v-else>
      {{ $t('message.effects.preset.noPresets') }}
    </span>
    <template v-slot:footer>
      <ModalButton
          ref="ok" class="modal-default-button" :enabled="selectedPreset !== undefined"
          @click="confirmPresetLoad()">{{ $t('message.effects.preset.loadPresetOk') }}</ModalButton>
    </template>
  </AccessibleModal>

  <AccessibleModal ref="override_preset_modal" id="override_preset" :show_close="false">
    <template v-slot:title>{{ $t('message.effects.preset.confirmTitle') }}</template>
    <template v-slot:default>{{ $t('message.effects.preset.confirmMessage') }}</template>
    <template v-slot:footer>
      <ModalButton ref="confirmFocusOk" @click="loadPreset()">{{ $t('message.effects.preset.confirmOk') }}</ModalButton>
      <ModalButton @click="this.selectedPreset = undefined; $refs.override_preset_modal.closeModal();">
        {{ $t('message.effects.preset.confirmCancel') }}
      </ModalButton>
    </template>
  </AccessibleModal>

  <AccessibleModal ref="overwrite_library_save" id="overwrite_save" :show_close="false">
    <template v-slot:title>{{ $t('message.effects.preset.overwriteTitle') }}</template>
    <template v-slot:default>
      {{ $t('message.effects.preset.overwriteMessage', { current: getCurrentPresetName() }) }}
    </template>
    <template v-slot:footer>
      <ModalButton ref="overwriteConfirm" @click="saveActivePreset(); $refs.overwrite_library_save.closeModal();">
        {{ $t('message.effects.preset.overwriteConfirm') }}
      </ModalButton>
      <ModalButton @click="$refs.overwrite_library_save.closeModal();">{{ $t('message.effects.preset.overwriteCancel') }}</ModalButton>
    </template>
  </AccessibleModal>
</template>

<script>
import ReverbEffect from "@/components/sections/effects/ReverbEffect.vue";
import EchoEffect from "@/components/sections/effects/EchoEffect.vue";
import PitchEffect from "@/components/sections/effects/PitchEffect.vue";
import GenderEffect from "@/components/sections/effects/GenderEffect.vue";
import MegaphoneEffect from "@/components/sections/effects/MegaphoneEffect.vue";
import RobotEffect from "@/components/sections/effects/RobotEffect.vue";
import HardTuneEffect from "@/components/sections/effects/HardTuneEffect.vue";
import {EffectPresets} from "@/util/mixerMapping";
import {store} from "@/store";
import {websocket} from "@/util/sockets";
import ModalButton from "@/components/design/modal/ModalButton.vue";
import ModalInput from "@/components/design/modal/ModalInput.vue";
import ContentContainer from "@/components/containers/ContentContainer.vue";
import RadioSelection from "@/components/lists/RadioSelection.vue";
import GroupContainer from "@/components/containers/GroupContainer.vue";
import AccessibleModal from "@/components/design/modal/AccessibleModal.vue";
import ScrollingRadioList from "@/components/lists/ScrollingRadioList.vue";
import EffectKnob from "@/components/sections/effects/EffectKnob.vue";
import {KNOBS} from "@/util/effectKnobs";
import {FINE, HARD_TUNE_SOURCES} from "@/util/effectFine";
import MicRow from "@/components/sections/mic/MicRow.vue";
import {buttonLook} from "@/util/lightingColours";

const VOICE_FX = [
  {id: "megaphone", button: "EffectMegaphone", css: "small", effect: "megaphone", i18n: "megaphone", toggleCommand: "SetMegaphoneEnabled", styleCommand: "SetMegaphoneStyle",
    amountCommand: "SetMegaphoneAmount",
    styles: ["Megaphone", "Radio", "OnThePhone", "Overdrive", "BuzzCutt", "Tweed"]},
  {id: "robot", button: "EffectRobot", css: "small", effect: "robot", i18n: "robot", toggleCommand: "SetRobotEnabled", styleCommand: "SetRobotStyle",
    styles: ["Robot1", "Robot2", "Robot3"]},
  {id: "hardTune", button: "EffectHardTune", css: "small", effect: "hard_tune", i18n: "hardTune", toggleCommand: "SetHardTuneEnabled", styleCommand: "SetHardTuneStyle",
    amountCommand: "SetHardTuneAmount",
    styles: ["Natural", "Medium", "Hard"]},
  {id: "fx", button: "EffectFx", css: "large", effect: null, i18n: null, toggleCommand: "SetFXEnabled"},
];

export default {
  emits: ["on-effect-preset-change"],

  name: "EffectsTab",
  components: {
    ScrollingRadioList,
    EffectKnob,
    MicRow,
    AccessibleModal,
    GroupContainer,
    RadioSelection,
    ContentContainer,
    ModalInput,
    ModalButton,
    HardTuneEffect,
    RobotEffect, MegaphoneEffect, GenderEffect, PitchEffect, EchoEffect, ReverbEffect,
  },

  data() {
    return {
      effectPresets: EffectPresets,
      knobs: KNOBS,
      voiceFx: VOICE_FX,
      selectedFx: null,   // the effect button whose settings are open
      hardTuneSources: HARD_TUNE_SOURCES,
      open: {},
      inFlight: {},
      queued: {},
      showRenameModal: false,
      newPresetName: '',

      selectedPreset: undefined,
    };
  },

  computed: {
    fxPanel() {
      return VOICE_FX.find(fx => fx.id === this.selectedFx) || null;
    },
  },

  methods: {
    current(effect) {
      return store.getActiveDevice().effects.current[effect];
    },
    presetName(preset) {
      return store.getActiveDevice().effects.preset_names[preset];
    },
    styleLabel(item, style) {
      return this.$t(`message.effects.${item.i18n}.styles.${style.charAt(0).toLowerCase() + style.slice(1)}`);
    },
    setStyle(item, style) {
      const command = {};
      command[item.styleCommand] = style;
      websocket.send_command(store.getActiveSerial(), command);
    },
    fxLabel(fx) {
      return this.$t(`message.lighting.effects.buttons.effect.${fx.i18n || 'fx'}`);
    },
    fxOn(fx) {
      return fx.effect ? this.current(fx.effect).is_enabled : store.getActiveDevice().effects.is_enabled;
    },
    fxLighting(fx) {
      return store.getActiveDevice().lighting.buttons[fx.button];
    },
    // Lit like the device's own button
    fxStyle(fx) {
      const lighting = this.fxLighting(fx);
      const {borderColor, color} = buttonLook(lighting.colours.colour_one, lighting.colours.colour_two, lighting.off_style, this.fxOn(fx));
      return {borderColor, color};
    },
    selectFx(fx) {
      this.selectedFx = this.selectedFx === fx.id ? null : fx.id;
    },
    isOpen(id) {
      return !!this.open[id];
    },
    toggleOpen(id) {
      this.open = Object.assign({}, this.open, {[id]: !this.open[id]});
    },
    // One request per command in flight; the latest value always lands
    send(key, command) {
      if (this.inFlight[key]) {
        this.queued[key] = command;
        return;
      }
      this.inFlight[key] = true;
      websocket.send_command(store.getActiveSerial(), command).finally(() => {
        this.inFlight[key] = false;
        const next = this.queued[key];
        if (next) {
          this.queued[key] = null;
          this.send(key, next);
        }
      });
    },
    fineRows(item) {
      const effect = this.current(item.effect);
      return (FINE[item.effect] || []).map(def => ({
        def: def, id: def.id, min: def.min, max: def.max,
        label: this.$t(`message.effects.${item.i18n}.${def.i18n}`),
        value: def.value(effect), text: def.text(effect),
      }));
    },
    setFine(item, def, value) {
      const command = def.apply(this.current(item.effect), value);
      this.send(Object.keys(command)[0] + ":" + def.id, command);
    },
    setFxAmount(fx, value) {
      this.current(fx.effect).amount = value;
      this.send(fx.amountCommand, {[fx.amountCommand]: value});
    },
    setHardTuneSource(source) {
      websocket.send_command(store.getActiveSerial(), {"SetHardTuneSource": source});
    },
    toggleFx(fx) {
      websocket.send_command(store.getActiveSerial(), {[fx.toggleCommand]: !this.fxOn(fx)});
    },

    // Header buttons: same actions as the old preset menu, focus returns to the pressed button
    openLoad(event) {
      this.$refs.select_preset_modal.openModal(undefined, event.currentTarget);
    },
    openRename(event) {
      this.$refs.renamePresetModal.openModal(this.$refs.newName, event.currentTarget);
    },
    saveToLibrary(event) {
      if (store.getPresetFiles().includes(this.getCurrentPresetName())) {
        this.$refs.overwrite_library_save.openModal(this.$refs.overwriteConfirm, event.currentTarget);
      } else {
        this.saveActivePreset();
      }
    },

    getMenuOptions() {
      return [
        {name: this.$t('message.effects.preset.menuLoad'), slug: "load"},
        {name: this.$t('message.effects.preset.menuRename'), slug: 'rename'},
        {name: this.$t('message.effects.preset.menuSave'), slug: 'save'}
      ];
    },

    getCurrentPresetName() {
      return store.getActiveDevice().effects.preset_names[store.getActiveDevice().effects.active_preset];
    },

    openPresets() {
      websocket.open_path("Presets");
    },

    confirmPresetLoad() {
      let returnRef = this.$refs.select_preset_modal.returnFocus;

      this.$refs.select_preset_modal.returnFocus = undefined;
      this.$refs.select_preset_modal.closeModal();

      this.$refs.override_preset_modal.openModal(this.$refs.confirmFocusOk, returnRef);
    },

    getPresetList() {
      let presets = [];
      for (let preset of store.getPresetFiles().sort(Intl.Collator().compare)) {
        presets.push({
          id: preset,
          label: preset,
        });
      }
      return presets;
    },

    getSelectedPreset() {
      return this.selectedPreset;
    },

    selectPreset(preset) {
      this.selectedPreset = preset;
    },

    getEffectOptions() {
      // We need to build the list from existing effects..
      let effects = [];
      for (let i = 0; i < this.effectPresets.length; i++) {
        effects.push({
          id: this.effectPresets[i],
          label: this.getLabel(i, this.effectPresets[i]),
        })
      }

      return effects;
    },

    loadPreset() {
      let name = this.getSelectedPreset();
      websocket.send_command(store.getActiveSerial(), {"LoadEffectPreset": name}).then(() => {
        store.getActiveDevice().effects.preset_names[store.getActiveDevice().effects.active_preset] = name;

        let currentBank = EffectPresets.indexOf(store.getActiveDevice().effects.active_preset) + 1;
        store.setAccessibilityNotification(
            "polite",
            this.$t("message.effects.preset.accessibilityPresetLoaded", { name: name, bank: currentBank })
        );

        this.selectedPreset = undefined;
      }).finally(() => {
        let self = this;
        setTimeout(() => {
          self.$refs.override_preset_modal.closeModal();
        }, 10);
      });
    },

    onEffectSelectionChange(id) {
      if (!this.isActive(id)) {
        websocket.send_command(store.getActiveSerial(), {"SetActiveEffectPreset": id});
      }
      this.$emit("on-effect-preset-change", id);
    },

    getActivePreset() {
      return store.getActiveDevice().effects.active_preset;
    },

    getButtonId(preset_name) {
      return preset_name.toLowerCase().replace(" ", "_").replace("(", "_").replace(")", "_") + "_profile_button";
    },

    getLabel(id, key) {
      return (id + 1).toString() + ": " + store.getActiveDevice().effects.preset_names[key];
    },

    isActive(key) {
      return store.getActiveDevice().effects.active_preset === key;
    },

    buttonPressed(id) {
      if (!this.isActive(id)) {
        websocket.send_command(store.getActiveSerial(), {"SetActiveEffectPreset": id});
      }
    },

    menuOpened(event, return_id, item) {
      if (!this.isActive(item)) {
        websocket.send_command(store.getActiveSerial(), {"SetActiveEffectPreset": item});
      }
    },

    menuPressed(event, return_id, item) {
      // If this wasn't on the active profile, load the selected one..
      if (!this.isActive(item)) {
        websocket.send_command(store.getActiveSerial(), {"SetActiveEffectPreset": item});
      }
      this.$refs.contextMenu.showMenu(event, item, return_id, this.$refs.buttonList.getScrollTop());
    },

    renamePreset() {
      if (this.newPresetName === undefined || this.newPresetName === "") {
        return;
      }

      let command = {"RenameActivePreset": this.newPresetName}

      websocket.send_command(store.getActiveSerial(), command).then(() => {
        store.getActiveDevice().effects.preset_names[store.getActiveDevice().effects.active_preset] = this.newPresetName;
      }).finally(() => {
        let self = this;
        this.newPresetName = ''
        setTimeout(() => {
          self.$refs.renamePresetModal.closeModal();
        }, 10);
      });
    },

    saveActivePreset() {
      let name = store.getActiveDevice().effects.preset_names[store.getActiveDevice().effects.active_preset];

      websocket.send_command(store.getActiveSerial(), {"SaveActivePreset": []});
      store.setAccessibilityNotification(
          "polite",
          this.$t("message.effects.preset.accessibilityPresetSaved", { name: name })
      );
    },

    optionClicked(event) {
      if (event.option.slug === "load") {
        let element = document.getElementById(event.return_id);
        this.$refs.select_preset_modal.openModal(undefined, element);
      }

      if (event.option.slug === "rename") {
        let element = document.getElementById(event.return_id);
        this.$refs.renamePresetModal.openModal(this.$refs.newName, element);
      }

      if (event.option.slug === "save") {
        // Get the Current Preset..
        let current = this.getCurrentPresetName();

        // Does this exist in the library?
        if (store.getPresetFiles().includes(current)) {
          let element = document.getElementById(event.return_id);
          this.$refs.overwrite_library_save.openModal(this.$refs.overwriteConfirm, element);
        } else {
          this.saveActivePreset();
        }
      }
    }
  }
}
</script>

<style scoped src="./device/deviceShell.css"></style>
<style scoped>
.effectsPage {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 24px 32px;
  color: #e8ecea;
}

.fxHead {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px;
}

.fxTitle {
  flex: 1 1 320px;
}

.fxTitle h2 {
  margin: 0;
  font-size: 26px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
}

.fxTitle p {
  margin: 6px 0 0;
  font-size: 14px;
  color: #9aa4a0;
}

.fxActions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.effectsPage .pill {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid #3a413f;
  border-radius: 8px;
  background: #2a2f2d;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 14px;
  cursor: pointer;
}

.effectsPage .pill:hover {
  border-color: #59b1b6;
}

.effectsPage .pill:focus-visible, .effectsPage .presetCard:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.topArea {
  display: grid;
  grid-template-columns: 200px minmax(400px, 560px) auto;
  gap: 18px;
  align-items: start;
}

.groupLabel {
  margin: 0 0 8px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 12px;
  color: #9aa4a0;
}

.presetCards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.effectsPage .presetCard {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-height: 56px;
  padding: 9px 14px;
  border: 2px solid #343a38;
  border-radius: 12px;
  background: #2d3230;
  color: #e8ecea;
  text-align: left;
  cursor: pointer;
}

.effectsPage .presetCard:hover {
  border-color: #4a6f71;
}

.effectsPage .presetCard.active {
  border-color: #59b1b6;
  background: #1d3a3c;
  box-shadow: 0 0 14px rgba(89, 177, 182, 0.25);
}

.presetNo {
  font-size: 12px;
  color: #9aa4a0;
}

.presetName {
  font-size: 16px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
}

.knobCards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.knobCard {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px 18px;
  border-radius: 12px;
  background: #2d3230;
}

.knobCard {
  align-items: center;
}

.topArea .knobCards {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.styleSelect {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 12px;
  color: #c3ccc8;
}

.styleSelect select {
  min-height: 40px;
  padding: 0 10px;
  border: 1px solid #3b413f;
  border-radius: 6px;
  background: #3b413f;
  color: #fff;
  font-family: var(--goxlr-font);
  font-size: 14px;
  letter-spacing: 0;
  text-transform: none;
  font-weight: 400;
}

.knobCard .disclosure, .fxPanel .disclosure {
  align-self: stretch;
}

.effectsPage .disclosure {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 12px 0 0;
  border: 0;
  border-top: 1px solid #3b413f;
  background: transparent;
  color: #c3ccc8;
  cursor: pointer;
}

.effectsPage .disclosure:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.effectsPage .disclosure span {
  flex: 1 1 auto;
  text-align: left;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 13px;
}

.effectsPage .disclosure small {
  font-size: 12px;
  color: #9aa4a0;
}

.effectsPage .chevron {
  transition: transform 0.15s;
}

.effectsPage .chevron.flipped {
  transform: rotate(180deg);
}

.fineRows {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fineRows :deep(.micRow) {
  grid-template-columns: 96px minmax(0, 1fr) 64px;
}

.allTitle {
  margin: 8px 0 0;
  font-size: 16px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
}

.allCards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

/* ---------- Effect buttons on a piece of the device, settings beside them (as on the Device page) ---------- */
.voiceColumn {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.fxPlate {
  padding: 20px 18px;
  background: linear-gradient(180deg, #2e3231 0%, #262a29 60%, #202322 100%);
  clip-path: polygon(0 0, 78% 0, 100% 9%, 100% 100%, 0 100%);
}

.effectsPage .fx {
  cursor: pointer;
}

.fxPanel {
  flex: 0 1 340px;
  width: 340px;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 21px;
  padding: 18px 20px;
  border-radius: 12px;
  background: #2d3230;
}

.fxPanel .fineRows :deep(.micRow) {
  grid-template-columns: 96px minmax(0, 1fr) 52px;
}

.panelHead {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panelHead .swatch {
  flex: none;
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.panelHead .kind {
  font-size: 12px;
  color: #9aa4a0;
}

.panelHead h2 {
  margin: 2px 0 0;
  font-size: 22px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
}

.effectsPage .closePanel {
  margin-left: auto;
  align-self: flex-start;
  width: 32px;
  height: 32px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 6px;
  color: #9aa4a0;
  font-size: 16px;
  cursor: pointer;
}

.effectsPage .closePanel:hover {
  background: #3b413f;
  color: #fff;
}

.toggleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 6px;
  background: #3b413f;
  font-size: 14px;
}

.toggleRow input {
  width: 20px;
  height: 20px;
  accent-color: #59b1b6;
}

.amount {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.amountTop {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 14px;
  color: #59b1b6;
}

.amountTop label {
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 12px;
  color: #c3ccc8;
}

.amount input[type=range] {
  accent-color: #59b1b6;
}

/* Too narrow for all three columns: the buttons and their settings go underneath */
@media (max-width: 1230px) {
  .topArea {
    grid-template-columns: 200px minmax(0, 560px);
  }

  .voiceColumn {
    grid-column: 1 / -1;
  }
}

button {
  background-color: transparent;
  color: #fff;
  border: 0;
  padding: 0;
  margin: 0;
}

button:focus {
  outline: none;
}

.openButton {
  border: 0;
  background-color: transparent;
  padding: 0;
  margin-left: 5px;

  display: inline-block;
  color: #a5a7a6;
  font-size: 14px;
}

.openButton:hover {
  color: #fff;
  cursor: pointer;
}
</style>
