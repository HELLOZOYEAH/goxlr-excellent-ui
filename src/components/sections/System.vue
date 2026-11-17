<template>
  <CenteredContainer>
    <GroupContainer :title="$t('message.system.title')">
      <div class="buttons">
        <MicSetupButton />
        <SwitchDeviceButton v-if="store.getDeviceCount() > 1" />
        <FirmwareUpdateButton />
        <ShutdownButton />
        <DeviceSettingsButton />
        <SettingsButton />
        <AboutButton />
        <LicenseButton />
        <HelpButton />
      </div>
      <!-- Only in the app window: device view needs the window program -->
      <button v-if="inApp" type="button" class="startView" :aria-pressed="startDeviceView" @click="toggleStartView">
        <span class="switch" :class="{ on: startDeviceView }"><span></span></span>
        <span>{{ $t('message.deviceView.startIn') }}<small>{{ $t('message.deviceView.startInHint') }}</small></span>
      </button>
    </GroupContainer>
  </CenteredContainer>
</template>

<script>
import MicSetupButton from "@/components/sections/system/modals/MicSetupButton.vue";
import CenteredContainer from "@/components/containers/CenteredContainer.vue";
import GroupContainer from "@/components/containers/GroupContainer.vue";
import LicenseButton from "@/components/sections/system/modals/LicenseButton.vue";
import AboutButton from "@/components/sections/system/modals/AboutButton.vue";
import SettingsButton from "@/components/sections/system/modals/SettingsButton.vue";
import HelpButton from "@/components/sections/system/HelpButton.vue";
import ShutdownButton from "@/components/sections/system/modals/PowerButton.vue";
import DeviceSettingsButton from "@/components/sections/system/modals/DeviceSettingsButton.vue";
import SwitchDeviceButton from "@/components/sections/system/modals/SwitchDeviceButton.vue";
import {store} from "@/store";
import FirmwareUpdateButton from "@/components/sections/system/modals/FirmwareUpdateButton.vue";
import {inApp, setStartsInDeviceView, startsInDeviceView} from "@/util/appWindow";

export default {
  name: "SystemComponent",
  data() {
    return {inApp: inApp(), startDeviceView: startsInDeviceView()}
  },
  methods: {
    toggleStartView() {
      this.startDeviceView = !this.startDeviceView;
      setStartsInDeviceView(this.startDeviceView);
    },
  },
  computed: {
    store() {
      return store
    }
  },
  components: {
    FirmwareUpdateButton,
    SwitchDeviceButton,
    DeviceSettingsButton,
    ShutdownButton,
    HelpButton,
    SettingsButton,
    AboutButton,
    LicenseButton,
    GroupContainer,
    CenteredContainer,
    MicSetupButton
  },
}
</script>

<style scoped>
.buttons {
  display: flex;
  flex-direction: row;
  gap: 15px;
}

.startView {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  min-height: 44px;
  padding: 8px 14px;
  border: 1px solid #3a413f;
  border-radius: 8px;
  background: #2a2f2d;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.startView[aria-pressed=true] {
  border-color: #59b1b6;
  background: #1d3a3c;
}

.startView small {
  display: block;
  font-size: 11px;
  color: #9aa4a0;
}

.startView:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.switch {
  position: relative;
  flex: none;
  width: 34px;
  height: 20px;
  border-radius: 10px;
  background: #4a524f;
}

.switch span {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: left .15s;
}

.switch.on {
  background: #59b1b6;
}

.switch.on span {
  left: 16px;
}
</style>
