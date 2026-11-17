<template>
  <div ref="page" class="configPage">
    <section ref="body" class="body" :style="{ zoom: fit }" :aria-label="$t('message.navigation.configuration')">
      <!-- The four faders, drawn exactly like the Device page (just bigger), with their settings underneath -->
      <template v-for="(fader, i) in faders" :key="fader">
          <div class="hw" :style="{ gridColumn: i + 1, gridRow: 1 }">
            <!-- The screen opens its own editor: icon, text, number, invert, backlight -->
            <button v-if="!isMini" type="button" class="screen" :class="{ editing: editing === fader }"
                    :style="screenStyle(fader)" :title="$t('message.device.editScreen')"
                    :aria-label="$t('message.device.editScreen')" :aria-expanded="editing === fader"
                    @click="toggleEditor(fader)">
              <ScribbleScreen :src="scribbleUrl(fader)"/>
              <span class="pen"><font-awesome-icon icon="fa-solid fa-pen"/></span>
            </button>
            <div v-else class="screen" :style="screenStyle(fader)">
              <span>{{ $t(`message.channels.${channel(fader)}`) }}</span>
            </div>

            <div v-if="editing === fader" class="screenEditor" :class="i < 2 ? 'alignLeft' : 'alignRight'"
                 role="dialog" :aria-label="$t('message.lighting.mixer.screen.title')">
              <div class="editorHead">
                <span>{{ $t('message.lighting.mixer.screen.title') }} · {{ $t('message.device.kinds.fader', { n: i + 1 }) }}</span>
                <button type="button" class="editorClose" :aria-label="$t('message.device.closeSettings')" @click="editing = null">
                  <font-awesome-icon icon="fa-solid fa-xmark"/>
                </button>
              </div>

              <label class="lab" :for="`scribble-icon-${fader}`">{{ $t('message.lighting.mixer.screen.icons') }}</label>
              <div class="iconRow">
                <select :id="`scribble-icon-${fader}`" :value="status(fader).scribble.file_name || ''"
                        @change="setIcon(fader, $event.target.value || null)">
                  <option value="">{{ $t('message.lighting.mixer.screen.iconNone') }}</option>
                  <option v-for="icon in iconFiles()" :key="icon" :value="icon">{{ icon }}</option>
                </select>
                <button type="button" class="iconFolder" :title="$t('message.device.openIcons')"
                        :aria-label="$t('message.device.openIcons')" @click="openIcons">
                  <font-awesome-icon icon="fa-solid fa-folder"/>
                </button>
              </div>

              <label class="lab" :for="`scribble-text-${fader}`">{{ $t('message.lighting.mixer.screen.options.text') }}</label>
              <input :id="`scribble-text-${fader}`" type="text" maxlength="32" :value="status(fader).scribble.bottom_text || ''"
                     @change="setText(fader, $event.target.value)" @keydown.enter="$event.target.blur()">

              <label class="check"><input type="checkbox" :checked="status(fader).scribble.left_text !== null"
                                          @change="setNumber(fader, $event.target.checked, i)">
                {{ $t('message.lighting.mixer.screen.options.showNumber') }}</label>
              <!-- The screen has one colour (the backlight): text is either dark on it, or lit in it on black -->
              <span class="lab">{{ $t('message.device.textColour') }}</span>
              <div class="textColour" role="radiogroup" :aria-label="$t('message.device.textColour')">
                <button type="button" role="radio" :aria-checked="!status(fader).scribble.inverted"
                        :class="{ on: !status(fader).scribble.inverted }" @click="setInvert(fader, false)">
                  <span class="sample dark" :style="{ background: '#' + device().lighting.simple[scribbleNames[fader]].colour_one }">Aa</span>
                  {{ $t('message.device.textDark') }}
                </button>
                <button type="button" role="radio" :aria-checked="status(fader).scribble.inverted"
                        :class="{ on: status(fader).scribble.inverted }" @click="setInvert(fader, true)">
                  <span class="sample light" :style="{ color: '#' + device().lighting.simple[scribbleNames[fader]].colour_one }">Aa</span>
                  {{ $t('message.device.textLight') }}
                </button>
              </div>
              <ColourSwatch :id="'cfg-backlight-' + fader" variant="inline" :value="device().lighting.simple[scribbleNames[fader]].colour_one"
                            :label="$t('message.lighting.mixer.screen.backgroundColour')" @change="setBacklight(fader, '#' + $event)"/>
            </div>

            <div class="faderTrack" role="slider" tabindex="0"
                 :aria-label="$t(`message.channels.${channel(fader)}`)" aria-valuemin="0" aria-valuemax="100"
                 :aria-valuenow="volumePercent(fader)"
                 @pointerdown="faderDown($event, fader)" @pointermove="faderMove($event, fader)"
                 @pointerup="faderUp($event)" @pointercancel="faderUp($event)" @lostpointercapture="faderUp($event)"
                 @keydown="faderKey($event, fader)">
              <div class="leds left">
                <span v-for="n in ledCount" :key="n" :style="{ background: ledColour(fader, n - 1) }"></span>
              </div>
              <div class="leds right">
                <span v-for="n in ledCount" :key="n" :style="{ background: ledColour(fader, n - 1) }"></span>
              </div>
              <div class="rail"></div>
              <div class="cap" :style="{ bottom: capBottom(fader) + 'px' }"><span></span></div>
            </div>

            <span class="percent">{{ volumePercent(fader) }}%</span>

            <button type="button" class="mute" :class="{ blink: status(fader).mute_state === 'MutedToAll' }"
                    :style="muteStyle(fader)" :aria-pressed="status(fader).mute_state !== 'Unmuted'"
                    :aria-label="$t('message.device.muteChannel', { channel: $t(`message.channels.${channel(fader)}`) })"
                    @click="toggleMute(fader)">
              <font-awesome-icon icon="fa-solid fa-volume-xmark"/>
            </button>
          </div>

          <div class="settings" :style="{ gridColumn: i + 1, gridRow: 2 }">
            <label class="lab" :for="`config-channel-${fader}`">{{ $t('message.device.kinds.fader', { n: i + 1 }) }}</label>
            <select :id="`config-channel-${fader}`" :ref="`channel-${fader}`" :value="channel(fader)"
                    @change="setChannel(fader, $event.target.value)">
              <option v-for="id in channels" :key="id" :value="id">{{ $t(`message.channels.${id}`) }}</option>
            </select>

            <label class="lab" :for="`config-mute-${fader}`">{{ $t('message.device.muteTo') }}</label>
            <select :id="`config-mute-${fader}`" :value="muteType(fader)" @change="setMuteFunction(fader, $event.target.value)">
              <option v-for="option in muteOptions(channel(fader))" :key="option.id" :value="option.id"
                      :disabled="option.disabled">{{ option.label }}</option>
            </select>
          </div>
      </template>

      <div class="divider"></div>

      <!-- Mic mute (cough) button: settings on top, the buttons at the bottom right like the hardware -->
      <div class="coughColumn">
        <div class="settings">
          <span class="lab">{{ $t('message.device.micMuteButton') }}</span>
          <div class="segment" role="radiogroup" :aria-label="$t('message.device.whenPressed')">
            <button type="button" role="radio" :aria-checked="!coughToggle()" :class="{ on: !coughToggle() }"
                    @click="setCoughHold(true)">{{ $t('message.configuration.cough.behaviour.hold') }}
            </button>
            <button type="button" role="radio" :aria-checked="coughToggle()" :class="{ on: coughToggle() }"
                    @click="setCoughHold(false)">{{ $t('message.configuration.cough.behaviour.toggle') }}
            </button>
          </div>

          <label class="lab" for="config-cough-mute">{{ $t('message.device.mutesMicTo') }}</label>
          <select id="config-cough-mute" :value="device().cough_button.mute_type"
                  @change="setCoughMuteFunction($event.target.value)">
            <option v-for="option in muteOptions(null)" :key="option.id" :value="option.id">{{ option.label }}</option>
          </select>
        </div>

        <div class="hw">
          <div class="bleep" :style="bleepStyle()" aria-hidden="true">!@#$?*</div>
          <div class="cough" :style="coughStyle()" aria-hidden="true">
            <span><font-awesome-icon icon="fa-solid fa-microphone-slash"/></span>
          </div>
        </div>
      </div>
    </section>

    <p class="hint">{{ $t('message.device.configHint') }}</p>
  </div>
</template>

<script>
import {store} from "@/store";
import ScribbleScreen from "@/components/design/ScribbleScreen.vue";
import ColourSwatch from "@/components/sections/lighting/elements/ColourSwatch.vue";
import {getBaseHTTPAddress, websocket} from "@/util/sockets";
import {assignFaderChannel} from "@/util/faderChannel";
import {MuteButtonNamesForFader, ScribbleNames} from "@/util/mixerMapping";
import {
  driverMix2,
  driverPreVOD,
  driverVOD,
  firmwareSupportsMix2,
  isDeviceMini,
  isStreamNoMusic,
  isWindowsDriver
} from "@/util/util";

const CHANNELS = ["Mic", "Chat", "Music", "Game", "Console", "LineIn", "System", "Sample", "Headphones", "LineOut"];
// Same geometry as the Device page's faders, so the zoom lands on an identical picture
const LED_COUNT = 15;
const TRACK_HEIGHT = 262;
const CAP_HEIGHT = 58;

// The Configuration page: what each hardware fader controls, what its mute button does,
// and how the mic mute (cough) button behaves. Drawn like the device so the zoom from the
// Device page lands on the same layout.
// How far the device may grow or shrink to fit the page, and the room kept around it
const MAX_FIT = 1.7;
const MIN_FIT = 0.6;
const FIT_GUTTER = 40;
const FIT_BELOW = 70;

export default {
  name: "ConfigurationTab",
  components: {ColourSwatch, ScribbleScreen},

  data() {
    return {
      faders: ["A", "B", "C", "D"],
      channels: CHANNELS,
      ledCount: LED_COUNT,
      scribbleNames: ScribbleNames,
      drag: null,
      editing: null,   // fader whose screen editor is open
      fit: 1,          // the device grows to fill the page (and shrinks for small windows)
      fitObserver: null,
    }
  },

  mounted() {
    window.addEventListener("pointerdown", this.editorOutside, true);
    window.addEventListener("keydown", this.editorKey);
    this.fitObserver = new ResizeObserver(this.refit);
    this.fitObserver.observe(this.$refs.page);
    window.addEventListener("resize", this.refit);
    this.refit();
  },

  beforeUnmount() {
    if (this.fitObserver) this.fitObserver.disconnect();
    window.removeEventListener("resize", this.refit);
    window.removeEventListener("pointerdown", this.editorOutside, true);
    window.removeEventListener("keydown", this.editorKey);
  },

  computed: {
    isMini() {
      return isDeviceMini();
    },
  },

  methods: {
    // As big as the page allows: the full width, and the window's height under the header
    refit() {
      const page = this.$refs.page, body = this.$refs.body;
      if (!page || !body) return;
      const box = body.getBoundingClientRect();
      if (!box.width) return;
      const width = box.width / this.fit, height = box.height / this.fit;
      const roomWide = page.clientWidth - FIT_GUTTER;
      const roomHigh = window.innerHeight - page.getBoundingClientRect().top - FIT_BELOW;
      const fit = Math.min(MAX_FIT, Math.max(MIN_FIT, Math.min(roomWide / width, roomHigh / height)));
      if (Math.abs(fit - this.fit) > 0.01) this.fit = Math.round(fit * 100) / 100;
    },
    device() {
      return store.getActiveDevice();
    },
    serial() {
      return store.getActiveSerial();
    },
    status(fader) {
      return this.device().fader_status[fader];
    },
    channel(fader) {
      return this.status(fader).channel;
    },
    muteType(fader) {
      const type = this.status(fader).mute_type;
      return (this.isMini && isStreamNoMusic() && type === "ToStreams") ? "ToStream" : type;
    },

    // Called when another part of the app asks for a fader's settings
    channelChanged(fader) {
      this.$refs[`channel-${fader}`]?.[0]?.focus();
    },

    /* ---------- Screen editor ---------- */
    toggleEditor(fader) {
      this.editing = this.editing === fader ? null : fader;
    },
    editorOutside(event) {
      if (this.editing && !event.target.closest(".screenEditor, .screen")) this.editing = null;
    },
    editorKey(event) {
      if (event.key === "Escape" && this.editing) this.editing = null;
    },
    iconFiles() {
      return [...store.getIconFiles()].sort(Intl.Collator().compare);
    },
    openIcons() {
      websocket.send_daemon_command({"OpenPath": "Icons"});
    },
    setIcon(fader, icon) {
      websocket.send_command(this.serial(), {"SetScribbleIcon": [fader, icon]});
    },
    setText(fader, text) {
      websocket.send_command(this.serial(), {"SetScribbleText": [fader, text]});
    },
    // The number on the left is the fader's position (1 - 4), like the original app
    setNumber(fader, show, index) {
      websocket.send_command(this.serial(), {"SetScribbleNumber": [fader, show ? String(index + 1) : ""]});
    },
    setInvert(fader, inverted) {
      websocket.send_command(this.serial(), {"SetScribbleInvert": [fader, inverted]});
    },
    setBacklight(fader, value) {
      const colour = value.substring(1).toUpperCase();
      this.device().lighting.simple[ScribbleNames[fader]].colour_one = colour;
      websocket.send_command(this.serial(), {"SetSimpleColour": [ScribbleNames[fader], colour]});
    },

    // The screen as the device draws it (the daemon renders the same image it sends to the hardware)
    scribbleUrl(fader) {
      const s = this.status(fader).scribble;
      const query = `?i=${s.file_name}&b=${s.bottom_text}&l=${s.left_text}&in=${s.inverted}`;
      return `${getBaseHTTPAddress()}files/scribble/${this.serial()}/${fader}.png${query}`;
    },
    screenStyle(fader) {
      if (this.isMini) return {};
      const colour = this.device().lighting.simple[ScribbleNames[fader]].colour_one;
      return {background: this.mixHex(colour, "ffffff", 0.7), boxShadow: `0 0 10px ${this.rgba(colour, 0.35)}`};
    },
    volume(fader) {
      return this.device().levels.volumes[this.channel(fader)];
    },
    volumePercent(fader) {
      return Math.round(this.volume(fader) / 255 * 100);
    },
    capBottom(fader) {
      return Math.round(this.volume(fader) / 255 * (TRACK_HEIGHT - CAP_HEIGHT));
    },
    ledColour(fader, index) {
      const lighting = this.device().lighting.faders[fader];
      const top = lighting.colours.colour_one, bottom = lighting.colours.colour_two;
      const lit = Math.ceil(LED_COUNT / 255 * this.volume(fader) + 0.25);
      if (lighting.style === "TwoColour") {
        return index >= lit ? this.hex(top) : this.hex(bottom);
      }
      if (index >= lit) return "#151817";
      return this.mixHex(bottom, top, index / (LED_COUNT - 1));
    },
    setVolume(fader, value) {
      const channel = this.channel(fader);
      value = Math.max(0, Math.min(255, Math.round(value)));
      if (this.device().levels.volumes[channel] === value) return;
      this.device().levels.volumes[channel] = value;
      websocket.send_command(this.serial(), {"SetVolume": [channel, value]});
    },
    // Drag the cap like on the Device page (the page is zoomed, so measure the on-screen size)
    faderDown(event, fader) {
      if (event.button !== 0 || this.drag || !event.target.closest(".cap")) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      const scale = event.currentTarget.getBoundingClientRect().height / TRACK_HEIGHT;
      this.drag = {
        fader, pointerId: event.pointerId, y: event.clientY, volume: this.volume(fader),
        travel: (TRACK_HEIGHT - CAP_HEIGHT) * scale,
        path: `/mixers/${this.serial()}/levels/volumes/${this.channel(fader)}`,
      };
      store.pausePatchPath(this.drag.path);
    },
    faderMove(event, fader) {
      const drag = this.drag;
      if (!drag || drag.fader !== fader || drag.pointerId !== event.pointerId) return;
      this.setVolume(fader, drag.volume + (drag.y - event.clientY) / drag.travel * 255);
    },
    faderUp(event) {
      if (!this.drag || this.drag.pointerId !== event.pointerId) return;
      store.resumePatchPath(this.drag.path);
      this.drag = null;
    },
    faderKey(event, fader) {
      const step = {ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 25, PageDown: -25}[event.key];
      if (step === undefined) return;
      event.preventDefault();
      this.setVolume(fader, this.volume(fader) + step);
    },
    toggleMute(fader) {
      const status = this.status(fader);
      const next = status.mute_state !== "Unmuted" ? "Unmuted" : (status.mute_type === "All" ? "MutedToAll" : "MutedToX");
      status.mute_state = next;
      websocket.send_command(this.serial(), {"SetFaderMuteState": [fader, next]});
    },
    muteStyle(fader) {
      const lighting = this.device().lighting.buttons[MuteButtonNamesForFader[fader]];
      const colour = this.offStyleColour(lighting, this.status(fader).mute_state !== "Unmuted");
      return {borderColor: colour, color: colour};
    },
    coughStyle() {
      const lighting = this.device().lighting.buttons.Cough;
      const colour = this.offStyleColour(lighting, this.device().cough_button.state !== "Unmuted");
      return {background: colour, color: colour};
    },
    bleepStyle() {
      const colour = this.offStyleColour(this.device().lighting.buttons.Bleep, this.device().button_down.Bleep);
      return {borderColor: colour, color: colour};
    },
    coughToggle() {
      return this.device().cough_button.is_toggle;
    },

    // Mute targets; for a fader, some are blocked by the channel (same rules as the original app)
    muteOptions(source) {
      const options = [{id: "All", label: this.$t('message.device.muteAll')}];
      options.push({id: "ToStream", label: this.streamName()});
      if (firmwareSupportsMix2() && (!isWindowsDriver() || !driverPreVOD())) {
        options.push({id: "ToStream2", label: (isWindowsDriver() && driverVOD()) ? "VOD" : "Stream Mix 2"});
        options.push({id: "ToStreams", label: driverVOD() ? "Stream Mix + VOD" : "Stream Mixes 1 + 2"});
      }
      options.push({id: "ToVoiceChat", label: this.$t('message.channels.ChatMic')});
      options.push({id: "ToPhones", label: this.$t('message.channels.Headphones')});
      options.push({id: "ToLineOut", label: this.$t('message.channels.LineOut')});
      for (const option of options) {
        option.disabled = (source === "Chat" && option.id === "ToVoiceChat") ||
            ((source === "Headphones" || source === "LineOut") && option.id !== "All");
      }
      return options;
    },
    streamName() {
      if (firmwareSupportsMix2()) return (isWindowsDriver() && !driverMix2()) ? "Stream Mix" : "Stream Mix 1";
      return "Stream Mix";
    },

    setChannel(fader, channel) {
      assignFaderChannel(this.serial(), fader, channel);
      this.status(fader).channel = channel;
      const blocked = this.muteOptions(channel).find(option => option.id === this.muteType(fader))?.disabled;
      if (blocked) this.setMuteFunction(fader, "All");
    },
    setMuteFunction(fader, fn) {
      websocket.send_command(this.serial(), {"SetFaderMuteFunction": [fader, fn]});
    },
    setCoughHold(hold) {
      websocket.send_command(this.serial(), {"SetCoughIsHold": hold});
    },
    setCoughMuteFunction(fn) {
      websocket.send_command(this.serial(), {"SetCoughMuteFunction": fn});
    },

    hex(colour) {
      return "#" + colour;
    },
    rgba(colour, alpha) {
      const r = parseInt(colour.substring(0, 2), 16), g = parseInt(colour.substring(2, 4), 16), b = parseInt(colour.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    mixHex(a, b, t) {
      const pa = [0, 2, 4].map(i => parseInt(a.substring(i, i + 2), 16));
      const pb = [0, 2, 4].map(i => parseInt(b.substring(i, i + 2), 16));
      return "rgb(" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(", ") + ")";
    },
    offStyleColour(lighting, active) {
      const one = lighting.colours.colour_one, two = lighting.colours.colour_two;
      if (active) return this.hex(one);
      switch (lighting.off_style) {
        case "Dimmed":
          return this.rgba(one, 0.4);
        case "Colour2":
          return this.hex(two);
        case "DimmedColour2":
          return this.rgba(two, 0.4);
        default:
          return this.hex(one);
      }
    },
  },
}
</script>

<style scoped>
.configPage {
  padding: 20px;
  color: #e8ecea;
}

/* The device body, same finish as the Device page */
.body {
  display: grid;
  grid-template-columns: repeat(4, auto) 1px auto;
  column-gap: 18px;
  row-gap: 14px;
  justify-items: center;
  width: max-content;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 34px 48px 28px;
  background: linear-gradient(180deg, #2e3231 0%, #262a29 60%, #202322 100%);
  clip-path: polygon(4% 0, 96% 0, 100% 7%, 100% 92%, 97% 100%, 3% 100%, 0 92%, 0 7%);
}

.coughColumn {
  grid-column: 6;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
}

.divider {
  grid-column: 5;
  grid-row: 1 / 3;
  width: 1px;
  margin: 0 8px;
  background: #3a3f3d;
}

/* ---------- Hardware: the Device page's pixel sizes, enlarged ---------- */
.hw {
  zoom: 1.15;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 82px;
}

.coughColumn .hw {
  width: auto;
  align-self: flex-end;
}

.bleep {
  width: 96px;
  height: 38px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  border-radius: 3px;
  font-size: 13px;
  font-weight: 700;
}

.screen {
  width: 72px;
  height: 36px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #d9dedc;
  color: #141716;
  font-size: 11px;
  font-weight: 700;
}

button.screen {
  position: relative;
  padding: 0;
  border: 0;
  cursor: pointer;
  transition: box-shadow .15s ease;
}

button.screen:hover, button.screen.editing {
  box-shadow: 0 0 0 2px #3ee6d9, 0 0 14px rgba(62, 230, 217, .45) !important;
}

button.screen:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.screen .pen {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #3ee6d9;
  color: #0b1414;
  font-size: 7px;
  opacity: 0;
  transition: opacity .15s ease;
}

button.screen:hover .pen, button.screen.editing .pen {
  opacity: 1;
}

/* The screen editor drops down from the screen, over the fader */
.hw {
  position: relative;
}

.screenEditor {
  position: absolute;
  z-index: 20;
  top: 46px;
  width: 190px;
  box-sizing: border-box;
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid #4a5452;
  border-radius: 8px;
  background: #2b302f;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .6);
  zoom: 0.87;
  font-size: 13px;
  color: #e8ecea;
}

.screenEditor.alignLeft {
  left: -4px;
}

.screenEditor.alignRight {
  right: -4px;
}

.editorHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 700;
  font-size: 11px;
  color: #9aa4a0;
}

.editorClose {
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 5px;
  background: none;
  color: #9aa4a0;
  cursor: pointer;
}

.editorClose:hover {
  background: #3b413f;
  color: #fff;
}

.iconRow {
  display: flex;
  gap: 6px;
}

.iconRow select {
  flex: 1 1 auto;
  min-width: 0;
}

.iconFolder {
  flex: none;
  width: 32px;
  border: 1px solid #3b413f;
  border-radius: 6px;
  background: #232827;
  color: #c3ccc8;
  cursor: pointer;
}

.iconFolder:hover {
  color: #fff;
  border-color: #59b1b6;
}

.screenEditor select, .screenEditor input[type=text] {
  height: 30px;
  box-sizing: border-box;
  padding: 0 8px;
  border: 1px solid #3b413f;
  border-radius: 6px;
  background: #232827;
  color: #e8ecea;
  font-family: inherit;
}

.screenEditor .check {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.screenEditor .check input[type=checkbox] {
  accent-color: #59b1b6;
}

.textColour {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.textColour button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  border: 1px solid #3b413f;
  border-radius: 6px;
  background: #232827;
  color: #c3ccc8;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
}

.textColour button.on {
  border-color: #3ee6d9;
  background: #1d3333;
  color: #fff;
}

.textColour .sample {
  width: 46px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 3px;
  font-weight: 700;
  font-size: 13px;
}

.textColour .sample.dark {
  color: #111;
}

.textColour .sample.light {
  background: #111;
}


.faderTrack {
  position: relative;
  width: 72px;
  height: 262px;
  touch-action: none;
  user-select: none;
}

.faderTrack:focus-visible, select:focus-visible, button:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.leds {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column-reverse;
  gap: 4px;
}

.leds.left {
  left: 4px;
}

.leds.right {
  right: 4px;
}

.leds span {
  display: block;
  width: 13px;
  height: 13px;
  border-radius: 1px;
}

.rail {
  position: absolute;
  left: 33px;
  top: 6px;
  bottom: 6px;
  width: 6px;
  border-radius: 3px;
  background: #0b0d0c;
  box-shadow: inset 0 0 3px #000;
}

.cap {
  position: absolute;
  left: 19px;
  width: 34px;
  height: 58px;
  border-radius: 4px;
  background: linear-gradient(180deg, #a3a8a6 0%, #6d7270 30%, #8d9290 48%, #505553 52%, #7a7f7d 70%, #4c5150 100%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.35);
  cursor: grab;
}

.cap span {
  position: absolute;
  left: 4px;
  right: 4px;
  top: 28px;
  height: 2px;
  background: #2a2e2d;
}

.percent {
  font-size: 12px;
  color: #9aa4a0;
}

.mute {
  width: 60px;
  height: 34px;
  border: 2px solid;
  border-radius: 3px;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
}

.mute.blink {
  animation: blink 1s steps(2, start) infinite;
}

@keyframes blink {
  to {
    visibility: hidden;
  }
}

/* Notched like the real mic mute button: a coloured shape with a dark one inset by 2px */
.cough {
  width: 96px;
  height: 92px;
  padding: 2px;
  box-sizing: border-box;
  clip-path: polygon(0 0, 100% 0, 100% 72%, 72% 100%, 0 100%);
}

.cough span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 26px;
  background: #262a29;
  clip-path: polygon(0 0, 100% 0, 100% 72%, 72% 100%, 0 100%);
}

/* ---------- Settings under each piece ---------- */
.settings {
  width: 94px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.coughColumn .settings {
  width: 170px;
}

.lab {
  margin-top: 4px;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #8e9894;
}

select {
  width: 100%;
  padding: 6px;
  font-family: inherit;
  font-size: 12px;
  color: #e8ecea;
  background: #1e2221;
  border: 1px solid #3d4442;
  border-radius: 6px;
  cursor: pointer;
}

.segment {
  display: flex;
  border: 1px solid #3d4442;
  border-radius: 6px;
  overflow: hidden;
}

.segment button {
  flex: 1;
  padding: 6px 0;
  font-family: inherit;
  font-size: 12px;
  color: #9aa4a0;
  background: transparent;
  border: none;
  cursor: pointer;
}

.segment button.on {
  background: rgba(224, 68, 42, .18);
  color: #f08a78;
}

.hint {
  text-align: center;
  margin: 12px auto 0;
  font-size: 13px;
  color: #8e9894;
}
</style>
