import {reactive, watch} from "vue";
import {store} from "@/store";
import {onCommandDone} from "@/util/sockets";

// "Not saved yet" markers for the profile and mic profile buttons in the header.
// The daemon doesn't say whether its in-memory profile differs from the file, so we keep a copy of the
// saved parts as they were when the profile was loaded or last saved here, and compare against it.
// Volumes, mute states and other live state are left out: moving a hardware fader isn't an edit.
// Saves made outside this UI (another app, a script) can't be seen, so the marker may stay lit after them.
export const profileDirty = reactive({profile: false, mic: false});

const SETTLE_MS = 300;
const AFTER_COMMAND_MS = 800;   // let the daemon's patches for a load / save arrive first

const PROFILE_RESETS = ["SaveProfile", "SaveProfileAs", "LoadProfile", "NewProfile"];
const MIC_RESETS = ["SaveMicProfile", "SaveMicProfileAs", "LoadMicProfile", "NewMicProfile"];

let base = null, micBase = null, presetBase = {}, owner = null, timer = null, started = false;

const json = (value) => JSON.stringify(value ?? null);

// The parts of the device status that a profile file stores (effects handled per preset below)
function profileParts(device) {
    const faders = {};
    for (const [name, fader] of Object.entries(device.fader_status || {})) {
        faders[name] = {channel: fader.channel, mute_type: fader.mute_type, scribble: fader.scribble};
    }
    const banks = {};
    for (const [bank, buttons] of Object.entries(device.sampler?.banks || {})) {
        banks[bank] = {};
        for (const [button, pad] of Object.entries(buttons)) {
            banks[bank][button] = {function: pad.function, order: pad.order, samples: pad.samples};
        }
    }
    return json({
        faders,
        router: device.router,
        cough: {is_toggle: device.cough_button?.is_toggle, mute_type: device.cough_button?.mute_type},
        lighting: device.lighting,
        preset_names: device.effects?.preset_names,
        banks,
        submix: device.levels?.submix,
        bleep: device.levels?.bleep,
    });
}

function micParts(device) {
    return json({mic: device.mic_status, deess: device.levels?.deess});
}

function ownerKey(device) {
    return device ? `${store.getActiveSerial()}|${device.profile_name}|${device.mic_profile_name}` : null;
}

function resetProfile(device) {
    base = profileParts(device);
    presetBase = {};
    if (device.effects) presetBase[device.effects.active_preset] = json(device.effects.current);
    profileDirty.profile = false;
}

function resetMic(device) {
    micBase = micParts(device);
    profileDirty.mic = false;
}

function check() {
    const device = store.getActiveDevice();
    if (!device || !device.fader_status) {
        owner = null;
        profileDirty.profile = profileDirty.mic = false;
        return;
    }
    // A different device or profile (or the same one plugged back in): start from what's loaded now
    const key = ownerKey(device);
    if (key !== owner) {
        owner = key;
        resetProfile(device);
        resetMic(device);
        return;
    }

    // Each effects preset is compared with how it looked the first time we saw it,
    // so switching presets on the device doesn't count as an edit
    let effectsChanged = false;
    if (device.effects) {
        const preset = device.effects.active_preset, current = json(device.effects.current);
        if (!(preset in presetBase)) presetBase[preset] = current;
        effectsChanged = presetBase[preset] !== current;
    }
    profileDirty.profile = effectsChanged || profileParts(device) !== base;
    profileDirty.mic = micParts(device) !== micBase;
}

export function startProfileDirty() {
    if (started) return;
    started = true;
    watch(() => store.getActiveDevice(), () => {
        clearTimeout(timer);
        timer = setTimeout(check, SETTLE_MS);
    }, {deep: true});

    onCommandDone((command) => {
        const name = typeof command === "string" ? command : Object.keys(command || {})[0];
        const profile = PROFILE_RESETS.includes(name), mic = MIC_RESETS.includes(name);
        if (!profile && !mic) return;
        setTimeout(() => {
            const device = store.getActiveDevice();
            if (!device) return;
            owner = ownerKey(device);
            if (profile) resetProfile(device);
            if (mic) resetMic(device);
        }, AFTER_COMMAND_MS);
    });
}
