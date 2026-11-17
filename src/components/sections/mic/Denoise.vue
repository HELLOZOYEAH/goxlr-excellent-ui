<template>
  <div class="denoise">
    <p v-if="!supported()" class="dnNote">{{ $t('message.device.denoiseUnavailable') }}</p>
    <p v-else-if="!available()" class="dnNote">{{ $t('message.device.denoiseChecking') }}</p>

    <div class="dnRows">
      <div v-for="branch in branches" :key="branch.id" class="dnRow">
        <button type="button" class="switch" role="switch" :aria-checked="active(branch.id)"
                :aria-busy="!!op && op.branch === branch.id" :disabled="!available() || busy()"
                :aria-label="$t(branch.label)" @click="toggleDenoise(branch.id)"><span></span></button>
        <div class="dnText">
          <b>{{ $t(branch.label) }}</b>
          <span>{{ rowText(branch.id) }}</span>
        </div>
        <button v-if="available() && !ready(branch.id)" type="button" class="dnLink" :disabled="busy()" @click="openSetup">
          {{ $t('message.device.denoiseSetupRequired') }}
        </button>
      </div>
    </div>

    <p v-if="error" class="dnError" role="alert">{{ error }}</p>
    <p v-else-if="status() && status().error" class="dnError" role="alert">{{ status().error }}</p>

    <details v-if="supported()" class="dnSetup" :open="setupOpen" @toggle="onToggle">
      <summary>{{ $t('message.device.denoiseSetup') }}</summary>
      <label>
        <span>{{ $t('message.device.denoiseSendOutput') }}</span>
        <select v-model="form.send_output">
          <option :value="null">{{ $t('message.device.denoiseNotSet') }}</option>
          <option v-for="e in endpoints('SendOutput')" :key="e.id" :value="e.id" :disabled="!e.available">
            {{ endpointText(e) }}
          </option>
        </select>
        <small>{{ $t('message.device.denoiseSendOutputHint') }}</small>
      </label>
      <label>
        <span>{{ $t('message.device.denoiseMonitorReturn') }}</span>
        <select v-model="form.monitor_return">
          <option :value="null">{{ $t('message.device.denoiseNotSet') }}</option>
          <option v-for="e in endpoints('MonitorReturn')" :key="e.id" :value="e.id" :disabled="!e.available">
            {{ endpointText(e) }}
          </option>
        </select>
        <small>{{ $t('message.device.denoiseMonitorReturnHint') }}</small>
      </label>
      <div class="dnActions">
        <button type="button" :disabled="busy()" :aria-busy="!!op && op.kind === 'save'" @click="saveSetup">{{ $t('message.device.denoiseSave') }}</button>
        <button type="button" :disabled="busy()" :aria-busy="!!op && op.kind === 'refresh'" @click="refreshEndpoints">{{ $t('message.device.denoiseRefresh') }}</button>
      </div>
    </details>
  </div>
</template>

<script>
// Denoise card body (DPDFNet-2). The daemon owns the worker and routing; this card only sends
// SetDenoiseEnabled / SetDenoiseConfig / RefreshDenoiseEndpoints and shows the state the daemon
// confirms. A switch never shows ON until the daemon reports it running.
//
// One request at a time per card. Each request carries the device serial, a generation number and
// a deadline: switching device or unmounting bumps the generation, so late replies are dropped,
// and every await (command and status alike) gives up at the deadline even if the daemon never
// answers.
import {store} from "@/store";
import {websocket} from "@/util/sockets";

// Longest wait for one request (worker start timeout is 5 s), and how often to re-check status
const TIMEOUT_MS = 6000, POLL_MS = 250;
const TIMEOUT = Symbol("timeout"), STALE = Symbol("stale");

export default {
  name: "MicDenoise",

  data() {
    return {
      branches: [
        {id: "Send", label: "message.device.denoiseSend"},
        {id: "Monitor", label: "message.device.denoiseMonitor"},
      ],
      // The request in flight: {kind: "toggle", branch} | {kind: "save"} | {kind: "refresh"} | null
      op: null,
      generation: 0,
      error: "",
      setupOpen: false,
      form: {send_output: null, monitor_return: null},
      timeoutMs: TIMEOUT_MS,
      pollMs: POLL_MS,
    }
  },

  computed: {
    activeSerial() {
      return store.getActiveSerial();
    },
  },

  watch: {
    activeSerial() {
      this.reset();
    },
  },

  unmounted() {
    this.generation++;
  },

  methods: {
    serial() {
      return store.getActiveSerial();
    },
    status() {
      const device = store.getActiveDevice();
      return device && device.denoise ? device.denoise : null;
    },
    // Old daemon builds have no denoise block at all: show unavailable and send nothing
    supported() {
      return this.status() !== null;
    },
    // A new daemon may still report available=false while it checks endpoints (Refresh/Setup still work)
    available() {
      const status = this.status();
      return !!(status && status.available);
    },
    config() {
      const status = this.status();
      return status && status.config ? status.config : {};
    },
    ready(branch) {
      const status = this.status();
      if (!status) return false;
      return branch === "Send" ? !!status.send_ready : !!status.monitor_ready;
    },
    active(branch) {
      const status = this.status();
      if (!status) return false;
      return branch === "Send" ? !!status.send_active : !!status.monitor_active;
    },
    starting() {
      const status = this.status();
      return !!(status && status.state === "Starting");
    },
    // Any request in flight, or the daemon still starting a branch, blocks every control on the card
    busy() {
      return this.op !== null || this.starting();
    },
    endpoints(kind) {
      const status = this.status();
      return status && status.endpoints ? status.endpoints.filter(e => e.kind === kind) : [];
    },
    endpointText(e) {
      return e.available || !e.reason ? e.name : e.name + " · " + e.reason;
    },
    rowText(branch) {
      const hint = branch === "Send" ? 'message.device.denoiseSendHint' : 'message.device.denoiseMonitorHint';
      if (!this.available()) return this.$t(hint);
      if ((this.op && this.op.branch === branch) || this.starting()) return this.$t('message.device.denoiseWorking');
      if (!this.ready(branch)) {
        return this.$t(branch === "Send" ? 'message.device.denoiseChooseSend' : 'message.device.denoiseChooseReturn');
      }
      const effects = store.getActiveDevice()?.effects;
      if (this.active(branch) && effects?.is_enabled && effects.current?.megaphone?.is_enabled) {
        return this.$t('message.device.denoiseMegaphoneBypass');
      }
      return this.$t(hint);
    },
    message(e) {
      if (e && e.Error) return String(e.Error);
      if (e && e.message) return e.message;
      return typeof e === "string" ? e : this.$t('message.device.denoiseFailed');
    },

    // New device (or back to an old one): forget everything in flight and start clean
    reset() {
      this.generation++;
      this.op = null;
      this.error = "";
      this.setupOpen = false;
      this.loadForm();
    },
    begin(op) {
      this.generation++;
      this.op = op;
      this.error = "";
      return {serial: this.serial(), generation: this.generation, deadline: Date.now() + this.timeoutMs};
    },
    current(request) {
      return request.serial === this.serial() && request.generation === this.generation;
    },
    finish(request) {
      if (this.current(request)) this.op = null;
    },
    fail(request, e) {
      if (!this.current(request) || e === STALE) return;
      this.error = e === TIMEOUT ? this.$t('message.device.denoiseTimeout') : this.message(e);
    },
    // Await a promise, but give up at the request's deadline; a reply for an old request is STALE
    async wait(request, promise) {
      let timer;
      const limit = new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(TIMEOUT), Math.max(0, request.deadline - Date.now()));
      });
      try {
        return await Promise.race([promise, limit]);
      } finally {
        clearTimeout(timer);
        if (!this.current(request)) throw STALE;
      }
    },
    // Fetch status until the daemon is past "Starting"; throws TIMEOUT at the deadline
    async settle(request) {
      for (;;) {
        store.replaceData(await this.wait(request, websocket.get_status()));
        if (!this.starting()) return;
        // Checked here too: a poll timer that ties with the deadline timer must not win forever
        if (Date.now() >= request.deadline) throw TIMEOUT;
        await this.wait(request, new Promise(resolve => setTimeout(resolve, this.pollMs)));
      }
    },

    async toggleDenoise(branch) {
      if (!this.supported() || !this.available() || this.busy()) return;
      if (!this.ready(branch)) {
        this.openSetup();
        return;
      }
      const enable = !this.active(branch);
      const request = this.begin({kind: "toggle", branch});
      try {
        try {
          await this.wait(request, websocket.send_command(request.serial, {SetDenoiseEnabled: [branch, enable]}));
        } catch (e) {
          if (e === TIMEOUT || e === STALE) throw e;
          // Rejected by the daemon: show why, then show the state it actually ended up in
          this.error = this.message(e);
        }
        await this.settle(request);
      } catch (e) {
        this.fail(request, e);
      } finally {
        this.finish(request);
      }
    },

    openSetup() {
      if (this.setupOpen || !this.supported()) return;
      this.setupOpen = true;
      this.loadForm();
      this.refreshEndpoints();
    },
    onToggle(event) {
      if (event.target.open) this.openSetup();
      else this.setupOpen = false;
    },
    loadForm() {
      const config = this.config();
      this.form = {send_output: config.send_output || null, monitor_return: config.monitor_return || null};
    },

    async refreshEndpoints() {
      if (!this.supported() || this.busy()) return;
      const request = this.begin({kind: "refresh"});
      try {
        // Unit variant on the Rust side, so it travels as a bare string
        await this.wait(request, websocket.send_command(request.serial, "RefreshDenoiseEndpoints"));
        await this.settle(request);
      } catch (e) {
        this.fail(request, e);
      } finally {
        this.finish(request);
      }
    },

    // Saves the selectors only. Any running branch is switched off and confirmed off first; if that
    // fails or times out nothing is saved. The saved flags are always false: saving never switches
    // anything on.
    async saveSetup() {
      if (!this.supported() || this.busy()) return;
      const request = this.begin({kind: "save"});
      try {
        for (const branch of ["Send", "Monitor"]) {
          if (!this.active(branch)) continue;
          await this.wait(request, websocket.send_command(request.serial, {SetDenoiseEnabled: [branch, false]}));
          await this.settle(request);
          if (this.active(branch)) throw Error(this.$t('message.device.denoiseStillOn'));
        }
        await this.wait(request, websocket.send_command(request.serial, {SetDenoiseConfig: {
          send_output: this.form.send_output,
          monitor_return: this.form.monitor_return,
          send_enabled: false,
          monitor_enabled: false,
        }}));
        await this.settle(request);
      } catch (e) {
        this.fail(request, e);
      } finally {
        this.finish(request);
      }
    },
  },
}
</script>

<style scoped>
.dnRows {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dnRow {
  display: flex;
  align-items: center;
  gap: 14px;
}

.dnText {
  flex: 1 1 auto;
}

.dnText b {
  display: block;
  font-weight: 400;
}

.dnText span {
  font-size: 12px;
  color: #9aa4a0;
}

.dnLink {
  padding: 5px 10px;
  border: 1px solid #3b413f;
  border-radius: 999px;
  background: none;
  color: #e6b450;
  font-family: var(--goxlr-font);
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}

.dnNote {
  margin: 0 0 14px;
  font-size: 12px;
  color: #6d7773;
}

.dnError {
  margin: 12px 0 0;
  font-size: 12px;
  color: #ff6b6b;
}

.dnSetup {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #3b413f;
}

.dnSetup summary {
  color: #9aa4a0;
  font-size: 13px;
  cursor: pointer;
}

.dnSetup label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 12px;
  font-size: 13px;
}

.dnSetup select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #3b413f;
  border-radius: 6px;
  background: #1b1f1e;
  color: #e8ecea;
  font-family: var(--goxlr-font);
}

.dnSetup small {
  color: #6d7773;
  font-size: 11px;
}

.dnActions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.dnActions button {
  padding: 6px 14px;
  border: 1px solid #3b413f;
  border-radius: 6px;
  background: #2a2f2d;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  cursor: pointer;
}

/* Same switch as the GATE card */
.switch {
  position: relative;
  flex: 0 0 auto;
  width: 44px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: #4a524f;
  cursor: pointer;
  transition: background 0.15s;
}

.switch span {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.15s;
}

.switch[aria-checked=true] {
  background: #59b1b6;
}

.switch[aria-checked=true] span {
  left: 23px;
}

.switch:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.switch[aria-busy=true] {
  cursor: progress;
}

button:focus-visible, select:focus-visible, summary:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}
</style>
