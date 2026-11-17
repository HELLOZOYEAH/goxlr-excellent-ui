<template>
  <div class="link" :class="{ embedded }">
    <header v-if="!settingsOnly" class="bar">
      <template v-if="!embedded || dockable">
        <font-awesome-icon icon="fa-solid fa-gamepad" class="logo"/>
        <span class="title">GOXLR LINK</span>
      </template>
      <span class="status" :class="statusClass">{{ statusText }}</span>
      <button type="button" class="iconButton" :aria-pressed="settingsOpen" :aria-label="$t('message.link.settings')"
              :title="$t('message.link.settings')" @click="toggleSettings">
        <font-awesome-icon :icon="settingsOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-gear'"/>
      </button>
      <button v-if="dockable" type="button" class="iconButton" :aria-label="$t('message.link.dockBack')"
              :title="$t('message.link.dockBack')" @click="$emit('dock')">
        <font-awesome-icon icon="fa-solid fa-down-left-and-up-right-to-center"/>
      </button>
    </header>

    <p v-if="!reachable" class="problem">{{ $t('message.link.notRunning') }}</p>
    <p v-else-if="state.problem" class="problem">
      {{ state.problem }}
      <a v-if="!state.output && settings.vbCableUrl" :href="settings.vbCableUrl" target="_blank" rel="noopener">{{ $t('message.link.getVbCable') }}</a>
    </p>

    <!-- Settings -->
    <section v-if="settingsOpen || settingsOnly" class="card settings" :aria-label="$t('message.link.settings')">
      <h3 v-if="settingsOnly">{{ $t('message.link.linkSettings') }}</h3>
      <template v-if="settingsOnly">
        <div class="backupRow">
          <span class="muted">{{ $t('message.link.backupMic') }}</span>
          <select :value="settings.backup || ''" :aria-label="$t('message.link.backupMic')"
                  @focus="loadSettings" @change="save({backup: $event.target.value || null})">
            <option value="">{{ $t('message.link.windowsDefault') }}</option>
            <option v-for="name in settings.inputs || []" :key="name" :value="name">{{ name }}</option>
          </select>
        </div>
        <label class="check">
          <input type="checkbox" :checked="state.fallback" @change="save({fallback: $event.target.checked})">
          <span>{{ $t('message.link.fallback') }}</span>
        </label>
      </template>
      <LinkFinder :api-base="apiBase || undefined" @picked="loadSettings"/>
      <label class="field">
        <span>{{ $t('message.link.streamingPc') }}</span>
        <input v-model.trim="form.host" type="text" inputmode="decimal" placeholder="192.168.0.10" @change="save({host: form.host})">
      </label>
      <label class="field">
        <span>{{ $t('message.link.pairingCode') }}</span>
        <input v-model.trim="form.code" type="text" inputmode="numeric" maxlength="6"
               :placeholder="settings.paired ? $t('message.link.paired') : '123456'" @change="save({code: form.code})">
        <small>{{ $t('message.link.pairingHint') }}</small>
      </label>
      <label class="field">
        <span>{{ $t('message.link.hotkey') }}</span>
        <select :value="settings.hotkey" @change="save({hotkey: $event.target.value})">
          <option v-for="n in 24" :key="n" :value="'F' + n">F{{ n }}</option>
        </select>
      </label>
      <div class="tips">
        <b>{{ $t('message.link.discordTitle') }}</b>
        <p>{{ $t('message.link.discordTips') }}</p>
      </div>
      <p v-if="saveError" class="problem inline">{{ saveError }}</p>
      <div v-if="!embedded" class="langs" role="group" :aria-label="$t('message.link.language')">
        <button type="button" :aria-pressed="$i18n.locale === 'en_GB'" @click="setLanguage('en_GB')">EN</button>
        <button type="button" :aria-pressed="$i18n.locale === 'th_TH'" @click="setLanguage('th_TH')">TH</button>
      </div>
    </section>

    <template v-else>
      <!-- Game mic -->
      <section class="card" :aria-label="$t('message.link.gameMic')">
        <div class="cardHead">
          <h3>{{ $t('message.link.gameMic') }}</h3>
          <span class="muted">{{ $t('message.link.whatTeamHears') }}</span>
        </div>
        <div class="seg" role="group" :aria-label="$t('message.link.gameMic')">
          <button type="button" :aria-pressed="state.mode === 'goxlr'" @click="setMode('goxlr')">{{ $t('message.link.goxlrVoice') }}</button>
          <button type="button" :aria-pressed="state.mode === 'backup'" @click="setMode('backup')">{{ $t('message.link.thisPcMic') }}</button>
        </div>
        <div class="hearing" :class="{ backup: hearingBackup }">
          <b>{{ hearingTitle }}</b>
          <span class="muted">{{ hearingHint }}</span>
          <div v-if="!hearingBackup && state.fx" class="fx">
            <span v-if="!state.fx.master" class="pill off">{{ $t('message.link.fxOff') }}</span>
            <template v-else>
              <span v-for="name in state.fx.active" :key="name" class="pill">{{ name }}</span>
              <span v-if="!state.fx.active.length" class="pill off">{{ $t('message.link.noEffects') }}</span>
            </template>
            <span v-if="state.fx.preset" class="preset">{{ state.fx.preset }}</span>
          </div>
        </div>
        <div class="meterRow">
          <span class="muted">{{ $t('message.link.sending') }}</span>
          <div class="meter"><i :class="{ backup: hearingBackup }" :style="{ width: meterWidth }"></i></div>
        </div>
        <div class="backupRow">
          <span class="muted">{{ $t('message.link.backupMic') }}</span>
          <select :value="settings.backup || ''" :aria-label="$t('message.link.backupMic')"
                  @focus="loadSettings" @change="save({backup: $event.target.value || null})">
            <option value="">{{ $t('message.link.windowsDefault') }}</option>
            <option v-for="name in settings.inputs || []" :key="name" :value="name">{{ name }}</option>
          </select>
        </div>
        <label class="check">
          <input type="checkbox" :checked="state.fallback" @change="save({fallback: $event.target.checked})">
          <span>{{ $t('message.link.fallback') }}</span>
        </label>
        <p class="muted small">{{ $t('message.link.hotkeyHint', { key: state.hotkey || 'F8' }) }}</p>
      </section>

      <!-- Sampler -->
      <section class="card" :aria-label="$t('message.link.sampler')">
        <div class="cardHead">
          <h3>{{ $t('message.link.sampler') }}</h3>
          <span class="muted">{{ $t('message.link.samePads') }}</span>
        </div>
        <div v-if="sampler" class="sampler">
          <div class="banks" role="group" :aria-label="$t('message.link.bank')">
            <button v-for="bank in BANKS" :key="bank" type="button" class="bank" :aria-pressed="sampler.bank === bank"
                    @click="send({type: 'bank', bank})">{{ bank }}</button>
          </div>
          <div class="pads">
            <button v-for="pad in pads" :key="pad.button" type="button" class="pad"
                    :class="{ empty: !pad.name, playing: pad.playing }" :disabled="!pad.name"
                    :aria-label="pad.name || $t('message.link.emptyPad')"
                    @click="send({type: 'play', bank: sampler.bank, button: pad.button})">
              {{ pad.name || $t('message.link.emptyPad') }}
            </button>
            <button type="button" class="stop" @click="stopAll">{{ $t('message.link.stop') }}</button>
          </div>
        </div>
        <p v-else class="muted small">{{ $t('message.link.samplerWaiting') }}</p>
      </section>
    </template>
  </div>
</template>

<script>
// GoXLR Link, gaming PC side: which mic the game hears, the GoXLR's real sampler pads, and setup.
// Talks to goxlr-link's local API (`apiBase`, same origin inside the Link window).
import LinkFinder from "@/link/LinkFinder.vue";

const BANKS = ["A", "B", "C"];
const BUTTONS = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"];
const POLL_MS = 250;

export default {
  name: "LinkPanel",
  components: {LinkFinder},
  props: {
    apiBase: {type: String, default: ""},
    // Inside the GoXLR app (Link tab or its pop-out): the app shows the title and picks the language
    embedded: {type: Boolean, default: false},
    // Show a Dock back button (the pop-out window)
    dockable: {type: Boolean, default: false},
    // Only the settings (the Link tab, where the controller above has the mic and pads)
    settingsOnly: {type: Boolean, default: false},
  },
  emits: ["dock"],

  data() {
    return {
      BANKS,
      state: {},
      reachable: true,
      settings: {},
      settingsOpen: false,
      form: {host: "", code: ""},
      saveError: "",
      timer: null,
    }
  },

  computed: {
    hearingBackup() {
      return this.state.hearing === "backup";
    },
    statusText() {
      if (!this.reachable) return this.$t('message.link.offline');
      if (!this.state.linked) return this.$t('message.link.notLinked');
      const host = this.state.host || "";
      return this.state.audio ? this.$t('message.link.linkedTo', {host}) : this.$t('message.link.linkedNoAudio');
    },
    statusClass() {
      return {ok: this.reachable && this.state.linked && this.state.audio, warn: !this.reachable || !this.state.linked};
    },
    hearingTitle() {
      if (!this.hearingBackup) return this.$t('message.link.goxlrLive');
      return this.$t('message.link.backupThisPc', {name: this.state.backup || this.$t('message.link.backupMic')});
    },
    hearingHint() {
      if (!this.hearingBackup) return this.$t('message.link.goxlrHint');
      if (this.state.mode === "goxlr") return this.$t('message.link.fellBack');
      return this.$t('message.link.plainVoice');
    },
    meterWidth() {
      const level = this.state.level || 0;
      const db = level > 0 ? 20 * Math.log10(level) : -60;
      return Math.max(0, Math.min(100, (db + 60) / 60 * 100)) + "%";
    },
    sampler() {
      return this.state.sampler || null;
    },
    pads() {
      const s = this.sampler;
      return BUTTONS.map(button => s.pads.find(p => p.bank === s.bank && p.button === button) || {button, name: null, playing: false});
    },
  },

  mounted() {
    this.load();
    this.loadSettings();
    this.timer = setInterval(this.load, POLL_MS);
  },

  unmounted() {
    clearInterval(this.timer);
  },

  methods: {
    url(path) {
      return this.apiBase + path;
    },
    async load() {
      try {
        const response = await fetch(this.url("/api/state"));
        this.state = await response.json();
        this.reachable = true;
      } catch (e) {
        this.reachable = false;
      }
    },
    async loadSettings() {
      try {
        this.settings = await (await fetch(this.url("/api/settings"))).json();
        this.form = {host: this.settings.host || "", code: ""};
      } catch (e) {
        this.reachable = false;
      }
    },
    toggleSettings() {
      this.settingsOpen = !this.settingsOpen;
      this.saveError = "";
      if (this.settingsOpen) this.loadSettings();
    },
    async save(change) {
      this.saveError = "";
      const response = await fetch(this.url("/api/settings"), {method: "POST", body: JSON.stringify(change)}).catch(() => null);
      if (!response) {
        this.reachable = false;
        return;
      }
      const body = await response.json();
      if (response.ok) {
        this.settings = body;
        if (change.code) this.form.code = "";
      } else {
        this.saveError = body;
      }
      this.load();
    },
    async setMode(mode) {
      if (this.state.mode === mode) return;
      await fetch(this.url("/api/mic/toggle"), {method: "POST"}).catch(() => null);
      this.load();
    },
    async send(command) {
      await fetch(this.url("/api/sampler"), {method: "POST", body: JSON.stringify(command)}).catch(() => null);
      this.load();
    },
    stopAll() {
      if (!this.sampler) return;
      BUTTONS.forEach(button => this.send({type: "stop", bank: this.sampler.bank, button}));
    },
    setLanguage(locale) {
      this.$i18n.locale = locale;
      try {
        localStorage.setItem("goxlr-link-lang", locale);
      } catch (e) {
        // only remembered while this window is open
      }
    },
  },
}
</script>

<style scoped>
.link {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #cfd6d2;
}

.link.embedded {
  max-width: none;
  margin: 0;
}

.bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #1b1f1e;
}

.logo {
  color: #59b1b6;
}

.title {
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  font-weight: 700;
  color: #e6efeb;
}

.status {
  margin-left: auto;
  font-size: 12px;
  color: #9aa4a0;
}

.status.ok {
  color: #4fd1a5;
}

.status.warn {
  color: #e6b450;
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

.iconButton[aria-pressed=true] {
  background: #1d3a3c;
  border-color: #59b1b6;
}

.problem {
  margin: 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: #3a321d;
  color: #fac775;
  font-size: 12px;
  line-height: 1.5;
}

.problem a {
  color: #e8ecea;
  margin-left: 4px;
}

.problem.inline {
  background: #3a1d1d;
  color: #ff9b9b;
}

.card {
  padding: 12px;
  border: 1px solid #343a38;
  border-radius: 10px;
  background: #2d3230;
}

.cardHead {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

h3 {
  margin: 0;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  font-size: 13px;
  font-weight: 700;
  color: #e6efeb;
}

.muted {
  color: #8d9693;
  font-size: 12px;
}

.small {
  margin: 8px 0 0;
  font-size: 11px;
}

.seg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  border: 1px solid #3b413f;
  border-radius: 7px;
}

.seg button {
  padding: 8px 6px;
  border: 0;
  background: none;
  color: #8d9693;
  font-size: 12px;
  cursor: pointer;
}

.seg button[aria-pressed=true] {
  background: #1d3a3c;
  color: #e8ecea;
}

.hearing {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 10px;
  padding: 10px 12px;
  border: 1px solid #59b1b6;
  border-radius: 8px;
  background: #1d3a3c;
}

.hearing b {
  font-weight: 700;
  color: #e8ecea;
}

.hearing.backup {
  border-color: #e6b450;
  background: #3a321d;
}

.fx {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
}

.pill {
  padding: 2px 8px;
  border: 1px solid #59b1b6;
  border-radius: 999px;
  background: #16302f;
  color: #e8ecea;
  font-size: 11px;
}

.pill.off {
  border-color: #3b413f;
  background: none;
  color: #8d9693;
}

.preset {
  margin-left: auto;
  font-size: 11px;
  color: #9fe1cb;
}

.meterRow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.meter {
  flex: 1;
  height: 6px;
  overflow: hidden;
  border-radius: 3px;
  background: #1b1f1e;
}

.meter i {
  display: block;
  height: 100%;
  background: #59b1b6;
  transition: width 80ms linear;
}

.meter i.backup {
  background: #e6b450;
}

.sampler {
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 8px;
}

.banks {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bank {
  height: 36px;
  border: 2px solid #0b3a66;
  border-radius: 5px;
  background: none;
  color: #4c8fcf;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.bank[aria-pressed=true] {
  border-color: #00ff08;
  color: #00ff08;
}

.pads {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.pad {
  height: 72px;
  padding: 6px;
  overflow: hidden;
  border: 2px solid #0f5f12;
  border-radius: 6px;
  background: #141716;
  color: #d6e8d6;
  font-size: 11px;
  line-height: 1.3;
  text-align: left;
  word-break: break-word;
  cursor: pointer;
}

.pad.empty {
  border-color: #2c312f;
  color: #5f6866;
  cursor: default;
}

.pad.playing {
  border-color: #ff3b3b;
  background: #3a1717;
  color: #ffd0d0;
}

.stop {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 3px 8px;
  border: 1px solid #0f5f12;
  border-radius: 4px;
  background: #1b1f1e;
  color: #8fdc8f;
  font-size: 10px;
  cursor: pointer;
}

.settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #9aa4a0;
}

.field input, .field select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #3b413f;
  border-radius: 6px;
  background: #1b1f1e;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 13px;
}

.field small {
  color: #6d7773;
  font-size: 11px;
}

.check {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
}

.backupRow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.backupRow select {
  flex: 1;
  min-width: 0;
  height: 28px;
  padding: 0 6px;
  border: 1px solid #3b413f;
  border-radius: 6px;
  background: #1b1f1e;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 12px;
}

.tips {
  padding: 8px 10px;
  border: 1px dashed #3b413f;
  border-radius: 8px;
  font-size: 12px;
}

.tips p {
  margin: 4px 0 0;
  color: #9aa4a0;
  line-height: 1.5;
}

.langs {
  display: flex;
  gap: 6px;
}

.langs button {
  padding: 4px 10px;
  border: 1px solid #3b413f;
  border-radius: 6px;
  background: none;
  color: #9aa4a0;
  cursor: pointer;
}

.langs button[aria-pressed=true] {
  background: #1d3a3c;
  color: #e8ecea;
}

button {
  font-family: var(--goxlr-font);
}

button:focus-visible, input:focus-visible, select:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}
</style>
