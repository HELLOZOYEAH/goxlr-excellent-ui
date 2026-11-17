<template>
  <div class="eqGraph">
    <div class="scroll"><div class="inner">
      <div class="ranges" aria-hidden="true">
        <div v-for="range in ranges" :key="range.id" :style="{ flex: range.flex }">{{ $t(`message.device.eqRanges.${range.id}`) }}</div>
      </div>
      <svg ref="svg" :class="{ fine: advanced && fine }" :viewBox="`0 0 ${W} ${H}`" role="group"
           :aria-label="$t('message.microphone.equaliser.title')"
           @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up">
        <g v-for="g in gridGains" :key="'g' + g">
          <line :x1="L" :x2="R" :y1="gy(g)" :y2="gy(g)" :stroke="g === 0 ? '#3d4644' : '#2a3130'"/>
          <text :x="L - 8" :y="gy(g) + 4" text-anchor="end" class="axis">{{ (g > 0 ? '+' : '') + g }} dB</text>
        </g>
        <line v-for="f in gridFreqs" :key="'f' + f" :x1="fx(f)" :x2="fx(f)" :y1="T" :y2="B" stroke="#262d2b"/>
        <text v-for="tick in freqTicks" :key="'t' + tick[0]" :x="fx(tick[0])" :y="B + 22" text-anchor="middle" class="axis">{{ tick[1] }}</text>

        <!-- Live spectrum of the mic (after the device's EQ). Paths are written straight from the
             animation loop, not through Vue, so the rest of the graph doesn't re-render every frame. -->
        <defs>
          <linearGradient id="specFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#5dcaa5" stop-opacity=".42"/>
            <stop offset="1" stop-color="#5dcaa5" stop-opacity=".04"/>
          </linearGradient>
        </defs>
        <g v-show="spectrum !== 'off'" ref="spec" class="spec" aria-hidden="true">
          <path ref="specArea" :fill="spectrum === 'bars' ? 'rgba(93,202,165,.28)' : 'url(#specFade)'"/>
          <path v-show="spectrum === 'fill'" ref="specLine" fill="none" stroke="rgba(93,202,165,.7)" stroke-width="1.5"/>
          <path v-show="peakHold" ref="specPeak" fill="none" stroke="rgba(230,239,235,.35)" stroke-width="1.2" stroke-dasharray="5 5"/>
        </g>

        <path :d="curve + ` L${R} ${gy(0)} L${L} ${gy(0)} Z`" fill="rgba(89,177,182,.10)"/>
        <path :d="curve" fill="none" stroke="#e8ecea" stroke-width="1.8"/>

        <template v-if="advanced">
          <g v-for="(band, i) in bands" :key="band.key" class="pt" :data-i="i" tabindex="0" role="slider"
             :aria-label="freqText(band.freq)" :aria-valuenow="band.gain" aria-valuemin="-9" aria-valuemax="9"
             @focus="selected = i" @keydown="key($event, i)">
            <line v-if="i === selected" :x1="fx(band.freq)" :x2="fx(band.freq)" :y1="T" :y2="B" :stroke="band.color"
                  stroke-opacity=".35" stroke-dasharray="3 4"/>
            <circle :cx="fx(band.freq)" :cy="gy(band.gain)" r="16" fill="transparent"/>
            <circle :cx="fx(band.freq)" :cy="gy(band.gain)" :r="i === selected ? 8 : 6" :fill="band.color"
                    :stroke="i === selected ? '#fff' : 'none'" stroke-width="2"/>
          </g>
        </template>
        <template v-else>
          <g v-for="(group, i) in groups" :key="group.id" class="pt" :data-i="i" tabindex="0" role="slider"
             :aria-label="group.label" :aria-valuenow="group.value" aria-valuemin="-9" aria-valuemax="9"
             @focus="selected = i" @keydown="key($event, i)">
            <circle :cx="fx(group.freq)" :cy="gy(group.value)" r="20" fill="transparent"/>
            <circle :cx="fx(group.freq)" :cy="gy(group.value)" :r="i === selected ? 11 : 9" :fill="group.color"
                    :stroke="i === selected ? '#fff' : 'none'" stroke-width="2"/>
            <text :x="fx(group.freq)" :y="gy(group.value) - 18" text-anchor="middle" class="groupLabel" :fill="group.color">{{ group.label }}</text>
          </g>
        </template>
      </svg>
    </div></div>

    <div class="foot">
      <div class="sel">
        <span class="dot" :style="{ background: current.color }"></span>
        <b>{{ current.title }} · {{ db(current.value) }}</b>
        <button type="button" class="step" :aria-label="$t('message.device.lower')" @click="nudge(-1)">−</button>
        <button type="button" class="step" :aria-label="$t('message.device.raise')" @click="nudge(1)">+</button>
      </div>
      <span class="hint">{{ advanced && fine ? $t('message.device.eqDragFine') : $t('message.device.eqDrag') }}</span>
      <div class="seg" role="group">
        <button type="button" :aria-pressed="!advanced" @click="$emit('mode', false)">{{ $t('message.device.simple') }}</button>
        <button type="button" :aria-pressed="advanced" @click="$emit('mode', true)">{{ $t('message.device.nBands', {n: bands.length}) }}</button>
      </div>
    </div>
  </div>
</template>

<script>
// Equaliser drawn as a response graph (idea from the reference screenshot). Simple mode shows one
// point per Bass / Mid / Treble group; advanced shows every band. Drag up/down = gain; with fine
// tune on, left/right = frequency (kept inside the band's own limits from the parent).
const W = 1000, H = 320, L = 56, R = 990, T = 12, B = 284, GMAX = 9;
const LOG_LO = Math.log10(20), LOG_HI = Math.log10(20000);
// Width (in octaves) of each drawn band bump; only for the picture, the device does the real filtering
const BUMP = 0.42;

// Spectrum: SPEC_BINS log-spaced columns, drawn from SPEC_FLOOR dBFS (bottom) to SPEC_TOP dBFS (top)
const SPEC_BINS = 96, SPEC_FLOOR = -90, SPEC_TOP = -10;
// Smoothing per frame (rise fast, fall slow), peak line fall in dB per second, and the level
// under which the mic counts as silent (the spectrum fades back)
const SPEC_RISE = 0.55, SPEC_FALL = 0.15, PEAK_FALL = 20, SILENT_DB = -72;
// GoXLR inputs as Windows names them; the mic-only one first
const PREFERRED_INPUTS = [/chat mic/i, /broadcast stream mix/i, /goxlr/i];

const RANGES = [
  {id: "subBass", from: 20, to: 60}, {id: "bass", from: 60, to: 250}, {id: "lowMids", from: 250, to: 500},
  {id: "midRange", from: 500, to: 2000}, {id: "upperMids", from: 2000, to: 6000}, {id: "highs", from: 6000, to: 20000},
];

export default {
  name: "EqGraph",
  emits: ["gain", "group", "freq", "hold", "mode", "source"],
  props: {
    // Live spectrum behind the curve: "fill", "bars" or "off"
    spectrum: {type: String, default: "fill"},
    peakHold: {type: Boolean, default: true},
    // Browser input device to listen to; "" = pick a GoXLR input by name
    deviceId: {type: String, default: ""},
    // [{key, freq, gain, color, minFreq, maxFreq, step}]
    bands: {type: Array, required: true},
    // [{id, label, color, value, freq, keys}]
    groups: {type: Array, required: true},
    advanced: {type: Boolean, default: false},
    fine: {type: Boolean, default: false},
  },

  data() {
    return {
      W, H, L, R, T, B,
      selected: 0,
      drag: null,
      gridGains: [9, 6, 3, 0, -3, -6, -9],
      gridFreqs: [30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
        2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
      freqTicks: [[20, "20Hz"], [50, "50Hz"], [100, "100Hz"], [200, "200Hz"], [500, "500Hz"], [1000, "1kHz"],
        [2000, "2kHz"], [5000, "5kHz"], [10000, "10kHz"], [20000, "20kHz"]],
      ranges: RANGES.map(r => ({id: r.id, flex: Math.log10(r.to) - Math.log10(r.from)})),
    }
  },

  computed: {
    curve() {
      let d = "";
      for (let x = L; x <= R; x += 3) {
        d += (x === L ? "M" : "L") + x + " " + this.gy(this.response(this.xf(x))).toFixed(1);
      }
      return d;
    },
    items() {
      return this.advanced ? this.bands : this.groups;
    },
    current() {
      const i = Math.min(this.selected, this.items.length - 1);
      if (this.advanced) {
        const band = this.bands[i];
        return {color: band.color, title: this.freqText(band.freq), value: band.gain};
      }
      const group = this.groups[i];
      return {color: group.color, title: group.label, value: group.value};
    },
  },

  watch: {
    advanced() {
      this.selected = 0;
    },
    spectrum(value, old) {
      if (value === "off") this.stopSpectrum();
      else if (old === "off") this.startSpectrum();
    },
    deviceId() {
      if (this.spectrum === "off") return;
      this.stopSpectrum();
      this.startSpectrum();
    },
  },

  created() {
    // Not reactive on purpose: audio objects and per-frame buffers
    this.audio = null;
    this.specFreqs = [];
    for (let i = 0; i <= SPEC_BINS; i++) this.specFreqs.push(20 * Math.pow(1000, i / SPEC_BINS));
    this.specLevel = new Float32Array(SPEC_BINS).fill(SPEC_FLOOR);
    this.specPeak = new Float32Array(SPEC_BINS).fill(SPEC_FLOOR);
  },

  mounted() {
    if (this.spectrum !== "off") this.startSpectrum();
  },

  unmounted() {
    this.stopSpectrum();
  },

  methods: {
    fx(f) {
      return L + (Math.log10(f) - LOG_LO) / (LOG_HI - LOG_LO) * (R - L);
    },
    xf(x) {
      return Math.pow(10, LOG_LO + (x - L) / (R - L) * (LOG_HI - LOG_LO));
    },
    gy(g) {
      return T + (GMAX - g) / (2 * GMAX) * (B - T);
    },
    yg(y) {
      return GMAX - (y - T) / (B - T) * 2 * GMAX;
    },
    response(f) {
      let sum = 0;
      for (const band of this.bands) {
        const octaves = Math.log2(f / band.freq);
        sum += band.gain * Math.exp(-(octaves * octaves) / (2 * BUMP * BUMP));
      }
      return Math.max(-GMAX - 2, Math.min(GMAX + 2, sum));
    },
    freqText(f) {
      if (f >= 1000) return Math.round(f / 100) / 10 + " " + this.$t('message.suffixes.kilohertz');
      return Math.round(f * 10) / 10 + " " + this.$t('message.suffixes.hertz');
    },
    db(v) {
      return (v > 0 ? "+" : "") + v + " " + this.$t('message.suffixes.decibels');
    },
    clamp(v) {
      return Math.max(-GMAX, Math.min(GMAX, v));
    },
    holdKeys(i) {
      return this.advanced ? [this.bands[i].key] : this.groups[i].keys;
    },
    setValue(i, value) {
      if (this.advanced) this.$emit("gain", this.bands[i].key, value);
      else this.$emit("group", this.groups[i].id, value);
    },
    nudge(delta) {
      const i = Math.min(this.selected, this.items.length - 1);
      this.setValue(i, this.clamp(this.current.value + delta));
    },
    key(event, i) {
      this.selected = i;
      if (event.key === "ArrowUp" || event.key === "ArrowRight") this.nudge(1);
      else if (event.key === "ArrowDown" || event.key === "ArrowLeft") this.nudge(-1);
      else return;
      event.preventDefault();
    },

    point(event) {
      const rect = this.$refs.svg.getBoundingClientRect();
      return {x: (event.clientX - rect.left) / rect.width * W, y: (event.clientY - rect.top) / rect.height * H};
    },
    down(event) {
      // Browsers may hold audio until the page is clicked
      if (this.audio && this.audio.ctx && this.audio.ctx.state === "suspended") this.audio.ctx.resume();
      const target = event.target.closest(".pt");
      if (!target) return;
      const i = +target.dataset.i;
      this.selected = i;
      this.drag = {i, last: null, lastFreq: null};
      this.$refs.svg.setPointerCapture(event.pointerId);
      this.$emit("hold", this.holdKeys(i), true);
      event.preventDefault();
    },
    move(event) {
      if (!this.drag) return;
      const p = this.point(event), i = this.drag.i;
      const gain = this.clamp(Math.round(this.yg(p.y)));
      if (gain !== this.drag.last) {
        this.drag.last = gain;
        this.setValue(i, gain);
      }
      if (this.advanced && this.fine) {
        const band = this.bands[i];
        let freq = Math.max(band.minFreq, Math.min(band.maxFreq, this.xf(p.x)));
        freq = Math.round(freq / band.step) * band.step;
        if (freq !== this.drag.lastFreq && freq !== band.freq) {
          this.drag.lastFreq = freq;
          this.$emit("freq", band.key, i, freq);
        }
      }
    },
    up() {
      if (!this.drag) return;
      this.$emit("hold", this.holdKeys(this.drag.i), false);
      this.drag = null;
    },

    // ---- Live spectrum ----
    async inputs() {
      const all = await navigator.mediaDevices.enumerateDevices();
      return all.filter(d => d.kind === "audioinput" && d.deviceId !== "default" && d.deviceId !== "communications");
    },
    pickGoXLR(list) {
      for (const pattern of PREFERRED_INPUTS) {
        const found = list.find(d => pattern.test(d.label));
        if (found) return found.deviceId;
      }
      return "";
    },
    open(id) {
      // Raw signal: no browser echo / noise / gain processing on top of the GoXLR's own
      return navigator.mediaDevices.getUserMedia({audio: {
        deviceId: id ? {exact: id} : undefined,
        echoCancellation: false, noiseSuppression: false, autoGainControl: false,
      }});
    },
    async startSpectrum() {
      if (this.audio) return;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.$emit("source", {state: "unsupported"});
        return;
      }
      const a = {};
      this.audio = a;
      let stream;
      try {
        let id = this.deviceId || this.pickGoXLR(await this.inputs());
        stream = await this.open(id);
        // Device names are hidden until mic access is allowed: look again and switch to the GoXLR input
        if (!id) {
          const list = await this.inputs();
          id = this.pickGoXLR(list);
          if (id && id !== stream.getAudioTracks()[0].getSettings().deviceId) {
            stream.getTracks().forEach(t => t.stop());
            stream = await this.open(id);
          }
        }
        if (this.audio !== a) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        a.stream = stream;
        a.ctx = new AudioContext();
        a.analyser = a.ctx.createAnalyser();
        a.analyser.fftSize = 8192;
        a.analyser.smoothingTimeConstant = 0.6;
        a.ctx.createMediaStreamSource(stream).connect(a.analyser);
        a.buf = new Float32Array(a.analyser.frequencyBinCount);

        const track = stream.getAudioTracks()[0];
        const devices = (await this.inputs()).map(d => ({id: d.deviceId, label: d.label}));
        this.$emit("source", {state: "live", deviceId: track.getSettings().deviceId, label: track.label, devices});
        a.raf = requestAnimationFrame(this.frame);
      } catch (e) {
        if (stream) stream.getTracks().forEach(t => t.stop());
        if (this.audio === a) this.audio = null;
        this.$emit("source", {state: e && e.name === "NotAllowedError" ? "denied" : "error"});
      }
    },
    stopSpectrum() {
      const a = this.audio;
      this.audio = null;
      if (!a) return;
      cancelAnimationFrame(a.raf);
      if (a.stream) a.stream.getTracks().forEach(t => t.stop());
      if (a.ctx) a.ctx.close();
      this.specLevel.fill(SPEC_FLOOR);
      this.specPeak.fill(SPEC_FLOOR);
      for (const ref of ["specArea", "specLine", "specPeak"]) this.$refs[ref] && this.$refs[ref].setAttribute("d", "");
      this.$emit("source", {state: "off"});
    },
    sy(db) {
      const v = Math.max(SPEC_FLOOR, Math.min(SPEC_TOP, db));
      return B - (v - SPEC_FLOOR) / (SPEC_TOP - SPEC_FLOOR) * (B - T);
    },
    frame(now) {
      const a = this.audio;
      if (!a || !a.analyser || !this.$refs.specArea) return;
      a.raf = requestAnimationFrame(this.frame);
      const dt = a.last ? Math.min(0.1, (now - a.last) / 1000) : 0;
      a.last = now;

      a.analyser.getFloatFrequencyData(a.buf);
      const hz = a.ctx.sampleRate / a.analyser.fftSize, top = a.buf.length - 1;
      const f = this.specFreqs, level = this.specLevel, peak = this.specPeak;
      let loudest = SPEC_FLOOR;
      for (let i = 0; i < SPEC_BINS; i++) {
        const k0 = Math.min(top, Math.round(f[i] / hz));
        const k1 = Math.min(top, Math.max(k0, Math.round(f[i + 1] / hz) - 1));
        let v = -Infinity;
        for (let k = k0; k <= k1; k++) if (a.buf[k] > v) v = a.buf[k];
        v = Math.max(SPEC_FLOOR, v);
        level[i] += (v > level[i] ? SPEC_RISE : SPEC_FALL) * (v - level[i]);
        peak[i] = level[i] > peak[i] ? level[i] : Math.max(level[i], peak[i] - PEAK_FALL * dt);
        if (level[i] > loudest) loudest = level[i];
      }

      let area = "", line = "", peaks = "";
      for (let i = 0; i < SPEC_BINS; i++) {
        const x = this.fx(Math.sqrt(f[i] * f[i + 1])).toFixed(1), y = this.sy(level[i]).toFixed(1);
        if (this.spectrum === "bars") {
          area += `M${(this.fx(f[i]) + 1.5).toFixed(1)} ${B}V${y}H${(this.fx(f[i + 1]) - 1.5).toFixed(1)}V${B}Z`;
        } else {
          area += `L${x} ${y}`;
        }
        line += (i ? "L" : "M") + x + " " + y;
        if (this.peakHold) peaks += (i ? "L" : "M") + x + " " + this.sy(peak[i]).toFixed(1);
      }
      if (this.spectrum !== "bars") area = `M${L} ${B}${area}L${R} ${B}Z`;
      this.$refs.specArea.setAttribute("d", area);
      this.$refs.specLine.setAttribute("d", this.spectrum === "fill" ? line : "");
      this.$refs.specPeak.setAttribute("d", peaks);
      this.$refs.spec.classList.toggle("quiet", loudest < SILENT_DB);
    },
  },
}
</script>

<style scoped>
.eqGraph {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranges {
  display: flex;
  gap: 2px;
  height: 30px;
  margin-left: 5.6%;
  margin-right: 1%;
}

.ranges div {
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 3px;
  background: #1b1f1e;
  color: #9aa4a0;
  font-size: 11px;
  letter-spacing: .08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.scroll {
  overflow-x: auto;
}

.inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 620px;
}

svg {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
  background: #1b1f1e;
  touch-action: none;
  user-select: none;
}

.spec {
  transition: opacity .6s;
}

.spec.quiet {
  opacity: .35;
}

.axis {
  font-size: 11px;
  fill: #6d7773;
}

.groupLabel {
  font-size: 13px;
}

.pt {
  cursor: ns-resize;
  outline: none;
}

svg.fine .pt {
  cursor: move;
}

.pt:focus-visible circle:last-of-type {
  stroke: #59b1b6;
  stroke-width: 3;
}

.foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.sel {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 6px 12px;
  border-radius: 8px;
  background: #1b1f1e;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.sel b {
  min-width: 150px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

.step {
  width: 30px;
  height: 30px;
  border: 1px solid #3b413f;
  border-radius: 6px;
  background: #2a2f2d;
  color: #e8ecea;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}

.hint {
  color: #6d7773;
  font-size: 12px;
}

.seg {
  display: inline-flex;
  margin-left: auto;
  overflow: hidden;
  border: 1px solid #3b413f;
  border-radius: 8px;
}

.seg button {
  padding: 7px 12px;
  border: 0;
  background: none;
  color: #9aa4a0;
  font-family: var(--goxlr-font);
  font-size: 13px;
  cursor: pointer;
}

.seg button[aria-pressed=true] {
  background: #1d3a3c;
  color: #e8ecea;
}

button:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}
</style>
