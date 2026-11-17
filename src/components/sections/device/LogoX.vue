<template>
  <!-- The X in the GOXLR logo, drawn as four bars lit from behind frosted acrylic, like the light on the device -->
  <span class="logoX" :class="{ glow: lit }" :style="lit ? { '--glow': colour } : null" aria-hidden="true">
    <svg viewBox="0 0 100 100">
      <defs>
        <!-- Soft light that spreads around the bars -->
        <filter id="logoXHalo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7"/>
        </filter>
        <!-- Frosted acrylic: the light inside is diffused, so the edges are slightly soft -->
        <filter id="logoXFrost" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.1"/>
        </filter>
      </defs>
      <g v-if="lit" class="halo" stroke-width="22" stroke-linecap="round" fill="none" filter="url(#logoXHalo)">
        <line v-for="(bar, i) in bars" :key="i" v-bind="bar"/>
      </g>
      <g class="bars" stroke-width="17" stroke-linecap="round" fill="none" :filter="lit ? 'url(#logoXFrost)' : null">
        <line v-for="(bar, i) in bars" :key="i" v-bind="bar"/>
      </g>
    </svg>
  </span>
</template>

<script>
// colour: "#RRGGBB" of the logo light (the Accent colour), or empty for a plain X that takes the text colour.
// Black means the light is off.
const BARS = [
  {x1: 9, y1: 9, x2: 40, y2: 40}, {x1: 91, y1: 9, x2: 60, y2: 40},
  {x1: 9, y1: 91, x2: 40, y2: 60}, {x1: 91, y1: 91, x2: 60, y2: 60},
];

export default {
  name: "LogoX",
  props: {
    colour: {type: String, default: ""},
  },
  data() {
    return {bars: BARS}
  },
  computed: {
    lit() {
      return !!this.colour && this.colour.toLowerCase() !== "#000000";
    },
  },
}
</script>

<style scoped>
/* 10% taller than the capital letters, sticking out a little above and below them */
.logoX {
  display: inline-block;
  width: 0.76em;
  height: 0.76em;
  margin: 0 0.08em 0 0.02em;
  vertical-align: -0.05em;
}

svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.bars {
  stroke: currentColor;
}

/* Milky: the light colour mixed with the white of the acrylic, not a bright neon */
.glow .bars {
  stroke: color-mix(in srgb, var(--glow) 62%, #dfe4e2);
  opacity: 0.9;
}

.halo {
  stroke: var(--glow);
  opacity: 0.22;
}

/* Breathes slowly like the light on the device (runs even with reduced motion: it's the device's own light) */
.glow .halo {
  animation: breathe 3.6s ease-in-out infinite;
}

.glow .bars {
  animation: breatheBars 3.6s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% {
    opacity: 0.14;
  }
  50% {
    opacity: 0.34;
  }
}

@keyframes breatheBars {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.95;
  }
}
</style>
