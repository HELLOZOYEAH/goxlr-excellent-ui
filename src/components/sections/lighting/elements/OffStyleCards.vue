<template>
  <div>
    <div :class="sub ? 'sublab' : 'lab'">{{ label() }}</div>
    <div class="seg" role="radiogroup" :aria-label="label()">
      <button v-for="style in styles" :key="style" type="button" role="radio" :class="{ on: modelValue === style }"
              :aria-checked="modelValue === style" :title="$t(`message.lighting.shared.offStyles.${style}.desc`)"
              @click="$emit('pick', style)">{{ $t(`message.lighting.shared.offStyles.${style}.name`) }}
      </button>
    </div>
  </div>
</template>

<script>
import {OFF_STYLES} from "@/util/lightingColours";

// How a button looks when it is off, as the chip row on Fader lights' mute buttons
export default {
  name: "OffStyleCards",
  props: {
    title: {type: String, default: null},
    sub: {type: Boolean, default: false},          // small label under another section, as on Fader lights
    modelValue: {type: String, default: null},     // null when the targets differ
  },
  emits: ["pick"],
  data() {
    return {styles: OFF_STYLES};
  },
  methods: {
    label() {
      return this.title || this.$t('message.lighting.shared.whenOff');
    },
  },
}
</script>

<style scoped src="./lightingPage.css"></style>
