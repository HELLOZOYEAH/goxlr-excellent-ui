<template>
  <!-- GoXLR Link as a game controller cabled into a port under the GoXLR.
       Pull it away (it's held by a magnet) and let go to pop it out into its own window. -->
  <div ref="root" class="linkController" :class="{ windowed }">
    <template v-if="!windowed">
      <div class="port" :class="{ live: linked && !popped }" :style="portGlow" aria-hidden="true"><i></i></div>
      <div class="cable" :class="{ live: linked, short: !running || popped, hidden: moved }" aria-hidden="true"></div>
      <svg v-if="moved" class="cableSvg" aria-hidden="true"><path :d="cablePath"/></svg>
    </template>

    <section v-if="running && !popped" ref="controller" class="controller"
             :class="{ dragging: !!drag && drag.started, free }" :style="controllerStyle" :aria-label="'GoXLR Link'"
             @pointerdown="dragStart" @click.capture="swallowClick">
      <div class="badge"><font-awesome-icon icon="fa-solid fa-gamepad" class="accent"/> GOXLR LINK</div>
      <!-- Keyboard users get a button (shown on focus); the mouse just pulls the controller out -->
      <button v-if="detachable" type="button" class="popKey" @click="popOut">{{ $t('message.link.popOut') }}</button>
      <button v-if="windowed" type="button" class="dockKey" :aria-label="$t('message.link.dockBack')"
              :title="$t('message.link.dockBack')" @click="$emit('dock')">
        <font-awesome-icon icon="fa-solid fa-down-left-and-up-right-to-center"/>
      </button>

      <!-- Game mic, like Select / Start -->
      <div class="micSide">
        <div class="label">{{ $t('message.link.gameMic') }}</div>
        <div class="mic" role="group" :aria-label="$t('message.link.gameMic')">
          <button type="button" :aria-pressed="state.mode === 'goxlr'" @click="setMode('goxlr')">{{ $t('message.link.goxlrVoice') }}</button>
          <button type="button" :aria-pressed="state.mode === 'backup'" @click="setMode('backup')">{{ $t('message.link.thisPcMic') }}</button>
        </div>
        <div class="hint">{{ $t('message.link.keySwitches', { key: state.hotkey || 'F8' }) }}</div>
      </div>

      <!-- Status window -->
      <div class="window" :class="{ backup: hearingBackup }">
        <div class="status" :class="{ ok: linked }">{{ statusText }}</div>
        <div v-if="state.problem && !linked" class="problem">{{ state.problem }}</div>
        <template v-else>
          <div class="hearing">{{ hearingTitle }}</div>
          <div v-if="!hearingBackup && state.fx" class="fx">
            <span v-if="!state.fx.master" class="pill off">{{ $t('message.link.fxOff') }}</span>
            <template v-else>
              <span v-for="name in state.fx.active" :key="name" class="pill">{{ name }}</span>
              <span v-if="!state.fx.active.length" class="pill off">{{ $t('message.link.noEffects') }}</span>
            </template>
          </div>
        </template>
      </div>

      <!-- Sampler: same shape as the GoXLR's pads -->
      <div class="samplerSide">
        <div class="banks" role="group" :aria-label="$t('message.link.bank')">
          <button v-for="bank in BANKS" :key="bank" type="button" class="bank" :disabled="!sampler"
                  :aria-pressed="!!sampler && sampler.bank === bank" @click="send({type: 'bank', bank})">{{ bank }}</button>
        </div>
        <div class="pads">
          <button v-for="pad in pads" :key="pad.button" type="button" class="pad" :class="[pad.css, { playing: pad.playing, empty: !pad.name }]"
                  :disabled="!pad.name" :aria-label="pad.name || $t('message.link.emptyPad')"
                  @click="send({type: 'play', bank: sampler.bank, button: pad.button})">
            <svg class="padShape" viewBox="0 0 150 90" preserveAspectRatio="none" aria-hidden="true">
              <path :d="PAD_PATH" vector-effect="non-scaling-stroke"/>
            </svg>
            <span class="padName">{{ pad.name || '' }}</span>
          </button>
          <button type="button" class="stop" :disabled="!sampler" @click="stopAll">{{ $t('message.link.stop') }}</button>
        </div>
      </div>
    </section>

    <!-- Popped out: the socket waits for it -->
    <section v-else-if="popped" class="slot">
      <font-awesome-icon icon="fa-solid fa-gamepad" class="slotIcon accent"/>
      <div class="slotTitle">{{ $t('message.link.poppedOut') }}</div>
      <div class="muted">{{ $t('message.link.poppedOutHint') }}</div>
      <button type="button" class="btn acc" @click="dockBack">
        <font-awesome-icon icon="fa-solid fa-down-left-and-up-right-to-center"/>{{ $t('message.link.dockBack') }}
      </button>
    </section>

    <!-- Link isn't running on this PC: an empty slot -->
    <section v-else class="slot">
      <font-awesome-icon icon="fa-solid fa-gamepad" class="slotIcon"/>
      <div class="slotTitle">GOXLR LINK</div>
      <div class="muted">{{ $t('message.link.controllerEmpty') }}</div>
      <button type="button" class="btn" disabled :title="$t('message.link.getLinkSoon')">
        <font-awesome-icon icon="fa-solid fa-download"/>{{ $t('message.link.getLink') }}
      </button>
    </section>
  </div>
</template>

<script>
// GoXLR Link drawn as a controller plugged into the GoXLR (the no-GoXLR screen, the Link tab, the pop-out).
// Talks to goxlr-link's local API like LinkPanel; the full settings stay in the Link window / tab.
//
// Pulling it out: the socket holds it like a magnet (it moves less than the mouse) until it has been
// pulled BREAK_PX away, then it comes free. Let go far enough out and it pops out into its own window;
// let go near the socket and the magnet pulls it back in with a little bounce.
import {dockBack, linkPopout, popOut, watchPopout} from "@/link/popout";
import {dragWindow} from "@/util/appWindow";

const BANKS = ["A", "B", "C"];
const PADS = [
  {button: "TopLeft", css: "tl"}, {button: "TopRight", css: "tr"},
  {button: "BottomLeft", css: "bl"}, {button: "BottomRight", css: "br"},
];
// Same outline as the Sampler page's pads: a rounded notch where the four pads meet
const PAD_PATH = "M 6 0 H 144 A 6 6 0 0 1 150 6 V 64 A 6 6 0 0 1 144 70 H 120 A 6 6 0 0 0 114 76 V 84 " +
    "A 6 6 0 0 1 108 90 H 6 A 6 6 0 0 1 0 84 V 6 A 6 6 0 0 1 6 0 Z";
const POLL_MS = 250;
const BREAK_PX = 110;          // pull this far and it comes free of the magnet
const PULL_ZONE = 0.8;         // once free, closer than this (x BREAK_PX) and the magnet pulls it back
const START_PX = 5;            // movement before a press becomes a drag (so buttons still click)
const DOCK_FROM_PX = 220;      // Dock back: it flies in from this far below

export default {
  name: "LinkController",
  props: {
    apiBase: {type: String, default: "http://127.0.0.1:47810"},
    // Can be pulled out into its own window
    detachable: {type: Boolean, default: false},
    // This is the pop-out window itself: no socket or cable, a dock button instead
    windowed: {type: Boolean, default: false},
  },
  emits: ["dock"],

  data() {
    return {
      BANKS, PAD_PATH, state: {}, running: false, timer: null,
      popout: linkPopout,
      off: {x: 0, y: 0},   // where the controller is, relative to its socket position
      drag: null,
      free: false,
      raf: 0,
      swallowNextClick: false,
      geometry: {width: 0, cableTop: 0, cableBottom: 0},
    }
  },

  computed: {
    popped() {
      return this.detachable && this.popout.open;
    },
    moved() {
      return Math.abs(this.off.x) + Math.abs(this.off.y) > 0.5;
    },
    distance() {
      return Math.hypot(this.off.x, this.off.y);
    },
    controllerStyle() {
      return this.moved ? {transform: `translate(${this.off.x}px, ${this.off.y}px)`} : {};
    },
    // The socket glows while the magnet has hold of the controller
    portGlow() {
      if (!this.drag || !this.drag.started) return {};
      const near = this.free ? Math.max(0, 1 - this.distance / (BREAK_PX * PULL_ZONE)) : 1;
      return near > 0.05 ? {boxShadow: `0 0 ${Math.round(16 * near)}px rgba(89, 177, 182, ${0.7 * near})`} : {};
    },
    cablePath() {
      const g = this.geometry;
      const x0 = g.width / 2, y0 = g.cableTop;
      const x1 = g.width / 2 + this.off.x, y1 = g.cableBottom + this.off.y;
      const bend = Math.max(20, Math.abs(y1 - y0) / 2);
      return `M ${x0} ${y0} C ${x0} ${y0 + bend}, ${x1} ${y1 - bend}, ${x1} ${y1}`;
    },
    linked() {
      return this.running && !!this.state.linked;
    },
    hearingBackup() {
      return this.state.hearing === "backup";
    },
    statusText() {
      if (!this.linked) return this.$t('message.link.notLinked');
      const ms = this.state.ms == null ? "" : ` · ${Math.max(1, this.state.ms)} ms`;
      return this.$t('message.link.linkedTo', {host: this.state.host || ""}) + ms;
    },
    hearingTitle() {
      if (!this.hearingBackup) return this.$t('message.link.goxlrLive');
      return this.$t('message.link.backupThisPc', {name: this.state.backup || this.$t('message.link.backupMic')});
    },
    sampler() {
      return this.state.sampler || null;
    },
    pads() {
      const s = this.sampler;
      return PADS.map(p => {
        const found = s && s.pads.find(x => x.bank === s.bank && x.button === p.button);
        return {...p, name: found ? found.name : null, playing: !!(found && found.playing)};
      });
    },
  },

  mounted() {
    if (this.detachable) watchPopout();
    this.load();
    this.timer = setInterval(this.load, POLL_MS);
  },

  unmounted() {
    clearInterval(this.timer);
    cancelAnimationFrame(this.raf);
    this.stopListening();
  },

  methods: {
    async load() {
      try {
        this.state = await (await fetch(this.apiBase + "/api/state")).json();
        this.running = true;
      } catch (e) {
        this.running = false;
      }
    },
    async setMode(mode) {
      if (this.state.mode === mode) return;
      await fetch(this.apiBase + "/api/mic/toggle", {method: "POST"}).catch(() => null);
      this.load();
    },
    async send(command) {
      await fetch(this.apiBase + "/api/sampler", {method: "POST", body: JSON.stringify(command)}).catch(() => null);
      this.load();
    },
    stopAll() {
      if (!this.sampler) return;
      PADS.forEach(p => this.send({type: "stop", bank: this.sampler.bank, button: p.button}));
    },

    /* ---------- Pulling it out ---------- */
    dragStart(event) {
      // The pop-out has no title bar: its body moves the window
      if (this.windowed && event.button === 0 && !event.target.closest("button")) dragWindow();
      if (!this.detachable || event.button !== 0) return;
      cancelAnimationFrame(this.raf);
      this.drag = {x: event.clientX - this.off.x, y: event.clientY - this.off.y, sx: event.clientX, sy: event.clientY, started: false};
      window.addEventListener("pointermove", this.dragMove);
      window.addEventListener("pointerup", this.dragEnd);
      window.addEventListener("pointercancel", this.dragEnd);
    },
    dragMove(event) {
      const drag = this.drag;
      if (!drag) return;
      if (!drag.started) {
        if (Math.hypot(event.clientX - drag.sx, event.clientY - drag.sy) < START_PX) return;
        drag.started = true;
        this.measure();
      }
      event.preventDefault();
      this.off = this.magnet({x: event.clientX - drag.x, y: event.clientY - drag.y});
    },
    dragEnd() {
      const drag = this.drag;
      this.stopListening();
      this.drag = null;
      if (!drag || !drag.started) return;
      this.swallowNextClick = true;
      if (this.free && this.distance >= BREAK_PX * PULL_ZONE) {
        // Let go out in the open: it pops out (still inside the user's gesture, so the window may open)
        this.free = false;
        this.off = {x: 0, y: 0};
        this.popOut();
      } else {
        this.free = false;
        this.springHome();
      }
    },
    stopListening() {
      window.removeEventListener("pointermove", this.dragMove);
      window.removeEventListener("pointerup", this.dragEnd);
      window.removeEventListener("pointercancel", this.dragEnd);
    },
    // The click that ends a drag shouldn't press whatever button it ended on
    swallowClick(event) {
      if (!this.swallowNextClick) return;
      this.swallowNextClick = false;
      event.stopPropagation();
      event.preventDefault();
    },
    // Raw pointer offset -> where the controller actually goes
    magnet(raw) {
      const d = Math.hypot(raw.x, raw.y);
      if (!this.free) {
        if (d > BREAK_PX) {
          this.free = true;
          return raw;
        }
        // Held by the magnet: moves a lot less than the mouse, a little more as it is pulled harder
        const k = 0.28 + 0.12 * (d / BREAK_PX);
        return {x: raw.x * k, y: raw.y * k};
      }
      const zone = BREAK_PX * PULL_ZONE;
      if (d < zone) {
        const k = 1 - (1 - d / zone) * 0.75;
        return {x: raw.x * k, y: raw.y * k};
      }
      return raw;
    },
    measure() {
      const root = this.$refs.root, controller = this.$refs.controller;
      if (!root || !controller) return;
      const port = root.querySelector(".port");
      this.geometry = {
        width: root.clientWidth,
        cableTop: port ? port.offsetTop + port.offsetHeight : 0,
        cableBottom: controller.offsetTop,
      };
    },
    // Spring back to the socket with a small overshoot
    springHome() {
      cancelAnimationFrame(this.raf);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        this.off = {x: 0, y: 0};
        return;
      }
      let v = {x: 0, y: 0};
      const step = () => {
        v = {x: (v.x - this.off.x * 0.22) * 0.68, y: (v.y - this.off.y * 0.22) * 0.68};
        this.off = {x: this.off.x + v.x, y: this.off.y + v.y};
        if (Math.abs(this.off.x) + Math.abs(this.off.y) + Math.abs(v.x) + Math.abs(v.y) > 0.3) {
          this.raf = requestAnimationFrame(step);
        } else {
          this.off = {x: 0, y: 0};
        }
      };
      this.raf = requestAnimationFrame(step);
    },
    popOut() {
      popOut(this.$i18n.locale);
    },
    // Dock back: it flies up from below and the magnet pulls it into the socket
    dockBack() {
      dockBack();
      this.off = {x: 0, y: DOCK_FROM_PX};
      this.$nextTick(() => {
        this.measure();
        this.springHome();
      });
    },
  },
}
</script>

<style scoped>
.linkController {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  color: #cfd6d2;
  font-family: var(--goxlr-font);
}

/* The socket under the GoXLR and the cable down to the controller */
.port {
  width: 140px;
  height: 16px;
  margin-top: -2px;
  display: grid;
  place-items: center;
  border: 1px solid #3a3f3d;
  border-top: 0;
  border-radius: 0 0 8px 8px;
  background: #141616;
}

.port i {
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: #0a0b0b;
  transition: background .3s ease;
}

.port.live i, .cable.live {
  background: #59b1b6;
}

.cable {
  width: 4px;
  height: 34px;
  background: #3b413f;
  transition: height .45s ease, background .3s ease;
}

.cable.short {
  height: 14px;
}

.controller {
  position: relative;
  width: 100%;
  max-width: 640px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) 220px;
  gap: 16px;
  align-items: center;
  padding: 16px 18px;
  border: 1px solid #3b413f;
  border-radius: 18px;
  background: #2a2f2d;
  animation: plugIn .45s ease;
}

@keyframes plugIn {
  from { transform: translateY(-16px); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .controller { animation: none; }
  .cable { transition: none; }
}

.badge {
  position: absolute;
  top: -9px;
  left: 18px;
  padding: 0 6px;
  background: #222726;
  font-family: var(--goxlr-title-font);
  font-weight: 700;
  font-size: 11px;
  letter-spacing: .2em;
  color: #e6efeb;
}

.accent {
  color: #59b1b6;
}

.label {
  font-family: var(--goxlr-title-font);
  font-weight: 700;
  font-size: 11px;
  letter-spacing: .16em;
  color: #8d9693;
}

.mic {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
}

.mic button {
  height: 28px;
  border: 1px solid #3b413f;
  border-radius: 14px;
  background: #1b1f1e;
  color: #8d9693;
  font-family: var(--goxlr-font);
  font-size: 12px;
  cursor: pointer;
}

.mic button[aria-pressed=true] {
  border-color: #59b1b6;
  background: #1d3a3c;
  color: #e8ecea;
}

.hint, .muted {
  margin-top: 6px;
  font-size: 11px;
  color: #8d9693;
}

.window {
  min-height: 84px;
  box-sizing: border-box;
  padding: 9px 11px;
  border: 1px solid #343a38;
  border-radius: 8px;
  background: #121514;
}

.status {
  font-size: 11px;
  color: #e6b450;
}

.status.ok {
  color: #4fd1a5;
}

.hearing {
  margin-top: 6px;
  font-size: 13px;
  color: #e6efeb;
}

.window.backup .hearing {
  color: #fac775;
}

.problem {
  margin-top: 6px;
  font-size: 11px;
  line-height: 1.45;
  color: #fac775;
}

.fx {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.pill {
  padding: 1px 7px;
  border-radius: 999px;
  background: #1d3a3c;
  color: #9fe1cb;
  font-size: 10px;
}

.pill.off {
  background: #2a2f2d;
  color: #8d9693;
}

.samplerSide {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
}

.banks {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bank {
  height: 24px;
  border: 1.5px solid #2c4a6b;
  border-radius: 4px;
  background: transparent;
  color: #4b7bb0;
  font-family: var(--goxlr-title-font);
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
}

.bank[aria-pressed=true] {
  border-color: #39d353;
  color: #39d353;
}

.pads {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px 8px;
}

.pad {
  position: relative;
  height: 42px;
  padding: 5px 7px;
  border: 0;
  background: transparent;
  color: #cfd6d2;
  font-family: var(--goxlr-font);
  font-size: 10px;
  text-align: left;
  cursor: pointer;
}

.pad.tr, .pad.br {
  text-align: right;
}

.pad.bl, .pad.br {
  display: flex;
  align-items: flex-end;
}

.pad.br {
  justify-content: flex-end;
}

.padShape {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.padShape path {
  fill: #141616;
  stroke: #2f8a3c;
  stroke-width: 1.5;
}

.pad.empty {
  cursor: default;
}

.pad.empty .padShape path {
  stroke: #2a3a2d;
}

.pad.playing .padShape path {
  stroke: #39d353;
}

.pad.playing .padShape {
  filter: drop-shadow(0 0 6px #39d353);
}

.pad.tr .padShape { transform: scaleX(-1); }
.pad.bl .padShape { transform: scaleY(-1); }
.pad.br .padShape { transform: scale(-1, -1); }

.padName {
  position: relative;
  display: block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.stop {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 22px;
  border: 1px solid #4a504e;
  border-radius: 5px;
  background: #2a2f2d;
  color: #8d9693;
  font-family: var(--goxlr-font);
  font-size: 10px;
  cursor: pointer;
}

.slot {
  width: 100%;
  max-width: 640px;
  box-sizing: border-box;
  padding: 16px;
  border: 2px dashed #3b413f;
  border-radius: 18px;
  text-align: center;
}

.slotIcon {
  font-size: 26px;
  color: #5d6461;
}

.slotTitle {
  margin-top: 6px;
  font-family: var(--goxlr-title-font);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: .2em;
  color: #e6efeb;
}

.btn {
  height: 28px;
  margin-top: 10px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #3b413f;
  border-radius: 7px;
  background: #2a2f2d;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 12px;
}

.btn:disabled {
  opacity: .5;
}

button:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.linkController {
  position: relative;
}

.cable.hidden {
  visibility: hidden;
}

.cableSvg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.cableSvg path {
  fill: none;
  stroke: #59b1b6;
  stroke-width: 4;
  stroke-linecap: round;
}

.controller {
  touch-action: none;
}

.controller.dragging {
  cursor: grabbing;
  animation: none;
  z-index: 5;
}

.controller.free {
  border-color: #f5a33a;
}

.linkController:not(.windowed) .controller:not(.dragging) {
  cursor: grab;
}

/* Only keyboard users see this (on focus); everyone else pulls the controller out */
.popKey {
  position: absolute;
  top: -12px;
  right: 16px;
  height: 22px;
  padding: 0 8px;
  border: 1px solid #59b1b6;
  border-radius: 6px;
  background: #1d3a3c;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 11px;
  opacity: 0;
  pointer-events: none;
}

.popKey:focus-visible {
  opacity: 1;
  pointer-events: auto;
}

.dockKey {
  position: absolute;
  top: -12px;
  right: 14px;
  width: 26px;
  height: 22px;
  border: 1px solid #3b413f;
  border-radius: 6px;
  background: #222726;
  color: #cfd6d2;
  cursor: pointer;
}

.windowed .controller {
  animation: none;
  margin-top: 10px;
}

.btn.acc {
  border-color: #59b1b6;
  background: #1d3a3c;
  cursor: pointer;
}

@media (max-width: 640px) {
  .controller {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
