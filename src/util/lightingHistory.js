import {reactive, watch} from "vue";
import {store} from "@/store";
import {websocket} from "@/util/sockets";

// Undo for lighting: every settled change to the device's colours is remembered, and Undo puts the
// previous colours back by sending only the commands that differ. Lives for the session, per profile.
const SETTLE_MS = 600;     // a burst of patches (one colour pick, "apply to all") counts as one step
const QUIET_MS = 3000;     // after an undo, ignore the patches it causes while they arrive
const LIMIT = 30;

export const lightingHistory = reactive({count: 0, busy: false});

let stack = [], stable = null, owner = null, timer = null, quietUntil = 0, started = false;

const copy = (value) => JSON.parse(JSON.stringify(value));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function lighting() {
    const device = store.getActiveDevice();
    return device && device.lighting ? copy(device.lighting) : null;
}

function ownerKey() {
    const device = store.getActiveDevice();
    return device ? `${store.getActiveSerial()}|${device.profile_name}` : null;
}

function reset() {
    clearTimeout(timer);
    stack = [];
    lightingHistory.count = 0;
    stable = lighting();
    owner = ownerKey();
}

function settle() {
    const now = lighting();
    if (!now || !stable || same(now, stable) || Date.now() < quietUntil) return;
    stack.push(stable);
    if (stack.length > LIMIT) stack.shift();
    lightingHistory.count = stack.length;
    stable = now;
}

export function startLightingHistory() {
    if (started) return;
    started = true;
    reset();
    watch(() => JSON.stringify(store.getActiveDevice()?.lighting ?? null), () => {
        // Another device or profile: its colours aren't an undoable change
        if (ownerKey() !== owner || !stable) {
            reset();
            return;
        }
        clearTimeout(timer);
        timer = setTimeout(settle, SETTLE_MS);
    });
}

// The commands that turn the current lighting into the target
function commands(now, target) {
    const out = [];
    const a = now.animation, ta = target.animation;
    if (ta && a && ta.supported) {
        if (a.mode !== ta.mode) out.push({"SetAnimationMode": ta.mode});
        if (a.mod1 !== ta.mod1) out.push({"SetAnimationMod1": ta.mod1});
        if (a.mod2 !== ta.mod2) out.push({"SetAnimationMod2": ta.mod2});
        if (a.waterfall_direction !== ta.waterfall_direction) out.push({"SetAnimationWaterfall": ta.waterfall_direction});
    }
    for (const [name, t] of Object.entries(target.simple || {})) {
        if (!same(now.simple?.[name], t)) out.push({"SetSimpleColour": [name, t.colour_one]});
    }
    for (const [name, t] of Object.entries(target.faders || {})) {
        const n = now.faders?.[name] || {};
        if (n.style !== t.style) out.push({"SetFaderDisplayStyle": [name, t.style]});
        if (!same(n.colours, t.colours)) out.push({"SetFaderColours": [name, t.colours.colour_one, t.colours.colour_two]});
    }
    for (const [name, t] of Object.entries(target.buttons || {})) {
        const n = now.buttons?.[name] || {};
        if (!same(n.colours, t.colours)) out.push({"SetButtonColours": [name, t.colours.colour_one, t.colours.colour_two ?? null]});
        if (n.off_style !== t.off_style) out.push({"SetButtonOffStyle": [name, t.off_style]});
    }
    for (const [name, t] of Object.entries(target.sampler || {})) {
        const n = now.sampler?.[name] || {};
        if (!same(n.colours, t.colours)) out.push({"SetSampleColour": [name, t.colours.colour_one, t.colours.colour_two, t.colours.colour_three]});
        if (n.off_style !== t.off_style) out.push({"SetSampleOffStyle": [name, t.off_style]});
    }
    for (const [name, t] of Object.entries(target.encoders || {})) {
        if (!same(now.encoders?.[name], t)) out.push({"SetEncoderColour": [name, t.colour_one, t.colour_two, t.colour_three]});
    }
    return out;
}

export async function undoLighting() {
    if (lightingHistory.busy) return;
    // A change that is still settling is the newest step
    clearTimeout(timer);
    settle();
    const target = stack.pop();
    lightingHistory.count = stack.length;
    const now = lighting();
    if (!target || !now) return;

    lightingHistory.busy = true;
    stable = target;
    quietUntil = Date.now() + QUIET_MS;
    try {
        const serial = store.getActiveSerial();
        for (const command of commands(now, target)) {
            await websocket.send_command(serial, command);
        }
    } finally {
        lightingHistory.busy = false;
        quietUntil = Date.now() + SETTLE_MS;
        // Anything changed meanwhile that isn't the undo itself becomes a new step
        clearTimeout(timer);
        timer = setTimeout(settle, SETTLE_MS * 2);
    }
}
