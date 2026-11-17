// How the GoXLR lights the LEDs beside a fader, for drawing them in the UI.
// Two colour / Gradient follow the fader's position; Meter / Gradient meter follow the audio.

export const LED_COUNT = 15;
export const FADER_STYLES = ["TwoColour", "Gradient", "Meter", "GradientMeter"];
export const LED_OFF = "#151817";

export function isMeterStyle(style) {
    return style === "Meter" || style === "GradientMeter";
}

function parse(hex) {
    const h = hex.replace("#", "");
    return [0, 2, 4].map(i => parseInt(h.substring(i, i + 2), 16));
}

export function mixColours(a, b, t) {
    const pa = parse(a), pb = parse(b);
    return "rgb(" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(", ") + ")";
}

// Colour of LED `index` (0 = bottom). `top` / `bottom` are hex colours ("RRGGBB" or "#RRGGBB").
// `position` is the fader (0 - 1); `meter` is {level, peak} (0 - 1, already scaled by the fader), or null
// when the channel has no level source, in which case meter styles fall back to showing the position.
export function ledColour({style, top, bottom, index, count = LED_COUNT, position, meter}) {
    const hex = (c) => c.startsWith("#") ? c : "#" + c;
    const t = count > 1 ? index / (count - 1) : 0;
    const live = isMeterStyle(style) && meter;
    const lit = live ? Math.round(meter.level * count) : Math.ceil(count * position + 0.25 * (count / 15));
    const peak = live && meter.peak > 0.02 ? Math.min(count, Math.ceil(meter.peak * count)) - 1 : -1;
    const on = index < lit || index === peak;

    switch (style) {
        case "TwoColour":
            return index < lit ? hex(bottom) : hex(top);
        case "Meter":
            // as the device draws it: every LED in the top colour, the sound filling up in the bottom colour
            return on ? hex(bottom) : hex(top);
        default:
            return on ? mixColours(hex(bottom), hex(top), t) : LED_OFF;
    }
}
