<template>
  <div class="samplerPage">
    <div class="samplerHead">
      <h2>{{ $t('message.navigation.sampler') }}</h2>
      <p>{{ $t('message.device.samplerHint') }}</p>
    </div>

    <div class="samplerBody">
      <!-- Bank buttons and the four pads, laid out like the hardware -->
      <div class="hardware">
        <div class="deviceBlock">
          <div class="banks" role="radiogroup" :aria-label="$t('message.sampler.banks.bankTitle')">
            <button v-for="bank in banks" :key="bank" type="button" role="radio" class="bank"
                    :aria-checked="activeBank === bank" :style="bankStyle(bank)" @click="setActiveBank(bank)">{{ bank }}
            </button>
          </div>
          <div class="pads" role="radiogroup" :aria-label="$t('message.sampler.banks.buttonTitle')">
            <button v-for="pad in pads" :key="pad.id" type="button" role="radio" class="pad"
                    :class="[pad.css, { selected: activeButton === pad.id, playing: padPlaying(pad.id) }]"
                    :aria-checked="activeButton === pad.id" :title="padName(pad.id)"
                    :aria-label="padName(pad.id) + ', ' + padSummary(pad.id)" @click="setActiveButton(pad.id)"
                    :data-file-over="fileOver === pad.id || null"
                    @dragover="fileDragOver($event, pad.id)" @dragleave="fileDragLeave($event, pad.id)" @drop="fileDrop($event, pad.id)">
              <!-- The pad outline, with the corner cut out where the hardware's Clear button sits -->
              <svg class="padShape" viewBox="0 0 150 90" preserveAspectRatio="none" aria-hidden="true">
                <path :d="padPath" v-bind="padPaint(pad.id)" vector-effect="non-scaling-stroke"/>
              </svg>
              <span class="padName">{{ padSamples(pad.id).length ? padSamples(pad.id)[0].name : $t('message.device.emptyPad') }}</span>
              <span class="padCount">{{ padSamples(pad.id).length ? $tc('message.device.sampleCount', padSamples(pad.id).length, { n: padSamples(pad.id).length }) : '' }}</span>
            </button>
          </div>
        </div>
        <div class="zoneLabel">{{ $t('message.navigation.sampler') }}</div>
      </div>

      <!-- Settings for the selected pad -->
      <section class="padCard" :class="{ fileOver: fileOver === 'card' }" :aria-label="padTitle()"
               @dragover="fileDragOver($event, 'card')" @dragleave="fileDragLeave($event, 'card')" @drop="fileDrop($event, 'card')">
        <div v-if="fileOver === 'card'" class="dropOverlay" aria-hidden="true">
          <font-awesome-icon icon="fa-solid fa-download"/>{{ $t('message.sampler.dropToAdd', { pad: padTitle() }) }}
        </div>
        <div class="cardHead">
          <h3>{{ padTitle() }}</h3>
          <span>{{ $t('message.device.bankN', { bank: activeBank }) }}</span>
        </div>

        <div class="twoCol">
          <label class="field">
            <span class="fieldLabel">{{ $t('message.device.whenPressed') }}</span>
            <select :value="getActiveFunction()" @change="setActiveFunction($event.target.value)">
              <option v-for="option in getFunctionOptions()" :key="option.id" :value="option.id">{{ option.label }}</option>
            </select>
          </label>
          <div class="field">
            <span class="fieldLabel">{{ $t('message.sampler.banks.playOrderTitle') }}</span>
            <div class="segment" role="radiogroup" :aria-label="$t('message.sampler.banks.playOrderTitle')">
              <button v-for="option in getOrderOptions()" :key="option.id" type="button" role="radio"
                      :class="{ on: getActiveOrder() === option.id }" :aria-checked="getActiveOrder() === option.id"
                      @click="setActiveOrder(option.id)">{{ option.label }}
              </button>
            </div>
          </div>
        </div>

        <span class="fieldLabel">{{ $t('message.device.samplesOnPad') }}</span>
        <div class="sampleList">
          <div v-for="(sample, index) in getSamples()" :key="index + sample.name" class="sampleRow"
               :class="{ on: activeSample === index.toString() }" @click="setActiveSample(index.toString())">
            <button type="button" class="iconButton" :aria-label="$t('message.device.playSample', { name: sample.name })"
                    @click.stop="playSample(index)">
              <font-awesome-icon :icon="isPlaying() && activeSample === index.toString() ? 'fa-solid fa-stop' : 'fa-solid fa-play'"/>
            </button>
            <button type="button" class="sampleName" :aria-pressed="activeSample === index.toString()">{{ sample.name }}</button>
            <span v-if="isDuplicate(sample.name)" class="dupe" :title="$t('message.device.duplicateHint')">{{ $t('message.device.duplicate') }}</span>
            <span class="sampleGain">{{ gainOf(sample.name) }}%</span>
            <button type="button" class="iconButton" :aria-label="$t('message.device.removeSample', { name: sample.name })"
                    @click.stop="removeSample(index)">
              <font-awesome-icon icon="fa-solid fa-trash"/>
            </button>
          </div>
          <p v-if="getSamples().length === 0" class="empty">{{ $t('message.device.noSamplesYet') }}</p>
        </div>
        <button ref="add_sample_button" type="button" class="addSample" :disabled="fileImport.busy"
                @click="$refs.add_sample_modal.openModal($refs.sample_selector, $refs.add_sample_button)">
          + {{ $t('message.sampler.samples.addSampleLabel') }}
          <small>{{ $t('message.sampler.orDropFiles') }}</small>
        </button>
        <p v-if="fileImport.busy" class="importLine" role="status">
          {{ $t('message.device.importingSamples', { current: fileImport.done + 1, total: fileImport.total }) }}
          <span>{{ fileImport.current }}</span>
        </p>
        <p v-else-if="fileImport.done > 0" class="importLine" role="status">
          {{ $t('message.device.samplesImported', { count: fileImport.added }) }}
        </p>
        <ul v-if="fileImport.errors.length" class="importErrors" role="alert">
          <li v-for="(error, index) in fileImport.errors" :key="index">{{ error }}</li>
        </ul>

        <!-- Selected sample: waveform with trim handles, and gain -->
        <!-- Always on screen (the visualiser only loads a waveform when the name changes after it's mounted) -->
        <div class="sampleDetail">
          <span class="fieldLabel">{{ getActiveSampleName(activeSample) || $t('message.device.pickSample') }}</span>
          <div class="waveWrap">
            <AudioVisualiser bare
                             :active-bank="activeBank"
                             :active-button="activeButton"
                             :active-sample="parseInt(activeSample)"
                             @deselect-sample="activeSample = '-1'"
                             :gain="getSampleVolume()" @levels="levels = $event" @live="onLive"
                             :sample-name="getActiveSampleName(activeSample)"
            />
          </div>
          <div class="hints">
            <span>{{ $t('message.device.trimHint') }}</span>
            <span><span class="red">{{ $t('message.device.clipRed') }}</span> {{ $t('message.device.clipLegend') }}</span>
          </div>
          <div class="gainRow">
            <label for="sampleGain">{{ $t('message.sampler.samples.gain') }}</label>
            <input id="sampleGain" type="range" min="0" max="200" :value="getSampleVolume()" :disabled="isVolumeDisabled()"
                   @input="setVolume(0, +$event.target.value)" @change="commitValue">
            <span>{{ getSampleVolume() }}%</span>
          </div>
          <p class="gainNote">{{ $t('message.device.gainPerFile') }}</p>

          <!-- Level after gain: average bar, peak tick, and a plain-words verdict -->
          <div class="gainRow">
            <span class="rowLabel">{{ $t('message.device.level') }}</span>
            <div class="meterWrap">
              <div class="meter" role="meter" aria-valuemin="-60" aria-valuemax="0"
                   :aria-valuenow="levelDb('peak') === null ? -60 : Math.max(-60, Math.min(0, levelDb('peak')))"
                   :aria-label="$t('message.device.peak')">
                <div class="zone green"></div>
                <div class="zone yellow"></div>
                <div class="zone red"></div>
                <!-- Playing: a bouncing bar with a falling peak-hold tick. Stopped: average bar and the sample's peak. -->
                <template v-if="live">
                  <div class="liveBar" :style="{ width: meterPos(live.bar) + '%' }"></div>
                  <div class="peakTick" :style="{ left: 'calc(' + meterPos(live.hold) + '% - 1px)' }"></div>
                </template>
                <template v-else>
                  <div v-if="levelDb('rms') !== null" class="average" :style="{ width: meterPos(levelDb('rms')) + '%' }"></div>
                  <div v-if="levelDb('peak') !== null" class="peakTick" :style="{ left: 'calc(' + meterPos(levelDb('peak')) + '% - 1px)' }"></div>
                </template>
              </div>
              <div class="ticks">
                <span v-for="tick in [-60, -30, -18, -6, 0]" :key="tick" :style="{ left: meterPos(tick) + '%' }">{{ tick }}</span>
              </div>
            </div>
            <span></span>
          </div>
          <div v-if="levels" class="verdict">
            <span class="badge" :class="verdict()">{{ $t('message.device.levelVerdict.' + verdict()) }}</span>
            <span>{{ $t('message.device.peak') }} <b>{{ dbText(levelDb('peak')) }}</b></span>
            <span>{{ $t('message.device.average') }} <b>{{ dbText(levelDb('rms')) }}</b></span>
          </div>
        </div>
      </section>
    </div>
  </div>

  <AccessibleModal
      ref="add_sample_modal"
      id="add_sample"
      :show_footer="true"
      @modal-close="stopAudio()"
  >
    <template v-slot:title>
      <span>{{ $t('message.sampler.samples.addSampleLabel') }}</span>
      <button
          class="openButton"
          @click="openSamples"
          :aria-label="$t('message.sampler.samples.accessibilityOpenSamplesDirectory')"
      >
        <font-awesome-icon icon="fa-solid fa-folder"/>
      </button>
    </template>

    <SampleFileSelector ref="sample_selector" max-height="300px" group="add_sample_list" prefix="add_sample_"/>

    <template v-slot:footer>
      <div style="display: flex; flex-direction: row">
        <div style="width: 50%; text-align: left; padding-left: 10px;">
          <ModalButton
              style="width: 50px; padding: 8px 2px"
              ref="err"
              class="modal-default-button"
              :enabled="hasSelectedSample()"
              @click="toggleAudio"
          >
            <font-awesome-icon :icon="getPlaybackButton()"></font-awesome-icon>
          </ModalButton>
        </div>
        <div style="text-align: right; width: 50%">
          <ModalButton
              ref="ok"
              class="modal-default-button"
              :enabled="hasSelectedSample()"
              @click="addSample"
          >{{$t('message.sampler.samples.sampleSelector.addButton')}}
          </ModalButton>
        </div>
      </div>
    </template>
  </AccessibleModal>

  <AccessibleModal
      ref="add_sample_wait"
      id="add_sample_wait"
      :show_footer="false"
      :show_close="false"
      :prevent_esc="true"
  >
    <template v-slot:title>{{$t('message.sampler.samples.addSampleWaitTitle')}}</template>
    <div tabindex="0">
      {{$t('message.sampler.samples.addSampleAnalysing')}}<br/>
      {{$t('message.sampler.samples.addSampleProgress', {progress: sampleProgress})}}
    </div>
  </AccessibleModal>

  <AccessibleModal
      ref="add_sample_error"
      id="add_sample_error"
      :show_footer="true"
      :show_close="true"
      :prevent_esc="false"
      @modal-close="clearErrors()"
  >
    <template v-slot:title>{{$t('message.sampler.samples.errorTitle')}}</template>
    <div tabindex="0">
      {{$t('message.sampler.samples.errorText')}}<br/><br/>
      {{ error }}
    </div>
  </AccessibleModal>
</template>

<script>
import {store} from "@/store";
import AudioVisualiser from "@/components/sections/sampler/AudioVisualiser.vue";
import AccessibleModal from "@/components/design/modal/AccessibleModal.vue";
import ModalButton from "@/components/design/modal/ModalButton.vue";
import {websocket} from "@/util/sockets";
import SampleFileSelector from "@/components/sections/sampler/SampleFileSelector.vue";
import {dragHasFiles, emptyImport, importSampleFiles} from "@/util/sampleImport";

// Top-left pad outline (150 x 90) with a rounded notch cut from the bottom-right corner;
// the other pads mirror it with CSS so the notches meet in the middle
const PAD_PATH = "M 6 0 H 144 A 6 6 0 0 1 150 6 V 64 A 6 6 0 0 1 144 70 H 120 A 6 6 0 0 0 114 76 V 84 " +
    "A 6 6 0 0 1 108 90 H 6 A 6 6 0 0 1 0 84 V 6 A 6 6 0 0 1 6 0 Z";

// Level meter: how fast the bar and the peak tick fall (dB per second), and how long the tick holds
const METER_FALL = 24;
const METER_HOLD_MS = 900;

const PADS = [
  {id: "TopLeft", css: "tl"},
  {id: "TopRight", css: "tr"},
  {id: "BottomLeft", css: "bl"},
  {id: "BottomRight", css: "br"},
];

export default {
  emits: ["on-sample-bank-change"],

  name: "SamplerTab",
  components: {
    SampleFileSelector,
    ModalButton,
    AccessibleModal,
    AudioVisualiser,
  },

  data() {
    return {
      last_error: undefined,

      banks: ["A", "B", "C"],
      pads: PADS,
      padPath: PAD_PATH,
      activeBank: store.hasActiveDevice() ? store.getActiveDevice().sampler.active_bank : "A",
      activeButton: "TopLeft",
      activeSample: "-1",
      levels: null,  // {peak, rms} of the selected sample before gain, from the visualiser
      live: null,    // while playing: {bar, hold, at} in dB after gain

      showAddModal: false,
      waitModal: false,

      fileOver: null,            // pad id or "card" while audio files from the PC are dragged over it
      fileImport: emptyImport(), // progress of dropped files
    };
  },

  methods: {
    device() {
      return store.getActiveDevice();
    },

    isActive(key) {
      return this.device().sampler.active_bank === key;
    },

    /* ---------- Hardware look: soft versions of the real lighting colours ---------- */
    hex(colour) {
      return "#" + colour;
    },
    rgba(colour, alpha) {
      const r = parseInt(colour.substring(0, 2), 16), g = parseInt(colour.substring(2, 4), 16), b = parseInt(colour.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    bankLighting(bank) {
      return this.device().lighting.sampler[`SamplerSelect${bank}`];
    },
    bankStyle(bank) {
      const lighting = this.bankLighting(bank);
      const one = lighting.colours.colour_one, two = lighting.colours.colour_two;
      if (this.activeBank === bank) {
        return {borderColor: this.rgba(one, 0.8), color: this.hex(one), background: this.rgba(one, 0.08)};
      }
      const off = {Colour2: two, DimmedColour2: two}[lighting.off_style] || one;
      return {borderColor: this.rgba(off, 0.3), color: this.rgba(off, 0.55)};
    },
    padPlaying(pad) {
      const button = this.device().sampler.banks[this.activeBank][pad];
      return button.is_playing || button.is_recording;
    },
    // Outline of a pad. Selected = thick bright border on a dark pad; playing = lit (filled) and glowing,
    // so the two never look alike. 'Colour three' is the empty colour; a very dark one is lifted to grey.
    padPaint(pad) {
      const colours = this.bankLighting(this.activeBank).colours;
      const button = this.device().sampler.banks[this.activeBank][pad];
      const width = this.activeButton === pad ? 3 : 1.5;
      if (this.padPlaying(pad)) {
        return {fill: this.rgba(colours.colour_one, 0.28), stroke: this.hex(colours.colour_one), "stroke-width": width};
      }
      if (button.samples.length === 0) {
        const three = colours.colour_three;
        const r = parseInt(three.substring(0, 2), 16), g = parseInt(three.substring(2, 4), 16), b = parseInt(three.substring(4, 6), 16);
        const idle = (r < 125 && r === g && g === b) ? "rgba(125, 125, 125, 0.3)" : this.rgba(three, 0.3);
        return {fill: "#161918", stroke: this.activeButton === pad ? "rgba(170, 178, 175, 0.9)" : idle, "stroke-width": width};
      }
      return {
        fill: "#161918",
        stroke: this.activeButton === pad ? this.hex(colours.colour_one) : this.rgba(colours.colour_one, 0.45),
        "stroke-width": width,
      };
    },
    padName(pad) {
      return this.$t(`message.sampler.banks.buttons.${pad.charAt(0).toLowerCase() + pad.slice(1)}`);
    },
    padTitle() {
      return this.$t('message.device.padTitle', {pad: this.padName(this.activeButton)});
    },
    padSamples(pad) {
      return this.device().sampler.banks[this.activeBank][pad].samples;
    },
    padSummary(pad) {
      const count = this.padSamples(pad).length;
      return count ? this.$tc('message.device.sampleCount', count, {n: count}) : this.$t('message.device.emptyPad');
    },

    getFunctionOptions() {
      return [
        {id: "PlayNext", label: this.$t('message.sampler.banks.functions.playNext')},
        {id: "PlayStop", label: this.$t('message.sampler.banks.functions.playStop')},
        {id: "PlayFade", label: this.$t('message.sampler.banks.functions.playFade')},
        {id: "StopOnRelease", label: this.$t('message.sampler.banks.functions.stopOnRelease')},
        {id: "FadeOnRelease", label: this.$t('message.sampler.banks.functions.fadeOnRelease')},
        {id: "Loop", label: this.$t('message.sampler.banks.functions.loop')},
      ];
    },

    getOrderOptions() {
      return [
        {id: "Sequential", label: this.$t('message.sampler.banks.playOrders.sequential')},
        {id: "Random", label: this.$t('message.sampler.banks.playOrders.random')},
      ];
    },

    openSamples() {
      websocket.open_path("Samples");
    },

    setActiveBank(bank) {
      this.activeBank = bank;
      this.activeSample = "-1";
      if (!this.isActive(bank)) {
        websocket.send_command(store.getActiveSerial(), {"SetActiveSamplerBank": bank});
      }
      this.$emit("on-sample-bank-change", bank);
    },

    setActiveButton(button) {
      this.activeButton = button;
      this.activeSample = "-1";
    },

    getActiveFunction() {
      return this.device().sampler.banks[this.activeBank][this.activeButton].function;
    },
    setActiveFunction(sampleFunction) {
      websocket.send_command(store.getActiveSerial(), {
        SetSamplerFunction: [this.activeBank, this.activeButton, sampleFunction],
      });
    },
    getActiveOrder() {
      return this.device().sampler.banks[this.activeBank][this.activeButton].order;
    },
    setActiveOrder(sampleOrder) {
      websocket.send_command(store.getActiveSerial(), {
        SetSamplerOrder: [this.activeBank, this.activeButton, sampleOrder],
      });
    },

    getSamples() {
      return this.device().sampler.banks[this.activeBank][this.activeButton].samples;
    },

    isPlaying() {
      return this.device().sampler.banks[this.activeBank][this.activeButton].is_playing;
    },
    // Row play button: selects the sample and plays it, or stops the pad if it's already playing
    playSample(index) {
      const playingThis = this.isPlaying() && this.activeSample === index.toString();
      this.activeSample = index.toString();
      if (this.isPlaying()) {
        websocket.send_command(store.getActiveSerial(), {StopSamplePlayback: [this.activeBank, this.activeButton]});
        if (playingThis) return;
      }
      websocket.send_command(store.getActiveSerial(), {PlaySampleByIndex: [this.activeBank, this.activeButton, index]});
    },
    removeSample(index) {
      if (this.activeSample === index.toString()) {
        this.activeSample = "-1";
      } else if (this.activeSample !== "-1" && parseInt(this.activeSample) > index) {
        this.activeSample = (parseInt(this.activeSample) - 1).toString();
      }
      websocket.send_command(store.getActiveSerial(), {RemoveSampleByIndex: [this.activeBank, this.activeButton, index]});
    },
    // Gain is stored per file, so the same file added twice shares one gain
    isDuplicate(name) {
      return this.getSamples().filter(sample => sample.name === name).length > 1;
    },
    gainOf(name) {
      // eslint-disable-next-line no-unused-vars
      for (let [key, sample] of Object.entries(store.getSampleFiles())) {
        if (sample.name === name) {
          return sample.gain_pct;
        }
      }
      return 100;
    },

    /* ---------- Level meter ---------- */
    // dB of the selected sample's peak / rms after the current gain (null when nothing is loaded)
    levelDb(which) {
      if (!this.levels || this.levels[which] <= 0) return null;
      return 20 * Math.log10(this.levels[which] * this.getSampleVolume() / 100);
    },
    // Meter ballistics: the bar jumps up and falls at FALL dB/s; the peak tick holds, then falls
    onLive(level) {
      if (!level) {
        this.live = null;
        return;
      }
      const now = performance.now();
      const db = level.peak > 0 ? 20 * Math.log10(level.peak * this.getSampleVolume() / 100) : -60;
      const last = this.live || {bar: -60, hold: -60, at: now, held: now};
      const elapsed = (now - last.at) / 1000;
      const bar = Math.max(db, last.bar - METER_FALL * elapsed);
      let hold = last.hold, held = last.held;
      if (db >= hold) {
        hold = db;
        held = now;
      } else if (now - held > METER_HOLD_MS) {
        hold = Math.max(bar, hold - METER_FALL * elapsed);
      }
      this.live = {bar: bar, hold: hold, at: now, held: held};
    },
    meterPos(db) {
      return Math.max(0, Math.min(100, (db + 60) / 60 * 100));
    },
    dbText(db) {
      if (db === null || db < -90) return "-∞ dB";
      return (db > 0 ? "+" : "") + db.toFixed(1) + " dB";
    },
    verdict() {
      const peak = this.levelDb("peak"), rms = this.levelDb("rms");
      if (peak !== null && peak > 0) return "clipping";
      if (peak !== null && peak > -1) return "close";
      if (rms === null || rms < -30) return "quiet";
      return "good";
    },

    hasSelectedSample() {
      // This may not have been mounted when this is first called, so fail-safe.
      if (this.$refs.sample_selector === undefined) {
        return false;
      }

      return this.$refs.sample_selector.getSelectedSampleName() !== undefined;
    },

    setActiveSample(id) {
      this.activeSample = id;
    },

    /* ---------- Drop audio files from the PC onto a pad (or the pad card) to add them ---------- */
    fileDragOver(event, where) {
      if (!dragHasFiles(event) || this.fileImport.busy) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "copy";
      this.fileOver = where;
    },
    fileDragLeave(event, where) {
      if (this.fileOver === where && !event.currentTarget.contains(event.relatedTarget)) this.fileOver = null;
    },
    fileDrop(event, where) {
      if (!dragHasFiles(event)) return;
      event.preventDefault();
      event.stopPropagation();
      this.fileOver = null;
      if (this.fileImport.busy) return;
      if (where !== "card") this.setActiveButton(where);
      // The destination is fixed now; changing pad or bank during the upload doesn't move the files
      importSampleFiles(Array.from(event.dataTransfer.files), {
        serial: store.getActiveSerial(), bank: this.activeBank, pad: this.activeButton,
        t: this.$t.bind(this), progress: this.fileImport,
      });
    },

    addSample() {
      let name = this.$refs.sample_selector.getSelectedSampleName();

      // If we're adding a sample, we need to drop the return focus...
      this.$refs.add_sample_modal.returnFocus = undefined;
      this.$refs.add_sample_modal.closeModal();

      websocket.send_command(store.getActiveSerial(), {
        AddSample: [this.activeBank, this.activeButton, name],
      }).catch(error => {
        this.last_error = error.Error;
      });

    },
    getActiveSampleName: function (id) {
      if (id === "-1") {
        return "";
      }

      // If a sample button is cleared, the active sample disappears, we need to return nothing..
      if (this.device().sampler.banks[this.activeBank][this.activeButton].samples[id] === undefined) {
        return "";
      }

      return this.device().sampler.banks[this.activeBank][this.activeButton].samples[id].name;
    },

    stopAudio() {
      this.$refs.sample_selector.stopPlayback();
    },

    toggleAudio() {
      this.$refs.sample_selector.toggleAudio();
    },

    getPlaybackButton() {
      // Again, fail safe..
      if (this.$refs.sample_selector === undefined) {
        return "play";
      }

      if (this.$refs.sample_selector.isAudioPlaying()) {
        return "stop";
      }
      return "play";
    },

    clearErrors() {
      if (this.last_error !== undefined) {
        this.last_error = undefined;
      }

      if (this.device().sampler.processing_state.last_error !== null) {
        websocket.send_command(store.getActiveSerial(), {
          ClearSampleProcessError: []
        });
      }
    },

    getSampleVolume() {
      if (this.activeSample !== "-1") {
        return this.gainOf(this.getActiveSampleName(this.activeSample));
      }
      // Not found, or not selected, either way, hit the default.
      return 100;
    },

    setVolume(id, volume) {
      // Get the Selected Sample Name..
      let sample_name = this.getActiveSampleName(this.activeSample);

      websocket.send_daemon_command({
        "SetSampleGainPct": [sample_name, volume]
      })
    },
    commitValue() {
      websocket.send_daemon_command("ApplySampleChange");
    },

    isVolumeDisabled() {
      if (this.activeSample === '-1') {
        return true;
      }
      return this.isPlaying();
    },
  },

  computed: {
    hasError() {
      if (this.last_error !== undefined) {
        return true;
      }
      return store.getActiveDevice().sampler.processing_state.last_error !== null;
    },

    error() {
      if (this.last_error !== undefined) {
        return this.last_error;
      }
      if (store.getActiveDevice().sampler.processing_state.last_error !== null) {
        return store.getActiveDevice().sampler.processing_state.last_error;
      }

      return this.$t('message.sampler.samples.genericError');
    },

    sampleProgress() {
      return store.getActiveDevice().sampler.processing_state.progress;
    },

    deviceBank() {
      return store.getActiveDevice().sampler.active_bank;
    },
  },

  watch: {
    // Follow bank changes made on the hardware
    deviceBank(bank) {
      if (bank !== this.activeBank) {
        this.activeBank = bank;
        this.activeSample = "-1";
      }
    },

    sampleProgress(newValue, oldValue) {
      // If we're going from null to not null, open the dialog..
      if ((oldValue === null) && (newValue !== null)) {
        // We need to open the Progress Dialog..
        this.$refs.add_sample_wait.openModal(undefined, this.$refs.add_sample_button);
        store.setAccessibilityNotification(
            "polite",
            this.$t('message.sampler.samples.accessibilityAnalysing')
        );
      }

      if (oldValue !== null && newValue !== null && this.$refs.add_sample_wait !== undefined && !this.$refs.add_sample_wait.isOpen()) {
        // User has opened the page while something was processing? Throw open the modal.
        this.$refs.add_sample_wait.openModal(undefined, this.$refs.add_sample_button);
        store.setAccessibilityNotification(
            "polite",
            this.$t('message.sampler.samples.accessibilityAnalysing')
        );
      }

      // If we're going from a Value to null, close the dialog..
      if ((oldValue !== null && newValue == null) && this.$refs.add_sample_wait.isOpen()) {
        this.$refs.add_sample_wait.closeModal();

        store.setAccessibilityNotification(
            "polite",
            this.$t('message.sampler.accessibilityAdded', {
              name: name,
              activeButton: this.activeButton,
              activeBank: this.activeBank
            })
        );
      }
    },

    hasError: {
      handler(newValue) {
        if (this.$refs.add_sample_error === undefined && newValue === true) {
          // We've picked up a cached error of some description, clear it.
          websocket.send_command(store.getActiveSerial(), {
            ClearSampleProcessError: []
          });

          return;
        }
        if (newValue === true) {
          this.$refs.add_sample_error.openModal(undefined, this.$refs.add_sample_button);
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.samplerPage {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 24px 32px;
  color: #e8ecea;
}

.samplerHead h2 {
  margin: 0;
  font-size: 26px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
}

.samplerHead p {
  margin: 6px 0 0;
  font-size: 14px;
  color: #9aa4a0;
}

button {
  font-family: var(--goxlr-font);
  cursor: pointer;
}

button:focus-visible, select:focus-visible, input:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.samplerBody {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

/* ---------- Hardware block ---------- */
.deviceBlock {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 20px 16px;
  border-radius: 14px;
  background: #262a29;
  border: 1px solid #333a38;
}

.banks {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bank {
  width: 46px;
  height: 38px;
  border: 1.5px solid;
  border-radius: 4px;
  background: transparent;
  font-family: var(--goxlr-title-font);
  font-weight: 600;
  font-size: 17px;
}

.pads {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 150px);
  gap: 14px 16px;
}

.pad {
  height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 9px 11px;
  position: relative;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #e8ecea;
  text-align: left;
}

.pad.tr, .pad.br {
  align-items: flex-end;
  text-align: right;
}

.padShape {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.pad.playing .padShape {
  animation: padGlow 0.9s ease-in-out infinite alternate;
}

@keyframes padGlow {
  from { filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.15)); }
  to { filter: drop-shadow(0 0 9px rgba(255, 255, 255, 0.35)); }
}

.pad.tr .padShape { transform: scaleX(-1); }
.pad.bl .padShape { transform: scaleY(-1); }
.pad.br .padShape { transform: scale(-1, -1); }

.padName, .padCount {
  position: relative;
}

.padName {
  max-width: 98px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 12px;
  color: #c3ccc8;
}

.padCount {
  font-size: 11px;
  color: #8e9894;
}

.zoneLabel {
  margin-top: 10px;
  text-align: center;
  font-family: var(--goxlr-title-font);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 11px;
  color: #6d7774;
}

/* ---------- Pad settings card ---------- */
.padCard {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  border-radius: 12px;
  background: #272c2b;
  border: 1px solid #333a38;
}

.cardHead {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
}

.cardHead h3 {
  margin: 0;
  font-size: 17px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
}

.cardHead span {
  font-size: 13px;
  color: #8e9894;
}

.twoCol {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fieldLabel {
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 11px;
  color: #8e9894;
}

select {
  height: 38px;
  padding: 0 10px;
  border: 1px solid #444b49;
  border-radius: 6px;
  background: #363c3a;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 14px;
}

.segment {
  display: flex;
  border: 1px solid #3a413f;
  border-radius: 6px;
  overflow: hidden;
}

.segment button {
  flex: 1 1 0;
  height: 36px;
  border: 0;
  background: #222625;
  color: #8e9894;
  font-size: 13px;
}

.segment button.on {
  background: #1d3a3c;
  color: #bff3f5;
}

.sampleList {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sampleRow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border: 1px solid #333a38;
  border-radius: 8px;
  background: #222625;
  cursor: pointer;
}

.sampleRow.on {
  border-color: #59b1b6;
}

.sampleName {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0;
  border: 0;
  background: transparent;
  color: #e8ecea;
  text-align: left;
  font-size: 14px;
}

.dupe {
  flex: none;
  padding: 2px 8px;
  border-radius: 5px;
  background: #3d3820;
  color: #f1d48a;
  font-size: 11px;
}

.gainNote {
  margin: -4px 0 0 60px;
  font-size: 12px;
  color: #8e9894;
}

.sampleGain {
  font-size: 12px;
  color: #8e9894;
}

.iconButton {
  flex: none;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #3a413f;
  border-radius: 6px;
  background: #2a2f2d;
  color: #c3ccc8;
  font-size: 12px;
}

.iconButton:hover {
  border-color: #6b7572;
}

.empty {
  margin: 0;
  font-size: 13px;
  color: #8e9894;
}

/* Dropping audio files */
.padCard {
  position: relative;
}

.padCard.fileOver {
  outline: 2px dashed #59b1b6;
  outline-offset: -2px;
}

.dropOverlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: inherit;
  background: rgba(29, 58, 60, 0.85);
  color: #bff3f5;
  font-size: 16px;
  pointer-events: none;
}

.pad[data-file-over] {
  outline: 2px dashed #59b1b6;
  outline-offset: 2px;
}

.addSample small {
  margin-left: 8px;
  color: #6d7773;
  font-size: 11px;
}

.importLine {
  margin: 8px 0 0;
  font-size: 12px;
  color: #4fd1a5;
}

.importLine span {
  margin-left: 6px;
  color: #9aa4a0;
}

.importErrors {
  margin: 6px 0 0;
  padding-left: 18px;
  font-size: 12px;
  color: #ff8a8a;
}

.addSample {
  height: 38px;
  border: 1px dashed #4a524f;
  border-radius: 8px;
  background: transparent;
  color: #9aa4a0;
  font-size: 14px;
}

.addSample:hover {
  border-color: #59b1b6;
  color: #e8ecea;
}

.sampleDetail {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px solid #3b413f;
}

.waveWrap {
  max-width: 100%;
  overflow-x: auto;
}

.hints {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: #8e9894;
}

.hints .red {
  color: #e0605f;
}

.rowLabel {
  width: 48px;
  color: #c3ccc8;
}

.meterWrap {
  flex: 1 1 auto;
  position: relative;
  padding-bottom: 16px;
}

.meter {
  position: relative;
  height: 14px;
  border-radius: 4px;
  background: #161918;
  overflow: hidden;
}

.zone {
  position: absolute;
  top: 0;
  bottom: 0;
}

.zone.green {
  left: 0;
  width: 70%;
  background: #1f3b2c;
}

.zone.yellow {
  left: 70%;
  width: 20%;
  background: #3d3820;
}

.zone.red {
  left: 90%;
  width: 10%;
  background: #45201f;
}

.average {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  background: #59b1b6;
  opacity: 0.55;
}

.liveBar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  background: #59b1b6;
  opacity: 0.85;
}

.peakTick {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #e8ecea;
}

.ticks span {
  position: absolute;
  top: 17px;
  transform: translateX(-50%);
  font-size: 10px;
  color: #6d7774;
}

.verdict {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: #8e9894;
}

.verdict b {
  font-weight: 400;
  color: #e8ecea;
}

.badge {
  padding: 3px 10px;
  border-radius: 6px;
}

.badge.good {
  background: #1f3b2c;
  color: #9fe1cb;
}

.badge.close {
  background: #3d3820;
  color: #f1d48a;
}

.badge.clipping {
  background: #45201f;
  color: #ff9d9b;
}

.badge.quiet {
  background: #2a2f2d;
  color: #c3ccc8;
}

.gainRow {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.gainRow label {
  width: 48px;
  color: #c3ccc8;
}

.gainRow input {
  flex: 1 1 auto;
  accent-color: #59b1b6;
}

.gainRow span {
  width: 48px;
  text-align: right;
  color: #59b1b6;
}

.openButton {
  display: inline-block;
  margin-left: 5px;
  padding: 0;
  border: 0;
  background-color: transparent;
  color: #a5a7a6;
  font-size: 14px;
}

.openButton:hover {
  color: #fff;
}
</style>
