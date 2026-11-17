<template>
  <div class="micRow" :class="{ boxed }" :style="boxed ? { '--p': fill + '%' } : null">
    <label :for="id">{{ label }}</label>
    <input :id="id" type="range" :min="min" :max="max" :step="step" :value="value"
           @pointerdown="pause" @input="$emit('update', +$event.target.value)" @change="resume">
    <span class="value">{{ text }}</span>
  </div>
</template>

<script>
import {store} from "@/store";

// One "label | slider | value" row, as in the Mic page design. While the slider is held, patches for
// `path` from the daemon are paused so the value doesn't jump back under the pointer.
export default {
  name: "MicRow",
  emits: ["update"],
  props: {
    id: {type: String, required: true},
    label: {type: String, required: true},
    min: {type: Number, required: true},
    max: {type: Number, required: true},
    step: {type: Number, default: 1},
    value: {type: Number, required: true},
    text: {type: String, required: true},
    path: {type: String, required: false, default: null},
    // Mic page look: slim track filled up to the thumb, square thumb, value in a box
    boxed: {type: Boolean, default: false},
  },

  computed: {
    fill() {
      return this.max === this.min ? 0 : (this.value - this.min) / (this.max - this.min) * 100;
    },
  },

  data() {
    return {paused: false}
  },

  methods: {
    pause() {
      if (this.path && !this.paused) {
        this.paused = true;
        store.pausePatchPath(this.path);
      }
    },
    resume() {
      if (this.path && this.paused) {
        this.paused = false;
        store.resumePatchPath(this.path);
      }
    },
  },

  unmounted() {
    this.resume();
  },
}
</script>

<style scoped>
.micRow {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) 76px;
  align-items: center;
  gap: 12px;
}

label {
  font-size: 14px;
  color: #9aa4a0;
}

input {
  min-width: 0;
  accent-color: #59b1b6;
}

input:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.value {
  text-align: right;
  font-size: 14px;
  color: #59b1b6;
}

/* ---------- boxed (Mic page) ---------- */
.boxed {
  grid-template-columns: 110px minmax(0, 1fr) 76px;
  gap: 14px;
  min-height: 40px;
}

.boxed label {
  font-size: 13px;
}

.boxed input {
  -webkit-appearance: none;
  appearance: none;
  height: 22px;
  margin: 0;
  background: transparent;
  cursor: pointer;
}

.boxed input::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, #59b1b6 var(--p), #3a413f var(--p));
}

.boxed input::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, #59b1b6 var(--p), #3a413f var(--p));
}

.boxed input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 18px;
  margin-top: -7px;
  border: 2px solid #8b9592;
  border-radius: 3px;
  background: #c9d0cd;
  box-shadow: inset 2px 0 0 #c9d0cd, inset 3px 0 0 #6d7773;
}

.boxed input::-moz-range-thumb {
  width: 12px;
  height: 16px;
  border: 2px solid #8b9592;
  border-radius: 3px;
  background: #c9d0cd;
}

.boxed .value {
  justify-self: end;
  width: 76px;
  padding: 6px 0;
  border-radius: 6px;
  background: #1b1f1e;
  color: #e8ecea;
  font-size: 13px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
</style>
