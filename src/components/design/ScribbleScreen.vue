<template>
  <canvas ref="canvas" class="scribbleCanvas" aria-hidden="true"></canvas>
</template>

<script>
// The daemon's 128x64 one-bit screen image, drawn at the canvas' real pixel size.
// A plain <img> shrunk by the browser drops thin lines (letters and icons look broken);
// the canvas filters it properly when shrinking and keeps hard pixels when enlarging.
export default {
  name: "ScribbleScreen",
  props: {
    src: {type: String, required: true},
  },

  watch: {
    src() {
      this.load();
    },
  },

  mounted() {
    this.observer = new ResizeObserver(() => this.draw());
    this.observer.observe(this.$refs.canvas);
    this.load();
  },

  beforeUnmount() {
    this.observer?.disconnect();
    this.image = null;
  },

  methods: {
    load() {
      const image = new Image();
      image.onload = () => {
        if (this.image !== image) return; // a newer screen arrived meanwhile
        this.draw();
      };
      this.image = image;
      image.src = this.src;
    },
    draw() {
      const canvas = this.$refs.canvas, image = this.image;
      if (!canvas || !image || !image.complete || !image.naturalWidth) return;
      // Size in device pixels, including CSS zoom on the page and Windows display scaling
      const box = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(box.width * window.devicePixelRatio));
      const height = Math.max(1, Math.round(box.height * window.devicePixelRatio));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      const ctx = canvas.getContext("2d");
      const enlarging = width >= image.naturalWidth;
      ctx.imageSmoothingEnabled = !enlarging;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);
    },
  },
}
</script>

<style scoped>
.scribbleCanvas {
  display: block;
  width: 100%;
  height: 100%;
  mix-blend-mode: multiply;
}
</style>
