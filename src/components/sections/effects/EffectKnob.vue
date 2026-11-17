<template>
  <button type="button" class="effectKnob" :class="{ selected: selected, dragging: dragging }"
          :title="$t('message.device.knobHint')"
          :aria-label="label() + ', ' + valueText()"
          @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up"
          @dblclick="reset" @keydown="key">
    <span class="ring" :style="{ width: size + 'px', height: size + 'px' }">
      <span v-for="dot in dots()" :key="dot.i" class="dot" :style="dot.style"></span>
      <span class="cap" :class="{ snapped: snapped() && dragging }" :style="capStyle()">
        <span class="pointer" :style="pointerStyle()"></span>
      </span>
      <span v-if="showValue" class="value">{{ valueText() }}</span>
    </span>
    <span class="name">{{ dragging && !showValue ? valueText() : label() }}</span>
  </button>
</template>

<script>
import {store} from "@/store";
import {websocket} from "@/util/sockets";
import {detent, KNOB_DOTS, knobDotColours, knobPos, knobRange, knobValueText, undetent, valueFromPos} from "@/util/effectKnobs";

// Pixels of horizontal drag for the knob's full travel
const DRAG_PX = 200;

export default {
  name: "EffectKnob",
  emits: ["select"],
  props: {
    knob: {type: Object, required: true},
    size: {type: Number, default: 84},
    selected: {type: Boolean, default: false},
    // Show the value inside the knob (large knobs) instead of only while dragging
    showValue: {type: Boolean, default: false},
  },

  data() {
    return {
      drag: null,
      dragging: false,
      inFlight: false,
      queued: null,
    }
  },

  methods: {
    device() {
      return store.getActiveDevice();
    },
    label() {
      return this.$t(`message.effects.${this.knob.i18n}.title`);
    },
    valueText() {
      return knobValueText(this.device(), this.knob);
    },
    snapped() {
      return this.knob.centred && this.device().effects.current[this.knob.effect].amount === 0;
    },
    dots() {
      const s = this.size, radius = s * 0.43, w = Math.max(3, s * 0.05), h = Math.max(8, s * 0.12);
      return knobDotColours(this.device(), this.knob).map((dot, i) => {
        const deg = 135 + i * 270 / (KNOB_DOTS - 1);
        const rad = deg * Math.PI / 180;
        return {
          i: i,
          style: {
            left: (s / 2 + radius * Math.cos(rad)) + "px", top: (s / 2 + radius * Math.sin(rad)) + "px",
            width: w + "px", height: h + "px", margin: `${-h / 2}px 0 0 ${-w / 2}px`,
            background: dot.colour, boxShadow: dot.lit ? `0 0 ${s * 0.05}px ${dot.colour}` : "none",
            transform: `rotate(${deg + 90}deg)`,
          },
        };
      });
    },
    capStyle() {
      const c = this.size * 0.52;
      return {left: (this.size - c) / 2 + "px", top: (this.size - c) / 2 + "px", width: c + "px", height: c + "px"};
    },
    pointerStyle() {
      const c = this.size * 0.52;
      const colour = "#" + this.device().lighting.encoders[this.knob.encoder].colour_three;
      const rotation = Math.round(-135 + knobPos(this.device(), this.knob) * 270);
      return {
        top: c * 0.08 + "px", height: c * 0.28 + "px", width: Math.max(3, c * 0.07) + "px",
        marginLeft: -Math.max(3, c * 0.07) / 2 + "px", transformOrigin: `50% ${c * 0.42}px`,
        background: colour, transform: `rotate(${rotation}deg)`,
      };
    },

    path() {
      return `/mixers/${store.getActiveSerial()}/effects/current/${this.knob.effect}/amount`;
    },
    // One request in flight at a time; the latest value always lands
    sendValue(value) {
      const command = {};
      command[this.knob.amountCommand] = value;
      if (this.inFlight) {
        this.queued = command;
        return;
      }
      this.inFlight = true;
      websocket.send_command(store.getActiveSerial(), command).finally(() => {
        this.inFlight = false;
        if (this.queued) {
          const next = this.queued;
          this.queued = null;
          this.inFlight = true;
          websocket.send_command(store.getActiveSerial(), next).finally(() => this.inFlight = false);
        }
      });
    },
    setValue(value) {
      const effect = this.device().effects.current[this.knob.effect];
      if (effect.amount === value) return;
      effect.amount = value;
      this.sendValue(value);
    },

    down(event) {
      event.currentTarget.setPointerCapture(event.pointerId);
      const pos = knobPos(this.device(), this.knob);
      this.drag = {x: event.clientX, raw: this.knob.centred ? undetent(pos) : pos, moved: false};
    },
    move(event) {
      const drag = this.drag;
      if (!drag) return;
      const dx = event.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 3) return;
      if (!drag.moved) {
        drag.moved = true;
        this.dragging = true;
        store.pausePatchPath(this.path());
      }
      const raw = Math.max(0, Math.min(1, drag.raw + dx / DRAG_PX));
      this.setValue(valueFromPos(this.device(), this.knob, this.knob.centred ? detent(raw) : raw));
    },
    up() {
      const drag = this.drag;
      this.drag = null;
      this.dragging = false;
      if (drag && drag.moved) store.resumePatchPath(this.path());
      this.$emit("select", this.knob);
    },
    reset() {
      this.setValue(this.knob.centred ? 0 : knobRange(this.device(), this.knob).min);
    },
    key(event) {
      const dir = {ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1}[event.key];
      if (dir === undefined) return;
      event.preventDefault();
      const r = knobRange(this.device(), this.knob);
      const amount = this.device().effects.current[this.knob.effect].amount;
      let next = Math.max(r.min, Math.min(r.max, amount + dir * r.step));
      // keyboard stops on the centre once before passing through it
      if (this.knob.centred && amount !== 0 && Math.sign(amount) !== Math.sign(next)) next = 0;
      this.setValue(next);
    },
  },
}
</script>

<style scoped>
.effectKnob {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: inherit;
  font-family: inherit;
  cursor: ew-resize;
  touch-action: none;
  user-select: none;
}

.effectKnob:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 2px;
}

.effectKnob.selected {
  box-shadow: 0 0 0 2px #59b1b6, 0 0 18px rgba(89, 177, 182, 0.45);
}

.ring {
  position: relative;
  display: block;
}

.dot {
  position: absolute;
  border-radius: 2px;
}

.cap {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #3a3f3e, #151817 70%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.7), inset 0 0 0 2px #0e100f;
  transition: box-shadow 0.12s;
}

.cap.snapped {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.7), inset 0 0 0 2px #0e100f, 0 0 0 2px #59b1b6, 0 0 14px rgba(89, 177, 182, 0.8);
}

.pointer {
  position: absolute;
  left: 50%;
  border-radius: 2px;
}

.value {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 4%;
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  color: #e8ecea;
}

.name {
  margin-top: 6px;
  min-width: 60px;
  font-size: 12px;
  color: #8a918e;
  text-align: center;
}

/* Large knobs show their value inside, so the name reads as the card title */
.ring:has(.value) + .name {
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 15px;
  color: #e8ecea;
}

.dragging .name {
  color: #e8ecea;
}
</style>
