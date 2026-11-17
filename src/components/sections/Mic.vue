<template>
  <div class="micPage">
    <div class="micHead">
      <div class="micTitle">
        <h2>{{ $t('message.navigation.microphone') }}</h2>
        <p>{{ $t('message.device.micHint') }}</p>
      </div>
      <button type="button" class="allAdvanced" :aria-pressed="allAdvanced()" @click="toggleAllAdvanced">
        <span class="switch small" :class="{ on: allAdvanced() }"><span></span></span>
        {{ $t('message.device.showAllAdvanced') }}
      </button>
    </div>

    <!-- Live input: rolling level graph with the "aim here" zone and the draggable gate line -->
    <section class="card live" :aria-label="$t('message.device.liveInput')">
      <div class="liveMain">
        <div class="liveHead">
          <h3>{{ $t('message.device.liveInput') }}</h3>
          <span class="chip" :class="levelState()">{{ levelStateText() }}</span>
          <span class="spacer"></span>
          <div class="legend">
            <span><i class="z"></i>{{ $t('message.device.aimHere') }}</span>
            <span v-if="gate().enabled"><i></i>{{ $t('message.device.gateLine') }}</span>
          </div>
        </div>
        <div class="waveBox">
          <LiveWave :history="history" :threshold="gate().threshold" :show-threshold="gate().enabled"
                    :threshold-label="$t('message.microphone.gate.title')"
                    @threshold="setGateThreshold" @hold="on => holdPath(micPath('noise_gate/threshold'), on)"/>
        </div>
        <div class="levelRow">
          <div class="bar" role="meter" aria-valuemin="-60" aria-valuemax="0" :aria-valuenow="Math.round(micLevel)"
               :aria-label="$t('message.device.inputLevel')">
            <div class="cover" :style="{ width: (100 - levelPercent(micLevel)) + '%' }"></div>
          </div>
          <span class="lvl">{{ Math.round(micLevel) }} {{ $t('message.suffixes.decibels') }}</span>
        </div>
      </div>
      <div class="liveSide">
        <div class="fact">
          <span>{{ $t('message.microphone.setup.type') }}</span>
          <b>{{ micTypeLabel() }}</b>
        </div>
        <div class="fact">
          <span>{{ $t('message.microphone.setup.gain') }}</span>
          <b class="accent">{{ micGain() }} {{ $t('message.suffixes.decibels') }}</b>
        </div>
        <div><MicSetupButton compact :label="$t('message.device.changeMicSetup')"/></div>
      </div>
    </section>

    <!-- Equaliser -->
    <section class="card" :aria-label="$t('message.microphone.equaliser.title')">
      <div class="cardHead">
        <h3>{{ $t('message.microphone.equaliser.title') }}</h3>
        <span class="help" :title="$t('message.device.eqHint')">?</span>
        <span class="sub">{{ eqSubtitle() }}</span>
        <span class="spacer"></span>
        <span v-if="specSource.state === 'live'" class="liveTag" :title="specSource.label">
          <i></i>{{ $t('message.device.spectrumLive', {name: shortInput(specSource.label)}) }}
        </span>
        <span v-else-if="specSource.state === 'denied'" class="liveTag off">{{ $t('message.device.spectrumDenied') }}</span>
        <span v-else-if="specSource.state === 'error' || specSource.state === 'unsupported'" class="liveTag off">
          {{ $t('message.device.spectrumNoInput') }}
        </span>
        <CardMenu :label="$t('message.device.cardOptions', {name: $t('message.microphone.equaliser.title')})"
                  :items="eqMenu()" @select="eqMenuSelect"/>
      </div>
      <div class="cardBody">
        <EqGraph :bands="eqBands()" :groups="eqGroupsView()" :advanced="isAdvanced('equaliser')" :fine="fineTune()"
                 :spectrum="spec.style" :peak-hold="spec.peak" :device-id="spec.device"
                 @source="v => specSource = v"
                 @gain="setEqGain" @group="setEqGroupById" @freq="setEqFrequency" @hold="holdEq"
                 @mode="v => setAdvanced('equaliser', v)"/>
      </div>
    </section>

    <div class="cards">
      <!-- Gate -->
      <section class="card" :class="{ off: !gate().enabled }" :aria-label="$t('message.microphone.gate.title')">
        <div class="cardHead">
          <button type="button" class="switch" role="switch" :aria-checked="gate().enabled"
                  :aria-label="$t('message.microphone.gate.title')" @click="toggleGate"><span></span></button>
          <h3>{{ $t('message.microphone.gate.title') }}</h3>
          <span class="help" :title="$t('message.device.gateHint')">?</span>
          <span class="spacer"></span>
          <CardMenu :label="$t('message.device.cardOptions', {name: $t('message.microphone.gate.title')})"
                    :items="[{id: 'adv', label: $t('message.device.showAdvancedN', {n: 4}), checked: isAdvanced('gate')}]"
                    @select="setAdvanced('gate', !isAdvanced('gate'))"/>
        </div>
        <div class="cardBody">
          <div class="mini">
            <LiveWave mode="gate" :history="history" :threshold="gate().threshold" :gate-on="gate().enabled"
                      :show-threshold="gate().enabled" :attenuation="gate().attenuation" :tag="$t('message.device.gateGraph')"/>
          </div>
          <div class="rows">
            <MicRow v-if="!isAdvanced('gate')" boxed id="mic-gate-amount" :label="$t('message.device.strength')"
                    :min="0" :max="100" :value="gateAmount()" :text="gateAmount() + '%'" :path="micPath('noise_gate/threshold')"
                    @update="setGateAmount"/>
            <template v-else>
              <MicRow boxed id="mic-gate-threshold" :label="$t('message.microphone.gate.threshold')" :min="-59" :max="0"
                      :value="gate().threshold" :text="gateThresholdText()" :path="micPath('noise_gate/threshold')"
                      @update="setGateThreshold"/>
              <MicRow boxed id="mic-gate-attenuation" :label="$t('message.microphone.gate.attenuation')" :min="0" :max="100"
                      :value="gate().attenuation" :text="gate().attenuation + '%'" :path="micPath('noise_gate/attenuation')"
                      @update="v => setMic('noise_gate', 'attenuation', 'SetGateAttenuation', v)"/>
              <MicRow boxed id="mic-gate-attack" :label="$t('message.microphone.gate.attack')" :min="0" :max="gateTimes.length - 1"
                      :value="gate().attack" :text="ms(gateTimes[gate().attack])" :path="micPath('noise_gate/attack')"
                      @update="v => setMic('noise_gate', 'attack', 'SetGateAttack', v)"/>
              <MicRow boxed id="mic-gate-release" :label="$t('message.microphone.gate.release')" :min="0" :max="gateTimes.length - 1"
                      :value="gate().release" :text="ms(gateTimes[gate().release])" :path="micPath('noise_gate/release')"
                      @update="v => setMic('noise_gate', 'release', 'SetGateRelease', v)"/>
            </template>
          </div>
        </div>
      </section>

      <!-- Compressor (the device has no on/off for it, so no switch) -->
      <section class="card" :aria-label="$t('message.microphone.compressor.title')">
        <div class="cardHead">
          <h3>{{ $t('message.microphone.compressor.title') }}</h3>
          <span class="help" :title="$t('message.device.compressorHint')">?</span>
          <span class="spacer"></span>
          <CardMenu :label="$t('message.device.cardOptions', {name: $t('message.microphone.compressor.title')})"
                    :items="[{id: 'adv', label: $t('message.device.showAdvancedN', {n: 5}), checked: isAdvanced('compressor')}]"
                    @select="setAdvanced('compressor', !isAdvanced('compressor'))"/>
        </div>
        <div class="cardBody">
          <div class="mini">
            <span class="tag">{{ $t('message.device.compGraph') }}</span>
            <svg viewBox="0 0 400 110" preserveAspectRatio="none" aria-hidden="true">
              <g v-for="d in [-48, -36, -24, -12]" :key="d">
                <line :x1="compX(d)" :x2="compX(d)" y1="0" y2="110" stroke="#262d2b"/>
                <line x1="0" x2="400" :y1="compY(d)" :y2="compY(d)" stroke="#262d2b"/>
              </g>
              <line x1="0" y1="110" x2="400" y2="0" stroke="#3d4644" stroke-dasharray="4 4"/>
              <line :x1="compX(compressor().threshold)" :x2="compX(compressor().threshold)" y1="0" y2="110"
                    stroke="#e6b450" stroke-opacity=".5" stroke-dasharray="3 4"/>
              <path :d="compressorCurve()" fill="none" stroke="#59b1b6" stroke-width="2.5" vector-effect="non-scaling-stroke"/>
            </svg>
          </div>
          <div class="rows">
            <MicRow v-if="!isAdvanced('compressor')" boxed id="mic-comp-amount" :label="$t('message.microphone.compressor.amount')"
                    :min="0" :max="100" :value="compressorAmount()" :text="compressorAmount() + '%'"
                    :path="micPath('compressor/threshold') + ';' + micPath('compressor/makeup_gain')" @update="setCompressorAmount"/>
            <template v-else>
              <MicRow boxed id="mic-comp-threshold" :label="$t('message.microphone.compressor.threshold')" :min="-40" :max="0"
                      :value="compressor().threshold" :text="db(compressor().threshold)" :path="micPath('compressor/threshold')"
                      @update="v => setMic('compressor', 'threshold', 'SetCompressorThreshold', v)"/>
              <MicRow boxed id="mic-comp-ratio" :label="$t('message.microphone.compressor.ratio')" :min="0" :max="ratios.length - 1"
                      :value="compressor().ratio" :text="ratios[compressor().ratio] + ':1'" :path="micPath('compressor/ratio')"
                      @update="v => setMic('compressor', 'ratio', 'SetCompressorRatio', v)"/>
              <MicRow boxed id="mic-comp-attack" :label="$t('message.microphone.compressor.attack')" :min="0" :max="compressorAttacks.length - 1"
                      :value="compressor().attack" :text="ms(compressorAttacks[compressor().attack])" :path="micPath('compressor/attack')"
                      @update="v => setMic('compressor', 'attack', 'SetCompressorAttack', v)"/>
              <MicRow boxed id="mic-comp-release" :label="$t('message.microphone.compressor.release')" :min="0" :max="compressorReleases.length - 1"
                      :value="compressor().release" :text="ms(compressorReleases[compressor().release])" :path="micPath('compressor/release')"
                      @update="v => setMic('compressor', 'release', 'SetCompressorReleaseTime', v)"/>
              <MicRow boxed id="mic-comp-makeup" :label="$t('message.microphone.compressor.makeUpGain')" :min="-6" :max="24"
                      :value="compressor().makeup_gain" :text="db(compressor().makeup_gain)" :path="micPath('compressor/makeup_gain')"
                      @update="v => setMic('compressor', 'makeup_gain', 'SetCompressorMakeupGain', v)"/>
            </template>
          </div>
        </div>
      </section>

      <!-- Denoise: DPDFNet-2 run by the daemon (codex/mic-denoise); state comes from device.denoise -->
      <section class="card" :aria-label="$t('message.device.denoise')">
        <div class="cardHead">
          <h3>{{ $t('message.device.denoise') }}</h3>
          <span class="help" :title="$t('message.device.denoiseHint')">?</span>
          <span class="sub">DPDFNet-2</span>
        </div>
        <div class="cardBody">
          <Denoise/>
        </div>
      </section>

      <!-- Extras -->
      <section class="card" :aria-label="$t('message.microphone.extras.title')">
        <div class="cardHead">
          <h3>{{ $t('message.microphone.extras.title') }}</h3>
          <span class="help" :title="$t('message.device.extrasHint')">?</span>
        </div>
        <div class="cardBody rows">
          <MicRow v-if="!isMini" boxed id="mic-deess" :label="$t('message.microphone.extras.deEsser')" :min="0" :max="100"
                  :value="levels().deess" :text="levels().deess + '%'" :path="levelPath('deess')"
                  @update="v => setLevel('deess', 'SetDeeser', v)"/>
          <MicRow boxed id="mic-bleep" :label="$t('message.device.bleepVolume')" :min="-36" :max="0"
                  :value="levels().bleep" :text="Math.round((levels().bleep + 36) / 36 * 100) + '%'" :path="levelPath('bleep')"
                  @update="v => setLevel('bleep', 'SetSwearButtonVolume', v)"/>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import MicRow from "./mic/MicRow.vue";
import CardMenu from "./mic/CardMenu.vue";
import EqGraph from "./mic/EqGraph.vue";
import Denoise from "./mic/Denoise.vue";
import LiveWave from "./mic/LiveWave.vue";
import MicSetupButton from "@/components/sections/system/modals/MicSetupButton.vue";
import {store} from "@/store";
import {websocket} from "@/util/sockets";
import {isDeviceMini, roundToStep} from "@/util/util";
import {EqFreqs, EqMiniFreqs} from "@/util/mixerMapping";

// Index -> value tables used by the daemon (same as the original Gate / Compressor components)
const GATE_TIMES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160,
  170, 180, 190, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800,
  850, 900, 950, 1000, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000];
const RATIOS = [1, 1.1, 1.2, 1.4, 1.6, 1.8, 2, 2.5, 3.2, 4, 5.6, 8, 16, 32, 64];
const COMPRESSOR_ATTACKS = [0.001, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 23, 26, 30, 35, 40];
const COMPRESSOR_RELEASES = [0, 15, 25, 35, 45, 55, 65, 75, 85, 100, 115, 140, 170, 230, 340, 680, 1000, 1500, 2000, 3000];

// Simple EQ: each of Bass / Mid / Treble moves a group of bands together
const EQ_GROUPS = [
  {id: "bass", full: [0, 1, 2, 3], mini: [0, 1], color: "#e957a6"},
  {id: "mid", full: [4, 5, 6], mini: [2, 3], color: "#f5a33a"},
  {id: "treble", full: [7, 8, 9], mini: [4, 5], color: "#36c9e6"},
];

// One colour per EQ point on the graph, low to high
const EQ_COLOURS = ["#a35cf0", "#6c6cf2", "#e957a6", "#ef5a5a", "#f2784b", "#f5a33a", "#b6e04a", "#3fd6a0", "#36c9e6", "#3a9bf0"];
const EQ_MINI_COLOURS = ["#a35cf0", "#e957a6", "#f2784b", "#f5a33a", "#3fd6a0", "#36c9e6"];

// Card -> [settings.display key, SetElementDisplayMode element]
const DISPLAY = {gate: ["gate", "NoiseGate"], equaliser: ["equaliser", "Equaliser"], compressor: ["compressor", "Compressor"]};

// EQ spectrum options, kept in this browser only (not a device setting)
const SPEC_STORE = "goxlr.eqSpectrum";
const SPEC_DEFAULT = {style: "fill", peak: true, device: ""};

function loadSpec() {
  try {
    return {...SPEC_DEFAULT, ...JSON.parse(localStorage.getItem(SPEC_STORE) || "{}")};
  } catch (e) {
    return {...SPEC_DEFAULT};
  }
}

// Input meter: poll interval, and the dB range drawn (-60 dB = empty, 0 dB = full)
const METER_POLL_MS = 60;
const METER_FLOOR_DB = -60;
// Samples kept for the live graph (200 x 60 ms = 12 seconds)
const HISTORY_LENGTH = 200;

export default {
  name: "MicSections",
  components: {MicRow, MicSetupButton, CardMenu, EqGraph, LiveWave, Denoise},

  data() {
    return {
      gateTimes: GATE_TIMES,
      ratios: RATIOS,
      compressorAttacks: COMPRESSOR_ATTACKS,
      compressorReleases: COMPRESSOR_RELEASES,
      eqGroups: EQ_GROUPS,

      micLevel: METER_FLOOR_DB,
      micPeak: METER_FLOOR_DB,
      history: new Array(HISTORY_LENGTH).fill(METER_FLOOR_DB),
      meterTimer: undefined,
      meterRunning: false,
      inFlight: {},
      queued: {},
      spec: loadSpec(),
      specSource: {state: "off"},
    }
  },

  computed: {
    isMini() {
      return isDeviceMini();
    },
  },

  methods: {
    device() {
      return store.getActiveDevice();
    },
    mic() {
      return this.device().mic_status;
    },
    gate() {
      return this.mic().noise_gate;
    },
    compressor() {
      return this.mic().compressor;
    },
    levels() {
      return this.device().levels;
    },
    micPath(target) {
      return `/mixers/${store.getActiveSerial()}/mic_status/${target}`;
    },
    levelPath(target) {
      return `/mixers/${store.getActiveSerial()}/levels/${target}`;
    },
    pausePath(path) {
      store.pausePatchPath(path);
    },
    resumePath(path) {
      store.resumePatchPath(path);
    },
    ms(value) {
      return value + " " + this.$t('message.suffixes.milliseconds');
    },
    db(value) {
      return (value > 0 ? "+" : "") + value + " " + this.$t('message.suffixes.decibels');
    },

    // Throttled send: one request per key in flight, the latest value always lands
    send(key, command) {
      if (this.inFlight[key]) {
        this.queued[key] = command;
        return;
      }
      this.inFlight[key] = true;
      websocket.send_command(store.getActiveSerial(), command).finally(() => {
        this.inFlight[key] = false;
        const next = this.queued[key];
        if (next) {
          this.queued[key] = null;
          this.send(key, next);
        }
      });
    },
    setMic(section, key, commandName, value) {
      this.mic()[section][key] = value;
      this.send(commandName, {[commandName]: value});
    },
    setLevel(key, commandName, value) {
      this.levels()[key] = value;
      this.send(commandName, {[commandName]: value});
    },

    /* ---------- Simple / Advanced ---------- */
    isAdvanced(card) {
      return this.device().settings.display[DISPLAY[card][0]] === "Advanced";
    },
    setAdvanced(card, advanced) {
      if (advanced === this.isAdvanced(card)) return;
      websocket.send_command(store.getActiveSerial(), {"SetElementDisplayMode": [DISPLAY[card][1], advanced ? "Advanced" : "Simple"]});
    },
    holdPath(path, hold) {
      if (hold) store.pausePatchPath(path);
      else store.resumePatchPath(path);
    },
    allAdvanced() {
      return Object.keys(DISPLAY).every(card => this.isAdvanced(card));
    },
    toggleAllAdvanced() {
      const mode = this.allAdvanced() ? "Simple" : "Advanced";
      for (const card of Object.keys(DISPLAY)) {
        websocket.send_command(store.getActiveSerial(), {"SetElementDisplayMode": [DISPLAY[card][1], mode]});
      }
    },

    /* ---------- Setup & meter ---------- */
    micTypeLabel() {
      const type = this.mic().mic_type;
      if (type === "Condenser") return this.$t('message.microphone.setup.phantom', {voltage: this.isMini ? "24" : "48"});
      if (type === "Jack") return this.$t('message.microphone.setup.jack');
      return this.$t('message.microphone.setup.xlr');
    },
    micGain() {
      return this.mic().mic_gains[this.mic().mic_type];
    },
    // Poll the live mic level while the Mic page is open (and the window is visible)
    pollLevel() {
      if (!this.meterRunning) return;
      if (document.visibilityState !== "visible") {
        this.meterTimer = setTimeout(this.pollLevel, 500);
        return;
      }
      websocket.get_mic_level(store.getActiveSerial()).then((data) => {
        const level = Math.max(METER_FLOOR_DB, Math.min(0, data["MicLevel"]));
        // New array each sample so the graphs redraw
        this.history = this.history.slice(1).concat(level);
        // Fast attack, slower fall, so the bar is readable; the peak marker falls slower still
        this.micLevel = level > this.micLevel ? level : this.micLevel + (level - this.micLevel) * 0.35;
        this.micPeak = level > this.micPeak ? level : Math.max(METER_FLOOR_DB, this.micPeak - 0.8);
      }).catch(() => {
      }).finally(() => {
        if (this.meterRunning) this.meterTimer = setTimeout(this.pollLevel, METER_POLL_MS);
      });
    },
    levelPercent(db) {
      return Math.max(0, Math.min(100, (db - METER_FLOOR_DB) / -METER_FLOOR_DB * 100));
    },
    // Judged on the last ~1.5 s: loud above the zone, good inside it, silent when the gate stays shut
    levelState() {
      const recent = this.history.slice(-25), top = Math.max(...recent);
      if (top > -10) return "loud";
      if (top >= -20) return "good";
      if (this.gate().enabled && recent.every(v => v <= this.gate().threshold)) return "silent";
      return "quiet";
    },
    levelStateText() {
      const state = this.levelState();
      if (state === "loud") return this.$t('message.device.levelLoud');
      if (state === "good") return this.$t('message.device.levelGood');
      if (state === "silent") return this.$t('message.device.levelSilent');
      return this.$t('message.device.levelLow');
    },

    /* ---------- Gate ---------- */
    toggleGate() {
      const enabled = !this.gate().enabled;
      this.gate().enabled = enabled;
      websocket.send_command(store.getActiveSerial(), {"SetGateActive": enabled});
    },
    gateAmount() {
      return Math.round((this.gate().threshold + 59) / 59 * 100);
    },
    setGateAmount(amount) {
      this.setMic("noise_gate", "threshold", "SetGateThreshold", Math.round(amount / 100 * 59) - 59);
    },
    setGateThreshold(value) {
      this.setMic("noise_gate", "threshold", "SetGateThreshold", value);
    },
    gateThresholdText() {
      return this.gate().threshold === -59 ? this.$t('message.lighting.global.animations.waterfallOff') : this.db(this.gate().threshold);
    },

    /* ---------- Compressor ---------- */
    compressorAmount() {
      return 100 - Math.round((this.compressor().threshold + 40) / 40 * 100);
    },
    // Simple mode moves threshold and make-up gain together (same formula as the original component)
    setCompressorAmount(amount) {
      const threshold = Math.round((amount / 100) * 40) * -1;
      const makeup = amount === 0 ? 0 : Math.round(-6 + threshold * -3 / 4);
      this.setMic("compressor", "threshold", "SetCompressorThreshold", threshold);
      this.setMic("compressor", "makeup_gain", "SetCompressorMakeupGain", makeup);
    },

    // Transfer curve on the card: input -60..0 dB across, output up; bends at the threshold
    compX(db) {
      return (db + 60) / 60 * 400;
    },
    compY(db) {
      return 110 - (Math.max(-60, Math.min(0, db)) + 60) / 60 * 110;
    },
    compressorCurve() {
      const threshold = this.compressor().threshold, ratio = this.ratios[this.compressor().ratio];
      let d = "";
      for (let input = -60; input <= 0; input++) {
        const output = input < threshold ? input : threshold + (input - threshold) / ratio;
        d += (input === -60 ? "M" : "L") + this.compX(input) + " " + this.compY(output).toFixed(1);
      }
      return d;
    },

    /* ---------- Equaliser ---------- */
    eqSubtitle() {
      if (!this.isAdvanced('equaliser')) return this.eqGroups.map(g => this.$t(`message.microphone.equaliser.${g.id}`)).join(" · ");
      const bands = this.$t('message.device.nBands', {n: this.eqKeys().length});
      return this.fineTune() ? bands + " · " + this.$t('message.device.fineTuneFreqs') : bands;
    },
    eqBands() {
      const colours = this.isMini ? EQ_MINI_COLOURS : EQ_COLOURS;
      return this.eqKeys().map((key, i) => ({
        key, freq: this.eqFrequency(key), gain: this.eqGain(key), color: colours[i],
        minFreq: this.freqMin(i), maxFreq: this.freqMax(i), step: this.freqStep(i),
      }));
    },
    eqGroupsView() {
      return this.eqGroups.map(group => {
        const keys = this.groupKeys(group);
        const low = this.eqFrequency(keys[0]), high = this.eqFrequency(keys[keys.length - 1]);
        return {
          id: group.id, keys, color: group.color, label: this.$t(`message.microphone.equaliser.${group.id}`),
          value: this.eqGroupValue(group), freq: Math.sqrt(low * high),
        };
      });
    },
    setEqGroupById(id, value) {
      this.setEqGroup(this.eqGroups.find(g => g.id === id), value);
    },
    // Pause daemon patches for the bands under the pointer so points don't jump while dragging
    holdEq(keys, hold) {
      for (const key of keys) {
        this.holdPath(this.eqPath("gain", key), hold);
        if (this.fineTune()) this.holdPath(this.eqPath("frequency", key), hold);
      }
    },
    eqMenu() {
      return [
        {id: "adv", label: this.$t('message.device.showBands', {n: this.eqKeys().length}), checked: this.isAdvanced('equaliser')},
        {id: "fine", label: this.$t('message.device.fineTuneFreqs'), checked: this.fineTune()},
        {id: "flat", label: this.$t('message.device.resetFlat')},
        {id: "spec:fill", label: this.$t('message.device.spectrumFill'), checked: this.spec.style === "fill"},
        {id: "spec:bars", label: this.$t('message.device.spectrumBars'), checked: this.spec.style === "bars"},
        {id: "spec:off", label: this.$t('message.device.spectrumOff'), checked: this.spec.style === "off"},
        {id: "peak", label: this.$t('message.device.peakHold'), checked: this.spec.peak},
        ...(this.specSource.devices || []).map(d => ({
          id: "input:" + d.id, label: this.$t('message.device.spectrumInput', {name: d.label}),
          checked: d.id === this.specSource.deviceId,
        })),
      ];
    },
    setSpec(change) {
      this.spec = {...this.spec, ...change};
      try {
        localStorage.setItem(SPEC_STORE, JSON.stringify(this.spec));
      } catch (e) {
        // Storage blocked: the choice still holds until the page reloads
      }
    },
    shortInput(label) {
      // "Chat Mic (TC-Helicon GoXLR)" -> "Chat Mic"
      return (label || "").replace(/\s*\(.*\)\s*$/, "");
    },
    eqMenuSelect(id) {
      if (id === "adv") this.setAdvanced('equaliser', !this.isAdvanced('equaliser'));
      if (id === "fine") {
        const enable = !this.fineTune();
        this.setFineTune(enable);
        if (enable) this.setAdvanced('equaliser', true);
      }
      if (id === "flat") this.resetEq();
      if (id.startsWith("spec:")) this.setSpec({style: id.slice(5)});
      if (id === "peak") this.setSpec({peak: !this.spec.peak});
      if (id.startsWith("input:")) this.setSpec({device: id.slice(6)});
    },
    eqSection() {
      return this.isMini ? this.mic().equaliser_mini : this.mic().equaliser;
    },
    eqKeys() {
      return this.isMini ? EqMiniFreqs : EqFreqs;
    },
    eqPath(kind, key) {
      return this.micPath(`${this.isMini ? "equaliser_mini" : "equaliser"}/${kind}/${key}`);
    },
    eqGain(key) {
      return this.eqSection().gain[key];
    },
    setEqGain(key, value) {
      const command = this.isMini ? "SetEqMiniGain" : "SetEqGain";
      this.eqSection().gain[key] = value;
      this.send(command + key, {[command]: [key, value]});
    },
    groupKeys(group) {
      return (this.isMini ? group.mini : group.full).map(i => this.eqKeys()[i]);
    },
    eqGroupValue(group) {
      const keys = this.groupKeys(group);
      return Math.round(keys.reduce((sum, key) => sum + this.eqGain(key), 0) / keys.length);
    },
    eqGroupPaths(group) {
      return this.groupKeys(group).map(key => this.eqPath("gain", key)).join(";");
    },
    setEqGroup(group, value) {
      for (const key of this.groupKeys(group)) this.setEqGain(key, value);
    },
    fineTune() {
      return this.device().settings.display.equaliser_fine === "Advanced";
    },
    setFineTune(enabled) {
      websocket.send_command(store.getActiveSerial(), {"SetElementDisplayMode": ["EqFineTune", enabled ? "Advanced" : "Simple"]});
    },
    eqFrequency(key) {
      return this.eqSection().frequency[key];
    },
    bandTitle(index) {
      const value = this.eqFrequency(this.eqKeys()[index]);
      const hz = this.$t('message.suffixes.hertz'), khz = this.$t('message.suffixes.kilohertz');
      if (this.isMini) return index < 3 ? Math.round(value) + hz : (value / 1000).toFixed(1) + khz;
      return value < 1000 ? Math.round(value * 10) / 10 + hz : Math.round(value) / 1000 + khz;
    },
    // Fine-tune limits: each band stays inside its range and between its neighbours (as in the original)
    freqMin(index) {
      if (this.isMini) return [30, 100, 310, 800, 2600, 5100][index];
      const floor = [30, 30, 30, 30, 300, 300, 300, 2000, 2000, 2000][index];
      const prev = index === 0 ? floor : Math.floor(this.eqFrequency(EqFreqs[index - 1]));
      return Math.max(floor, prev);
    },
    freqMax(index) {
      if (this.isMini) return [90, 300, 800, 2500, 5000, 18000][index];
      const ceiling = [300, 300, 300, 300, 2000, 2000, 2000, 18000, 18000, 18000][index];
      const next = index === EqFreqs.length - 1 ? ceiling : Math.floor(this.eqFrequency(EqFreqs[index + 1]));
      return Math.min(ceiling, next);
    },
    freqStep(index) {
      return index < 4 ? 0.5 : 100;
    },
    setEqFrequency(key, index, value) {
      if (isNaN(value)) return;
      value = Math.max(this.freqMin(index), Math.min(this.freqMax(index), roundToStep(value, this.freqStep(index))));
      const command = this.isMini ? "SetEqMiniFreq" : "SetEqFreq";
      this.eqSection().frequency[key] = value;
      this.send(command + key, {[command]: [key, value]});
    },
    resetEq() {
      const keys = this.eqKeys();
      const defaults = this.isMini ? [90, 250, 500, 1000, 3000, 8000] : [31.5, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
      const freqCommand = this.isMini ? "SetEqMiniFreq" : "SetEqFreq";
      const gainCommand = this.isMini ? "SetEqMiniGain" : "SetEqGain";
      keys.forEach((key, i) => {
        websocket.send_command(store.getActiveSerial(), {[freqCommand]: [key, defaults[i]]});
        websocket.send_command(store.getActiveSerial(), {[gainCommand]: [key, 0]});
      });
    },
  },

  mounted() {
    this.meterRunning = true;
    this.pollLevel();
  },

  unmounted() {
    this.meterRunning = false;
    clearTimeout(this.meterTimer);
  },
}
</script>

<style scoped>
.micPage {
  max-width: 1180px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 24px 32px;
  color: #e8ecea;
}

.micHead {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px;
}

.micTitle {
  flex: 1 1 320px;
}

.micTitle h2 {
  margin: 0;
  font-size: 26px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
}

.micTitle p {
  margin: 6px 0 0;
  font-size: 14px;
  color: #9aa4a0;
}

button {
  font-family: var(--goxlr-font);
  cursor: pointer;
}

button:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.allAdvanced {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid #3a413f;
  border-radius: 8px;
  background: #2a2f2d;
  color: #e8ecea;
  font-size: 14px;
}

.allAdvanced:hover {
  border-color: #59b1b6;
}

.allAdvanced[aria-pressed=true] {
  border-color: #59b1b6;
  background: #1d3a3c;
}

/* Toggle switch (gate on / off, denoise, show all advanced) */
.switch {
  position: relative;
  flex: 0 0 auto;
  width: 44px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: #4a524f;
  transition: background 0.15s;
}

.switch span {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.15s;
}

.switch[aria-checked=true], .switch.on {
  background: #59b1b6;
}

.switch[aria-checked=true] span, .switch.on span {
  left: 23px;
}

.switch:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.switch.small {
  display: inline-block;
  width: 34px;
  height: 20px;
  border-radius: 10px;
}

.switch.small span {
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
}

.switch.small.on span {
  left: 16px;
}

/* ---------- Cards ---------- */
.card {
  box-sizing: border-box;
  min-width: 0;
  border-radius: 12px;
  background: #2d3230;
  border: 1px solid #343a38;
}

.card h3 {
  margin: 0;
  font-size: 18px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
}

.cardHead {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 66px;
  box-sizing: border-box;
  padding: 12px 16px 12px 20px;
  border-bottom: 1px solid #3b413f;
  border-radius: 12px 12px 0 0;
  background: #313735;
}

.help {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border: 1px solid #6d7773;
  border-radius: 50%;
  color: #9aa4a0;
  font-size: 11px;
  cursor: help;
}

.sub {
  color: #9aa4a0;
  font-size: 13px;
}

.spacer {
  flex: 1 1 auto;
}

.cardBody {
  padding: 18px 20px 20px;
}

.card.off .cardBody {
  opacity: .45;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  align-items: start;
}

/* ---------- Live input ---------- */
.live {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
}

.liveMain {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 16px 20px 18px;
}

.liveHead {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.liveTag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: 10px;
  color: #5dcaa5;
  font-size: 12px;
  white-space: nowrap;
}

.liveTag i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.liveTag.off {
  color: #9aa4a0;
}

.chip {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  white-space: nowrap;
}

.chip.good {
  background: rgba(79, 209, 165, .14);
  color: #4fd1a5;
}

.chip.quiet, .chip.silent {
  background: rgba(230, 180, 80, .14);
  color: #e6b450;
}

.chip.silent {
  background: rgba(154, 164, 160, .14);
  color: #9aa4a0;
}

.chip.loud {
  background: rgba(255, 107, 107, .16);
  color: #ff6b6b;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 12px;
  color: #9aa4a0;
}

.legend i {
  display: inline-block;
  width: 14px;
  height: 0;
  margin-right: 6px;
  border-top: 2px dashed #e6b450;
  vertical-align: middle;
}

.legend i.z {
  height: 8px;
  border: 1px solid rgba(79, 209, 165, .4);
  background: rgba(79, 209, 165, .1);
}

.waveBox {
  height: 120px;
}

.levelRow {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar {
  position: relative;
  flex: 1 1 auto;
  height: 10px;
  overflow: hidden;
  border-radius: 5px;
  background: linear-gradient(90deg, #2c6e70, #59b1b6 55%, #4fd1a5 75%, #e6b450 88%, #ff6b6b);
}

/* Dark cover from the right: the coloured bar shows up to the current level */
.cover {
  position: absolute;
  inset: 0 0 0 auto;
  background: #1b1f1e;
  transition: width 0.06s linear;
}

.lvl {
  width: 62px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.liveSide {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px;
  border-left: 1px solid #3b413f;
}

.fact span {
  display: block;
  font-size: 12px;
  color: #9aa4a0;
}

.fact b {
  font-weight: 400;
  font-size: 15px;
}

.fact b.accent {
  color: #59b1b6;
}

/* ---------- Gate / Compressor graphs ---------- */
.mini {
  position: relative;
  height: 110px;
  margin-bottom: 14px;
  overflow: hidden;
  border-radius: 8px;
  background: #1b1f1e;
}

.mini svg {
  display: block;
  width: 100%;
  height: 100%;
}

.mini .tag {
  position: absolute;
  top: 8px;
  left: 10px;
  color: #6d7773;
  font-size: 11px;
}

@media (max-width: 1100px) {
  .cards {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 860px) {
  .live {
    grid-template-columns: minmax(0, 1fr);
  }

  .liveSide {
    flex-direction: row;
    flex-wrap: wrap;
    border-left: 0;
    border-top: 1px solid #3b413f;
  }
}
</style>
