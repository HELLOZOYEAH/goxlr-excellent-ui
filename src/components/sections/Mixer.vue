<template>
  <div class="mixerPage">
    <div class="pageHead">
      <div class="pageTitle">
        <h2>{{ $t('message.navigation.mixer') }}</h2>
        <p>{{ $t('message.mixer.pageHint') }}</p>
      </div>
      <button v-if="submixSupported()" type="button" class="submixToggle" :aria-pressed="submixEnabled()" @click="toggleSubmix">
        <span class="switch" :class="{ on: submixEnabled() }"><span></span></span>
        <span>{{ $t('message.device.mixBToggle') }}<small>{{ $t('message.mixer.mixBSameSwitch') }}</small></span>
      </button>
    </div>

    <!-- Which outputs play Mix A, which play Mix B -->
    <div class="mixBar" :class="{ one: !submixEnabled() }">
      <div v-if="!submixEnabled()" class="mixBox one">
        <span class="tag"><font-awesome-icon icon="fa-solid fa-sliders"/></span>
        <span class="txt"><b>{{ $t('message.mixer.oneMix') }}</b><span class="users">{{ $t('message.mixer.oneMixHint') }}</span></span>
      </div>
      <template v-else>
        <div class="mixBox">
          <span class="tag">A</span>
          <span class="txt"><b>{{ $t('message.mixer.mixATitle') }}</b>
            <span class="users">{{ $t('message.mixer.playsIn', { outputs: mixUsers('A') || $t('message.mixer.nothing') }) }}</span></span>
        </div>
        <div class="mixBox b">
          <span class="tag">B</span>
          <span class="txt"><b>{{ $t('message.mixer.mixBTitle') }}</b>
            <span class="users">{{ $t('message.mixer.playsIn', { outputs: mixUsers('B') || $t('message.mixer.nothingYet') }) }}</span></span>
        </div>
      </template>
    </div>

    <!-- One card per sound: faders 1 - 4 first, then the rest -->
    <section class="card" :aria-label="$t('message.mixer.sounds')">
      <div class="cardHead">
        <h3>{{ $t('message.mixer.sounds') }}</h3>
        <span class="help" :title="$t('message.mixer.soundsHelp')">?</span>
        <span class="sub">{{ $t('message.mixer.soundsSub') }}</span>
        <span class="spacer"></span>
        <button type="button" class="goesAll" :aria-pressed="allGoesOpen()" @click="toggleAllGoes">
          <span class="switch" :class="{ on: allGoesOpen() }"><span></span></span>{{ $t('message.mixer.showWhere') }}
        </button>
      </div>
      <div class="cardBody">
        <div class="scroll">
          <div class="strips">
            <template v-for="(channel, index) in soundOrder()" :key="channel">
              <div v-if="index === separatorAt()" class="sep" aria-hidden="true"></div>
              <div class="strip" :class="{ muted: isMuted(channel), off: isOff(channel), drop: dropOn === channel }"
                   @dragover="dragOver($event, channel)" @dragleave="dragLeave($event, channel)" @drop="dropApp($event, channel)">
                <div class="sHead">
                  <span class="ic"><font-awesome-icon :icon="channelIcon(channel)"/></span>
                  <span class="sName">
                    <span class="nm">{{ soundName(channel) }}</span>
                    <span class="what">{{ soundWhat(channel) }}</span>
                    <span class="badge" :class="faderOf(channel) ? 'f' : 'n'">{{ faderBadge(channel) }}</span>
                  </span>
                  <button type="button" class="lamp" :class="{ on: !isOff(channel) }" :aria-pressed="!isOff(channel)"
                          :title="isOff(channel) ? $t('message.mixer.lampOffTitle') : $t('message.mixer.lampOnTitle')"
                          :aria-label="soundName(channel) + ': ' + (isOff(channel) ? $t('message.mixer.markedNotInUse') : $t('message.mixer.inUse'))"
                          @click="toggleOff(channel)">
                    <font-awesome-icon icon="fa-solid fa-power-off"/>
                  </button>
                </div>
                <span v-if="isOff(channel)" class="offNote">{{ $t('message.mixer.notInUse') }}<template v-if="toStream(channel)"> · <b><font-awesome-icon icon="fa-solid fa-tower-broadcast"/> {{ $t('message.mixer.stillToStream') }}</b></template></span>

                <div class="levels">
                  <template v-if="submixEnabled()">
                    <LevelSlider :value="volume(channel)" :path="volumePath(channel)" kind="a" tag="A"
                                 :label="soundName(channel) + ' Mix A'" @update="setVolume(channel, $event)"/>
                    <div class="meter" :class="{ none: !hasMeter(channel) }" :title="hasMeter(channel) ? '' : $t('message.mixer.noMeter')">
                      <i v-if="hasMeter(channel)" :style="{ height: meterLevel(channel) + '%' }"></i>
                    </div>
                    <LevelSlider :value="submixVolume(channel)" :path="submixPath(channel)" kind="b" tag="B"
                                 :label="soundName(channel) + ' Mix B'" @update="setSubmixVolume(channel, $event)"/>
                  </template>
                  <template v-else>
                    <div class="meter" :class="{ none: !hasMeter(channel) }" :title="hasMeter(channel) ? '' : $t('message.mixer.noMeter')">
                      <i v-if="hasMeter(channel)" :style="{ height: meterLevel(channel) + '%' }"></i>
                    </div>
                    <LevelSlider :value="volume(channel)" :path="volumePath(channel)" kind="one" :tag="$t('message.mixer.volume')"
                                 :label="soundName(channel) + ' ' + $t('message.mixer.volume')" @update="setVolume(channel, $event)"/>
                  </template>
                </div>

                <button v-if="submixEnabled()" type="button" class="linkB" :class="{ on: isLinked(channel) }"
                        :aria-pressed="isLinked(channel)" :title="$t('message.mixer.linkTitle')" @click="toggleLink(channel)">
                  <font-awesome-icon :icon="isLinked(channel) ? 'fa-solid fa-link' : 'fa-solid fa-link-slash'"/>
                  {{ isLinked(channel) ? $t('message.mixer.bFollowsA') : $t('message.mixer.bOnItsOwn') }}
                </button>

                <template v-if="faderOf(channel)">
                  <button type="button" class="mute" :class="{ muted: isMuted(channel) }" :aria-pressed="isMuted(channel)"
                          :aria-label="$t('message.device.muteChannel', { channel: soundName(channel) })" @click="toggleMute(channel)">
                    <font-awesome-icon :icon="isMuted(channel) ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high'"/>
                    {{ isMuted(channel) ? $t('message.mixer.muted') : $t('message.mixer.mute') }}
                  </button>
                  <span class="muteHow">{{ muteHow(channel) }}</span>
                </template>
                <template v-else>
                  <button type="button" class="mute" aria-disabled="true" :title="$t('message.mixer.muteOnlyFader')">
                    <font-awesome-icon icon="fa-solid fa-volume-high"/>{{ $t('message.mixer.mute') }}
                  </button>
                  <span class="muteHow">{{ $t('message.mixer.needsFader') }}</span>
                </template>

                <template v-if="appsShown()">
                  <span class="label">{{ $t('message.mixer.apps') }}</span>
                  <AppTray v-if="isAppChannel(channel)" :ref="el => trays[channel] = el" :channel="channel"
                           @moved="appMoved" @failed="appFailed"/>
                  <div v-else class="apps closed">{{ closedText(channel) }}</div>
                </template>

                <button type="button" class="goesHead" :aria-expanded="goesOpen(channel)" @click="toggleGoes(channel)">
                  <span class="label">{{ $t('message.mixer.goesTo') }}</span>
                  <span class="goesIcons">
                    <template v-if="!goesOpen(channel)">
                      <span v-for="output in routedTo(channel)" :key="output" :class="{ s: output === 'BroadcastMix' }"
                            :title="outputShort(output)"><font-awesome-icon :icon="outputIcon(output)"/></span>
                    </template>
                  </span>
                  <font-awesome-icon class="chev" :icon="goesOpen(channel) ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"/>
                </button>
                <div v-if="goesOpen(channel)" class="goes">
                  <button v-for="output in outputs()" :key="output" type="button" class="go"
                          :class="{ on: isRouted(channel, output), s: output === 'BroadcastMix', blocked: !canRoute(channel, output) }"
                          :aria-pressed="isRouted(channel, output)" :aria-disabled="!canRoute(channel, output)"
                          :title="canRoute(channel, output) ? '' : $t('message.mixer.chatLockedTitle')"
                          @click="toggleRoute(channel, output)">
                    <font-awesome-icon :icon="canRoute(channel, output) ? outputIcon(output) : 'fa-solid fa-lock'"/>{{ outputShort(output) }}
                  </button>
                </div>
                <span v-if="!routedTo(channel).length" class="nowhere">
                  <font-awesome-icon icon="fa-solid fa-triangle-exclamation"/> {{ $t('message.mixer.nobodyHears') }}
                </span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- One card per output -->
    <section class="card" :aria-label="$t('message.mixer.outputs')">
      <div class="cardHead">
        <h3>{{ $t('message.mixer.outputs') }}</h3>
        <span class="sub">{{ $t('message.mixer.outputsSub') }}</span>
      </div>
      <div class="cardBody">
        <div class="scroll">
          <div class="strips">
            <div v-for="output in outputStrips()" :key="output" class="strip wide">
              <div class="sHead">
                <span class="ic"><font-awesome-icon :icon="outputIcon(output)"/></span>
                <span class="sName">
                  <span class="nm">{{ outputName(output) }}</span>
                  <span class="what">{{ $t(`message.mixer.outputWhat.${output}`) }}</span>
                  <span class="badge" :class="faderOf(output) ? 'f' : 'n'">{{ faderBadge(output) }}</span>
                </span>
              </div>
              <div class="oLevel">
                <LevelSlider v-if="hasLevel(output)" :value="volume(output)" :path="volumePath(output)" kind="one"
                             :tag="$t('message.mixer.volume')" :label="outputName(output) + ' ' + $t('message.mixer.volume')"
                             @update="setVolume(output, $event)"/>
                <span v-else class="noLevel">{{ $t('message.mixer.noOwnVolume') }}<br>{{ $t('message.mixer.setBySounds') }}</span>
              </div>
              <button v-if="faderOf(output)" type="button" class="mute" :class="{ muted: isMuted(output) }" :aria-pressed="isMuted(output)"
                      :aria-label="$t('message.device.muteChannel', { channel: outputName(output) })" @click="toggleMute(output)">
                <font-awesome-icon :icon="isMuted(output) ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high'"/>
                {{ isMuted(output) ? $t('message.mixer.muted') : $t('message.mixer.mute') }}
              </button>
              <template v-if="submixEnabled() && hasMixChoice(output)">
                <span class="label">{{ $t('message.mixer.playsMix') }}</span>
                <div class="ab" role="radiogroup" :aria-label="outputName(output) + ' ' + $t('message.mixer.playsMix')">
                  <button v-for="mix in ['A', 'B']" :key="mix" type="button" role="radio" :class="[mix.toLowerCase(), { on: outputMix(output) === mix }]"
                          :aria-checked="outputMix(output) === mix" @click="setOutputMix(output, mix)">{{ mix }}</button>
                </div>
              </template>
              <button v-if="canListen(output)" type="button" class="listen" :class="{ on: isMonitored(output) }"
                      :aria-pressed="isMonitored(output)" :title="$t('message.mixer.listenTitle')" @click="setMonitor(output)">
                <font-awesome-icon icon="fa-solid fa-headphones"/>{{ isMonitored(output) ? $t('message.mixer.listening') : $t('message.mixer.listen') }}
              </button>
              <span class="oWho">{{ outputWho(output) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="appsShown()" class="card" :aria-label="$t('message.mixer.appsElsewhere')">
      <div class="cardHead">
        <h3>{{ $t('message.mixer.appsElsewhere') }}</h3>
        <span class="sub">{{ $t('message.mixer.appsElsewhereSub') }}</span>
      </div>
      <div class="cardBody">
        <AppTray class="elsewhere" :channel="null" :empty="$t('message.mixer.appsElsewhereEmpty')" @moved="appMoved" @failed="appFailed"/>
        <p class="status" :class="{ error: message.error }" role="status">{{ message.text }}</p>
      </div>
    </section>
    <p v-else class="status" :class="{ error: message.error }" role="status">{{ message.text }}</p>
  </div>
</template>

<script>
import LevelSlider from "@/components/sections/mixer/LevelSlider.vue";
import AppTray from "@/components/sections/mixer/AppTray.vue";
import {liveMeters, useLiveMeters} from "@/util/liveMeters";
import {APP_CHANNELS, appSounds, useAppSounds} from "@/util/appSounds";
import {store} from "@/store";
import {websocket} from "@/util/sockets";
import {firmwareSupportsMix2, isDeviceMini, isStreamNoMusic} from "@/util/util";
import {channelNameToInputDevice, InputMixer, OutputRouting} from "@/util/mixerMapping";

// Redesigned Mixer page (mockup docs/mockups/2026-10-29-mixer)
const LEVEL_OUTPUTS = ["Headphones", "LineOut", "MicMonitor"];
const FADERS = ["A", "B", "C", "D"];
// Sounds with a live meter (the mic, and the GoXLR's Windows playback devices)
const METERED = ["Mic", "System", "Game", "Music", "Chat", "Sample"];
// Sounds marked "not in use" are only greyed out on this page, remembered in this browser
const OFF_KEY = "goxlr.mixer.notInUse";

const CHANNEL_ICONS = {
  Mic: "fa-solid fa-microphone", Chat: "fa-solid fa-comments", Music: "fa-solid fa-music",
  Game: "fa-solid fa-gamepad", Console: "fa-solid fa-tv", LineIn: "fa-solid fa-right-to-bracket",
  System: "fa-solid fa-desktop", Sample: "fa-solid fa-wave-square",
};

const OUTPUT_ICONS = {
  Headphones: "fa-solid fa-headphones", BroadcastMix: "fa-solid fa-tower-broadcast",
  StreamMix2: "fa-solid fa-tower-broadcast", ChatMic: "fa-solid fa-comment-dots", Sampler: "fa-solid fa-circle-dot",
  LineOut: "fa-solid fa-right-from-bracket", MicMonitor: "fa-solid fa-ear-listen",
};

function loadOff() {
  try {
    return JSON.parse(localStorage.getItem(OFF_KEY)) || [];
  } catch (e) {
    return [];
  }
}

export default {
  name: "MixerTop",
  components: {LevelSlider, AppTray},

  data() {
    return {
      appSounds,
      meters: liveMeters,
      message: {text: "", error: false},
      off: loadOff(),
      openGoes: [],
      dropOn: null,
      inFlight: {},
      queued: {},
    }
  },

  created() {
    // App boxes by channel, so a drop anywhere on a card reaches its box (not reactive on purpose)
    this.trays = {};
  },

  mounted() {
    this.releaseMeters = useLiveMeters();
    this.releaseApps = useAppSounds();
  },

  unmounted() {
    this.releaseMeters?.();
    this.releaseApps?.();
  },

  methods: {
    device() {
      return store.getActiveDevice();
    },
    serial() {
      return store.getActiveSerial();
    },
    // One request per key in flight; the latest value always lands
    send(key, command) {
      if (this.inFlight[key]) {
        this.queued[key] = command;
        return;
      }
      this.inFlight[key] = true;
      websocket.send_command(this.serial(), command).finally(() => {
        this.inFlight[key] = false;
        const next = this.queued[key];
        if (next) {
          this.queued[key] = null;
          this.send(key, next);
        }
      });
    },
    say(text, error = false) {
      this.message = {text, error};
    },

    /* ---------- Names and icons ---------- */
    soundName(channel) {
      return this.$t(`message.mixer.soundName.${channel}`);
    },
    soundWhat(channel) {
      return this.$t(`message.mixer.soundWhat.${channel}`);
    },
    channelIcon(channel) {
      return CHANNEL_ICONS[channel];
    },
    outputName(output) {
      return this.$t(`message.mixer.outputName.${output}`);
    },
    outputShort(output) {
      return this.$t(`message.mixer.outputShort.${output}`);
    },
    outputIcon(output) {
      return OUTPUT_ICONS[output];
    },
    faderBadge(channel) {
      const fader = this.faderOf(channel);
      return fader ? this.$t('message.mixer.faderN', {n: fader}) : this.$t('message.mixer.noFader');
    },

    /* ---------- Order: sounds on faders 1 - 4 first ---------- */
    faderOf(channel) {
      const index = FADERS.findIndex(f => this.device().fader_status[f].channel === channel);
      return index === -1 ? 0 : index + 1;
    },
    faderName(channel) {
      return FADERS[this.faderOf(channel) - 1];
    },
    onFaders() {
      return FADERS.map(f => this.device().fader_status[f].channel).filter(c => InputMixer.includes(c));
    },
    soundOrder() {
      const first = this.onFaders();
      return [...first, ...InputMixer.filter(c => !first.includes(c))];
    },
    // A thin line between the fader sounds and the rest (none when one side is empty)
    separatorAt() {
      const count = this.onFaders().length;
      return count > 0 && count < InputMixer.length ? count : -1;
    },

    /* ---------- Volumes ---------- */
    volume(channel) {
      return this.device().levels.volumes[channel];
    },
    volumePath(channel) {
      return `/mixers/${this.serial()}/levels/volumes/${channel}`;
    },
    setVolume(channel, value) {
      this.device().levels.volumes[channel] = value;
      this.send("volume-" + channel, {"SetVolume": [channel, value]});
    },
    hasMeter(channel) {
      return METERED.includes(channel);
    },
    meterLevel(channel) {
      return Math.round((this.meters[channel]?.level || 0) * 100);
    },

    /* ---------- Not in use (only greys the card out) ---------- */
    isOff(channel) {
      return this.off.includes(channel);
    },
    toggleOff(channel) {
      const off = !this.isOff(channel);
      this.off = off ? [...this.off, channel] : this.off.filter(c => c !== channel);
      try {
        localStorage.setItem(OFF_KEY, JSON.stringify(this.off));
      } catch (e) {
        // Not remembered; the page still works
      }
      this.say(off ? this.$t('message.mixer.lampOffDone', {sound: this.soundName(channel)})
          : this.$t('message.mixer.lampOnDone', {sound: this.soundName(channel)}));
    },
    toStream(channel) {
      return this.isRouted(channel, "BroadcastMix");
    },

    /* ---------- Mute (only possible through a fader's mute button) ---------- */
    isMuted(channel) {
      const fader = this.faderName(channel);
      return !!fader && this.device().fader_status[fader].mute_state !== "Unmuted";
    },
    toggleMute(channel) {
      const fader = this.faderName(channel);
      const status = this.device().fader_status[fader];
      const next = status.mute_state !== "Unmuted" ? "Unmuted" : (status.mute_type === "All" ? "MutedToAll" : "MutedToX");
      status.mute_state = next;
      websocket.send_command(this.serial(), {"SetFaderMuteState": [fader, next]});
    },
    // What the fader's mute does (set on the Configuration page)
    muteHow(channel) {
      let type = this.device().fader_status[this.faderName(channel)].mute_type;
      if (isDeviceMini() && isStreamNoMusic() && type === "ToStreams") type = "ToStream";
      return this.$t(`message.mixer.muteHow.${type}`);
    },

    /* ---------- Apps (drag an app to the sound it should play through) ---------- */
    // Only once the daemon has listed the apps (hidden on daemons without the apps API)
    appsShown() {
      return this.appSounds.loaded && !this.appSounds.error;
    },
    isAppChannel(channel) {
      return APP_CHANNELS.includes(channel);
    },
    closedText(channel) {
      return channel === "Mic" ? this.$t('message.mixer.appsClosedMic') : this.$t('message.mixer.appsClosedJack');
    },
    // The whole card takes the drop, not only its app box
    dragOver(event, channel) {
      if (!this.isAppChannel(channel) || !event.dataTransfer.types.includes("application/x-goxlr-app")) return;
      event.preventDefault();
      this.dropOn = channel;
    },
    dragLeave(event, channel) {
      if (this.dropOn === channel && !event.currentTarget.contains(event.relatedTarget)) this.dropOn = null;
    },
    dropApp(event, channel) {
      if (!this.isAppChannel(channel)) return;
      event.preventDefault();
      this.dropOn = null;
      this.trays[channel]?.drop(event);
    },
    appMoved(app, channel) {
      this.say(channel ? this.$t('message.mixer.appMoved', {app, channel: this.soundName(channel)})
          : this.$t('message.mixer.appMovedDefault', {app}));
    },
    appFailed(app, reason) {
      this.say(this.$t('message.mixer.appMoveFailed', {app, reason}), true);
    },

    /* ---------- Goes to (routing) ---------- */
    outputs() {
      const router = this.device().router.Microphone;
      return OutputRouting.filter(o => o in router && (o !== "StreamMix2" || firmwareSupportsMix2()));
    },
    canRoute(channel, output) {
      return !(channel === "Chat" && output === "ChatMic");
    },
    isRouted(channel, output) {
      return this.canRoute(channel, output) && !!this.device().router[channelNameToInputDevice(channel)][output];
    },
    routedTo(channel) {
      return this.outputs().filter(o => this.isRouted(channel, o));
    },
    toggleRoute(channel, output) {
      if (!this.canRoute(channel, output)) {
        this.say(this.$t('message.mixer.chatLocked'));
        return;
      }
      const input = channelNameToInputDevice(channel);
      const value = !this.device().router[input][output];
      this.device().router[input][output] = value;
      websocket.send_command(this.serial(), {"SetRouter": [input, output, value]});
    },
    goesOpen(channel) {
      return this.openGoes.includes(channel);
    },
    toggleGoes(channel) {
      this.openGoes = this.goesOpen(channel) ? this.openGoes.filter(c => c !== channel) : [...this.openGoes, channel];
    },
    allGoesOpen() {
      return InputMixer.every(c => this.goesOpen(c));
    },
    toggleAllGoes() {
      this.openGoes = this.allGoesOpen() ? [] : [...InputMixer];
    },

    /* ---------- Outputs ---------- */
    outputStrips() {
      return [...LEVEL_OUTPUTS, ...this.outputs().filter(o => o !== "Headphones" && o !== "LineOut")];
    },
    hasLevel(output) {
      return LEVEL_OUTPUTS.includes(output);
    },
    outputWho(output) {
      if (output === "MicMonitor") return this.$t('message.mixer.micMonitorWho');
      const who = this.soundOrder().filter(c => this.isRouted(c, output)).map(c => this.soundName(c));
      return this.$t('message.mixer.hears', {sounds: who.join(', ') || this.$t('message.mixer.nothing')});
    },

    /* ---------- Mix B (submix) ---------- */
    submixSupported() {
      return this.device().levels.submix_supported;
    },
    submixEnabled() {
      return this.submixSupported() && this.device().levels.submix !== null;
    },
    toggleSubmix() {
      websocket.send_command(this.serial(), {"SetSubMixEnabled": !this.submixEnabled()});
    },
    submixVolume(channel) {
      return this.device().levels.submix.inputs[channel].volume;
    },
    submixPath(channel) {
      return `/mixers/${this.serial()}/levels/submix/inputs/${channel}/volume`;
    },
    setSubmixVolume(channel, value) {
      this.device().levels.submix.inputs[channel].volume = value;
      this.send("submix-" + channel, {"SetSubMixVolume": [channel, value]});
    },
    // Linked: B moves with A (the real fader) and keeps the same gap
    isLinked(channel) {
      return this.device().levels.submix.inputs[channel].linked;
    },
    toggleLink(channel) {
      const linked = !this.isLinked(channel);
      this.device().levels.submix.inputs[channel].linked = linked;
      websocket.send_command(this.serial(), {"SetSubMixLinked": [channel, linked]});
    },
    // Only outputs the hardware lets you switch between A and B get the picker
    hasMixChoice(output) {
      return output in this.device().levels.submix.outputs;
    },
    outputMix(output) {
      return this.device().levels.submix.outputs[output];
    },
    setOutputMix(output, mix) {
      this.device().levels.submix.outputs[output] = mix;
      websocket.send_command(this.serial(), {"SetSubMixOutputMix": [output, mix]});
    },
    mixUsers(mix) {
      return this.outputStrips().filter(o => this.hasMixChoice(o) && this.outputMix(o) === mix)
          .map(o => this.outputName(o)).join(', ');
    },
    // Which output the headphones listen to (works with Mix B off too, like the Routing page)
    canListen(output) {
      return this.submixSupported() && this.outputs().includes(output);
    },
    isMonitored(output) {
      return this.device().levels.output_monitor === output;
    },
    setMonitor(output) {
      websocket.send_command(this.serial(), {"SetMonitorMix": output});
      this.say(output === "Headphones" ? this.$t('message.mixer.listenBack')
          : this.$t('message.mixer.listenNow', {output: this.outputName(output)}));
    },
  },
}
</script>

<style scoped>
.mixerPage {
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

/* ---------- Page head (same as Routing) ---------- */
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
  max-width: 70ch;
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
  transition: left .15s;
}

.switch.on {
  background: #59b1b6;
}

.switch.on span {
  left: 16px;
}

/* ---------- Mix bar ---------- */
.mixBar {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.mixBar.one {
  grid-template-columns: minmax(0, 1fr);
}

@media (max-width: 700px) {
  .mixBar {
    grid-template-columns: minmax(0, 1fr);
  }
}

.mixBox {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #59b1b6;
  border-radius: 10px;
  background: #1d3a3c;
}

.mixBox.b {
  border-color: #cc7224;
  background: #3d2a17;
}

.mixBox .tag {
  flex: none;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #59b1b6;
  color: #1d2120;
  font-weight: 700;
  font-size: 16px;
}

.mixBox.b .tag {
  background: #cc7224;
}

.mixBox .txt {
  flex: 1 1 200px;
  min-width: 0;
}

.mixBox b {
  display: block;
  font-family: var(--goxlr-title-font);
  font-weight: 600;
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-size: 15px;
}

.mixBox .users {
  font-size: 13px;
  color: #bff3f5;
}

.mixBox.b .users {
  color: #ffd2a6;
}

.mixBox.one {
  border-color: #3a413f;
  background: #2a2f2d;
}

.mixBox.one .tag {
  background: #4a524f;
  color: #e8ecea;
}

.mixBox.one .users {
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
  gap: 14px;
  min-height: 66px;
  padding: 12px 16px 12px 20px;
  border-bottom: 1px solid #3b413f;
  border-radius: 12px 12px 0 0;
  background: #313735;
}

.cardHead h3 {
  margin: 0;
  font-family: var(--goxlr-title-font);
  font-weight: 600;
  font-size: 18px;
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
}

.sub {
  font-size: 13px;
  color: #9aa4a0;
}

.spacer {
  flex: 1;
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

.goesAll {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #3a413f;
  border-radius: 8px;
  background: #2a2f2d;
  font-size: 13px;
}

.goesAll[aria-pressed=true] {
  border-color: #59b1b6;
  background: #1d3a3c;
  color: #bff3f5;
}

/* ---------- Strips ---------- */
.scroll {
  overflow-x: auto;
  padding-bottom: 4px;
}

.strips {
  display: flex;
  gap: 10px;
  align-items: stretch;
  width: max-content;
}

.strip {
  width: 148px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 10px;
  border: 1px solid #343a38;
  border-radius: 10px;
  background: #282d2b;
  transition: opacity .25s, filter .25s;
}

.strip.wide {
  width: 128px;
}

.strip.drop {
  border-color: #59b1b6;
  background: #233331;
}

/* "Not in use": greyed out like a room with the light off. Still works; hover or focus lights it up a bit. */
.strip.off {
  opacity: .4;
  filter: grayscale(1) brightness(.8);
  background: #222625;
}

.strip.off:hover, .strip.off:focus-within {
  opacity: .75;
}

.sep {
  width: 1px;
  margin: 0 4px;
  background: #3b413f;
}

.sHead {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-height: 52px;
}

.sHead .ic {
  width: 22px;
  padding-top: 2px;
  font-size: 18px;
  color: #9aa4a0;
  text-align: center;
}

.sName {
  flex: 1;
  min-width: 0;
}

.sHead .nm {
  display: block;
  font-family: var(--goxlr-title-font);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
}

.sHead .what {
  display: block;
  margin-top: 1px;
  font-size: 11px;
  color: #9aa4a0;
}

.badge {
  display: inline-block;
  margin-top: 5px;
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 10.5px;
}

.badge.f {
  background: #1d3a3c;
  color: #7fd3d8;
}

.badge.n {
  background: #353a38;
  color: #5f6866;
}

.lamp {
  flex: none;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid #343a38;
  border-radius: 6px;
  background: transparent;
  color: #5f6866;
  font-size: 12px;
}

.lamp.on {
  color: #59b1b6;
  border-color: #2f4d4f;
}

.lamp:hover {
  border-color: #6b7572;
}

.offNote {
  margin-top: -4px;
  font-size: 11px;
  color: #9aa4a0;
  text-align: center;
}

.offNote b {
  font-weight: 400;
  color: #ffd2a6;
}

.levels {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 10px;
}

/* Sits level with the slider tracks (the % above, the A/B tag below) */
.meter {
  position: relative;
  align-self: flex-end;
  width: 6px;
  height: 170px;
  margin-bottom: 22px;
  border-radius: 3px;
  background: #222625;
  overflow: hidden;
}

.meter i {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, #4fd1a5 70%, #e6c44f 88%, #e05a4f);
  transition: height .08s linear;
}

.meter.none {
  background: repeating-linear-gradient(180deg, #222625 0 4px, #2a2f2d 4px 8px);
}

.linkB {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 26px;
  border: 1px solid #3a413f;
  border-radius: 6px;
  background: #222625;
  color: #5f6866;
  font-size: 11px;
}

.linkB.on {
  border-color: #7a5a3a;
  color: #ffd2a6;
}

.mute {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 34px;
  border: 1px solid #444b49;
  border-radius: 6px;
  background: #2f3533;
  color: #c3ccc8;
  font-size: 13px;
}

.mute.muted {
  border-color: #c0484f;
  background: #5a1f22;
  color: #ffb3b6;
}

.mute[aria-disabled=true] {
  opacity: .45;
  cursor: not-allowed;
  border-style: dashed;
}

.muteHow {
  min-height: 13px;
  margin-top: -6px;
  font-size: 10.5px;
  color: #5f6866;
  text-align: center;
}

.label {
  font-size: 10.5px;
  color: #5f6866;
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
}

.apps.closed {
  min-height: 58px;
  display: grid;
  place-items: center;
  padding: 6px;
  border: 1px solid #303634;
  border-radius: 8px;
  background: #252a28;
  font-size: 11px;
  color: #5f6866;
  text-align: center;
}

/* ---------- Goes to ---------- */
.goesHead {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid #343a38;
  border-radius: 6px;
  background: #252a28;
  text-align: left;
}

.goesHead:hover {
  border-color: #6b7572;
}

.goesHead[aria-expanded=true] {
  border-color: #3a413f;
}

.goesIcons {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  color: #59b1b6;
  font-size: 12px;
}

.goesIcons .s {
  color: #cc7224;
}

.chev {
  color: #5f6866;
  font-size: 10px;
}

.goes {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.go {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid #3a413f;
  border-radius: 6px;
  background: #222625;
  color: #5f6866;
  font-size: 12px;
  text-align: left;
}

.go svg {
  width: 14px;
}

.go:hover:not(.blocked) {
  border-color: #6b7572;
}

.go.on {
  border-color: #59b1b6;
  background: #1d3a3c;
  color: #bff3f5;
}

.go.on.s {
  border-color: #cc7224;
  background: #3d2a17;
  color: #ffd2a6;
}

.go.blocked {
  opacity: .35;
  cursor: not-allowed;
  background: repeating-linear-gradient(135deg, transparent 0 6px, #2a2f2d 6px 12px);
}

.nowhere {
  font-size: 11px;
  color: #f0a8a8;
  text-align: center;
}

/* ---------- Output strips ---------- */
.oLevel {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  min-height: 200px;
}

.noLevel {
  align-self: center;
  padding: 0 4px;
  font-size: 11px;
  line-height: 1.4;
  color: #5f6866;
  text-align: center;
}

.ab {
  display: flex;
  border: 1px solid #3a413f;
  border-radius: 6px;
  overflow: hidden;
}

.ab button {
  flex: 1;
  height: 30px;
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

.listen {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 30px;
  border: 1px solid #3a413f;
  border-radius: 6px;
  background: #222625;
  color: #5f6866;
  font-size: 12px;
}

.listen.on {
  border-color: #59b1b6;
  background: #1d3a3c;
  color: #bff3f5;
}

.oWho {
  font-size: 11px;
  line-height: 1.4;
  color: #9aa4a0;
}

/* ---------- Apps elsewhere + status ---------- */
.elsewhere {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 44px;
  padding: 8px;
}

.elsewhere :deep(.app) {
  width: 170px;
}

.status {
  min-height: 20px;
  margin: 12px 0 0;
  font-size: 13px;
  color: #4fd1a5;
}

.status.error {
  color: #ff6b6b;
}

@media (prefers-reduced-motion: reduce) {
  .switch span, .meter i {
    transition: none;
  }
}
</style>
