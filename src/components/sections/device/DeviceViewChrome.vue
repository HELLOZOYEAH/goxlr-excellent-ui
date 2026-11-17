<template>
  <!-- Floats above the device in device view: the mouse-wheel volume pop-up (middle) and the window buttons (right) -->
  <div class="chrome">
    <div class="wheelPop" :class="{ on: shown || menuOpen, arming: !armed }" role="status" aria-live="polite">
      <button type="button" class="wheelIcon" :title="$t('message.deviceView.wheelPick')" aria-haspopup="true"
              :aria-expanded="menuOpen" @click.stop="toggleMenu">
        <font-awesome-icon :icon="target.icon"/><small><font-awesome-icon icon="fa-solid fa-chevron-down"/></small>
      </button>
      <span class="wheelTxt">
        <span class="wheelTop"><b>{{ targetName(target) }}</b><span>{{ percent(target.id) }}%</span></span>
        <span class="wheelBar"><i :style="{ width: percent(target.id) + '%' }"></i></span>
        <span v-if="!armed" class="wheelArm">{{ $t('message.deviceView.keepTurning') }}</span>
      </span>
      <svg v-if="!armed" class="arm" viewBox="0 0 34 34" aria-hidden="true">
        <circle class="track" cx="17" cy="17" r="13"/>
        <circle class="fill" cx="17" cy="17" r="13" :stroke-dasharray="RING" :stroke-dashoffset="RING * (1 - Math.min(turned, ARM_NOTCHES) / ARM_NOTCHES)"/>
      </svg>
      <div v-if="menuOpen" class="wheelMenu" role="menu" @click.stop>
        <p>{{ $t('message.deviceView.wheelChanges') }}</p>
        <button v-for="t in targets" :key="t.id" type="button" role="menuitemradio" :aria-checked="t.id === target.id"
                :class="{ on: t.id === target.id }" @click="pick(t)">
          <span class="ic"><font-awesome-icon :icon="t.icon"/></span>{{ targetName(t) }}<span class="pct">{{ percent(t.id) }}%</span>
        </button>
      </div>
    </div>

    <div class="winButtons">
      <button type="button" class="openApp" @click="$emit('open-app')">
        <font-awesome-icon icon="fa-solid fa-bars"/>{{ $t('message.deviceView.openApp') }}
      </button>
      <button type="button" class="winBtn" :title="$t('message.deviceView.minimise')" :aria-label="$t('message.deviceView.minimise')"
              @click="minimiseWindow">–</button>
      <button type="button" class="winBtn" :title="$t('message.deviceView.close')" :aria-label="$t('message.deviceView.close')"
              @click="hideWindow"><font-awesome-icon icon="fa-solid fa-xmark"/></button>
    </div>
  </div>
</template>

<script>
import {store} from "@/store";
import {websocket} from "@/util/sockets";
import {hideWindow, minimiseWindow} from "@/util/appWindow";

// Mouse wheel over the device changes one volume (Headphones unless picked otherwise).
// The first notches only unlock it, so a stray scroll never changes anything.
const TARGETS = [
  {id: "Headphones", icon: "fa-solid fa-headphones"},
  {id: "LineOut", icon: "fa-solid fa-right-from-bracket"},
  {id: "MicMonitor", icon: "fa-solid fa-ear-listen"},
  {id: "Music", icon: "fa-solid fa-music"},
  {id: "System", icon: "fa-solid fa-desktop"},
  {id: "Game", icon: "fa-solid fa-gamepad"},
  {id: "Chat", icon: "fa-solid fa-comments"},
];
const TARGET_KEY = "goxlr.wheelTarget";
const ARM_NOTCHES = 3;   // notches before the wheel starts changing the volume
const STEP = 2;          // % per notch once unlocked
const IDLE_MS = 1500;    // locks again after this long without turning
const HIDE_MS = 2200;    // the pop-up hides after this long
const NOTCH = 100;       // deltaY of one wheel notch (touchpads send smaller steps)

export default {
  name: "DeviceViewChrome",
  emits: ["open-app"],

  data() {
    let saved = null;
    try {
      saved = localStorage.getItem(TARGET_KEY);
    } catch (e) {
      // Headphones
    }
    return {
      targets: TARGETS,
      target: TARGETS.find(t => t.id === saved) || TARGETS[0],
      armed: false,
      turned: 0,
      acc: 0,
      shown: false,
      menuOpen: false,
      RING: 81.7,
      ARM_NOTCHES,
      inFlight: false,
      queued: null,
    }
  },

  mounted() {
    window.addEventListener("wheel", this.onWheel, {passive: false});
    window.addEventListener("click", this.closeMenu);
  },

  beforeUnmount() {
    window.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("click", this.closeMenu);
    clearTimeout(this.idleTimer);
    clearTimeout(this.hideTimer);
  },

  methods: {
    minimiseWindow,
    hideWindow,
    targetName(t) {
      return this.$t(`message.channels.${t.id}`);
    },
    percent(id) {
      return Math.round(store.getActiveDevice().levels.volumes[id] / 255 * 100);
    },
    show() {
      this.shown = true;
      clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => this.shown = false, HIDE_MS);
    },
    lock() {
      this.armed = false;
      this.turned = 0;
      this.acc = 0;
    },
    onWheel(event) {
      if (this.menuOpen) return;
      event.preventDefault();
      this.acc += event.deltaY;
      while (Math.abs(this.acc) >= NOTCH) {
        const dir = this.acc < 0 ? 1 : -1;   // wheel up = louder
        this.acc += dir * NOTCH;
        this.notch(dir);
      }
      clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(this.lock, IDLE_MS);
    },
    notch(dir) {
      if (!this.armed) {
        this.turned++;
        if (this.turned >= ARM_NOTCHES) this.armed = true;
      } else {
        const next = Math.max(0, Math.min(100, this.percent(this.target.id) + dir * STEP));
        this.setVolume(this.target.id, Math.round(next / 100 * 255));
      }
      this.show();
    },
    // One request in flight; the latest value always lands
    setVolume(channel, value) {
      store.getActiveDevice().levels.volumes[channel] = value;
      const command = {"SetVolume": [channel, value]};
      if (this.inFlight) {
        this.queued = command;
        return;
      }
      this.inFlight = true;
      websocket.send_command(store.getActiveSerial(), command).finally(() => {
        this.inFlight = false;
        const next = this.queued;
        this.queued = null;
        if (next) this.setVolume(next.SetVolume[0], next.SetVolume[1]);
      });
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
      if (!this.menuOpen) this.show();
    },
    closeMenu() {
      if (!this.menuOpen) return;
      this.menuOpen = false;
      this.show();
    },
    pick(t) {
      this.target = t;
      this.lock();
      try {
        localStorage.setItem(TARGET_KEY, t.id);
      } catch (e) {
        // only for this session
      }
      this.closeMenu();
    },
  },
}
</script>

<style scoped>
/* Above the device, so the wheel menu opens over it instead of behind it */
.chrome {
  position: relative;
  z-index: 30;
  height: 64px;
  flex: none;
  font-family: var(--goxlr-font);
  color: #e8ecea;
}

button {
  font-family: var(--goxlr-font);
  cursor: pointer;
  color: inherit;
}

button:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

/* ---------- Window buttons: only while the mouse is over the window ----------
   One frosted-glass capsule that eases in like iOS (rises and settles), and stays a moment after
   the mouse leaves before fading away. */
.winButtons {
  position: absolute;
  right: 6%;
  bottom: 8px;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 999px;
  background: rgba(24, 28, 27, .55);
  backdrop-filter: blur(14px) saturate(1.4);
  opacity: 0;
  pointer-events: none;
  transform: translateY(6px) scale(.96);
  transition: opacity .35s ease 1s, transform .5s cubic-bezier(.32, .72, 0, 1) 1s;
}

:global(html.deviceOnly:hover .winButtons), .winButtons:focus-within {
  opacity: 1;
  pointer-events: auto;
  transform: none;
  transition-delay: 0s;
}

.openApp {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 24px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: rgba(89, 177, 182, .18);
  color: #cfeff1;
  font-size: 12px;
  transition: background .2s;
}

.openApp:hover {
  background: rgba(89, 177, 182, .3);
}

.winBtn {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #aab3af;
  font-size: 12px;
  transition: background .2s, color .2s;
}

.winBtn:hover {
  background: rgba(255, 255, 255, .1);
  color: #e8ecea;
}

/* ---------- Mouse-wheel pop-up ---------- */
.wheelPop {
  position: absolute;
  left: 50%;
  bottom: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 230px;
  padding: 6px 12px 6px 6px;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 14px;
  background: rgba(24, 28, 27, .7);
  backdrop-filter: blur(14px) saturate(1.4);
  box-shadow: 0 8px 20px rgba(0, 0, 0, .35);
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 6px) scale(.96);
  transition: opacity .35s ease, transform .5s cubic-bezier(.32, .72, 0, 1);
}

.wheelPop.on {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, 0);
}

.wheelIcon {
  position: relative;
  flex: none;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid #3b413f;
  border-radius: 8px;
  background: #222625;
  color: #59b1b6;
  font-size: 16px;
}

.wheelIcon:hover {
  border-color: #59b1b6;
}

.wheelIcon small {
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 14px;
  height: 14px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #3a413f;
  color: #9aa4a0;
  font-size: 7px;
}

.wheelTxt {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.wheelTop {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.wheelTop b {
  flex: 1;
  font-family: var(--goxlr-title-font);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  color: #e6c44f;
}

.wheelTop span {
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}

.wheelBar {
  height: 4px;
  border-radius: 2px;
  background: #2f3533;
  overflow: hidden;
}

.wheelBar i {
  display: block;
  height: 100%;
  background: #59b1b6;
}

.wheelPop.arming .wheelBar i {
  background: #6b7572;
}

.wheelArm {
  font-size: 11px;
  color: #9aa4a0;
}

.arm {
  flex: none;
  width: 34px;
  height: 34px;
}

.arm circle {
  fill: none;
  stroke-width: 3;
}

.arm .track {
  stroke: #2f3533;
}

.arm .fill {
  stroke: #59b1b6;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset .1s;
}

.wheelMenu {
  position: absolute;
  z-index: 30;
  top: calc(100% + 6px);
  left: 0;
  display: flex;
  flex-direction: column;
  min-width: 190px;
  padding: 4px;
  border: 1px solid #3b413f;
  border-radius: 8px;
  background: #1f2322;
  box-shadow: 0 8px 20px #0009;
}

.wheelMenu p {
  margin: 4px 8px 6px;
  font-size: 11px;
  color: #5f6866;
}

.wheelMenu button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border: 0;
  border-radius: 5px;
  background: none;
  font-size: 12px;
  text-align: left;
}

.wheelMenu button:hover, .wheelMenu button:focus-visible {
  background: #2d3432;
}

.wheelMenu button.on {
  color: #bff3f5;
}

.wheelMenu .ic {
  width: 16px;
  text-align: center;
  color: #9aa4a0;
}

.wheelMenu button.on .ic {
  color: #59b1b6;
}

.wheelMenu .pct {
  margin-left: auto;
  color: #5f6866;
}

/* No reduced-motion override: Windows animations are off on this PC, but these short eases are
   wanted (same as the zoom on the Device page) */
</style>
