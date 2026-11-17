<template>
  <div class="cardMenu" ref="root">
    <button type="button" class="dots" :aria-label="label" aria-haspopup="menu" :aria-expanded="open" @click="open = !open">
      <span></span>
    </button>
    <div v-if="open" class="menu" role="menu">
      <button v-for="item in items" :key="item.id" type="button" role="menuitemcheckbox"
              :aria-checked="item.checked === undefined ? undefined : !!item.checked" @click="pick(item)">
        <span>{{ item.label }}</span>
        <font-awesome-icon v-if="item.checked" icon="fa-solid fa-check" class="check"/>
      </button>
    </div>
  </div>
</template>

<script>
// The ⋮ button on a Mic card header: a short list of options (Advanced, Fine-tune, Reset ...)
export default {
  name: "CardMenu",
  emits: ["select"],
  props: {
    label: {type: String, required: true},
    // [{id, label, checked?}] - checked undefined = plain action, true/false = shows a tick
    items: {type: Array, required: true},
  },

  data() {
    return {open: false}
  },

  methods: {
    pick(item) {
      this.open = false;
      this.$emit("select", item.id);
    },
    outside(event) {
      if (this.open && !this.$refs.root.contains(event.target)) this.open = false;
    },
    escape(event) {
      if (event.key === "Escape") this.open = false;
    },
  },

  mounted() {
    document.addEventListener("pointerdown", this.outside);
    document.addEventListener("keydown", this.escape);
  },

  unmounted() {
    document.removeEventListener("pointerdown", this.outside);
    document.removeEventListener("keydown", this.escape);
  },
}
</script>

<style scoped>
.cardMenu {
  position: relative;
}

.dots {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #343a38;
  cursor: pointer;
}

.dots:hover, .dots[aria-expanded=true] {
  border-color: #4a524f;
}

.dots span {
  display: block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #e8ecea;
  box-shadow: 0 -7px 0 #e8ecea, 0 7px 0 #e8ecea;
}

.menu {
  position: absolute;
  top: 44px;
  right: 0;
  z-index: 20;
  min-width: 230px;
  padding: 6px;
  border: 1px solid #3b413f;
  border-radius: 8px;
  background: #2a302e;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .45);
}

.menu button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 9px 10px;
  border: 0;
  border-radius: 6px;
  background: none;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.menu button:hover {
  background: #1d3a3c;
}

.check {
  color: #59b1b6;
}

button:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}
</style>
