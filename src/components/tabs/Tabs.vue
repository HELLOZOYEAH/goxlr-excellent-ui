<template>
  <div :class="{ 'tabs-vertical': vertical }" :style="vertical ? {} : { marginLeft: '8px', marginRight: '8px' }"
       style="font-family: var(--goxlr-font);">
    <div v-if="vertical" class="tab-scrim" :class="{ on: drawer.open }" @click="drawer.open = false"></div>
    <div :class="vertical ? ['tab-nav', { open: drawer.open }] : 'tab'" role="TabList" :aria-label="tabListLabel"
         :aria-orientation="vertical ? 'vertical' : 'horizontal'"
         @mouseenter="hoverOpen" @mouseleave="hoverClose">
      <button v-for="tab in tabs" :key="tab.name"
        :class="{ active: tab.isActive }" v-show="!tab.hidden" @click="selectTab(tab)" role="tab"
        :aria-selected="tab.isActive" :tabindex="tab.isActive ? 0 : -1" @keydown="onTabKeydown" :ref="tab.name"
        :title="vertical ? tab.name : null">
        <span v-if="vertical && tab.icon" class="tab-icon-wrap">
          <font-awesome-icon :icon="tab.icon" class="tab-icon" fixed-width/>
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </span>
        <span class="tab-label">{{ tab.name }}</span>
      </button>
    </div>
    <div :class="vertical ? 'tab-content' : 'tabs-details'" role="tabpanel" :aria-label="getActiveTab().name">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import {navDrawer} from "@/util/navDrawer";

// Resting on the rail this long slides the drawer out
const HOVER_OPEN_MS = 350;

export default {
  emits: ["on-change"],
  name: "TabList",

  data() {
    return { tabs: [], drawer: navDrawer };
  },
  computed: {
    tabListLabel() {
      return this.label || this.$t('message.common.tabList');
    },
  },
  props: {
    label: {
      type: String,
      required: false,
      default: "Tab list",
    },
    // Sidebar layout: tabs stacked on the left with icons, content on the right
    vertical: {
      type: Boolean,
      default: false,
    },
  },

  created() {
    window.addEventListener("keydown", this.onTabKeydownGlobal)
  },
  unmounted() {
    window.removeEventListener("keydown", this.onTabKeydownGlobal)
    clearTimeout(this.hoverTimer);
  },
  methods: {
    hoverOpen() {
      if (!this.vertical) return;
      clearTimeout(this.hoverTimer);
      this.hoverTimer = setTimeout(() => {
        this.drawer.open = true;
        this.openedByHover = true;
      }, HOVER_OPEN_MS);
    },
    hoverClose() {
      clearTimeout(this.hoverTimer);
      if (this.openedByHover) this.drawer.open = false;
      this.openedByHover = false;
    },
    selectTab(selectedTab) {
      if (this.vertical) {
        this.drawer.open = false;
        this.openedByHover = false;
      }
      let activeTab = this.tabs.find((tab) => tab.isActive);
      this.tabs.forEach((tab) => {
        tab.isActive = tab.id === selectedTab.id;
      });
      let newActive = this.tabs.find((tab) => tab.isActive);

      if (activeTab !== newActive) {
        // Make sure we mount the tab before we call an update..
        this.$nextTick(() => this.$emit("on-change", selectedTab));
      }
    },

    // This function is generally for external calls, to set directly by id.
    selectTabById(id) {
      let tab = this.tabs.find((tab) => tab.id === id);
      this.selectTab(tab);
    },

    getActiveTab() {
      //return the active tab
      const activeTab = this.tabs.find((tab) => tab.isActive);
      if (activeTab) {
        return activeTab;
      } else {
        return "";
      }
    },
    //keyboard navigation
    onTabKeydown(event) {
      const tabs = this.tabs;
      const activeTab = this.getActiveTab();
      const activeTabIndex = tabs.indexOf(activeTab);
      let nextTab;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
          nextTab = tabs[(activeTabIndex + 1) % tabs.length];
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          nextTab = tabs[(activeTabIndex - 1 + tabs.length) % tabs.length];
          break;
        case "Home":
          nextTab = tabs[0];
          break;
        case "End":
          nextTab = tabs[tabs.length - 1];
          break;
        default:
          break;
      }


      if (nextTab) {
        this.selectTab(nextTab);
        //nextTab.$el is the button element
        //we need a ref on the button element to focus it
        this.$refs[nextTab.name][0].focus();
      }
    },
    onTabKeydownGlobal(event) {
      if (this.vertical && !event.target.closest?.("input, textarea, select, [contenteditable=true]")) {
        if (event.key === "[" && !event.ctrlKey && !event.altKey && !event.metaKey) {
          this.drawer.open = !this.drawer.open;
          this.openedByHover = false;
          return;
        }
        if (event.key === "Escape" && this.drawer.open) {
          this.drawer.open = false;
          event.drawerClosed = true; // so the page underneath doesn't also act on this Escape
          return;
        }
      }
      if (this.label !== "Device Settings") return;
      const tabs = this.tabs;
      // const activeTab = this.getActiveTab();
      // const activeTabIndex = tabs.indexOf(activeTab);
      let nextTab;
      if (event.shiftKey && event.ctrlKey) {
        // Shift(Number) have different symbol between US keyboard and Other language.
        switch (event.code) {
          case "Digit1":
          case "Digit2":
          case "Digit3":
          case "Digit4":
          case "Digit5":
          case "Digit6":
          case "Digit7":
          case "Digit8":
            nextTab = tabs[Number(event.code[5]) - 1];
            break;
          default:
            break;
        }
      }

      if (nextTab) {
        this.selectTab(nextTab);
        //nextTab.$el is the button element
        //we need a ref on the button element to focus it
        this.$refs[nextTab.name][0].focus();
      }
    },
  },
  mounted() {
    this.$emit("on-change", this.getActiveTab());
  }
};
</script>

<style>
.tab {
  border-bottom: 1px solid #59b1b6;
  text-align: left;
}

.tab button {
  background-color: inherit;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 10px 20px;
  margin-bottom: -1px;
  min-width: 150px;
  max-width: min-content;

  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  border-radius: 5px 5px 0 0;
  color: #fff;
  white-space: nowrap;
}

.tab button:hover:not(.active) {
  background-color: #2d3230;
}

.tab button.active {
  border: 1px solid #59b1b6;
  border-bottom: 1px solid #252927;

  text-shadow: 0 0 3px #59b1b6, 0 0 5px #59b1b6;
}

/* ---------- Vertical (sidebar) layout ---------- */
/* A thin icon rail; it slides out over the page as a drawer with labels */
.tabs-vertical {
  position: relative;
  display: flex;
  align-items: stretch;
  min-height: calc(100vh - 64px);
  padding-left: 64px;
}

.tab-nav {
  position: absolute;
  z-index: 30;
  top: 0;
  bottom: 0;
  left: 0;
  width: 64px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 10px;
  overflow: hidden;
  background: #1f2423;
  border-right: 1px solid #2e3432;
  transition: width .22s ease, box-shadow .22s ease;
}

.tab-nav.open {
  width: 220px;
  box-shadow: 12px 0 40px rgba(0, 0, 0, .55);
}

.tab-nav .tab-label {
  opacity: 0;
  transition: opacity .15s ease;
}

.tab-nav.open .tab-label {
  opacity: 1;
}

.tab-scrim {
  position: absolute;
  z-index: 29;
  inset: 0;
  background: rgba(0, 0, 0, .4);
  opacity: 0;
  pointer-events: none;
  transition: opacity .2s ease;
}

.tab-scrim.on {
  opacity: 1;
  pointer-events: auto;
}

.tab-nav button {
  display: flex;
  flex: none;
  align-items: center;
  gap: 14px;
  min-height: 44px;
  padding: 0 13px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #a9b3af;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-size: 15px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
}

.tab-nav button:hover:not(.active) {
  background: #262b2a;
  color: #fff;
}

.tab-nav button.active {
  background: #2d3330;
  color: #fff;
}

.tab-nav button.active .tab-icon {
  color: #59b1b6;
  filter: drop-shadow(0 0 4px #59b1b6);
}

.tab-nav button:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.tab-icon {
  width: 18px;
  font-size: 16px;
}

.tab-icon-wrap {
  position: relative;
  display: inline-flex;
}

.tab-badge {
  position: absolute;
  top: -7px;
  right: -14px;
  padding: 1px 4px;
  border-radius: 999px;
  background: #f5a33a;
  color: #412402;
  font-family: var(--goxlr-font);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.2;
}

.tab-content {
  flex: 1 1 auto;
  min-width: 0;
  overflow: auto;
}

.tabs-details {
  border: 1px solid #59b1b6;
  border-top: 0;
  padding: 0;
  margin: 0;
  overflow: auto;
  vertical-align: middle;
}
</style>
