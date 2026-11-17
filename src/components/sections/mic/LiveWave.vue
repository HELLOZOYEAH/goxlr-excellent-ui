<template>
  <div class="wave" ref="box">
    <canvas ref="canvas"></canvas>
    <template v-if="mode === 'input'">
      <div class="zone" :style="{ top: y(-10) + '%', height: (y(-20) - y(-10)) + '%' }"></div>
      <span class="ylab" style="top: 8%">0 dB</span>
      <span class="ylab" style="top: 50%">-30</span>
      <span class="ylab" style="top: 92%">-60</span>
    </template>
    <span v-else class="tag">{{ tag }}</span>
    <div v-if="showThreshold" class="thr" :class="{ fixed: mode !== 'input' }" :style="{ top: y(threshold) + '%' }"
         :tabindex="mode === 'input' ? 0 : -1" role="slider" :aria-label="thresholdLabel"
         aria-valuemin="-59" aria-valuemax="0" :aria-valuenow="threshold"
         @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up" @keydown="key">
      <span v-if="mode === 'input'">{{ thresholdLabel }} {{ threshold }} dB</span>
    </div>
  </div>
</template>

<script>
// Rolling picture of the mic level (history of dB values, newest on the right).
// mode "input": big graph with the "aim here" zone and a draggable gate threshold line.
// mode "gate": bars coloured by whether the gate is open (level above the threshold) or closed.
const FLOOR = -60;

export default {
  name: "LiveWave",
  emits: ["threshold", "hold"],
  props: {
    history: {type: Array, required: true},
    mode: {type: String, default: "input"},
    threshold: {type: Number, default: -59},
    showThreshold: {type: Boolean, default: true},
    gateOn: {type: Boolean, default: true},
    attenuation: {type: Number, default: 100},
    thresholdLabel: {type: String, default: "Gate"},
    tag: {type: String, default: ""},
  },

  data() {
    return {dragging: false, observer: null}
  },

  watch: {
    history() {
      this.draw();
    },
    threshold() {
      this.draw();
    },
    gateOn() {
      this.draw();
    },
  },

  methods: {
    // dB -> percent from the top
    y(db) {
      return Math.max(0, Math.min(100, db / FLOOR * 100));
    },
    fit() {
      const canvas = this.$refs.canvas;
      const rect = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      this.draw();
    },
    draw() {
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d"), w = canvas.width, h = canvas.height, dpr = window.devicePixelRatio || 1;
      const data = this.history, n = data.length;
      ctx.clearRect(0, 0, w, h);
      if (n < 2) return;
      const step = w / (n - 1), py = db => this.y(db) / 100 * h;

      if (this.mode === "input") {
        ctx.beginPath();
        ctx.moveTo(0, h);
        data.forEach((v, i) => ctx.lineTo(i * step, py(v)));
        ctx.lineTo((n - 1) * step, h);
        ctx.closePath();
        const fill = ctx.createLinearGradient(0, 0, 0, h);
        fill.addColorStop(0, "rgba(255,107,107,.55)");
        fill.addColorStop(0.25, "rgba(79,209,165,.45)");
        fill.addColorStop(1, "rgba(89,177,182,.12)");
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.beginPath();
        data.forEach((v, i) => i ? ctx.lineTo(i * step, py(v)) : ctx.moveTo(0, py(v)));
        ctx.strokeStyle = "#cfe9ea";
        ctx.lineWidth = 1.2 * dpr;
        ctx.stroke();
        return;
      }

      // Gate: open bars in the accent, closed bars pushed down by the attenuation and greyed
      const bar = Math.max(1, step - dpr);
      data.forEach((v, i) => {
        const open = !this.gateOn || v > this.threshold;
        const level = open ? v : Math.max(FLOOR, v - this.attenuation * 0.6);
        ctx.fillStyle = open ? "rgba(89,177,182,.85)" : "rgba(109,119,115,.35)";
        ctx.fillRect(i * step - bar / 2, py(level), bar, h - py(level));
      });
    },

    fromPointer(event) {
      const rect = this.$refs.box.getBoundingClientRect();
      return Math.round(Math.max(-59, Math.min(0, (event.clientY - rect.top) / rect.height * FLOOR)));
    },
    down(event) {
      if (this.mode !== "input") return;
      this.dragging = true;
      event.target.setPointerCapture(event.pointerId);
      this.$emit("hold", true);
      event.preventDefault();
    },
    move(event) {
      if (!this.dragging) return;
      const value = this.fromPointer(event);
      if (value !== this.threshold) this.$emit("threshold", value);
    },
    up() {
      if (!this.dragging) return;
      this.dragging = false;
      this.$emit("hold", false);
    },
    key(event) {
      if (this.mode !== "input") return;
      if (event.key === "ArrowUp") this.$emit("threshold", Math.min(0, this.threshold + 1));
      else if (event.key === "ArrowDown") this.$emit("threshold", Math.max(-59, this.threshold - 1));
      else return;
      event.preventDefault();
    },
  },

  mounted() {
    this.observer = new ResizeObserver(() => this.fit());
    this.observer.observe(this.$refs.canvas);
    this.fit();
  },

  unmounted() {
    this.observer?.disconnect();
  },
}
</script>

<style scoped>
.wave {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  background: #1b1f1e;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.zone {
  position: absolute;
  left: 0;
  right: 0;
  border-block: 1px solid rgba(79, 209, 165, .3);
  background: rgba(79, 209, 165, .07);
  pointer-events: none;
}

.ylab, .tag {
  position: absolute;
  left: 8px;
  color: #6d7773;
  font-size: 10px;
  pointer-events: none;
}

.ylab {
  transform: translateY(-50%);
}

.tag {
  top: 8px;
  font-size: 11px;
}

.thr {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-top: 2px dashed #e6b450;
  cursor: ns-resize;
  outline: none;
}

.thr.fixed {
  border-top-color: rgba(230, 180, 80, .8);
  border-top-width: 1px;
  cursor: default;
  pointer-events: none;
}

/* Bigger grab area than the 2px line */
.thr::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -10px;
  height: 20px;
}

.thr span {
  position: absolute;
  right: 8px;
  top: -24px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #1b1f1e;
  color: #e6b450;
  font-size: 11px;
}

.thr:focus-visible span {
  outline: 2px solid #59b1b6;
}
</style>
