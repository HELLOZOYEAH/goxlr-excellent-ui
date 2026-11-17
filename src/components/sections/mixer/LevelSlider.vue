<template>
  <div class="lv" :class="kind">
    <span class="pct">{{ percent }}%</span>
    <div ref="track" class="vs" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"
         :aria-valuenow="percent" :aria-label="label" @pointerdown="start" @keydown="key">
      <div class="fill" :style="{ height: `calc(${percent}% - 6px)` }"></div>
      <div class="knob" :style="{ bottom: percent + '%' }"></div>
    </div>
    <span class="mx">{{ tag }}</span>
  </div>
</template>

<script>
import {store} from "@/store";

// A big vertical volume for the Mixer page (mockup docs/mockups/2026-10-29-mixer). Value is 0-255.
// kind: "a" (teal, Mix A), "b" (gold, Mix B) or "one" (wider, when there is only one volume)
export default {
  name: "LevelSlider",
  props: {
    value: {type: Number, required: true},
    path: {type: String, default: null},      // store path paused while dragging, so patches don't fight the drag
    label: {type: String, default: ""},
    tag: {type: String, default: ""},
    kind: {type: String, default: "a"},
  },
  emits: ["update", "hold"],

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
      this.$emit("hold", true);
      this.fromPointer(event);
      const move = (e) => this.fromPointer(e);
      const end = () => {
        track.removeEventListener("pointermove", move);
        track.removeEventListener("pointerup", end);
        track.removeEventListener("pointercancel", end);
        if (this.path) store.resumePatchPath(this.path);
        this.$emit("hold", false);
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
.lv {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.pct {
  min-width: 42px;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.mx {
  padding: 1px 6px;
  border-radius: 3px;
  background: #59b1b6;
  color: #1d2120;
  font-size: 10px;
  font-weight: 700;
}

.lv.b .mx {
  background: #cc7224;
}

.lv.one .mx {
  background: #4a524f;
  color: #e8ecea;
}

.vs {
  position: relative;
  width: 34px;
  height: 170px;
  border: 1px solid #3a413f;
  border-radius: 8px;
  background: #222625;
  cursor: ns-resize;
  touch-action: none;
}

.vs:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.lv.one .vs {
  width: 44px;
}

.fill {
  position: absolute;
  left: 3px;
  right: 3px;
  bottom: 3px;
  border-radius: 5px;
  background: #59b1b6;
  opacity: .85;
}

.lv.b .fill {
  background: #cc7224;
}

/* The strip adds .muted around it */
:global(.strip.muted) .fill {
  background: #555d5a;
}

.knob {
  position: absolute;
  left: -3px;
  right: -3px;
  height: 10px;
  margin-bottom: -5px;
  border-radius: 4px;
  background: linear-gradient(#e9eeec, #9ea7a4);
  box-shadow: 0 1px 3px #0008;
}
</style>
