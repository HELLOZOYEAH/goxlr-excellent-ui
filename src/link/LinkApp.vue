<template>
  <LinkPanel/>
</template>

<script>
// The GoXLR Link window on the gaming PC (served by goxlr-link itself)
import LinkPanel from "@/link/LinkPanel.vue";

export default {
  name: "LinkApp",
  components: {LinkPanel},
}
</script>

<style>
/* Same fonts as the GoXLR app: Play for text, Rajdhani for titles, Chakra Petch for Thai */
@font-face {
  src: url('../assets/fonts/Play-Regular.ttf');
  font-family: 'GoXLR';
  font-weight: 400;
}

@font-face {
  src: url('../assets/fonts/Play-Bold.ttf');
  font-family: 'GoXLR';
  font-weight: 700;
}

@font-face {
  src: url('../assets/fonts/Rajdhani-SemiBold.ttf');
  font-family: 'GoXLRTitle';
  font-weight: 700;
}

@font-face {
  src: url('../assets/fonts/ChakraPetch-Regular.ttf');
  font-family: 'GoXLR';
  font-weight: 400;
  unicode-range: U+0E00-0E7F;
}

@font-face {
  src: url('../assets/fonts/ChakraPetch-SemiBold.ttf');
  font-family: 'GoXLR';
  font-weight: 700;
  unicode-range: U+0E00-0E7F;
}

@font-face {
  src: url('../assets/fonts/ChakraPetch-SemiBold.ttf');
  font-family: 'GoXLRTitle';
  font-weight: 700;
  unicode-range: U+0E00-0E7F;
}

:root {
  --goxlr-font: GoXLR, sans-serif;
  --goxlr-title-font: GoXLRTitle, GoXLR, sans-serif;
  --goxlr-title-spacing: 0.12em;
}

html, body {
  margin: 0;
  background: #252927;
}

body {
  padding: 12px;
  font-family: var(--goxlr-font);
  -webkit-font-smoothing: antialiased;
  user-select: none;
}
</style>
