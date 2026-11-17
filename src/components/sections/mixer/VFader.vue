<template>
  <div class="vFader">
    <span v-if="tag" class="tag">{{ tag }}</span>
    <span class="value">{{ percent }}%</span>
    <div ref="track" class="track" :class="{ dim: dim }" :style="{ height: height + 'px' }"
         role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="percent"
         :aria-label="label" @pointerdown="start" @keydown="key">
      <div class="fill" :style="{ height: percent + '%', background: colour }"></div>
      <div class="cap" :style="{ bottom: percent + '%' }"></div>
    </div>
  </div>
</template>

<script>
import {store} from "@/store";

// A vertical fader for the Mixer page. Value is 0-255 (the daemon's volume range).
export default {
  name: "VFader",
  props: {
    value: {type: Number, required: true},
    path: {type: String, default: null},      // store path paused while dragging, so patches don't fight the drag
    label: {type: String, default: ""},
    tag: {type: String, default: ""},         // small text above the value ("A" / "B")
    colour: {type: String, default: "#59b1b6"},
    height: {type: Number, default: 170},
    dim: {type: Boolean, default: false},
  },
  emits: ["update"],

  computed: {
    percent() {
      return Math.round(this.value / 255 * 100);
    },
  },

  methods: {
    emitPercent(p) {
      p = Math.max(0, Math.min(100, p));
      this.$emit("update", Math.round(p / 100 * 255));
    },
    fromPointer(event) {
      const rect = this.$refs.track.getBoundingClientRect();
      this.emitPercent(Math.round((rect.bottom - event.clientY) / rect.height * 100));
    },
    start(event) {
      const track = this.$refs.track;
      track.setPointerCapture(event.pointerId);
      track.focus();
      if (this.path) store.pausePatchPath(this.path);
      this.fromPointer(event);
      const move = (e) => this.fromPointer(e);
      const end = () => {
        track.removeEventListener("pointermove", move);
        track.removeEventListener("pointerup", end);
        track.removeEventListener("pointercancel", end);
        if (this.path) store.resumePatchPath(this.path);
      };
      track.addEventListener("pointermove", move);
      track.addEventListener("pointerup", end);
      track.addEventListener("pointercancel", end);
    },
    key(event) {
      const steps = {ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10};
      if (event.key in steps) {
        event.preventDefault();
        this.emitPercent(this.percent + steps[event.key]);
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        this.emitPercent(event.key === "End" ? 100 : 0);
      }
    },
  },
}
</script>

<style scoped>
.vFader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.tag {
  font-size: 11px;
  color: #8e9894;
}

.value {
  font-size: 12px;
  color: #c3ccc8;
}

.track {
  position: relative;
  width: 8px;
  margin: 10px 0;
  border-radius: 4px;
  background: #161918;
  cursor: ns-resize;
  touch-action: none;
}

.track:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 6px;
}

.fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 4px;
}

.track.dim .fill {
  opacity: 0.35;
}

.cap {
  position: absolute;
  left: 50%;
  width: 32px;
  height: 16px;
  margin: 0 0 -8px -16px;
  border-radius: 4px;
  background: #d9dfdc;
  border: 1px solid #0e100f;
}

.cap::after {
  content: "";
  position: absolute;
  left: 4px;
  right: 4px;
  top: 6px;
  height: 2px;
  background: #333;
}
</style>
