// Shared maths for the four effect encoders (Reverb, Pitch, Echo, Gender): their raw value ranges,
// the centre detent used by Pitch / Gender, and the LED ring colours.

// Within this much of the centre (as a fraction of the knob's travel) a centred knob sticks to zero,
// so you have to pull a little further to leave it.
export const DETENT = 0.09;

export const KNOB_DOTS = 13;

export const KNOBS = [
    {
        id: "reverb", effect: "reverb", encoder: "Reverb", i18n: "reverb", centred: false,
        amountCommand: "SetReverbAmount", styleCommand: "SetReverbStyle",
        styles: ["Library", "DarkBloom", "MusicClub", "RealPlate", "Chapel", "HockeyArena"]
    },
    {
        id: "pitch", effect: "pitch", encoder: "Pitch", i18n: "pitch", centred: true,
        amountCommand: "SetPitchAmount", styleCommand: "SetPitchStyle", styles: ["Narrow", "Wide"]
    },
    {
        id: "echo", effect: "echo", encoder: "Echo", i18n: "echo", centred: false,
        amountCommand: "SetEchoAmount", styleCommand: "SetEchoStyle",
        styles: ["Quarter", "Eighth", "Triplet", "PingPong", "ClassicSlap", "MultiTap"]
    },
    {
        id: "gender", effect: "gender", encoder: "Gender", i18n: "gender", centred: true,
        amountCommand: "SetGenderAmount", styleCommand: "SetGenderStyle", styles: ["Narrow", "Medium", "Wide"]
    },
];

// {min, max, step} of the raw value the daemon stores for this knob
export function knobRange(device, knob) {
    const current = device.effects.current;
    if (knob.id === "pitch") {
        const narrow = current.pitch.style === "Narrow";
        if (current.hard_tune.is_enabled) return narrow ? {min: -1, max: 1, step: 1} : {min: -2, max: 2, step: 1};
        return narrow ? {min: -24, max: 24, step: 2} : {min: -24, max: 24, step: 1};
    }
    if (knob.id === "gender") {
        const limit = {Narrow: 12, Medium: 25, Wide: 50}[current.gender.style] || 12;
        return {min: -limit, max: limit, step: 1};
    }
    return {min: 0, max: 100, step: 1};
}

export function knobPos(device, knob) {
    const r = knobRange(device, knob);
    return (device.effects.current[knob.effect].amount - r.min) / (r.max - r.min);
}

export function valueFromPos(device, knob, pos) {
    const r = knobRange(device, knob);
    const raw = r.min + Math.max(0, Math.min(1, pos)) * (r.max - r.min);
    return Math.max(r.min, Math.min(r.max, Math.round(raw / r.step) * r.step));
}

// Pointer travel -> knob position, sticking to the centre inside the detent zone
export function detent(pos) {
    const d = pos - 0.5;
    if (Math.abs(d) <= DETENT) return 0.5;
    return 0.5 + Math.sign(d) * (Math.abs(d) - DETENT) * 0.5 / (0.5 - DETENT);
}

// Knob position -> pointer travel (inverse of detent), so a drag starts where the knob is
export function undetent(pos) {
    const d = pos - 0.5;
    if (Math.abs(d) < 0.0001) return 0.5;
    return 0.5 + Math.sign(d) * (Math.abs(d) * (0.5 - DETENT) / 0.5 + DETENT);
}

export function knobValueText(device, knob) {
    const current = device.effects.current;
    const amount = current[knob.effect].amount;
    if (knob.id === "pitch") {
        const semitones = current.hard_tune.is_enabled ? amount * 12 : (current.pitch.style === "Narrow" ? amount / 2 : amount);
        return (semitones > 0 ? "+" : "") + semitones;
    }
    if (knob.centred) return (amount > 0 ? "+" : "") + amount;
    return amount + "%";
}

// LED ring colours, following the hardware: a plain knob shows colour two below the current level and
// colour one above it; a centred knob fills outwards from the middle (colour one right, colour two left).
// The current level itself is white.
export function knobDotColours(device, knob) {
    const colours = device.lighting.encoders[knob.encoder];
    const pos = knobPos(device, knob);
    const dark = "#1d201f";
    const result = [];
    for (let i = 0; i < KNOB_DOTS; i++) {
        let colour;
        if (knob.centred) {
            const level = Math.round((pos - 0.5) * (KNOB_DOTS - 1));
            const j = i - (KNOB_DOTS - 1) / 2;
            if (j === level) colour = "#ffffff";
            else if (level > 0 && j > 0 && j < level) colour = "#" + colours.colour_one;
            else if (level < 0 && j < 0 && j > level) colour = "#" + colours.colour_two;
            else colour = dark;
        } else {
            const level = Math.round(pos * (KNOB_DOTS - 1));
            colour = i === level ? "#ffffff" : "#" + (i < level ? colours.colour_two : colours.colour_one);
        }
        result.push({colour: colour, lit: colour !== dark});
    }
    return result;
}
