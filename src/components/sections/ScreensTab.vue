<template>
  <div class="screensPage">
    <div class="pageTitle">
      <h2>{{ $t('message.screens.title') }}</h2>
      <p>{{ $t('message.screens.hint') }}</p>
    </div>

    <p v-if="isMini" class="miniNote">{{ $t('message.screens.mini') }}</p>
    <template v-else>
      <!-- The four screens, with the real gap between them (7 mm between 18 mm screens) -->
      <div class="deviceStrip">
        <div class="screens" role="group" :aria-label="$t('message.screens.pick')">
          <button v-for="(fader, i) in faders" :key="fader" type="button" class="scr" :aria-pressed="pick === fader" @click="pick = fader">
            <canvas :ref="el => canvases[fader] = el" aria-hidden="true"></canvas>
            <span>{{ $t('message.screens.screenN', { n: i + 1 }) }} · {{ channelName(fader) }}<i v-if="dirty[fader]" class="unsaved"></i></span>
          </button>
        </div>
      </div>

      <div class="editor">
        <section class="card" :aria-label="$t('message.screens.screenN', { n: faders.indexOf(pick) + 1 })">
          <div class="cardHead">
            <h3>{{ $t('message.screens.screenN', { n: faders.indexOf(pick) + 1 }) }}</h3>
            <span class="sub">{{ $t('message.screens.faderN', { n: faders.indexOf(pick) + 1 }) }} · {{ channelName(pick) }}</span>
          </div>
          <div class="cardBody">
            <div class="modes" role="group" :aria-label="$t('message.screens.show')">
              <button v-for="m in modes" :key="m.id" type="button" class="mode" :aria-pressed="edit.mode === m.id" @click="setMode(m.id)">
                <font-awesome-icon :icon="m.icon"/><b>{{ $t(`message.screens.modes.${m.id}`) }}</b><small>{{ $t(`message.screens.modes.${m.id}Hint`) }}</small>
              </button>
            </div>

            <p v-if="edit.mode === 'name'" class="note" v-html="$t('message.screens.nameNote')"></p>

            <div v-else-if="edit.mode === 'text'" class="fields">
              <label class="field full"><span class="label">{{ $t('message.screens.text') }}</span>
                <input id="screenText" type="text" maxlength="60" :value="edit.text.text" @input="change(() => edit.text.text = $event.target.value)"></label>
              <label class="field"><span class="label">{{ $t('message.screens.font') }}</span>
                <select id="screenFont" :value="edit.text.font" @change="change(() => edit.text.font = $event.target.value)">
                  <option value="pixel">{{ $t('message.screens.fonts.pixel') }}</option>
                  <option value="GoXLRTitle">{{ $t('message.screens.fonts.title') }}</option>
                  <option value="GoXLR">{{ $t('message.screens.fonts.body') }}</option>
                </select></label>
              <div class="field"><span class="label">{{ $t('message.screens.size') }}</span>
                <div class="rangeRow"><input id="screenSize" type="range" min="9" max="56" :value="edit.text.size" @input="change(() => edit.text.size = +$event.target.value)"><output>{{ edit.text.size }}</output></div></div>
              <div class="field"><span class="label">{{ $t('message.screens.align') }}</span>
                <div class="seg" role="group">
                  <button v-for="a in ['left', 'center', 'right']" :key="a" type="button" :aria-pressed="edit.text.align === a" @click="change(() => edit.text.align = a)">{{ $t(`message.screens.aligns.${a}`) }}</button>
                </div></div>
              <div class="field"><span class="label">{{ $t('message.screens.tooLong') }}</span>
                <div class="seg" role="group">
                  <button v-for="l in ['shrink', 'scroll']" :key="l" type="button" :aria-pressed="edit.text.long === l" @click="change(() => edit.text.long = l)">{{ $t(`message.screens.longs.${l}`) }}</button>
                </div></div>
              <button type="button" class="toggle" :aria-pressed="edit.text.invert" @click="change(() => edit.text.invert = !edit.text.invert)"><span class="switch"><span></span></span>{{ $t('message.screens.lightBackground') }}</button>
              <button type="button" class="toggle" :aria-pressed="edit.text.bold" @click="change(() => edit.text.bold = !edit.text.bold)"><span class="switch"><span></span></span>{{ $t('message.screens.bold') }}</button>
            </div>

            <div v-else-if="edit.mode === 'image'" class="fields">
              <div class="field full">
                <div class="drop" :class="{ over: dropOver }" @dragover.prevent="dropOver = true" @dragleave="dropOver = false" @drop.prevent="dropFile">
                  <font-awesome-icon icon="fa-solid fa-download" class="dropIcon"/>
                  <b>{{ $t('message.screens.dropHere') }}</b>
                  <span>{{ $t('message.screens.becomesDots') }}</span>
                  <button type="button" @click="$refs.file.click()">{{ $t('message.screens.chooseFile') }}</button>
                  <input ref="file" type="file" accept="image/gif,image/png,image/jpeg,image/webp" hidden @change="chooseFile">
                </div>
                <span class="fileInfo">{{ fileInfo() }}</span>
              </div>
              <div v-if="gifLong()" class="field full"><span class="label">{{ $t('message.screens.whichPart') }}</span>
                <div class="rangeRow"><input id="screenPart" type="range" min="0" :max="media[pick].totalMs - MAX_MS" step="100" :value="edit.image.startMs"
                                             @input="change(() => edit.image.startMs = +$event.target.value)"><output>{{ (partStart() / 1000).toFixed(1) }} s</output></div></div>
              <div class="field"><span class="label">{{ $t('message.screens.fit') }}</span>
                <div class="seg" role="group">
                  <button v-for="f in ['fit', 'fill']" :key="f" type="button" :aria-pressed="edit.image.fit === f" @click="change(() => edit.image.fit = f)">{{ $t(`message.screens.fits.${f}`) }}</button>
                </div></div>
              <div class="field"><span class="label">{{ $t('message.screens.shading') }}</span>
                <div class="seg" role="group">
                  <button type="button" :aria-pressed="!edit.image.dither" @click="change(() => edit.image.dither = false)">{{ $t('message.screens.sharp') }}</button>
                  <button type="button" :aria-pressed="edit.image.dither" @click="change(() => edit.image.dither = true)">{{ $t('message.screens.dotted') }}</button>
                </div></div>
              <div class="field"><span class="label">{{ $t('message.screens.cutoff') }}</span>
                <div class="rangeRow"><input id="screenThreshold" type="range" min="10" max="245" :value="edit.image.threshold" @input="change(() => edit.image.threshold = +$event.target.value)"><output>{{ Math.round(edit.image.threshold / 2.55) }}%</output></div></div>
              <div class="field"><span class="label">{{ $t('message.screens.speed') }}</span>
                <div class="rangeRow"><input id="screenSpeed" type="range" min="25" max="200" step="25" :value="edit.image.speed * 100" @input="change(() => edit.image.speed = $event.target.value / 100)"><output>{{ edit.image.speed }}×</output></div></div>
              <button type="button" class="toggle" :aria-pressed="edit.image.invert" @click="change(() => edit.image.invert = !edit.image.invert)"><span class="switch"><span></span></span>{{ $t('message.screens.swap') }}</button>
              <p class="note">{{ frameInfo() }}</p>
            </div>

          </div>
        </section>

        <section class="card" :aria-label="$t('message.screens.thisScreen')">
          <div class="cardHead"><h3>{{ $t('message.screens.thisScreen') }}</h3><span class="sub">{{ $t('message.screens.closeUp') }}</span></div>
          <div class="cardBody big">
            <canvas ref="bigScreen" :aria-label="$t('message.screens.thisScreen')"></canvas>
            <!-- Screen light colour (the same setting as Lighting → Mixer): one colour for all, or each its own -->
            <div class="colourBox">
              <span class="label">{{ $t('message.screens.colour') }}</span>
              <div class="seg" role="group" :aria-label="$t('message.screens.colour')">
                <button type="button" :aria-pressed="colourScope === 'all'" @click="colourScope = 'all'">{{ $t('message.screens.colourAll') }}</button>
                <button type="button" :aria-pressed="colourScope === 'one'" @click="colourScope = 'one'">{{ $t('message.screens.colourOne') }}</button>
              </div>
              <ColourSwatch id="screenColour" :value="colour(pick)"
                            :label="colourScope === 'all' ? $t('message.screens.colourAllLabel') : $t('message.screens.screenN', { n: faders.indexOf(pick) + 1 })"
                            :hint="$t('message.screens.colourHint')" @change="setColour"/>
              <p v-if="tooDark()" class="darkWarn" role="status">
                <font-awesome-icon icon="fa-solid fa-triangle-exclamation"/> {{ $t('message.screens.tooDark') }}
                <button type="button" @click="setColour('00ACFF')">{{ $t('message.screens.makeBright') }}</button>
              </p>
            </div>
            <div class="saveRow">
              <button type="button" class="reset" @click="backToName">{{ $t('message.screens.backToName') }}</button>
              <button type="button" class="save" :disabled="saving || lineTest || !anyDirty()" @click="save">{{ saving ? $t('message.screens.saving') : $t('message.screens.save') }}</button>
            </div>
            <p class="status" :class="{ error: message.error }" role="status">{{ message.text }}</p>
          </div>
        </section>
      </div>

      <section class="card" :aria-label="$t('message.screens.lineUp')">
        <div class="cardHead"><h3>{{ $t('message.screens.lineUp') }}</h3><span class="sub">{{ $t('message.screens.lineUpSub') }}</span></div>
        <div class="cardBody">
          <div class="fields">
            <div class="field"><span class="label">{{ $t('message.screens.gap') }}</span>
              <div class="rangeRow"><input id="screenGap" type="range" min="20" max="80" :value="gap" @input="setGap(+$event.target.value)"><output>{{ $t('message.screens.dots', { n: gap }) }}</output></div></div>
            <button type="button" class="toggle" :aria-pressed="lineTest" @click="toggleLineTest"><span class="switch"><span></span></span>{{ $t('message.screens.testLine') }}</button>
            <p class="note full" v-html="$t('message.screens.lineUpNote')"></p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import {store} from "@/store";
import {getBaseHTTPAddress} from "@/util/sockets";
import {isDeviceMini} from "@/util/util";
import {websocket} from "@/util/sockets";
import {ScribbleNames} from "@/util/mixerMapping";
import ColourSwatch from "@/components/sections/lighting/elements/ColourSwatch.vue";
import {
  blank, colourBrightness, DARK, DEFAULT_GAP, FRAME_MS, fitGif, fromCustomScreen, lineFrame, MAX_MS, pictureFrame, readPictureFile,
  renderDots, textFrame, textFrames, toCustomScreen,
} from "@/util/screenDots";

// Screens page (mockup docs/mockups/2026-10-30-screens): each fader screen shows its channel name (the
// profile's scribble, like before), your words, or a picture or GIF. Saved in the daemon
// (SetCustomScreen), which plays them on the real screens, not in the GoXLR profile.
const FADERS = ["A", "B", "C", "D"];
const MODES = [
  {id: "name", icon: "fa-solid fa-tag"}, {id: "text", icon: "fa-solid fa-font"},
  {id: "image", icon: "fa-solid fa-image"},
];
const GAP_KEY = "goxlr.screens.gap";
// While the test line is on, the screens it replaced are kept here, so they come back even if this page
// was closed or reloaded in between (the test line itself lives in the daemon until it's turned off)
const LINE_BACKUP_KEY = "goxlr.screens.lineBackup";
const defaultText = () => ({text: "ON AIR", font: "pixel", size: 27, align: "center", long: "scroll", invert: false, bold: false});
const defaultImage = () => ({fit: "fit", dither: false, threshold: 128, invert: false, speed: 1, startMs: 0, name: ""});

export default {
  name: "ScreensTab",
  components: {ColourSwatch},

  data() {
    let gap = DEFAULT_GAP;
    try {
      gap = +localStorage.getItem(GAP_KEY) || DEFAULT_GAP;
    } catch (e) {
      // default gap
    }
    return {
      faders: FADERS,
      modes: MODES,
      MAX_MS,
      pick: "A",
      edits: {},
      dirty: {A: false, B: false, C: false, D: false},
      gap,
      lineTest: false,
      lineBackup: null,
      dropOver: false,
      saving: false,
      message: {text: "", error: false},
      tick: 0,
      colourScope: "all",
    }
  },

  created() {
    // Not reactive: canvases and decoded pictures are big and change often
    this.canvases = {};
    this.media = {};
    this.names = {};
    this.savedFrames = {};
    this.loadFromDevice();
  },

  mounted() {
    // One colour for all screens unless they already differ
    if (!this.isMini) this.colourScope = new Set(FADERS.map(f => this.colour(f))).size > 1 ? "one" : "all";
    this.timer = setInterval(this.frame, FRAME_MS);
  },

  beforeUnmount() {
    clearInterval(this.timer);
  },

  computed: {
    isMini() {
      return isDeviceMini();
    },
    edit() {
      return this.edits[this.pick];
    },
    screensSignature() {
      return FADERS.map(f => this.device().fader_status[f].custom_screen?.ui || "").join("|");
    },
  },

  watch: {
    // Another window (or a profile load) changed a screen: pick it up unless it's being edited here
    screensSignature() {
      for (const f of FADERS) if (!this.dirty[f]) this.loadFader(f);
    },
  },

  methods: {
    device() {
      return store.getActiveDevice();
    },
    serial() {
      return store.getActiveSerial();
    },
    channelName(fader) {
      return this.$t(`message.channels.${this.device().fader_status[fader].channel}`);
    },
    colour(fader) {
      return this.device().lighting.simple[`Scribble${FADERS.indexOf(fader) + 1}`].colour_one;
    },
    // Changes the screen light right away, like the Lighting page (Save the profile to keep it)
    setColour(colour) {
      const targets = this.colourScope === "all" ? FADERS : [this.pick];
      for (const f of targets) {
        this.device().lighting.simple[ScribbleNames[f]].colour_one = colour;
        websocket.send_command(this.serial(), {"SetSimpleColour": [ScribbleNames[f], colour]});
      }
    },
    // A very dark light colour: the real screen looks black whatever it shows
    tooDark() {
      const targets = this.colourScope === "all" ? FADERS : [this.pick];
      return targets.some(f => colourBrightness(this.colour(f)) < DARK);
    },
    say(text, error = false) {
      this.message = {text, error};
    },

    /* ---------- Loading what the daemon has ---------- */
    loadFromDevice() {
      for (const f of FADERS) this.loadFader(f);
      if (FADERS.some(f => this.isLineScreen(f))) {
        this.lineTest = true;
        try {
          this.lineBackup = JSON.parse(localStorage.getItem(LINE_BACKUP_KEY)) || null;
        } catch (e) {
          this.lineBackup = null;
        }
      }
    },
    isLineScreen(f) {
      const ui = this.device().fader_status[f].custom_screen?.ui || "";
      return ui.includes('"lineTest":true');
    },
    loadFader(f) {
      // The test line isn't a screen of yours: leave this screen's settings as they are
      if (this.isLineScreen(f)) {
        if (!this.edits[f]) this.edits[f] = {mode: "name", text: defaultText(), image: defaultImage()};
        return;
      }
      const saved = this.device().fader_status[f].custom_screen;
      let ui = {};
      try {
        ui = saved ? JSON.parse(saved.ui || "{}") : {};
      } catch (e) {
        ui = {};
      }
      // Mochi the cat was taken out (it upset the real screens): a saved Mochi screen shows as the
      // channel name, and is cleared from the daemon on the next Save
      const gone = ui.mode === "cat";
      this.edits[f] = {
        mode: gone ? "name" : saved && ui.mode ? ui.mode : (saved ? "image" : "name"),
        text: {...defaultText(), ...(ui.text || {})},
        image: {...defaultImage(), ...(ui.image || {})},
      };
      this.savedFrames[f] = saved && !gone ? fromCustomScreen(saved) : null;
      this.dirty[f] = gone;
    },
    /* ---------- Editing ---------- */
    change(apply) {
      apply();
      this.dirty[this.pick] = true;
      this.say("");
    },
    setMode(mode) {
      this.change(() => this.edits[this.pick].mode = mode);
    },
    setGap(gap) {
      this.gap = gap;
      try {
        localStorage.setItem(GAP_KEY, String(gap));
      } catch (e) {
        // only for this session
      }
      if (this.lineTest) this.sendLine();
    },
    anyDirty() {
      return FADERS.some(f => this.dirty[f]);
    },
    backToName() {
      this.setMode("name");
      this.say(this.$t('message.screens.nameAgain'));
    },

    /* ---------- Pictures ---------- */
    chooseFile(event) {
      const file = event.target.files[0];
      event.target.value = "";
      if (file) this.loadFile(file);
    },
    dropFile(event) {
      this.dropOver = false;
      const file = event.dataTransfer.files[0];
      if (file) this.loadFile(file);
    },
    async loadFile(file) {
      const fader = this.pick;
      try {
        const all = await readPictureFile(file);
        this.media[fader] = {all, totalMs: all.reduce((a, f) => a + f.ms, 0), merged: 0, at: 0, clock: 0};
        this.change(() => Object.assign(this.edits[fader].image, {startMs: 0, name: file.name}));
        this.tick++;
      } catch (e) {
        this.say(this.$t('message.screens.cantRead', {file: file.name}), true);
      }
    },
    gifPart(fader) {
      const m = this.media[fader];
      if (!m) return null;
      const fit = fitGif(m.all, this.edits[fader].image.startMs);
      m.totalMs = fit.totalMs;
      m.merged = fit.merged;
      return fit;
    },
    gifLong() {
      void this.tick;
      return !!this.media[this.pick] && this.media[this.pick].totalMs > MAX_MS;
    },
    partStart() {
      const fit = this.gifPart(this.pick);
      return fit ? fit.start : 0;
    },
    fileInfo() {
      void this.tick;
      const m = this.media[this.pick], img = this.edit.image;
      if (!m) return this.savedFrames[this.pick] ? this.$t('message.screens.savedPicture', {name: img.name || "—"}) : this.$t('message.screens.noFile');
      const fit = this.gifPart(this.pick);
      const bits = [`${img.name} · ${(fit.totalMs / 1000).toFixed(1)} s`];
      if (fit.totalMs > MAX_MS) bits.push(this.$t('message.screens.tooLongKeeping', {from: (fit.start / 1000).toFixed(1), to: ((fit.start + Math.min(MAX_MS, fit.totalMs)) / 1000).toFixed(1)}));
      if (fit.merged) bits.push(this.$t('message.screens.merged', {n: fit.merged}));
      return bits.join(" · ");
    },
    frameInfo() {
      void this.tick;
      const frames = this.imageFrames(this.pick);
      if (frames.length <= 1) return this.$t('message.screens.still');
      const len = frames.reduce((a, f) => a + f.ms, 0) / 1000;
      return this.$t('message.screens.loopInfo', {n: frames.length, s: len.toFixed(1)});
    },
    // The picture or GIF as dots, ready for the screen
    imageFrames(fader) {
      const cfg = this.edits[fader].image;
      const fit = this.gifPart(fader);
      if (fit) return fit.frames.map(fr => ({pix: pictureFrame(fr.img, cfg), ms: fr.ms / cfg.speed}));
      return this.savedFrames[fader] || [{pix: blank(), ms: 1000}];
    },

    /* ---------- Channel name: the daemon's own scribble picture ---------- */
    nameFrame(fader) {
      const s = this.device().fader_status[fader].scribble;
      const url = s ? `${getBaseHTTPAddress()}files/scribble/${this.serial()}/${fader}.png?i=${s.file_name}&b=${s.bottom_text}&l=${s.left_text}&in=${s.inverted}` : "";
      const entry = this.names[fader];
      if (!entry || entry.url !== url) {
        this.names[fader] = {url, pix: blank()};
        if (url) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const c = document.createElement("canvas");
            c.width = 128;
            c.height = 64;
            const g = c.getContext("2d");
            g.drawImage(img, 0, 0, 128, 64);
            const data = g.getImageData(0, 0, 128, 64).data;
            // The PNG: see-through = lit, black = unlit
            this.names[fader].pix = Array.from({length: 64}, (_, y) => Array.from({length: 128}, (_, x) => data[(y * 128 + x) * 4 + 3] < 128));
          };
          img.src = url;
        }
      }
      return this.names[fader].pix;
    },

    /* ---------- Preview, 16 times a second ---------- */
    pictureAt(fader, t) {
      const e = this.edits[fader];
      if (this.lineTest) return lineFrame(FADERS.indexOf(fader), this.gap);
      if (e.mode === "name") return this.nameFrame(fader);
      if (e.mode === "text") return textFrame(e.text, t);
      const frames = this.cachedImage(fader);
      // step through the GIF by its own timing
      const total = frames.reduce((a, f) => a + f.ms, 0);
      let at = (t * FRAME_MS) % Math.max(1, total);
      for (const f of frames) {
        if (at < f.ms) return f.pix;
        at -= f.ms;
      }
      return frames[0].pix;
    },
    // Converting a GIF every preview picture would be slow: keep the dots until a setting changes
    cachedImage(fader) {
      const key = JSON.stringify(this.edits[fader].image) + this.tick + !!this.media[fader];
      if (!this.imageCache) this.imageCache = {};
      if (this.imageCache[fader]?.key !== key) this.imageCache[fader] = {key, frames: this.imageFrames(fader)};
      return this.imageCache[fader].frames;
    },
    frame() {
      if (this.isMini) return;
      this.t = (this.t || 0) + 1;
      for (const f of FADERS) {
        const canvas = this.canvases[f];
        if (!canvas) continue;
        const pix = this.pictureAt(f, this.t);
        renderDots(canvas, pix, this.colour(f));
        if (f === this.pick && this.$refs.bigScreen) renderDots(this.$refs.bigScreen, pix, this.colour(f));
      }
    },

    /* ---------- Saving to the daemon ---------- */
    async sendScreen(fader, screen) {
      // Over HTTP, not the websocket: a GIF can be bigger than one websocket message
      const body = JSON.stringify({Command: [this.serial(), {SetCustomScreen: [fader, screen]}]});
      const response = await fetch(`${getBaseHTTPAddress()}api/command`, {method: "POST", headers: {"Content-Type": "application/json"}, body});
      const result = await response.json();
      if (result && result.Error) throw new Error(result.Error);
    },
    uiFor(fader) {
      const e = this.edits[fader];
      return {mode: e.mode, text: e.text, image: e.image, gap: this.gap};
    },
    framesFor(fader) {
      const e = this.edits[fader];
      if (e.mode === "text") return textFrames(e.text);
      if (e.mode === "image") return this.imageFrames(fader);
      return null;
    },
    async save() {
      this.saving = true;
      this.say("");
      try {
        for (const f of FADERS) {
          if (!this.dirty[f]) continue;
          const frames = this.framesFor(f);
          await this.sendScreen(f, frames ? toCustomScreen(frames, this.uiFor(f)) : null);
          this.dirty[f] = false;
          if (this.edits[f].mode === "image") this.savedFrames[f] = this.imageFrames(f);
        }
        this.say(this.$t('message.screens.saved'));
      } catch (e) {
        this.say(this.$t('message.screens.saveFailed', {reason: e.message}), true);
      } finally {
        this.saving = false;
      }
    },

    /* ---------- Line up: a straight line across the real screens ---------- */
    async sendLine() {
      for (const f of FADERS) await this.sendScreen(f, toCustomScreen([{pix: lineFrame(FADERS.indexOf(f), this.gap), ms: 1000}], {lineTest: true}));
    },
    async toggleLineTest() {
      try {
        if (!this.lineTest) {
          this.lineBackup = Object.fromEntries(FADERS.map(f => [f, this.device().fader_status[f].custom_screen || null]));
          try {
            localStorage.setItem(LINE_BACKUP_KEY, JSON.stringify(this.lineBackup));
          } catch (e) {
            // too big for this browser: the screens are rebuilt from this page's settings when it's turned off
          }
          this.lineTest = true;
          await this.sendLine();
        } else {
          for (const f of FADERS) {
            const kept = this.lineBackup?.[f];
            if (kept !== undefined) await this.sendScreen(f, kept);
            else {
              // No copy kept: make the screen again from this page's settings
              const frames = this.framesFor(f);
              await this.sendScreen(f, frames ? toCustomScreen(frames, this.uiFor(f)) : null);
            }
          }
          this.lineTest = false;
          this.lineBackup = null;
          try {
            localStorage.removeItem(LINE_BACKUP_KEY);
          } catch (e) {
            // nothing kept
          }
        }
      } catch (e) {
        this.say(this.$t('message.screens.saveFailed', {reason: e.message}), true);
      }
    },
  },
}
</script>

<style scoped>
.screensPage {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px 32px;
  color: #e8ecea;
  font-family: var(--goxlr-font);
}

button, select, input {
  font-family: var(--goxlr-font);
  color: inherit;
}

button {
  cursor: pointer;
}

button:focus-visible, input:focus-visible, select:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.pageTitle h2 {
  margin: 0;
  font-family: var(--goxlr-title-font);
  font-weight: 600;
  font-size: 26px;
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
}

.pageTitle p {
  margin: 6px 0 0;
  max-width: 70ch;
  font-size: 14px;
  color: #9aa4a0;
}

.miniNote {
  color: #9aa4a0;
}

/* ---------- Cards ---------- */
.card {
  min-width: 0;
  border: 1px solid #343a38;
  border-radius: 12px;
  background: #2d3230;
}

.cardHead {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 58px;
  padding: 10px 20px;
  border-bottom: 1px solid #3b413f;
  border-radius: 12px 12px 0 0;
  background: #313735;
}

.cardHead h3 {
  margin: 0;
  font-family: var(--goxlr-title-font);
  font-weight: 600;
  font-size: 17px;
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
}

.sub {
  font-size: 13px;
  color: #9aa4a0;
}

.cardBody {
  padding: 18px 20px 20px;
}

/* ---------- The four screens ---------- */
.deviceStrip {
  overflow-x: auto;
  padding: 18px;
  border: 1px solid #343a38;
  border-radius: 14px;
  background: #1c201f;
}

.screens {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  column-gap: calc(100% * 7 / 93);
  min-width: 560px;
}

.scr {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  border: 0;
  background: none;
  text-align: center;
}

.scr canvas {
  width: 100%;
  aspect-ratio: 3 / 2;
  display: block;
  border-radius: 4px;
  box-shadow: 0 0 0 1px #303634;
}

.scr span {
  font-size: 11.5px;
  color: #5f6866;
}

.scr[aria-pressed=true] canvas {
  box-shadow: 0 0 0 2px #59b1b6, 0 0 14px rgba(89, 177, 182, .35);
}

.scr[aria-pressed=true] span {
  color: #bff3f5;
}

.unsaved {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-left: 6px;
  border-radius: 50%;
  background: #e6c44f;
  vertical-align: 1px;
}

/* ---------- Editor ---------- */
.editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 16px;
  align-items: start;
}

@media (max-width: 1000px) {
  .editor {
    grid-template-columns: minmax(0, 1fr);
  }
}

.modes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 18px;
}

.mode {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-height: 70px;
  padding: 10px 12px;
  border: 1px solid #3a413f;
  border-radius: 10px;
  background: #2a2f2d;
  text-align: left;
}

.mode svg {
  color: #9aa4a0;
}

.mode b {
  font-weight: 400;
  font-size: 14px;
}

.mode small {
  font-size: 11px;
  color: #9aa4a0;
}

.mode[aria-pressed=true] {
  border-color: #59b1b6;
  background: #1d3a3c;
}

.mode[aria-pressed=true] svg, .mode[aria-pressed=true] small {
  color: #bff3f5;
}

.fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.full {
  grid-column: 1 / -1;
}

.label {
  font-size: 11px;
  color: #5f6866;
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
}

.field input[type=text], .field select {
  height: 38px;
  padding: 0 12px;
  border: 1px solid #3a413f;
  border-radius: 8px;
  background: #222625;
  font-size: 14px;
}

.field input[type=range] {
  accent-color: #59b1b6;
}

.rangeRow {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rangeRow input {
  flex: 1;
}

.rangeRow output {
  min-width: 44px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  color: #bff3f5;
}

.seg {
  display: flex;
  border: 1px solid #3a413f;
  border-radius: 8px;
  overflow: hidden;
}

.seg button {
  flex: 1;
  height: 36px;
  padding: 0 10px;
  border: 0;
  background: #2a2f2d;
  color: #9aa4a0;
  font-size: 12.5px;
}

.seg button[aria-pressed=true] {
  background: #1d3a3c;
  color: #bff3f5;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid #3a413f;
  border-radius: 8px;
  background: #2a2f2d;
  font-size: 13px;
  text-align: left;
}

.toggle[aria-pressed=true] {
  border-color: #59b1b6;
  background: #1d3a3c;
}

.switch {
  position: relative;
  display: inline-block;
  flex: none;
  width: 30px;
  height: 18px;
  border-radius: 9px;
  background: #4a524f;
}

.switch span {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  transition: left .15s;
}

.toggle[aria-pressed=true] .switch {
  background: #59b1b6;
}

.toggle[aria-pressed=true] .switch span {
  left: 14px;
}

.drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 110px;
  padding: 14px;
  border: 1.5px dashed #46504d;
  border-radius: 10px;
  background: #262b29;
  text-align: center;
  color: #9aa4a0;
}

.drop.over {
  border-color: #59b1b6;
  background: #233331;
  color: #bff3f5;
}

.dropIcon {
  font-size: 22px;
}

.drop b {
  font-weight: 400;
  color: #e8ecea;
}

.drop button {
  margin-top: 4px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid #59b1b6;
  border-radius: 8px;
  background: #1d3a3c;
  color: #bff3f5;
  font-size: 13px;
}

.fileInfo {
  font-size: 12px;
  color: #9aa4a0;
}

.note {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.45;
  color: #9aa4a0;
}

.note :deep(b) {
  font-weight: 400;
  color: #e8ecea;
}

/* ---------- This screen ---------- */
.big {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.big canvas {
  width: 100%;
  aspect-ratio: 3 / 2;
  display: block;
  border-radius: 6px;
}

.darkWarn {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  margin: 0;
  padding: 8px 10px;
  border: 1px solid #6b4a2a;
  border-radius: 8px;
  background: #3a2c1c;
  color: #f5ddb0;
  font-size: 12px;
  line-height: 1.4;
}

.darkWarn button {
  height: 26px;
  padding: 0 10px;
  border: 1px solid #c79a4a;
  border-radius: 6px;
  background: transparent;
  color: #f5ddb0;
  font-size: 12px;
}

.colourBox {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.saveRow {
  display: flex;
  gap: 8px;
}

.saveRow button {
  flex: 1;
  height: 38px;
  border-radius: 8px;
  font-size: 13px;
}

.save {
  border: 1px solid #c79a4a;
  background: #3d3320;
  color: #f5ddb0;
}

.save:disabled {
  opacity: .5;
  cursor: default;
}

.reset {
  border: 1px solid #3a413f;
  background: #2a2f2d;
  color: #9aa4a0;
}

.status {
  min-height: 18px;
  margin: 0;
  font-size: 12.5px;
  color: #4fd1a5;
}

.status.error {
  color: #ff6b6b;
}

@media (max-width: 640px) {
  .modes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .fields {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
