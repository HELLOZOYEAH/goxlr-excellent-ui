<template>
  <div class="routingPage">
    <div class="pageHead">
      <div class="pageTitle">
        <h2>{{ $t('message.routing.title') }}</h2>
        <p>{{ $t('message.routing.pageHint') }}</p>
      </div>
      <button v-if="submixSupported()" type="button" class="submixToggle" :aria-pressed="submixEnabled()" @click="toggleSubmix">
        <span class="switch" :class="{ on: submixEnabled() }"><span></span></span>
        <span>{{ $t('message.device.mixBToggle') }}<small>{{ $t('message.routing.mixBSameSwitch') }}</small></span>
      </button>
    </div>

    <div class="layout">
      <section class="card" :aria-label="$t('message.routing.whoHearsWhat')">
        <div class="cardHead">
          <h3>{{ $t('message.routing.whoHearsWhat') }}</h3>
          <span class="help" :title="$t('message.routing.gridHelp')">?</span>
          <span class="sub">{{ $t('message.routing.hoverHint') }}</span>
        </div>
        <div class="cardBody">
          <div v-if="monitor() !== 'Headphones'" class="listenBar">
            <font-awesome-icon icon="fa-solid fa-headphones"/>
            <p>{{ $t('message.routing.listenBanner', { name: outputName(monitor()) }) }}</p>
            <button type="button" @click="setMonitor('Headphones')">{{ $t('message.routing.listenBack') }}</button>
          </div>

          <div class="scroll">
            <table :aria-label="$t('message.routing.whoHearsWhat')" @mouseleave="hot = null">
              <tr class="groupHead">
                <th></th>
                <th :colspan="inputs.length">{{ $t('message.routing.soundsInputs') }}</th>
              </tr>
              <tr class="inHead">
                <th class="goesTo"><span class="nm">{{ $t('message.routing.goesToOutputs') }}</span></th>
                <th v-for="input in inputs" :key="input" :class="{ hot: hot && hot.input === input }">
                  <span class="ic"><font-awesome-icon :icon="inputIcons[input]"/></span>
                  <span class="nm">{{ inputName(input) }}</span>
                  <span class="what">{{ $t(`message.routing.inputWhat.${input}`) }}</span>
                </th>
              </tr>
              <template v-for="output in outputChannels" :key="output">
                <template v-if="output === 'Sampler'">
                  <tr class="gap"><td :colspan="inputs.length + 1"></td></tr>
                  <tr class="recLabel"><th :colspan="inputs.length + 1">{{ $t('message.routing.recording') }}</th></tr>
                </template>
                <tr :class="{ dimmed: isPaused(output) }">
                  <th class="outCell">
                    <div class="out" :class="{ hot: hot && hot.output === output }">
                      <span class="oic"><font-awesome-icon :icon="outputIcons[output]"/></span>
                      <span class="txt">
                        <span class="nm">{{ outputName(output) }}<span v-if="isPaused(output)" class="paused">{{ $t('message.routing.paused') }}</span></span>
                        <span class="what">{{ $t(`message.routing.outputWhat.${output}`) }}</span>
                      </span>
                      <button v-if="submixSupported()" type="button" class="listen" :class="{ on: monitor() === output }"
                              :aria-pressed="monitor() === output"
                              :title="monitor() === output ? $t('message.routing.listenOn') : $t('message.routing.listenTo', { name: outputName(output) })"
                              :aria-label="$t('message.routing.listenTo', { name: outputName(output) })"
                              @click="setMonitor(output)">
                        <font-awesome-icon icon="fa-solid fa-headphones"/>
                      </button>
                      <span v-if="hasMixChoice(output)" class="ab" role="radiogroup"
                            :aria-label="$t('message.routing.volumeSet', { name: outputName(output) })">
                        <button v-for="mix in ['A', 'B']" :key="mix" type="button" role="radio"
                                :class="[mix.toLowerCase(), { on: outputMix(output) === mix }]"
                                :aria-checked="outputMix(output) === mix"
                                :title="$t('message.routing.useMix', { mix })"
                                @click="setOutputMix(output, mix)">{{ mix }}</button>
                      </span>
                    </div>
                  </th>
                  <td v-for="input in inputs" :key="input" class="cell">
                    <button type="button" class="route"
                            :class="{
                              on: isRouted(output, input),
                              stream: output === 'BroadcastMix',
                              blocked: !canRoute(output, input),
                              colHot: hot && hot.input === input,
                              rowHot: hot && hot.output === output,
                            }"
                            :aria-pressed="isRouted(output, input)" :aria-disabled="!canRoute(output, input)"
                            :aria-label="inputName(input) + ' → ' + outputName(output)"
                            @mouseenter="hot = { output, input }" @focus="hot = { output, input }"
                            @click="toggleRoute(output, input)">
                      <font-awesome-icon :icon="canRoute(output, input) ? 'fa-solid fa-check' : 'fa-solid fa-lock'"/>
                    </button>
                  </td>
                </tr>
              </template>
            </table>
          </div>

          <div class="explain" aria-live="polite">
            <template v-if="!hot">
              <span class="pill off">{{ $t('message.routing.tip') }}</span>
              <p>{{ $t('message.routing.tipText') }}</p>
            </template>
            <template v-else-if="!canRoute(hot.output, hot.input)">
              <span class="pill lock"><font-awesome-icon icon="fa-solid fa-lock"/> {{ $t('message.routing.locked') }}</span>
              <span class="path">{{ inputName(hot.input) }} → {{ outputName(hot.output) }}</span>
              <p>{{ $t('message.routing.lockedText') }}</p>
            </template>
            <template v-else>
              <span class="pill" :class="isRouted(hot.output, hot.input) ? 'on' : 'off'">
                {{ isRouted(hot.output, hot.input) ? $t('message.routing.on') : $t('message.routing.off') }}
              </span>
              <span class="path">{{ inputName(hot.input) }} → {{ outputName(hot.output) }}</span>
              <p>{{ explainText() }}</p>
            </template>
          </div>

          <div class="legend">
            <span><i class="sw"></i>{{ $t('message.routing.legendOn') }}</span>
            <span><i class="sw stream"></i>{{ $t('message.routing.legendStream') }}</span>
            <span><i class="sw x"></i>{{ $t('message.routing.legendLocked') }}</span>
            <span v-if="submixSupported()"><font-awesome-icon icon="fa-solid fa-headphones"/> {{ $t('message.routing.legendListen') }}</span>
            <span v-if="submixEnabled()">{{ $t('message.routing.legendMixOn') }}</span>
            <span v-else-if="submixSupported()">{{ $t('message.routing.legendMixOff') }}</span>
          </div>
        </div>
      </section>

      <section class="card" :aria-label="$t('message.routing.plainWords')">
        <div class="cardHead">
          <h3>{{ $t('message.routing.plainWords') }}</h3>
          <span class="sub">{{ $t('message.routing.plainWordsSub') }}</span>
        </div>
        <div class="sumList">
          <div v-for="output in outputChannels" :key="output" class="sumRow">
            <div class="sumTop">
              <span class="oic"><font-awesome-icon :icon="outputIcons[output]"/></span>
              <b>{{ outputName(output) }}</b>
              <span v-if="hasMixChoice(output)" class="mixTag" :class="outputMix(output).toLowerCase()"
                    :title="$t('message.routing.useMix', { mix: outputMix(output) })">{{ outputMix(output) }}</span>
            </div>
            <p class="hears">{{ $t(`message.routing.outputWho.${output}`) }}: {{ heard(output, true) || $t('message.routing.nothing') }}</p>
            <p v-if="heard(output, false)" class="not">{{ $t('message.routing.notList', { list: heard(output, false) }) }}</p>
            <p v-if="monitor() === output && output !== 'Headphones'" class="listening">
              <font-awesome-icon icon="fa-solid fa-headphones"/> {{ $t('message.routing.playingNow') }}
            </p>
            <p v-if="isPaused(output)" class="not">{{ $t('message.routing.pausedWhile', { name: outputName(monitor()) }) }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { store } from "@/store";
import { InputRouting, OutputRouting } from "@/util/mixerMapping";
import { websocket } from "@/util/sockets";
import { driverMix2, driverVOD, firmwareSupportsMix2, isDeviceMini, isStreamNoMusic, isWindowsDriver } from "@/util/util";

const INPUT_ICONS = {
  Microphone: "fa-solid fa-microphone", Chat: "fa-solid fa-comments", Music: "fa-solid fa-music",
  Game: "fa-solid fa-gamepad", Console: "fa-solid fa-tv", LineIn: "fa-solid fa-right-to-bracket",
  System: "fa-solid fa-desktop", Samples: "fa-solid fa-wave-square",
};

const OUTPUT_ICONS = {
  Headphones: "fa-solid fa-headphones", BroadcastMix: "fa-solid fa-tower-broadcast",
  StreamMix2: "fa-solid fa-tower-broadcast", LineOut: "fa-solid fa-right-from-bracket",
  ChatMic: "fa-solid fa-comment-dots", Sampler: "fa-solid fa-circle-dot",
};

// Official app order: the places you listen or stream first, the Sampler (a recorder) last
const OUTPUT_ORDER = ["Headphones", "BroadcastMix", "StreamMix2", "LineOut", "ChatMic", "Sampler"];

export default {
  name: "RoutingTable",

  data() {
    return {
      inputs: InputRouting,
      inputIcons: INPUT_ICONS,
      outputIcons: OUTPUT_ICONS,
      // The box under the mouse (or keyboard focus), for the explain line
      hot: null,
    }
  },

  methods: {
    device() {
      return store.getActiveDevice();
    },
    serial() {
      return store.getActiveSerial();
    },

    inputName(input) {
      if (input === "Microphone") {
        return this.$t('message.routing.micShort');
      }
      return this.$t(`message.routing.inputs["${input}"]`);
    },
    outputName(output) {
      if (output === "BroadcastMix") {
        if (firmwareSupportsMix2() && !(isWindowsDriver() && !driverMix2())) {
          return this.$t('message.routing.broadcast1');
        }
        return this.$t('message.routing.broadcast');
      }
      if (output === "StreamMix2" && isWindowsDriver() && driverVOD()) {
        return this.$t('message.routing.outputs.VOD');
      }
      return this.$t(`message.routing.outputs['${output}']`);
    },

    canRoute(output, input) {
      return !(output === "ChatMic" && input === "Chat");
    },
    isRouted(output, input) {
      return this.canRoute(output, input) && this.device().router[input][output];
    },
    toggleRoute(output, input) {
      if (!this.canRoute(output, input)) {
        return;
      }
      websocket.send_command(this.serial(), {"SetRouter": [input, output, !this.device().router[input][output]]});
    },
    // Sound names this output gets (or doesn't), joined for the summary card
    heard(output, routed) {
      return this.inputs
        .filter(input => this.canRoute(output, input) && this.isRouted(output, input) === routed)
        .map(input => this.inputName(input))
        .join(", ");
    },
    explainText() {
      const { output, input } = this.hot;
      const key = this.isRouted(output, input) ? 'outputWho' : 'outputWhoNot';
      const sound = input === "Microphone" ? this.$t('message.routing.yourMic') : this.inputName(input);
      let text = this.$t('message.routing.sentence', { who: this.$t(`message.routing.${key}.${output}`), sound });
      if (this.isPaused(output)) {
        text += " " + this.$t('message.routing.pausedNote', { name: this.outputName(this.monitor()) });
      } else if (this.monitor() === output && output !== "Headphones") {
        text += " " + this.$t('message.routing.listeningNote');
      }
      return text;
    },

    // Mix B (submix) and listening
    submixSupported() {
      return this.device().levels.submix_supported;
    },
    submixEnabled() {
      return this.submixSupported() && this.device().levels.submix !== null;
    },
    toggleSubmix() {
      websocket.send_command(this.serial(), {"SetSubMixEnabled": !this.submixEnabled()});
    },
    hasMixChoice(output) {
      return this.submixEnabled() && output in this.device().levels.submix.outputs;
    },
    outputMix(output) {
      return this.device().levels.submix.outputs[output];
    },
    setOutputMix(output, mix) {
      websocket.send_command(this.serial(), {"SetSubMixOutputMix": [output, mix]});
    },
    monitor() {
      return this.device().levels.output_monitor;
    },
    setMonitor(output) {
      websocket.send_command(this.serial(), {"SetMonitorMix": output});
    },
    // While the headphones play another output, the Headphones row is stored but not heard
    isPaused(output) {
      return output === "Headphones" && this.monitor() !== "Headphones";
    },
  },

  computed: {
    outputChannels() {
      let outputList = OUTPUT_ORDER.filter(o => OutputRouting.includes(o));

      if (isDeviceMini()) {
        // On the Mini, Mix2 firmware swaps the Sampler output for Stream Mix 2
        if (!firmwareSupportsMix2()) {
          outputList = outputList.filter(i => i !== "StreamMix2");
        } else {
          outputList = outputList.filter(i => i !== "Sampler");
        }
      } else if (!firmwareSupportsMix2()) {
        outputList = outputList.filter(i => i !== "StreamMix2");
      }

      if (isStreamNoMusic()) {
        outputList = outputList.filter(i => {
          if (isDeviceMini()) {
            return (i !== "StreamMix2" && i !== "Sampler");
          }
          return (i !== "StreamMix2");
        });
      }

      return outputList;
    }
  }
}
</script>

<style scoped>
.routingPage {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px 32px;
  color: #e8ecea;
  font-family: var(--goxlr-font);
}

button {
  font-family: var(--goxlr-font);
  cursor: pointer;
  color: inherit;
}

button:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

/* ---------- Page head ---------- */
.pageHead {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 16px;
}

.pageTitle {
  flex: 1 1 320px;
}

.pageTitle h2 {
  margin: 0;
  font-size: 26px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
}

.pageTitle p {
  margin: 6px 0 0;
  max-width: 62ch;
  font-size: 14px;
  color: #9aa4a0;
}

.submixToggle {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid #3a413f;
  border-radius: 8px;
  background: #2a2f2d;
  font-size: 14px;
}

.submixToggle[aria-pressed=true] {
  border-color: #59b1b6;
  background: #1d3a3c;
}

.submixToggle small {
  display: block;
  text-align: left;
  font-size: 11px;
  color: #9aa4a0;
}

.switch {
  position: relative;
  display: inline-block;
  flex: none;
  width: 34px;
  height: 20px;
  border-radius: 10px;
  background: #4a524f;
}

.switch span {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.15s;
}

.switch.on {
  background: #59b1b6;
}

.switch.on span {
  left: 16px;
}

/* ---------- Cards ---------- */
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 16px;
  align-items: start;
}

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

.card {
  box-sizing: border-box;
  min-width: 0;
  border-radius: 12px;
  background: #2d3230;
  border: 1px solid #343a38;
}

.cardHead {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  min-height: 66px;
  box-sizing: border-box;
  padding: 12px 16px 12px 20px;
  border-bottom: 1px solid #3b413f;
  border-radius: 12px 12px 0 0;
  background: #313735;
}

.cardHead h3 {
  margin: 0;
  font-size: 18px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
}

.sub {
  font-size: 13px;
  color: #9aa4a0;
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

.cardBody {
  padding: 16px 20px 20px;
}

/* ---------- Listen banner ---------- */
.listenBar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding: 10px 14px;
  border: 1px solid #59b1b6;
  border-radius: 8px;
  background: #1d3a3c;
  color: #bff3f5;
}

.listenBar > svg {
  font-size: 18px;
}

.listenBar p {
  flex: 1 1 260px;
  margin: 0;
}

.listenBar button {
  padding: 6px 12px;
  border: 1px solid #59b1b6;
  border-radius: 6px;
  background: transparent;
  color: #bff3f5;
}

/* ---------- Grid ---------- */
.scroll {
  overflow-x: auto;
}

table {
  min-width: 860px;
  border-collapse: separate;
  border-spacing: 4px;
}

th {
  font-weight: normal;
}

.groupHead th {
  padding: 6px;
  border-radius: 6px;
  background: #353937;
  font-family: var(--goxlr-title-font);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  color: #9aa4a0;
}

.groupHead th:first-child {
  background: transparent;
}

.inHead th {
  width: 74px;
  padding: 8px 4px 6px;
  border-radius: 6px;
  vertical-align: bottom;
}

.inHead th.goesTo {
  width: auto;
  padding-left: 4px;
  text-align: left;
}

.inHead th.goesTo .nm {
  font-size: 11px;
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  color: #9aa4a0;
}

.inHead .ic {
  display: block;
  margin-bottom: 4px;
  font-size: 16px;
  color: #9aa4a0;
}

.inHead .nm {
  display: block;
  font-size: 13px;
}

.inHead .what {
  display: block;
  margin-top: 2px;
  font-size: 10.5px;
  line-height: 1.2;
  color: #5f6866;
}

.inHead th.hot {
  background: #2a302e;
}

.inHead th.hot .ic {
  color: #59b1b6;
}

.outCell {
  padding: 0;
}

.out {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 290px;
  min-height: 52px;
  box-sizing: border-box;
  padding: 6px 8px 6px 12px;
  border: 1px solid #3a413f;
  border-radius: 8px;
  background: #2a2f2d;
  text-align: left;
}

.out.hot {
  border-color: #6b7572;
}

.out .oic {
  width: 22px;
  text-align: center;
  font-size: 16px;
  color: #9aa4a0;
}

.out .txt {
  flex: 1;
  min-width: 0;
}

.out .nm {
  display: block;
  font-size: 14px;
}

.out .what {
  display: block;
  margin-top: 1px;
  font-size: 11px;
  color: #9aa4a0;
}

.out .paused {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  background: #3a403e;
  color: #9aa4a0;
  font-size: 10px;
  vertical-align: 1px;
}

.listen {
  width: 32px;
  height: 30px;
  padding: 0;
  border: 1px solid #3a413f;
  border-radius: 6px;
  background: #222625;
  color: #5f6866;
  font-size: 14px;
}

.listen:hover {
  border-color: #6b7572;
  color: #9aa4a0;
}

.listen.on {
  border-color: #59b1b6;
  background: #1d3a3c;
  color: #59b1b6;
}

.ab {
  display: flex;
  overflow: hidden;
  border: 1px solid #3a413f;
  border-radius: 6px;
}

.ab button {
  width: 26px;
  height: 28px;
  padding: 0;
  border: 0;
  background: #222625;
  color: #5f6866;
  font-size: 12px;
  font-weight: 700;
}

.ab button.a.on {
  background: #59b1b6;
  color: #1d2120;
}

.ab button.b.on {
  background: #cc7224;
  color: #1d2120;
}

.cell {
  padding: 0;
}

.route {
  width: 100%;
  height: 52px;
  padding: 0;
  border: 1px solid #3a413f;
  border-radius: 6px;
  background: #222625;
  color: transparent;
  font-size: 15px;
}

.route:hover:not(.blocked) {
  border-color: #6b7572;
  color: #4a5351;
}

.route.stream:hover:not(.blocked):not(.on) {
  color: #5a4530;
}

.route.on {
  border-color: #59b1b6;
  background: #1d3a3c;
  color: #59b1b6;
}

.route.on.stream {
  border-color: #cc7224;
  background: #3d2a17;
  color: #cc7224;
}

.route.blocked {
  opacity: 0.35;
  cursor: not-allowed;
  color: #5f6866;
  background: repeating-linear-gradient(135deg, transparent 0 6px, #2a2f2d 6px 12px);
}

.route.colHot:not(.on), .route.rowHot:not(.on) {
  background: #262b29;
}

tr.dimmed .route {
  opacity: 0.45;
}

.gap td {
  height: 10px;
  padding: 0;
}

.recLabel th {
  padding: 2px 4px;
  text-align: left;
  font-size: 11px;
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  color: #5f6866;
}

/* ---------- Explain line ---------- */
.explain {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  box-sizing: border-box;
  margin-top: 12px;
  padding: 10px 14px;
  border: 1px solid #343a38;
  border-radius: 8px;
  background: #262b29;
}

.explain p {
  margin: 0;
}

.explain .path {
  white-space: nowrap;
  color: #9aa4a0;
}

.pill {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  white-space: nowrap;
}

.pill.on {
  background: #1d3a3c;
  color: #bff3f5;
}

.pill.off {
  background: #3a403e;
  color: #9aa4a0;
}

.pill.lock {
  background: #3a2626;
  color: #f0a8a8;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  margin-top: 12px;
  font-size: 12px;
  color: #9aa4a0;
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend .sw {
  display: inline-block;
  width: 14px;
  height: 14px;
  box-sizing: border-box;
  border: 1px solid #59b1b6;
  border-radius: 3px;
  background: #1d3a3c;
}

.legend .sw.stream {
  border-color: #cc7224;
  background: #3d2a17;
}

.legend .sw.x {
  border-color: #3a413f;
  background: repeating-linear-gradient(135deg, #222625 0 3px, #2a2f2d 3px 6px);
}

/* ---------- In plain words ---------- */
.sumList {
  display: flex;
  flex-direction: column;
}

.sumRow {
  padding: 12px 18px;
  border-bottom: 1px solid #343a38;
}

.sumRow:last-child {
  border-bottom: 0;
}

.sumTop {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sumTop .oic {
  width: 18px;
  text-align: center;
  color: #9aa4a0;
}

.sumTop b {
  flex: 1;
  font-weight: 400;
  font-size: 14px;
}

.mixTag {
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #1d2120;
}

.mixTag.a {
  background: #59b1b6;
}

.mixTag.b {
  background: #cc7224;
}

.sumRow p {
  margin: 6px 0 0;
  font-size: 12.5px;
  line-height: 1.45;
}

.sumRow .not {
  color: #5f6866;
}

.sumRow .listening {
  font-size: 11.5px;
  color: #59b1b6;
}

@media (prefers-reduced-motion: reduce) {
  .switch span {
    transition: none;
  }
}
</style>
