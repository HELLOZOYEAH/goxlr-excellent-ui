<template>
  <div>
    <button v-if="compact" id="mic_setup" ref="mic_setup_button" type="button" class="compactButton" @click="openModal">
      {{ label || $t('message.microphone.setup.button') }}
    </button>
    <BigButton v-else id="mic_setup" ref="mic_setup_button" :title="$t('message.microphone.setup.button')" @click="openModal">
      <font-awesome-icon icon="fa-solid fa-microphone-lines" />
    </BigButton>
    <AccessibleModal width="820px" ref="micSetupModal" id="mic_setup" body-padding="0px" :show_footer=false @modal-close="closeModal">
      <template v-slot:title>{{ $t('message.microphone.setup.title') }}</template>
      <SetupModel ref="setup" />
    </AccessibleModal>
  </div>
</template>

<script>
import BigButton from "@/components/buttons/BigButton.vue";
import SetupModel from "@/components/sections/mic/SetupModel.vue";
import AccessibleModal from "@/components/design/modal/AccessibleModal.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

export default {
  emits: ["mic-setup-open"],
  name: "MicSetupButton",
  components: {FontAwesomeIcon, AccessibleModal, BigButton, SetupModel},
  props: {
    // Small text button (Mic page) instead of the large icon tile
    compact: {type: Boolean, default: false},
    label: {type: String, required: false, default: ""},
  },

  data() {
    return {
      showModal: false,
    }
  },

  methods: {
    openModal() {
      this.$emit('mic-setup-open');

      this.$refs.micSetupModal.openModal(this.$refs.setup, this.$refs.mic_setup_button);
      this.$refs.setup.opened();
    },

    closeModal() {
      this.$refs.setup.closed();
    }
  }
}
</script>

<style scoped>
.compactButton {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid #3a413f;
  border-radius: 8px;
  background: #2a2f2d;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 14px;
  cursor: pointer;
}

.compactButton:hover {
  border-color: #59b1b6;
}

.compactButton:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}
</style>
