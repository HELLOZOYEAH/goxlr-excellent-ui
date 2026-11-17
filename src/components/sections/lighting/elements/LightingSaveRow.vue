<template>
  <div class="saveRow">
    <button type="button" class="save" :disabled="!dirty.profile || saving" @click="save">
      {{ $t('message.lighting.faderLights.save') }}
    </button>
    <span class="state">{{ dirty.profile ? $t('message.lighting.faderLights.unsaved') : $t('message.lighting.faderLights.saved') }}</span>
  </div>
</template>

<script>
import {store} from "@/store";
import {websocket} from "@/util/sockets";
import {profileDirty} from "@/util/profileDirty";

// "Save to profile" with the saved / not saved state, as on Fader lights
export default {
  name: "LightingSaveRow",
  data() {
    return {dirty: profileDirty, saving: false};
  },
  methods: {
    save() {
      this.saving = true;
      websocket.send_command(store.getActiveSerial(), {"SaveProfile": []}).finally(() => this.saving = false);
    },
  },
}
</script>

<style scoped>
.saveRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.state {
  font-size: 12px;
  line-height: 1.5;
  color: #9aa4a0;
}

.save {
  padding: 7px 14px;
  border: 1px solid #f0b429;
  border-radius: 6px;
  background: #3a2f12;
  color: #ffd77a;
  font-family: inherit;
  cursor: pointer;
}

.save:disabled {
  border-color: #343a38;
  background: #262b2a;
  color: #6f7774;
  cursor: default;
}

.save:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}
</style>
