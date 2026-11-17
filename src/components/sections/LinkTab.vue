<template>
  <!-- Pop-out window: the small "controller" -->
  <div v-if="popout" class="mini" :class="{ solid: !appUp }">
    <LinkController v-if="appUp" windowed :api-base="APP_API" @dock="$emit('dock')"/>
    <template v-else>
      <header class="miniBar" @pointerdown="dragBar">
        <font-awesome-icon icon="fa-solid fa-gamepad" class="accent"/>
        <span class="title">GOXLR LINK</span>
        <button type="button" class="iconButton" :aria-label="$t('message.link.dockBack')"
                :title="$t('message.link.dockBack')" @click="$emit('dock')">
          <font-awesome-icon icon="fa-solid fa-down-left-and-up-right-to-center"/>
        </button>
      </header>
      <template v-if="host">
        <section class="card">
          <div class="row"><b>{{ $t('message.link.sendingChatMic') }}</b><span class="pill">{{ fxText }}</span></div>
          <div class="pc">
            <font-awesome-icon icon="fa-solid fa-desktop" class="pcIcon" :class="{ dim: !host.client }"/>
            <div>
              <div>{{ host.client ? host.client.name : $t('message.link.noGamingPc') }}</div>
              <div class="muted">{{ clientDetail }}</div>
            </div>
          </div>
        </section>
        <p class="muted small">{{ lastSampleText }}</p>
      </template>
      <p v-else class="muted small">{{ $t('message.link.notRunningHere') }}</p>
    </template>
  </div>

  <!-- The tab -->
  <div v-else class="linkTab">
    <div class="row">
      <h2 class="title big">GOXLR LINK</h2>
      <span v-if="roleText" class="pill">{{ roleText }}</span>
    </div>

      <p class="muted intro">{{ $t('message.link.intro') }}</p>
      <p v-if="blocked" class="problem">{{ $t('message.link.popOutBlocked') }}</p>

      <!-- Streaming PC: what goxlr-link host is doing -->
      <template v-if="host">
        <section class="card">
          <div class="row">
            <b>{{ $t('message.link.sendingChatMic') }}</b>
            <span class="pill">{{ fxText }}</span>
            <span class="muted push">48 kHz · LAN</span>
          </div>
          <div class="pc">
            <font-awesome-icon icon="fa-solid fa-desktop" class="pcIcon" :class="{ dim: !host.client }"/>
            <div>
              <div>{{ host.client ? host.client.name : $t('message.link.noGamingPc') }}</div>
              <div class="muted">{{ clientDetail }}</div>
            </div>
            <span v-if="host.client" class="pill push">{{ $t('message.link.live') }}</span>
          </div>
        </section>
        <section class="card">
          <div class="row">
            <b>{{ $t('message.link.samplerFromGamingPc') }}</b>
            <span class="muted push">{{ $t('message.link.playsOnGoxlr') }}</span>
          </div>
          <div class="muted gap">{{ lastSampleText }}</div>
        </section>
        <section v-if="host.lastSyncAgoMs != null" class="card">
          <div class="row">
            <b>{{ $t('message.link.syncTitle') }}</b>
            <span class="muted push">{{ $t('message.link.syncHostLine', {ago: ago(host.lastSyncAgoMs)}) }}</span>
          </div>
        </section>
      </template>

      <!-- Gaming PC: the controller (pull it out to pop it out) and the Link settings -->
      <template v-if="appUp">
        <p class="muted pullHint">{{ $t('message.link.pullHint') }}</p>
        <LinkController detachable :api-base="APP_API"/>
        <LinkSync :api-base="APP_API"/>
        <LinkPanel embedded settings-only :api-base="APP_API"/>
      </template>

      <section v-if="!host && !appUp" class="card">
        <b>{{ $t('message.link.notRunningHere') }}</b>
        <div class="muted gap">{{ $t('message.link.howToStart') }}</div>
      </section>

      <section v-if="!appUp" class="card">
        <div class="row"><b>{{ $t('message.link.noAppThere') }}</b></div>
        <div class="row gap">
          <span class="muted">{{ $t('message.link.installLink') }}</span>
          <button type="button" class="btn push" disabled :title="$t('message.link.getLinkSoon')">
            <font-awesome-icon icon="fa-solid fa-download"/>{{ $t('message.link.getLink') }}
          </button>
        </div>
      </section>
  </div>
</template>

<script>
// GoXLR Link inside the GoXLR app. On the streaming PC it shows what `goxlr-link host` is sending
// and to which gaming PC; on a gaming PC running `goxlr-link` it shows the same Link controls as the
// Link window. Both talk to goxlr-link's own local APIs (it only answers pages on this PC).
import LinkPanel from "@/link/LinkPanel.vue";
import LinkController from "@/link/LinkController.vue";
import LinkSync from "@/link/LinkSync.vue";
import {linkPopout} from "@/link/popout";
import {dragWindow} from "@/util/appWindow";

const HOST_API = "http://127.0.0.1:47811";
const APP_API = "http://127.0.0.1:47810";
const POLL_MS = 1000;

export default {
  name: "LinkTab",
  components: {LinkPanel, LinkController, LinkSync},
  props: {
    // Rendered in the pop-out window
    popout: {type: Boolean, default: false},
  },
  emits: ["dock"],

  data() {
    return {
      APP_API,
      host: null,
      appUp: false,
      timer: null,
      popoutState: linkPopout,
    }
  },

  computed: {
    blocked() {
      return this.popoutState.blocked;
    },
    roleText() {
      if (this.host && this.appUp) return this.$t('message.link.thisPcBoth');
      if (this.host) return this.$t('message.link.thisPcStream');
      if (this.appUp) return this.$t('message.link.thisPcGaming');
      return "";
    },
    fxText() {
      const fx = this.host && this.host.fx;
      if (!fx || !fx.master) return this.$t('message.link.fxOff');
      if (!fx.active.length) return this.$t('message.link.noEffects');
      return this.$t('message.link.fxOn', {fx: fx.active.join(" · ")});
    },
    clientDetail() {
      const client = this.host && this.host.client;
      if (!client) return this.$t('message.link.pairingCodeIs', {code: this.host ? this.host.code : ""});
      const ms = client.ms == null ? "…" : Math.max(1, client.ms);
      const mic = client.hearing === "backup" ? this.$t('message.link.backupMic') : this.$t('message.link.goxlrVoice');
      return this.$t('message.link.connectedDetail', {ms, mic});
    },
    lastSampleText() {
      const last = this.host && this.host.lastSample;
      if (!last) return this.$t('message.link.noSampleYet');
      return this.$t('message.link.lastSample', {name: last.name, ago: this.ago(last.agoMs)});
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
    // The pop-out has no title bar: this bar moves the window
    dragBar(event) {
      if (event.button === 0 && !event.target.closest("button")) dragWindow();
    },
    async poll() {
      this.host = await fetch(HOST_API + "/api/host").then(r => r.json()).catch(() => null);
      this.appUp = await fetch(APP_API + "/api/state").then(r => r.ok).catch(() => false);
    },
    ago(ms) {
      const s = Math.round(ms / 1000);
      if (s < 60) return this.$t('message.link.secondsAgo', {n: s});
      return this.$t('message.link.minutesAgo', {n: Math.round(s / 60)});
    },
  },
}
</script>

<style scoped>
.linkTab {
  max-width: 760px;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #cfd6d2;
  font-family: var(--goxlr-font);
}

.mini {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  color: #cfd6d2;
  font-family: var(--goxlr-font);
}

/* The window is see-through around the controller; the other view needs its own background */
.mini.solid {
  box-sizing: border-box;
  min-height: 100vh;
  border-radius: 12px;
  background: #252927;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.push {
  margin-left: auto;
}

.gap {
  margin-top: 6px;
}

.title {
  margin: 0;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  font-weight: 700;
  color: #e6efeb;
}

.title.big {
  font-size: 18px;
}

.accent {
  color: #59b1b6;
}

.muted {
  color: #8d9693;
  font-size: 12px;
}

.small {
  margin: 0;
}

.intro {
  margin: 0;
}

.pullHint {
  margin: 4px 0 0;
  text-align: center;
}

.card {
  padding: 10px 12px;
  border: 1px solid #343a38;
  border-radius: 10px;
  background: #262b29;
}

.card b {
  font-weight: 400;
  color: #e6efeb;
}

.pill {
  padding: 2px 8px;
  border-radius: 999px;
  background: #1d3a3c;
  color: #9fe1cb;
  font-size: 11px;
}

.btn {
  height: 30px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #3b413f;
  border-radius: 7px;
  background: #2a2f2d;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 12px;
  cursor: pointer;
}

.btn.acc {
  border-color: #59b1b6;
  background: #1d3a3c;
}

.btn:disabled {
  opacity: .5;
  cursor: default;
}

.pc {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  padding: 8px;
  border-radius: 8px;
  background: #1b1f1e;
}

.pcIcon {
  font-size: 20px;
  color: #59b1b6;
}

.pcIcon.dim {
  color: #5d6663;
}

.dock {
  min-height: 150px;
  margin-top: 2px;
  padding: 16px;
  display: grid;
  place-items: center;
  border: 2px dashed #3b413f;
  border-radius: 12px;
  text-align: center;
}

.dockIcon {
  font-size: 24px;
}

.dockTitle {
  margin-top: 6px;
}

.dockButton {
  margin-top: 10px;
}

.problem {
  margin: 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: #3a321d;
  color: #fac775;
  font-size: 12px;
}

.miniBar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #1b1f1e;
}

.miniBar .iconButton {
  margin-left: auto;
}

.iconButton {
  width: 30px;
  height: 30px;
  border: 1px solid #3b413f;
  border-radius: 7px;
  background: #2a2f2d;
  color: #cfd6d2;
  cursor: pointer;
}
</style>
