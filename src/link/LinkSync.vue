<template>
  <section class="sync" :aria-label="$t('message.link.syncTitle')">
    <div class="row">
      <span class="title">{{ $t('message.link.syncTitle') }}</span>
      <span class="muted">{{ $t('message.link.syncHint') }}</span>
      <span class="pill" :class="pill.kind">{{ pill.text }}</span>
    </div>

    <div class="pcs">
      <div class="pc">
        <font-awesome-icon icon="fa-solid fa-desktop" class="pcIcon"/>
        <div><b>{{ state.thisPc || '…' }}</b><div class="muted">{{ $t('message.link.syncThisPc') }}</div></div>
      </div>
      <font-awesome-icon :icon="state.linked ? 'fa-solid fa-right-left' : 'fa-solid fa-clock'" class="arrows"/>
      <div class="pc right">
        <div><b>{{ peer }}</b><div class="muted">{{ peerDetail }}</div></div>
        <font-awesome-icon icon="fa-solid fa-desktop" class="pcIcon" :class="{ dim: !state.linked }"/>
      </div>
    </div>

    <div class="list">
      <div v-for="group in GROUPS" :key="group.id" class="item">
        <div class="row">
          <b>{{ $t(group.label) }}</b>
          <button type="button" class="switch" role="switch" :aria-checked="isOn(group)"
                  :aria-label="$t(group.label)" @click="toggle(group)"><i></i></button>
        </div>
        <span class="muted">{{ countText(group) }}</span>
        <template v-if="busyIn(group)">
          <div class="bar"><i :style="{ width: progressWidth }"></i></div>
          <span class="muted file">{{ progressFile }}</span>
        </template>
      </div>
    </div>

    <p v-if="state.problem" class="problem">{{ state.problem }}</p>
    <span class="muted">{{ $t('message.link.syncBackups') }}</span>
  </section>
</template>

<script>
// GoXLR Link's file sync: profiles, mic profiles, sounds, presets and icons kept the same on both
// PCs. Reads goxlr-link's /api/sync on this PC; the switches choose which folders take part.
const APP_API = "http://127.0.0.1:47810";
const POLL_MS = 1000;
const GROUPS = [
  {id: "profiles", label: "message.link.syncProfiles", folders: ["profiles"]},
  {id: "mic", label: "message.link.syncMicProfiles", folders: ["mic-profiles"]},
  {id: "sounds", label: "message.link.syncSounds", folders: ["samples"]},
  {id: "extras", label: "message.link.syncExtras", folders: ["presets", "icons"]},
];

export default {
  name: "LinkSync",
  props: {
    apiBase: {type: String, default: APP_API},
  },

  data() {
    return {
      GROUPS,
      state: {},
      timer: null,
    }
  },

  computed: {
    peer() {
      return this.state.peer || this.$t('message.link.syncOtherPc');
    },
    peerDetail() {
      if (this.state.linked) return this.$t('message.link.syncGoxlrThere');
      if (this.state.lastOkAgoMs == null) return this.$t('message.link.syncOff');
      return this.$t('message.link.syncOffSince', {ago: this.ago(this.state.lastOkAgoMs)});
    },
    pill() {
      const s = this.state;
      if (!s.enabled || !s.enabled.length) return {kind: "wait", text: this.$t('message.link.syncPaused')};
      if (!s.linked) return {kind: "wait", text: this.$t('message.link.syncPeerOff', {pc: this.peer})};
      if (s.progress) return {kind: "busy", text: this.$t('message.link.syncCopying', {n: s.progress.total - s.progress.done})};
      if (s.lastOkAgoMs == null) return {kind: "busy", text: this.$t('message.link.syncStarting')};
      return {kind: "ok", text: this.$t('message.link.syncUpToDate', {ago: this.ago(s.lastOkAgoMs)})};
    },
    progressWidth() {
      const p = this.state.progress;
      return p && p.total ? Math.round(p.done / p.total * 100) + "%" : "0%";
    },
    progressFile() {
      const p = this.state.progress;
      return p ? p.file.split("/").slice(1).join("/") : "";
    },
  },

  mounted() {
    this.load();
    this.timer = setInterval(this.load, POLL_MS);
  },

  unmounted() {
    clearInterval(this.timer);
  },

  methods: {
    async load() {
      // While developing, ?preview=no-device-sync shows a sync in progress without a second PC
      if (import.meta.env.DEV && new URLSearchParams(location.search).get("preview") === "no-device-sync") {
        this.state = {
          thisPc: "GAMING-PC", peer: "STREAM-PC", linked: true, enabled: ["profiles", "mic-profiles", "samples", "presets", "icons"],
          lastOkAgoMs: 12000, progress: {done: 3, total: 5, file: "samples/Airhorn.wav"},
          counts: {"profiles": {files: 9, bytes: 4e6}, "mic-profiles": {files: 6, bytes: 1e5}, "samples": {files: 214, bytes: 1.2e9}, "presets": {files: 24, bytes: 1e5}, "icons": {files: 7, bytes: 1e5}},
          problem: "",
        };
        return;
      }
      const [sync, state] = await Promise.all([
        fetch(this.apiBase + "/api/sync").then(r => r.json()).catch(() => null),
        fetch(this.apiBase + "/api/state").then(r => r.json()).catch(() => null),
      ]);
      if (sync) this.state = {...sync, peer: state && state.host};
    },
    isOn(group) {
      return group.folders.every(f => (this.state.enabled || []).includes(f));
    },
    async toggle(group) {
      const on = new Set(this.state.enabled || []);
      group.folders.forEach(f => this.isOn(group) ? on.delete(f) : on.add(f));
      await fetch(this.apiBase + "/api/settings", {method: "POST", body: JSON.stringify({sync: [...on]})}).catch(() => null);
      this.load();
    },
    countText(group) {
      if (!this.isOn(group)) return this.$t('message.link.syncOffHere');
      let files = 0, bytes = 0;
      group.folders.forEach(f => {
        const c = (this.state.counts || {})[f];
        if (c) {
          files += c.files;
          bytes += c.bytes;
        }
      });
      const size = bytes >= 1e9 ? (bytes / 1e9).toFixed(1) + " GB" : Math.max(1, Math.round(bytes / 1e6)) + " MB";
      return group.id === "sounds" && files ? this.$t('message.link.syncFilesSize', {n: files, size}) : this.$t('message.link.syncFiles', {n: files});
    },
    busyIn(group) {
      const p = this.state.progress;
      return !!p && group.folders.includes(p.file.split("/")[0]);
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
.sync {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #343a38;
  border-radius: 10px;
  background: #262b29;
  color: #cfd6d2;
  font-family: var(--goxlr-font);
  font-size: 12px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  font-weight: 700;
  font-size: 13px;
  color: #e6efeb;
}

.muted {
  color: #8d9693;
}

.pill {
  margin-left: auto;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  white-space: nowrap;
}

.pill.ok {
  background: #1d3a3c;
  color: #9fe1cb;
}

.pill.busy {
  background: #1d2f3c;
  color: #9fc8e1;
}

.pill.wait {
  background: #2e3230;
  color: #b4b2a9;
}

.pcs {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  background: #1b1f1e;
}

.pc {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.pc.right {
  justify-content: flex-end;
  text-align: right;
}

.pc b {
  font-weight: 400;
  color: #e6efeb;
}

.pcIcon {
  font-size: 18px;
  color: #59b1b6;
}

.pcIcon.dim {
  color: #5d6663;
}

.arrows {
  font-size: 16px;
  color: #59b1b6;
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.item {
  padding: 8px 10px;
  border-radius: 8px;
  background: #1b1f1e;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.item b {
  font-weight: 400;
  color: #e6efeb;
}

.switch {
  margin-left: auto;
  width: 30px;
  height: 17px;
  flex: none;
  position: relative;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: #3a3f3d;
  cursor: pointer;
}

.switch i {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #cfd6d2;
  transition: left .15s ease;
}

.switch[aria-checked="true"] {
  background: #2f6f72;
}

.switch[aria-checked="true"] i {
  left: 15px;
  background: #e8ecea;
}

.bar {
  height: 4px;
  border-radius: 2px;
  background: #141716;
  overflow: hidden;
}

.bar i {
  display: block;
  height: 100%;
  background: #59b1b6;
  transition: width .3s ease;
}

.file {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.problem {
  margin: 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: #3a321d;
  color: #fac775;
}

@media (prefers-reduced-motion: reduce) {
  .switch i,
  .bar i {
    transition: none;
  }
}
</style>
