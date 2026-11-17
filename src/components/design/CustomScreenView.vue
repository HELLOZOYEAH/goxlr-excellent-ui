<template>
  <canvas ref="canvas" class="customScreen" aria-hidden="true"></canvas>
</template>

<script>
import {fromCustomScreen, renderInk} from "@/util/screenDots";

// A screen made on the Screens page, played here the same way the daemon plays it on the GoXLR.
// Drawn like ScribbleScreen (unlit dots black, lit dots see-through) so the screen colour shows behind.
export default {
  name: "CustomScreenView",
  props: {
    screen: {type: Object, required: true},   // the daemon's CustomScreen {frames, ms, ui}
  },

  watch: {
    screen() {
      this.load();
    },
  },

  mounted() {
    this.observer = new ResizeObserver(() => this.draw());
    this.observer.observe(this.$refs.canvas);
    this.load();
  },

  beforeUnmount() {
    clearTimeout(this.timer);
    this.observer?.disconnect();
  },

  methods: {
    load() {
      clearTimeout(this.timer);
      try {
        this.frames = fromCustomScreen(this.screen);
      } catch (e) {
        this.frames = [];
      }
      this.at = 0;
      this.play();
    },
    play() {
      this.draw();
      if (this.frames.length > 1) {
        this.timer = setTimeout(() => {
          this.at = (this.at + 1) % this.frames.length;
          this.play();
        }, Math.max(50, this.frames[this.at].ms));
      }
    },
    draw() {
      const frame = this.frames?.[this.at];
      if (frame && this.$refs.canvas) renderInk(this.$refs.canvas, frame.pix);
    },
  },
}
</script>

<style scoped>
.customScreen {
  display: block;
  width: 100%;
  height: 100%;
  mix-blend-mode: multiply;
}
</style>
