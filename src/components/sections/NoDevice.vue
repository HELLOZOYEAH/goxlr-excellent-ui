<template>
  <!-- The streaming PC's own GoXLR app, reached through GoXLR Link -->
  <div v-if="remoteOpen && link" class="remote">
    <header class="remoteBar">
      <font-awesome-icon icon="fa-solid fa-link"/>
      <span>{{ $t('message.noDevice.remoteBanner', {host: hostName}) }}{{ msText }}</span>
      <button type="button" class="back" @click="remoteOpen = false">{{ $t('message.noDevice.back') }}</button>
    </header>
    <iframe v-if="remoteReady" class="remoteApp" :src="remoteUrl" :title="$t('message.noDevice.openRemote', {host: hostName})"></iframe>
    <div v-else class="remoteWait">
      <p v-if="remoteFailed">{{ $t('message.noDevice.remoteFailed', {host: hostName}) }}</p>
      <p v-else class="muted">{{ $t('message.noDevice.remoteOpening', {host: hostName}) }}</p>
      <button v-if="remoteFailed" type="button" class="back" @click="openRemote">{{ $t('message.noDevice.tryAgain') }}</button>
    </div>
  </div>

  <div v-else class="noDevice">
    <header class="bar">
      <div class="logo" aria-hidden="true">GO<span>X</span>LR</div>
      <span class="status" :class="{ ok: link }">{{ statusText }}</span>
      <SettingsButton v-if="hasConfig" compact/>
    </header>

    <main class="stage">
      <div class="heading">
        <h1>{{ link ? $t('message.noDevice.linkedTitle', {host: hostName}) : $t('message.noDevice.title') }}</h1>
        <p>{{ link ? $t('message.noDevice.linkedHint', {host: hostName}) : $t('message.noDevice.hint') }}</p>
      </div>

      <DeviceOff :link="link" @open="openRemote"/>
      <LinkController detachable/>
      <LinkFinder v-if="appUp && !link" class="finder"/>
      <LinkSync v-if="appUp && link" class="finder"/>

      <ul class="tips">
        <li><font-awesome-icon icon="fa-solid fa-plug"/><span>{{ $t('message.noDevice.tipUsb') }}</span></li>
        <li><font-awesome-icon icon="fa-solid fa-desktop"/><span>{{ $t('message.noDevice.tipOtherPc') }}</span></li>
        <li><font-awesome-icon icon="fa-solid fa-floppy-disk"/><span>{{ $t('message.noDevice.tipSave') }}</span></li>
      </ul>
    </main>
  </div>
</template>

<script>
// Shown when the daemon is running but no GoXLR is plugged into this PC: the GoXLR switched off,
// with GoXLR Link plugged in underneath so a gaming PC can still use its voice and sampler.
import DeviceOff from "@/components/sections/device/DeviceOff.vue";
import LinkController from "@/link/LinkController.vue";
import LinkFinder from "@/link/LinkFinder.vue";
import LinkSync from "@/link/LinkSync.vue";
import SettingsButton from "@/components/sections/system/modals/SettingsButton.vue";
import {store} from "@/store";

const APP_API = "http://127.0.0.1:47810";
const POLL_MS = 1000;

export default {
  name: "NoDevice",
  components: {DeviceOff, LinkController, LinkFinder, LinkSync, SettingsButton},
  data() {
    return {
      // {host, ms} while GoXLR Link here is linked to the GoXLR on another PC
      link: null,
      // GoXLR Link is running on this PC (so it can look for the streaming PC)
      appUp: false,
      // Showing the streaming PC's GoXLR app (closes by itself if the link drops)
      remoteOpen: false,
      // The streaming PC answered through the link (else a message instead of a blank page)
      remoteReady: false,
      remoteFailed: false,
      remotePort: 47813,
      timer: null,
    }
  },
  computed: {
    hostName() {
      return this.link ? String(this.link.host || "").toUpperCase() : "";
    },
    msText() {
      return !this.link || this.link.ms == null ? "" : ` · ${Math.max(1, this.link.ms)} ms`;
    },
    statusText() {
      if (!this.link) return this.$t('message.noDevice.status');
      return this.$t('message.noDevice.linkedStatus', {host: this.hostName}) + this.msText;
    },
    remoteUrl() {
      return `http://127.0.0.1:${this.remotePort}/`;
    },
    // Settings need the daemon's config, which arrives a moment after connecting
    hasConfig() {
      return !!store.getConfig();
    },
  },
  mounted() {
    this.poll();
    this.timer = setInterval(this.poll, POLL_MS);
  },
  unmounted() {
    clearInterval(this.timer);
  },
  methods: {
    async openRemote() {
      this.remoteOpen = true;
      this.remoteReady = false;
      this.remoteFailed = false;
      // Opaque, but it only resolves if the streaming PC's daemon answered through the link
      const answered = await fetch(this.remoteUrl, {mode: "no-cors", cache: "no-store"}).then(() => true).catch(() => false);
      this.remoteReady = answered;
      this.remoteFailed = !answered;
    },
    async poll() {
      // While developing, ?preview=no-device-linked shows the linked look without a second PC
      if (import.meta.env.DEV && new URLSearchParams(location.search).get("preview") === "no-device-linked") {
        this.link = {host: "STREAM-PC", ms: 12};
        return;
      }
      if (import.meta.env.DEV && new URLSearchParams(location.search).get("preview") === "no-device-find") {
        this.appUp = true;
        return;
      }
      const state = await fetch(APP_API + "/api/state").then(r => r.json()).catch(() => null);
      this.appUp = !!state;
      this.link = state && state.linked ? {host: state.host, ms: state.ms} : null;
      if (state && state.remotePort) this.remotePort = state.remotePort;
    },
  },
}
</script>

<style scoped>
.remote {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1f2423;
}

.remoteBar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: #1d3a3c;
  border-bottom: 1px solid #2f5a5c;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 13px;
}

.remoteBar .back {
  margin-left: auto;
  height: 28px;
  padding: 0 14px;
  border: 1px solid #59b1b6;
  border-radius: 7px;
  background: #1b2627;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 12px;
  cursor: pointer;
}

.remoteWait {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  color: #cfd6d2;
  font-family: var(--goxlr-font);
  font-size: 14px;
  text-align: center;
}

.remoteWait p {
  max-width: 520px;
  margin: 0;
}

.remoteWait .muted {
  color: #8d9693;
}

.remoteWait .back {
  height: 30px;
  padding: 0 14px;
  border: 1px solid #59b1b6;
  border-radius: 7px;
  background: #1d3a3c;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  cursor: pointer;
}

.remoteApp {
  flex: 1;
  width: 100%;
  border: 0;
}

.noDevice {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #cfd6d2;
  font-family: var(--goxlr-font);
}

.bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  border-bottom: 1px solid #2e3432;
  background: #1f2423;
}

.logo {
  font-family: var(--goxlr-title-font);
  font-weight: 700;
  font-size: 24px;
  letter-spacing: 0.22em;
  color: #e8ecea;
}

.logo span {
  color: #59b1b6;
}

.status {
  margin-left: auto;
  font-size: 13px;
  color: #9aa4a0;
}

.status.ok {
  color: #9fe1cb;
}

.stage {
  flex: 1;
  width: 100%;
  max-width: 1000px;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 24px 20px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.heading {
  margin-bottom: 18px;
  text-align: center;
}

h1 {
  margin: 0;
  font-family: var(--goxlr-title-font);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: var(--goxlr-title-spacing);
  color: #e6efeb;
}

.heading p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #8d9693;
}

.finder {
  max-width: 760px;
  margin-top: 16px;
}

.tips {
  width: 100%;
  max-width: 760px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.tips li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  border: 1px solid #343a38;
  border-radius: 10px;
  background: #262b29;
  font-size: 12px;
  line-height: 1.5;
}

.tips svg {
  margin-top: 2px;
  color: #59b1b6;
}
</style>
