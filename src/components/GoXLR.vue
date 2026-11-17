<template>
  <div id="main">
    <NoDevice v-if="showNoDevice()"/>
    <DeviceSelector v-else-if="!isDeviceSet()"/>
    <!-- Device view: only the device, floating on the desktop (app window only, see util/appWindow.js) -->
    <DeviceHome v-if="deviceReady() && deviceOnly" bare @open-section="leaveDeviceView" @open-app="leaveDeviceView(null)"/>
    <template v-if="deviceReady() && !deviceOnly">
      <h1 class="screenreader-only"> {{ $t('message.navigation.accessibilityProfileSection') }}</h1>
      <!-- Top bar: profile drop-down (profiles / samples / presets), mic profile, language, status -->
      <AppHeader @device-view="enterDeviceView"/>

      <h1 class="sr-only">{{ $t('message.navigation.accessibilityDeviceSection') }}</h1>
      <Tabs ref="device-tabs" vertical @on-change="onTabChange" :label="$t('message.navigation.accessibilityDeviceSection')">
        <Tab id="device" icon="fa-solid fa-sliders" :name="$t('message.device.tab')" selected>
          <DeviceHome :zoom-from="zoomReturn" @open-section="zoomInto" @device-view="enterDeviceView"/>
        </Tab>
        <Tab id="mic" icon="fa-solid fa-microphone" :name="$t('message.navigation.microphone')">
          <Mic/>
        </Tab>
        <Tab id="mixer" icon="fa-solid fa-volume-high" :name="$t('message.navigation.mixer')">
          <Mixer/>
        </Tab>
        <Tab id="configuration" icon="fa-solid fa-toggle-on" :name="$t('message.navigation.configuration')">
          <div :class="zoomClass('configuration')">
            <button v-if="zoomedFrom === 'configuration'" type="button" class="zoomBack" @click="zoomBack">
              ← {{ $t('message.device.tab') }}
            </button>
            <ConfigurationTab ref="faders"/>
          </div>
        </Tab>
        <Tab id="screens" icon="fa-solid fa-display" v-if="!isDeviceMini()" :name="$t('message.navigation.screens')">
          <ScreensTab/>
        </Tab>
        <Tab id="effects" icon="fa-solid fa-wand-magic-sparkles" v-if="!isDeviceMini()" :name="$t('message.navigation.effects')">
          <div :class="zoomClass('effects')">
            <button v-if="zoomedFrom === 'effects'" type="button" class="zoomBack" @click="zoomBack">
              ← {{ $t('message.device.tab') }}
            </button>
            <EffectsTab ref="effects" @on-effect-preset-change="onEffectPresetChange"/>
          </div>
        </Tab>
        <Tab id="sampler" icon="fa-solid fa-table-cells-large" v-if="!isDeviceMini()" :name="$t('message.navigation.sampler')">
          <div :class="zoomClass('sampler')">
            <button v-if="zoomedFrom === 'sampler'" type="button" class="zoomBack" @click="zoomBack">
              ← {{ $t('message.device.tab') }}
            </button>
            <SamplerTab ref="sampler" @on-sample-bank-change="onSampleBankChange"/>
          </div>
        </Tab>
        <Tab id="link" icon="fa-solid fa-gamepad" name="GoXLR Link" :badge="linkSeen ? null : 'NEW'">
          <LinkTab/>
        </Tab>
        <Tab id="lighting" icon="fa-solid fa-lightbulb" :name="$t('message.navigation.lighting')">
          <LightingTab ref="lighting" @on-lighting-changed="onLightingDataChange" @open-tab="openTab"/>
        </Tab>
        <Tab id="routing" icon="fa-solid fa-shuffle" :name="$t('message.navigation.routing')">
          <Routing/>
        </Tab>
        <Tab id="system" icon="fa-solid fa-gear" :name="$t('message.navigation.system')">
          <ContentContainer>
            <SystemComponent/>
          </ContentContainer>
        </Tab>
      </Tabs>
    </template>
    <VersionCheck v-if="!deviceOnly" @firmware-click="onFirmwareClicked" />
    <Language v-if="!utilitySupportsLanguages()" />
    <A11yNotifications/>

    <AccessibleModal id="firmware_update_progress_modal" ref="firmware_update_progress_modal" width="620px" :show_footer=false :show_close=false>
      <template v-slot:title>{{$t('message.system.firmwareUpdate.title')}}</template>

      <div v-if="getFirmwareUpdateState() == 'Pause'">
        {{ $t('message.system.firmwareUpdate.updatePaused', {version: getFirmwareTargetVersion()}) }}

        <ProgressBar
            :progress="getUpdateProgress()"
            :status_message="getFirmwareUpdateStateLocalized()"
            status_position="top"
        />

        <div class="modalButtonBox">
          <button @click="continueFirmwareUpdate">{{$t('message.modalButtons.continue')}}</button>
          <button @click="completeFirmwareUpdate" class="cancel">{{$t('message.modalButtons.cancel')}}</button>
        </div>
      </div>

      <div v-else-if="getFirmwareUpdateState() == 'Complete'">
        {{ $t('message.system.firmwareUpdate.completed') }}

        <ProgressBar
            :progress="getUpdateProgress()"
            :status_message="getFirmwareUpdateStateLocalized()"
            status_position="top"
        />

        <div class="modalButtonBox">
          <button @click="completeFirmwareUpdate" class="close">{{$t('message.modalButtons.close')}}</button>
        </div>
      </div>

      <div v-else-if="getFirmwareUpdateState() == 'Failed'">
        {{ $t('message.system.firmwareUpdate.failed') }}

        <ProgressBar
            :progress="getUpdateProgress()"
            :status_message="getFirmwareUpdateStateLocalized()"
            status_position="top"
        />

        <div class="modalButtonBox">
          <button @click="completeFirmwareUpdate" class="close">{{$t('message.modalButtons.close')}}</button>
        </div>
      </div>

      <div v-else>
        {{ $t('message.system.firmwareUpdate.updateInProgress') }}

        <ProgressBar
            :progress="getUpdateProgress()"
            :status_message="getFirmwareUpdateStateLocalized()"
            status_position="top"
        />
      </div>

      <!--<textarea :value="JSON.stringify(firmwareUpdateStatus, null, 2)"></textarea>-->

    </AccessibleModal>
  </div>
</template>

<script>
import A11yNotifications from "./A11yNotifications.vue";
import Mixer from "./sections/Mixer.vue";
import ScreensTab from "./sections/ScreensTab.vue";
import Tabs from "@/components/tabs/Tabs.vue";
import Tab from "@/components/tabs/Tab.vue";
import Routing from "@/components/sections/Routing.vue";
import LinkTab from "@/components/sections/LinkTab.vue";
import Mic from "@/components/sections/Mic.vue";
import DeviceSelector from "@/components/sections/DeviceSelector.vue";
import NoDevice from "@/components/sections/NoDevice.vue";
import {store} from "@/store";
import {runWebsocket, websocket} from "@/util/sockets";
import SystemComponent from "@/components/sections/System.vue";
import FileTabs from "@/components/sections/files/FileTabs.vue";
import EffectsTab from "@/components/sections/EffectsTab.vue";
import ConfigurationTab from "@/components/sections/ConfigurationTab.vue";
import {isDeviceMini} from "@/util/util";
import LightingTab from "@/components/sections/lighting/LightingTab.vue";
import SamplerTab from "@/components/sections/SamplerTab.vue";
import ContentContainer from "@/components/containers/ContentContainer.vue";
import GoXLRVisualiser from "@/components/visualisation/GoXLRVisualiser.vue";
import VersionCheck from "@/components/VersionCheck.vue";
import LanguageToggle from "@/components/LanguageToggle.vue";
import DeviceHome from "@/components/sections/device/DeviceHome.vue";
import AppHeader from "@/components/AppHeader.vue";
import {HighlightArea} from "@/components/visualisation/VisualiserHelper";
import Language from "@/components/Language.vue";
import AccessibleModal from "@/components/design/modal/AccessibleModal.vue";
import ProgressBar from "@/components/design/ProgressBar.vue";
import {startLightingHistory} from "@/util/lightingHistory";
import {startProfileDirty} from "@/util/profileDirty";
import {enterDeviceView, inApp, leaveDeviceView, startsInDeviceView} from "@/util/appWindow";

// Device view window size: the device (about 1.8 : 1) plus the strip above it for the pop-up and buttons
const DEVICE_VIEW_WIDTH = 960;
const DEVICE_VIEW_RATIO = 0.553;
const DEVICE_VIEW_EXTRA = 84;

export default {
  name: "GoXLR",
  expose: ['openFirmwareUpdateProgressModal'],
  components: {
    ProgressBar,
    AccessibleModal,
    Language,
    LanguageToggle,
    DeviceHome,
    AppHeader,
    VersionCheck,
    GoXLRVisualiser,
    A11yNotifications,
    ContentContainer,
    SamplerTab,
    LightingTab,
    EffectsTab,
    ConfigurationTab,
    FileTabs,
    SystemComponent,
    DeviceSelector,
    NoDevice,
    Routing,
    LinkTab,
    Tab,
    Tabs,
    Mixer,
    Mic,
    ScreensTab,
  },

  computed: {
    readyNow() {
      return this.deviceReady();
    },
    HighlightArea() {
      return HighlightArea
    },
    firmwareUpdateStatus() {
      const updateState = store.status.firmware;

      if (this.$refs.firmware_update_progress_modal === undefined)
        return updateState;

      // open progress modal if there is an update in progress
      const isPerformingUpdate = updateState !== undefined && Object.keys(updateState).length > 0;
      if (isPerformingUpdate && !this.$refs.firmware_update_progress_modal.isOpen()) {
        this.$refs.firmware_update_progress_modal.openModal(undefined, undefined);
      } else if (!isPerformingUpdate && this.$refs.firmware_update_progress_modal.isOpen()){
        this.$refs.firmware_update_progress_modal.closeModal();
      }

      return updateState;
    }
  },

  data() {
    return {
      visualiserHighlightAreas: [],
      activeTab: "device",
      linkSeen: (() => { try { return !!localStorage.getItem("goxlr-link-seen"); } catch (e) { return false; } })(),
      zoomedFrom: null,   // page we zoomed into from the device view (shows the way back)
      zoomReturn: null,   // page the device view should zoom back out of when it opens
      zoomLeaving: false, // the zoomed-into page is fading away before the zoom back out
      deviceOnly: false,  // device view: the window shows only the device, no frame
      startChecked: false,
    }
  },

  watch: {
    // Opens in device view once the GoXLR is there; leaves it if the GoXLR goes away
    readyNow: {
      immediate: true,
      handler(ready) {
        if (ready && !this.startChecked) {
          this.startChecked = true;
          if (inApp() && startsInDeviceView()) this.enterDeviceView();
        } else if (!ready && this.deviceOnly) {
          this.leaveDeviceView(null);
        }
      },
    },
  },

  methods: {
    isDeviceMini,

    loadLocale() {
      if (!this.utilitySupportsLanguages()) {
        return;
      }

      // Load up the Locale..
      let locale = store.getConfig().locale.system_locale;
      if (store.getConfig().locale.user_locale !== null) {
        locale = store.getConfig().locale.user_locale;
      }
      this.$i18n.locale = locale;
    },

    utilitySupportsLanguages() {
      if (!store.isConnected()) {
        return false;
      }

      if (store.getConfig() == undefined) {
        return false;
      }

      return store.getConfig().hasOwnProperty("locale");
    },

    isDeviceSet() {
      let ready = store.hasActiveDevice() && store.isConnected();
      return ready;
    },
    // The daemon is up but has no GoXLR at all (several GoXLRs still get the picker).
    // While developing, ?preview=no-device (or no-device-linked) shows it with a GoXLR plugged in.
    showNoDevice() {
      if (import.meta.env.DEV && new URLSearchParams(location.search).get("preview")?.startsWith("no-device")) return true;
      return !this.isDeviceSet() && store.isConnected() && store.getDeviceCount() === 0;
    },

    openTab(id) {
      this.$refs["device-tabs"].selectTabById(id);
    },

    deviceReady() {
      return this.isDeviceSet() && !this.showNoDevice();
    },
    enterDeviceView() {
      if (!inApp() || this.deviceOnly) return;
      const width = Math.min(DEVICE_VIEW_WIDTH, screen.availWidth * 0.7);
      enterDeviceView(width, width * DEVICE_VIEW_RATIO + DEVICE_VIEW_EXTRA);
      this.deviceOnly = true;
      document.documentElement.classList.add("deviceOnly");
    },
    // Frame back, full size, then the page that was clicked (null = the Device page)
    async leaveDeviceView(page) {
      if (!this.deviceOnly) return;
      const device = document.querySelector(".deviceHome.bare .device");
      document.documentElement.classList.remove("deviceOnly");
      await leaveDeviceView(device);
      this.deviceOnly = false;
      if (!page) return;
      await this.$nextTick();
      if (this.$refs["device-tabs"]) this.zoomInto(page);
    },

    zoomInto(id) {
      this.zoomedFrom = id;
      this.zoomReturn = null;
      this.openTab(id);
    },

    zoomClass(id) {
      return {zoomArrive: this.zoomedFrom === id, zoomLeave: this.zoomLeaving};
    },

    zoomBack() {
      if (this.zoomLeaving) return;
      this.zoomLeaving = true;
      setTimeout(() => {
        this.zoomLeaving = false;
        this.zoomReturn = this.zoomedFrom;
        this.zoomedFrom = null;
        this.openTab("device");
      }, 160);
    },

    onTabChange(tab) {
      let id = tab.id;
      this.activeTab = id;
      if (id !== this.zoomedFrom) this.zoomedFrom = null;
      if (id !== "device") this.zoomReturn = null;
      if (id === "link" && !this.linkSeen) {
        this.linkSeen = true;
        try {
          localStorage.setItem("goxlr-link-seen", "1");
        } catch (e) {
          // shows NEW again next time, nothing worse
        }
      }
      if (id === "configuration") {
        this.visualiserHighlightAreas = [
          HighlightArea.COUGH,
          HighlightArea.CHANNEL_A
        ];
      } else if (id === "effects") {
        // This one comes initially from the store...
        this.visualiserHighlightAreas = [
          HighlightArea[`EFFECTS_PRESET${this.$refs.effects.getActivePreset().slice(-1)}`]
        ];
      } else if (id === "sampler") {
        this.visualiserHighlightAreas = [
          HighlightArea[`SAMPLER_BANK_${this.$refs.sampler.activeBank}`]
        ];
      } else {
        this.visualiserHighlightAreas = []
      }
    },

    onFaderChannelChange(activeChannel) {
      this.visualiserHighlightAreas[this.visualiserHighlightAreas.length - 1] = HighlightArea[`CHANNEL_${activeChannel}`];
    },

    onEffectPresetChange(activePreset) {
      this.visualiserHighlightAreas = [HighlightArea[`EFFECTS_PRESET${activePreset.slice(-1)}`]];
    },

    onSampleBankChange(activeBank) {
      this.visualiserHighlightAreas = [HighlightArea[`SAMPLER_BANK_${activeBank}`]];
    },

    onLightingDataChange() {
      let lightingData = this.$refs.lighting.getNodes();
      // a tab editing "all" has no single part to highlight
      if (lightingData[0] !== "cough" && lightingData.length < 2) {
        this.visualiserHighlightAreas = [];
        return;
      }

      // mixer channels
      if (lightingData[0] === "mixer")
        this.visualiserHighlightAreas = [HighlightArea[`CHANNEL_${lightingData[1]}`]];

      // effect presets
      else if (lightingData[0] === "effects")
        this.visualiserHighlightAreas = [HighlightArea[`EFFECTS_PRESET${lightingData[1].slice(-1)}`]];

      // sampler banks
      else if (lightingData[0] === "sampler")
        this.visualiserHighlightAreas = [HighlightArea[`SAMPLER_BANK_${lightingData[1].slice(-1)}`]];

      // cough
      else if (lightingData[0] === "cough")
        this.visualiserHighlightAreas = [HighlightArea.COUGH];

      // nothing
      else this.visualiserHighlightAreas = [];
    },

    onFirmwareClicked() {
      if (store.getActiveDevice() === null || store.getActiveDevice() === undefined) {
        // This should never happen, the message only shows if there's an active device!
        return;
      }
      this.loadSystemTab();
    },

    onAreaClicked(area) {
      if (area.alt) {
        // All right click behaviour is handled by the Lighting Tab (saves sub-tab headaches)
        this.$refs["device-tabs"].selectTabById("lighting");
        this.$nextTick(() => this.$refs.lighting.activateArea(area.area));
        return;
      }

      switch (area.area) {
        case HighlightArea.COUGH: {
          this.loadConfigurationTab();
          break;
        }
        case HighlightArea.CHANNEL_A:
          this.loadConfigurationTab("A");
          break;
        case HighlightArea.CHANNEL_B:
          this.loadConfigurationTab("B");
          break;
        case HighlightArea.CHANNEL_C:
          this.loadConfigurationTab("C");
          break;
        case HighlightArea.CHANNEL_D: {
          this.loadConfigurationTab("D");
          break;
        }
        case HighlightArea.SAMPLER_BANK_A: {
          this.loadSampleBank("A");
          break;
        }
        case HighlightArea.SAMPLER_BANK_B: {
          this.loadSampleBank("B");
          break;
        }
        case HighlightArea.SAMPLER_BANK_C: {
          this.loadSampleBank("C");
          break;
        }
        case HighlightArea.EFFECTS_PRESET1: {
          this.loadEffectsTab("Preset1");
          break;
        }
        case HighlightArea.EFFECTS_PRESET2: {
          this.loadEffectsTab("Preset2");
          break;
        }
        case HighlightArea.EFFECTS_PRESET3: {
          this.loadEffectsTab("Preset3");
          break;
        }
        case HighlightArea.EFFECTS_PRESET4: {
          this.loadEffectsTab("Preset4");
          break;
        }
        case HighlightArea.EFFECTS_PRESET5: {
          this.loadEffectsTab("Preset5");
          break;
        }
        case HighlightArea.EFFECTS_PRESET6: {
          this.loadEffectsTab("Preset6");
          break;
        }
      }
    },

    loadConfigurationTab(channel = undefined) {
      this.$refs['device-tabs'].selectTabById("configuration");
      if (channel !== undefined) {
        this.$nextTick(() => {
          this.$refs.faders.channelChanged(channel);
        });
      }
    },

    loadSampleBank(bank) {
      this.$refs['device-tabs'].selectTabById("sampler");
      this.$nextTick(() => {
        this.$refs.sampler.setActiveBank(bank);
      })
    },

    loadEffectsTab(preset) {
      this.$refs['device-tabs'].selectTabById("effects");
      this.$nextTick(() => {
        this.$refs.effects.onEffectSelectionChange(preset);
      });
    },

    loadSystemTab() {
      this.$refs['device-tabs'].selectTabById("system");
    },

    getFirmwareUpdateState() {
      if (this.firmwareUpdateStatus === undefined)
        return false;

      const firstDevice = Object.values(store.status.firmware)[0];
      if (firstDevice === undefined)
        return false;

      if (typeof firstDevice.state === "string")
        return firstDevice.state;

      return Object.keys(firstDevice.state)[0];
    },

    getFirmwareUpdateStateLocalized() {
      const state = this.getFirmwareUpdateState();
      if (state === false) return "";

      return this.$t(`message.system.firmwareUpdate.progress.${state[0].toLowerCase() + state.slice(1)}`) ;
    },

    continueFirmwareUpdate() {
      if (this.firmwareUpdateStatus  === undefined)
        return false;

      const firstDeviceSerial = Object.keys(store.status.firmware)[0];
      websocket.continue_firmware_update(firstDeviceSerial);
    },

    completeFirmwareUpdate() {
      if (this.firmwareUpdateStatus  === undefined)
        return false;

      const firstDeviceSerial = Object.keys(store.status.firmware)[0];
      websocket.clear_firmware_state(firstDeviceSerial);
    },

    getUpdateProgress() {
      if (this.firmwareUpdateStatus  === undefined)
        return 0;

      if (this.getFirmwareUpdateState() === "Complete")
        return 100;

      const firstDevice = Object.values(store.status.firmware)[0];
      if (firstDevice === undefined)
        return 0;

      return firstDevice.progress;
    },

    getFirmwareTargetVersion() {
      if (this.firmwareUpdateStatus  === undefined)
        return this.$t('message.common.unknown');

      if (this.getFirmwareUpdateState() !== "Pause")
        return this.$t('message.common.unknown');

      const firstDevice = Object.values(store.status.firmware)[0];
      const firmwareInfo = firstDevice.state["Pause"];
      return firmwareInfo.version.join('.');
    }
  },

  created() {
    runWebsocket();
    startLightingHistory();
    startProfileDirty();
  },

  mounted() {
    store.onConnected(() => {
      this.loadLocale();
    });
  }
};
</script>

<style>
.screenreader-only {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

#main {
  width: 100%;
  font-size: 10pt;
}

/* Device view: the window is see-through around the device */
html.deviceOnly, html.deviceOnly body, html.deviceOnly #app, html.deviceOnly #main {
  background: transparent !important;
  overflow: hidden;
}
</style>

<style scoped>
/* The page grows in as the zoom lands, and shrinks away before zooming back out */
.zoomArrive {
  animation: zoomArrive .32s cubic-bezier(.2, .7, .3, 1) both;
}

@keyframes zoomArrive {
  from {
    opacity: 0;
    transform: scale(.96);
  }
}

.zoomArrive.zoomLeave {
  animation: zoomLeave .16s ease-in both;
}

@keyframes zoomLeave {
  to {
    opacity: 0;
    transform: scale(.96);
  }
}

.zoomBack {
  margin: 16px 0 0 20px;
  padding: 4px 12px;
  font-size: 12px;
  font-family: inherit;
  color: #d6dcd9;
  background: transparent;
  border: 1px solid #59b1b6;
  border-radius: 6px;
  cursor: pointer;
}

.zoomBack:hover {
  background: rgba(89, 177, 182, .1);
}

.modalButtonBox {
  display: flex;
  flex-direction: row;
  justify-content: right;
  gap: 5px;

  button {
    padding: 5px;
    color: #ccc;
    border: 1px solid #CCCCCC;
    background-color: transparent;
    padding: 4px 8px;
    cursor: pointer;

    &:hover {
      color: #fff;
      border-color: #fff;
    }

    &.cancel {
      border-color: #c00;

      &:hover {
        border-color: #ff0000;
      }
    }

    &.close {
      border-color: #417b80;

      &:hover {
        border-color: #59b1b6;
      }
    }
  }
}
</style>