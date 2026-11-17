<template>
  <LinkTab v-if="linkPopout" popout @dock="dock"/>
  <GoXLR v-else/>
</template>

<script>
import GoXLR from "@/components/GoXLR.vue";
import LinkTab from "@/components/sections/LinkTab.vue";
import {isPopoutView, popoutLocale, runAsPopout} from "@/link/popout";

export default {
  name: 'App',
  components: {
    GoXLR,
    LinkTab,
  },
  data() {
    // The GoXLR Link pop-out window loads this same page with ?view=link-popout
    return {linkPopout: isPopoutView(), dock: null};
  },
  created() {
    if (!this.linkPopout) return;
    document.title = "GoXLR Link";
    const locale = popoutLocale();
    if (locale) this.$i18n.locale = locale;
    this.dock = runAsPopout();
  },
}
</script>

<style>
/* Thin, quiet scrollbars everywhere (like a chat app): no arrows, no track, a soft rounded thumb */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track, ::-webkit-scrollbar-corner {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, .14);
  border: 3px solid transparent;
  border-radius: 5px;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, .3);
}

::-webkit-scrollbar-button {
  display: none;
}

body {
  background-color: #252927;
  padding: 0;
  margin: 0;
}

/* Body text: Play, the font used by the official GoXLR App */
@font-face {
  src: url('./assets/fonts/Play-Regular.ttf');
  font-family: 'GoXLR';
  font-weight: 400;
}

@font-face {
  src: url('./assets/fonts/Play-Bold.ttf');
  font-family: 'GoXLR';
  font-weight: 700;
}

/* Titles: Rajdhani, also from the official app (Latin only, falls back to GoXLR) */
@font-face {
  src: url('./assets/fonts/Rajdhani-Medium.ttf');
  font-family: 'GoXLRTitle';
  font-weight: 400;
}

@font-face {
  src: url('./assets/fonts/Rajdhani-SemiBold.ttf');
  font-family: 'GoXLRTitle';
  font-weight: 700;
}

/* Thai glyphs for both families: Chakra Petch matches the squared style */
@font-face {
  src: url('./assets/fonts/ChakraPetch-Regular.ttf');
  font-family: 'GoXLR';
  font-weight: 400;
  unicode-range: U+0E00-0E7F;
}

@font-face {
  src: url('./assets/fonts/ChakraPetch-SemiBold.ttf');
  font-family: 'GoXLR';
  font-weight: 700;
  unicode-range: U+0E00-0E7F;
}

@font-face {
  src: url('./assets/fonts/ChakraPetch-Regular.ttf');
  font-family: 'GoXLRTitle';
  font-weight: 400;
  unicode-range: U+0E00-0E7F;
}

@font-face {
  src: url('./assets/fonts/ChakraPetch-SemiBold.ttf');
  font-family: 'GoXLRTitle';
  font-weight: 700;
  unicode-range: U+0E00-0E7F;
}

/* GoXLR Link pop-out in the app window: only the controller, see-through around it */
html.linkPopoutWindow, html.linkPopoutWindow body {
  background: transparent;
  overflow: hidden;
}

:root {
  --goxlr-font: GoXLR, sans-serif;
  --goxlr-title-font: GoXLRTitle, GoXLR, sans-serif;
  --goxlr-title-spacing: 0.12em;
}

#app {
  font-family: var(--goxlr-font);

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  user-select: none;
}

button {
  font-family: var(--goxlr-font);
}
</style>
