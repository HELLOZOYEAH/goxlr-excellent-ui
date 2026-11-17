<template>
  <div>
    <div class="lab">{{ $t('message.lighting.faderLights.pairs') }}</div>
    <div class="pairs">
      <button v-for="pair in pairs" :key="pair.name" type="button" class="pair" :class="{ on: isOn(pair) }"
              :aria-pressed="isOn(pair)" :title="pair.name" @click="$emit('pick', pair.top, pair.bottom)">
        <i :style="{ background: `linear-gradient(#${pair.top}, #${pair.bottom})` }"></i>
        <span>{{ pair.name }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import {PAIRS} from "@/util/lightingColours";

// The colour pair presets from Fader lights: first colour = on / top, second = off / bottom
export default {
  name: "ColourPairs",
  props: {
    // [[one, two], ...] for every target being edited; a pair is lit when all of them match it
    current: {type: Array, required: true},
  },
  emits: ["pick"],
  data() {
    return {pairs: PAIRS};
  },
  methods: {
    isOn(pair) {
      return this.current.every(([one, two]) => one === pair.top && two === pair.bottom);
    },
  },
}
</script>

<style scoped>
.lab {
  margin-bottom: 8px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  color: #c3ccc8;
}

.pairs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pair {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border: 1px solid #343a38;
  border-radius: 6px;
  background: #262b2a;
  color: #e8ecea;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
}

.pair.on {
  border-color: #3ee6d9;
  background: #1d3333;
}

.pair i {
  width: 12px;
  height: 22px;
  border-radius: 3px;
}

.pair:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}
</style>
