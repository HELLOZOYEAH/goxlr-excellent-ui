<template>
  <div v-if='isActive'>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "TabButton",
  props: {
    id: {type: String, required: true},
    name: {type: String, required: true},
    selected: {type: Boolean, default: false},
    // Font Awesome icon shown in the sidebar layout, e.g. "fa-solid fa-sliders"
    icon: {type: String, required: false, default: null},
    // Small label on the sidebar icon, e.g. "NEW"
    badge: {type: String, required: false, default: null},
  },
  data() {
    return {
      isActive: true
    }
  },

  computed: {
    href() {
      return '#' + this.name.toLowerCase().replace(/ /g, '-');
    }
  },

  mounted() {
    this.isActive = this.selected;
  },

  created() {
    this.$parent.tabs.push(this);
  }
}
</script>

<style scoped>
</style>
