<template>
  <section class="finder" :aria-label="$t('message.link.findTitle')">
    <div class="head">
      <span class="muted">{{ searching && !found.length ? $t('message.link.findLooking') : $t('message.link.findTitle') }}</span>
      <button type="button" class="again" :disabled="searching" @click="search">
        <font-awesome-icon icon="fa-solid fa-rotate" :spin="searching"/>{{ $t('message.link.findAgain') }}
      </button>
    </div>
    <div v-for="pc in found" :key="pc.name" class="pc">
      <font-awesome-icon icon="fa-solid fa-desktop" class="pcIcon"/>
      <div class="who">
        <div>{{ pc.name }}</div>
        <div class="muted">{{ pc.device }}</div>
      </div>
      <span v-if="pc.current" class="pill">{{ $t('message.link.findLinked') }}</span>
      <button v-else type="button" class="link" :disabled="picking" @click="pick(pc)">{{ $t('message.link.findLink') }}</button>
    </div>
    <form v-if="codeFor" class="codeRow" @submit.prevent="sendCode">
      <label for="linkFinderCode">{{ $t('message.link.findCode', {host: codeFor}) }}</label>
      <input id="linkFinderCode" v-model.trim="code" type="text" inputmode="numeric" maxlength="6" placeholder="123456" autocomplete="off">
      <button type="submit" class="link" :disabled="code.length !== 6">{{ $t('message.link.findLink') }}</button>
    </form>
    <p v-if="!searching && !found.length" class="muted none">{{ $t('message.link.findNone') }}</p>
    <p v-if="error" class="problem">{{ error }}</p>
  </section>
</template>

<script>
// The streaming PCs GoXLR Link found on this network (they answer a broadcast), to link with one
// click instead of typing an IP address. Pairing still needs the code shown on the streaming PC.
const APP_API = "http://127.0.0.1:47810";

export default {
  name: "LinkFinder",
  props: {
    apiBase: {type: String, default: APP_API},
  },
  emits: ["picked"],

  data() {
    return {
      found: [],
      searching: false,
      picking: false,
      error: "",
      // The streaming PC waiting for its pairing code (only the first time)
      codeFor: "",
      code: "",
    }
  },

  mounted() {
    this.search();
  },

  methods: {
    async search() {
      this.searching = true;
      this.error = "";
      const found = await fetch(this.apiBase + "/api/find").then(r => r.json()).catch(() => null);
      this.found = Array.isArray(found) ? found : [];
      this.searching = false;
    },
    async pick(pc) {
      this.picking = true;
      this.error = "";
      const change = {host: `${pc.ip}:${pc.port}`, hostName: pc.name};
      const response = await fetch(this.apiBase + "/api/settings", {method: "POST", body: JSON.stringify(change)}).catch(() => null);
      const body = response ? await response.json() : null;
      if (response && !response.ok) this.error = body;
      this.codeFor = response && response.ok && !body.paired ? pc.name : "";
      this.picking = false;
      this.found = this.found.map(f => ({...f, current: f.name === pc.name}));
      this.$emit("picked", pc);
    },
    async sendCode() {
      this.error = "";
      const response = await fetch(this.apiBase + "/api/settings", {method: "POST", body: JSON.stringify({code: this.code})}).catch(() => null);
      if (!response) return;
      if (response.ok) {
        this.codeFor = "";
        this.code = "";
      } else {
        this.error = await response.json();
      }
    },
  },
}
</script>

<style scoped>
.finder {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  color: #cfd6d2;
  font-family: var(--goxlr-font);
  font-size: 12px;
}

.head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.muted {
  color: #8d9693;
}

.pc {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border: 1px solid #343a38;
  border-radius: 10px;
  background: #262b29;
}

.pcIcon {
  font-size: 18px;
  color: #59b1b6;
}

.who {
  flex: 1;
  min-width: 0;
}

.who div {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.again,
.link {
  height: 28px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #3b413f;
  border-radius: 7px;
  background: #2a2f2d;
  color: #e8ecea;
  font-family: var(--goxlr-font);
  font-size: 12px;
  cursor: pointer;
}

.again {
  margin-left: auto;
}

.link {
  border-color: #59b1b6;
  background: #1d3a3c;
}

.again:disabled,
.link:disabled {
  opacity: .5;
  cursor: default;
}

.pill {
  padding: 2px 8px;
  border-radius: 999px;
  background: #1d3a3c;
  color: #9fe1cb;
  font-size: 11px;
}

.codeRow {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 9px 11px;
  border: 1px solid #59b1b6;
  border-radius: 10px;
  background: #1b2627;
}

.codeRow label {
  flex: 1 1 200px;
}

.codeRow input {
  width: 110px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid #3b413f;
  border-radius: 7px;
  background: #141716;
  color: #9fe1cb;
  font-family: var(--goxlr-font);
  font-size: 14px;
  letter-spacing: .2em;
}

.none,
.problem {
  margin: 0;
}

.problem {
  padding: 8px 10px;
  border-radius: 8px;
  background: #3a321d;
  color: #fac775;
}
</style>
