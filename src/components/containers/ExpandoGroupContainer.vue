<script>
import GroupContainer from "@/components/containers/GroupContainer.vue";

export default {
  name: "ExpandoGroupContainer",
  components: {GroupContainer},
  emits: ["expando-clicked"],
  props: {
    title: String,
    expanded: Boolean,
  }
}
</script>

<template>
  <div class="expando">
    <GroupContainer :title="title">
      <template #right>
        <slot name="right"></slot>
        <!-- Simple / Advanced switch lives in the card header instead of a thin arrow strip on the side -->
        <button type="button" class="advancedButton" :class="{ open: expanded }" :aria-expanded="expanded"
                @click="$emit('expando-clicked')">
          {{ expanded ? $t('message.device.simple') : $t('message.device.advanced') }}
          <font-awesome-icon icon="fa-solid fa-chevron-down" class="chevron"/>
        </button>
      </template>
      <slot></slot>
    </GroupContainer>
  </div>
</template>

<style scoped>
.expando {
  display: flex;
  flex-direction: row;
}

.advancedButton {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  margin-left: 8px;
  padding: 0 10px;
  border: 1px solid #3b413f;
  border-radius: 6px;
  background: #3b413f;
  color: #c3ccc8;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}

.advancedButton:hover {
  border-color: #59b1b6;
  color: #fff;
}

.advancedButton.open {
  border-color: #59b1b6;
  color: #fff;
}

.advancedButton:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.chevron {
  font-size: 10px;
  transition: transform 0.15s;
}

.open .chevron {
  transform: rotate(180deg);
}
</style>
