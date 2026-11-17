<template>
  <div class="languageToggle" role="group" :aria-label="$t('message.system.settings.language')">
    <button v-for="language in toggleLanguages" :key="language.id"
            :class="{ active: isActive(language.id) }" :aria-pressed="isActive(language.id)"
            @click="setLanguage(language.id)">
      {{ language.label }}
    </button>
  </div>
</template>

<script>
import {websocket} from "@/util/sockets";

export default {
  name: "LanguageToggle",

  data() {
    return {
      toggleLanguages: [
        {id: "en_GB", label: "EN"},
        {id: "th_TH", label: "TH"},
      ],
    }
  },

  methods: {
    isActive(id) {
      // Anything that isn't Thai (en_US, en_GB, missing locales) displays as English
      let isThai = this.$i18n.locale.startsWith("th");
      return id === "th_TH" ? isThai : !isThai;
    },

    setLanguage(id) {
      // Saved in the daemon, the same way the System > Utility Settings language list does it
      websocket.send_daemon_command({"SetLocale": id}).then(() => {
        this.$i18n.locale = id;
      });
    },
  },
}
</script>

<style scoped>
.languageToggle {
  display: flex;
  border: 1px solid #3a413f;
  border-radius: 8px;
  overflow: hidden;
}

.languageToggle button {
  min-width: 48px;
  min-height: 40px;
  padding: 0 10px;
  border: none;
  background-color: transparent;
  color: #8a918e;
  font-size: 14px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  cursor: pointer;
}

.languageToggle button:hover:not(.active) {
  color: #fff;
}

.languageToggle button.active {
  background-color: #1d3a3c;
  color: #fff;
  text-shadow: 0 0 3px #59b1b6, 0 0 5px #59b1b6;
}
</style>
