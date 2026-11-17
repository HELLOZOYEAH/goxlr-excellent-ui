<template>
  <div class="tray" :class="{ over }" @dragover.prevent="over = true" @dragleave="over = false" @drop.prevent="drop">
    <div v-for="app in apps" :key="app.path" class="app">
      <button type="button" class="chip" :class="{ quiet: !app.playing }" draggable="true"
              :title="appName(app) + ' · ' + app.device" :aria-expanded="menu === app.path"
              :aria-label="$t('message.mixer.appMove', { app: appName(app) })"
              @dragstart="dragStart($event, app)" @click="menu = menu === app.path ? null : app.path">
        <span class="dot" :title="app.playing ? $t('message.mixer.appPlaying') : ''"></span>
        <span class="label">{{ appName(app) }}</span>
      </button>
      <div v-if="menu === app.path" class="menu" role="menu">
        <button v-for="target in targets" :key="target.id" type="button" role="menuitem" @click="move(app, target.id)">
          {{ target.label }}
        </button>
      </div>
    </div>
    <span v-if="!apps.length" class="empty">{{ empty || $t('message.mixer.appDrop') }}</span>
  </div>
</template>

<script>
// Apps playing through one GoXLR channel (Mixer page). Drag a chip onto another channel's tray,
// or click it and pick a channel, to move the app there.
import {APP_CHANNELS, appName, appSounds, moveApp} from "@/util/appSounds";

export default {
  name: "AppTray",
  emits: ["moved", "failed"],
  props: {
    // GoXLR channel ("System", "Game", ...), or null for apps on other devices
    channel: {type: String, default: null},
    // Text when no app is here (defaults to "Drop an app here")
    empty: {type: String, default: ""},
  },

  data() {
    return {over: false, menu: null}
  },

  computed: {
    apps() {
      return appSounds.list.filter(a => (a.channel || null) === this.channel);
    },
    targets() {
      const list = APP_CHANNELS.filter(c => c !== this.channel)
          .map(c => ({id: c, label: this.$t('message.mixer.appMoveTo', {channel: this.$t(`message.channels.${c}`)})}));
      if (this.channel) list.push({id: null, label: this.$t('message.mixer.appWindowsDefault')});
      return list;
    },
  },

  methods: {
    appName,
    dragStart(event, app) {
      this.menu = null;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("application/x-goxlr-app", app.path);
    },
    drop(event) {
      this.over = false;
      const path = event.dataTransfer.getData("application/x-goxlr-app");
      const app = appSounds.list.find(a => a.path === path);
      if (app && (app.channel || null) !== this.channel) return this.move(app, this.channel);
    },
    async move(app, channel) {
      this.menu = null;
      const name = appName(app);
      try {
        await moveApp(app.path, channel);
        this.$emit("moved", name, channel);
      } catch (e) {
        this.$emit("failed", name, e.message);
      }
    },
  },
}
</script>

<style scoped>
/* Looks of the Mixer mockup (docs/mockups/2026-10-29-mixer): dashed box, chips with a "playing" dot */
.tray {
  width: 100%;
  min-height: 58px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  box-sizing: border-box;
  border: 1px dashed #3d4442;
  border-radius: 8px;
  transition: border-color .15s, background .15s;
}

.tray.over {
  border-color: #59b1b6;
  background: #233331;
}

.app {
  position: relative;
}

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
  padding: 4px 6px;
  border: 0;
  border-radius: 6px;
  background: #343a38;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 12px;
  cursor: grab;
  user-select: none;
}

.dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4fd1a5;
}

.chip.quiet .dot {
  background: #59615e;
}

.label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.menu {
  position: absolute;
  z-index: 5;
  top: calc(100% + 4px);
  left: 0;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  padding: 4px;
  border: 1px solid #3b413f;
  border-radius: 8px;
  background: #1f2322;
  box-shadow: 0 8px 20px rgba(0, 0, 0, .5);
}

.menu button {
  padding: 7px 10px;
  border: 0;
  border-radius: 5px;
  background: none;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}

.menu button:hover, .menu button:focus-visible {
  background: #2d3432;
}

.empty {
  padding: 4px 0;
  font-size: 11px;
  color: #5f6866;
  text-align: center;
}

button:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 1px;
}
</style>
