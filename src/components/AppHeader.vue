<template>
  <header class="appHeader" :class="{ inApp }" @pointerdown="headerDrag" @dblclick="headerDouble">
    <button type="button" class="burger" :aria-expanded="drawer.open" :aria-label="$t('message.navigation.menu')"
            :title="$t('message.navigation.menu') + '  ['" @click="drawer.open = !drawer.open">
      <font-awesome-icon icon="fa-solid fa-bars"/>
    </button>
    <div class="logo" aria-hidden="true">GO<span>X</span>LR</div>

    <!-- Profiles, samples and presets live in a drop-down instead of a permanent box -->
    <div class="profileMenu" v-click-outside="close">
      <button type="button" class="pill" :aria-expanded="open" aria-haspopup="true" @click="open = !open">
        <span class="pillLabel">{{ $t('message.navigation.profiles') }}</span>
        <strong>{{ profileName() }}</strong>
        <span v-if="dirty.profile" class="unsaved" :title="$t('message.navigation.unsaved')"
              :aria-label="$t('message.navigation.unsaved')"></span>
        <font-awesome-icon icon="fa-solid fa-chevron-down" class="chevron" :class="{ flipped: open }"/>
      </button>
      <div v-show="open" class="popover">
        <FileTabs/>
      </div>
    </div>

    <!-- Mic profiles, same drop-down pattern -->
    <div v-if="micProfileName()" class="profileMenu" v-click-outside="closeMic">
      <button type="button" class="pill" :aria-expanded="micOpen" aria-haspopup="true" @click="micOpen = !micOpen">
        <span class="pillLabel">{{ $t('message.navigation.microphone') }}</span>
        <strong>{{ micProfileName() }}</strong>
        <span v-if="dirty.mic" class="unsaved" :title="$t('message.navigation.unsaved')"
              :aria-label="$t('message.navigation.unsaved')"></span>
        <font-awesome-icon icon="fa-solid fa-chevron-down" class="chevron" :class="{ flipped: micOpen }"/>
      </button>
      <div v-show="micOpen" class="popover micPopover">
        <MicProfileHandler/>
      </div>
    </div>

    <div class="spacer"></div>

    <button v-if="inApp" type="button" class="deviceViewBtn" :title="$t('message.deviceView.buttonTitle')" @click="$emit('device-view')">
      <font-awesome-icon icon="fa-solid fa-down-left-and-up-right-to-center"/>{{ $t('message.deviceView.button') }}
    </button>

    <LanguageToggle v-if="supportsLanguages()"/>

    <div class="status">
      <span class="dot"></span>{{ deviceLabel() }}
    </div>

    <!-- The app window has no Windows frame: its buttons, in the same capsule as device view -->
    <div v-if="inApp" class="winCaps">
      <button type="button" :title="$t('message.deviceView.minimise')" :aria-label="$t('message.deviceView.minimise')"
              @click="minimiseWindow">–</button>
      <button type="button" :title="$t('message.deviceView.maximise')" :aria-label="$t('message.deviceView.maximise')"
              @click="toggleMaximiseWindow"><span class="maxBox"></span></button>
      <button type="button" class="close" :title="$t('message.deviceView.close')" :aria-label="$t('message.deviceView.close')"
              @click="hideWindow"><font-awesome-icon icon="fa-solid fa-xmark"/></button>
    </div>
  </header>
</template>

<script>
import {store} from "@/store";
import {isDeviceMini} from "@/util/util";
import FileTabs from "@/components/sections/files/FileTabs.vue";
import LanguageToggle from "@/components/LanguageToggle.vue";
import MicProfileHandler from "@/components/profiles/handlers/MicProfileHandler.vue";
import {navDrawer} from "@/util/navDrawer";
import {profileDirty} from "@/util/profileDirty";
import {dragWindow, hideWindow, inApp, minimiseWindow, toggleMaximiseWindow} from "@/util/appWindow";

export default {
  name: "AppHeader",
  components: {FileTabs, LanguageToggle, MicProfileHandler},
  emits: ["device-view"],

  data() {
    return {
      open: false,
      micOpen: false,
      drawer: navDrawer,
      dirty: profileDirty,
      inApp: inApp(),   // device view only works in the app window
    }
  },

  methods: {
    minimiseWindow,
    toggleMaximiseWindow,
    hideWindow,
    // Empty parts of the header move the window (it has no title bar); double-click maximises
    isEmptySpot(event) {
      return this.inApp && event.button === 0 && !event.target.closest("button, a, input, select, .profileMenu, .popover, .status");
    },
    headerDrag(event) {
      if (this.isEmptySpot(event)) dragWindow();
    },
    headerDouble(event) {
      if (this.isEmptySpot(event)) toggleMaximiseWindow();
    },
    close() {
      this.open = false;
    },
    closeMic() {
      this.micOpen = false;
    },
    profileName() {
      return store.getActiveDevice().profile_name;
    },
    micProfileName() {
      return store.getActiveDevice().mic_profile_name;
    },
    supportsLanguages() {
      return store.getConfig() !== undefined && store.getConfig().hasOwnProperty("locale");
    },
    deviceLabel() {
      return (isDeviceMini() ? "GoXLR Mini" : "GoXLR") + " · USB";
    },
  },
}
</script>

<style scoped>
.appHeader {
  position: relative;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  box-sizing: border-box;
  padding: 10px 20px;
  background: #1f2423;
  border-bottom: 1px solid #343a38;
  color: #e8ecea;
}

/* "Not saved yet": a small amber dot after the profile name */
.unsaved {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
  background: #f0b429;
  box-shadow: 0 0 6px rgba(240, 180, 41, .7);
}

.burger {
  width: 38px;
  height: 38px;
  margin-left: -8px;
  display: grid;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: none;
  color: #c3ccc8;
  font-size: 17px;
  cursor: pointer;
}

.burger:hover, .burger[aria-expanded=true] {
  background: #2d3230;
  color: #fff;
}

.burger:focus-visible {
  outline: 2px solid #59b1b6;
}

.logo {
  margin-right: 10px;
  font-family: var(--goxlr-title-font);
  font-weight: 700;
  font-size: 24px;
  letter-spacing: 0.22em;
}

.logo span {
  color: #59b1b6;
}

.profileMenu {
  position: relative;
}

.pill {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid #3a413f;
  border-radius: 8px;
  background: #2a2f2d;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 14px;
  cursor: pointer;
}

.pill:hover, .pill[aria-expanded=true] {
  border-color: #59b1b6;
}

.pill:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.pillLabel {
  font-size: 12px;
  color: #9aa4a0;
}

.chevron {
  font-size: 11px;
  transition: transform 0.15s;
}

.chevron.flipped {
  transform: rotate(180deg);
}

.popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  padding: 10px 6px 6px;
  border: 1px solid #3a413f;
  border-radius: 12px;
  background: #252927;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
}

.micPopover {
  padding: 6px;
}

.spacer {
  flex: 1 1 24px;
}

/* Window buttons: frosted capsule like device view */
.winCaps {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 999px;
  background: rgba(255, 255, 255, .04);
}

.winCaps button {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #aab3af;
  font-family: var(--goxlr-font);
  font-size: 12px;
  cursor: pointer;
  transition: background .2s, color .2s;
}

.maxBox {
  display: inline-block;
  width: 9px;
  height: 9px;
  border: 1.5px solid currentColor;
  border-radius: 2px;
  vertical-align: middle;
}

.winCaps button:hover {
  background: rgba(255, 255, 255, .1);
  color: #e8ecea;
}

.winCaps button.close:hover {
  background: rgba(192, 72, 79, .55);
  color: #fff;
}

.winCaps button:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 1px;
}

/* Shrinks the app to the device, floating on the desktop */
.deviceViewBtn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid #3b413f;
  border-radius: 8px;
  background: #2a2f2d;
  color: #c3ccc8;
  font-family: var(--goxlr-font);
  font-size: 12px;
  cursor: pointer;
}

.deviceViewBtn:hover {
  border-color: #59b1b6;
  color: #bff3f5;
}

.deviceViewBtn:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #9aa4a0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4fd1a5;
  box-shadow: 0 0 6px #4fd1a5;
}
</style>
