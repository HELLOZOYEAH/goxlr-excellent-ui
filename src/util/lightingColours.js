// Shared bits for the Lighting tabs: colour pair presets, the "when it is off" styles for buttons,
// and how the GoXLR lights a button so the previews can draw it.

// Colour pairs that sit well together on the LEDs: [first (top / on), second (bottom / off)]
export const PAIRS = [
    {name: "Aurora", top: "C900FF", bottom: "00FFD4"},
    {name: "Sunset", top: "FFAC00", bottom: "FF006C"},
    {name: "Ocean", top: "00E5FF", bottom: "0040FF"},
    {name: "Ember", top: "FF2A00", bottom: "FFB300"},
    {name: "Lime", top: "E6FF00", bottom: "00C853"},
    {name: "Vapor", top: "FF71CE", bottom: "01CDFE"},
    {name: "Rose", top: "FF4FA3", bottom: "7A00FF"},
    {name: "Glacier", top: "FFFFFF", bottom: "00B8FF"},
    {name: "Teal", top: "3EE6D9", bottom: "1D4ED8"},
    {name: "Mono", top: "FFFFFF", bottom: "5A6361"},
];

// ButtonColourOffStyle in the daemon
export const OFF_STYLES = ["Dimmed", "Colour2", "DimmedColour2"];

export function hexValue(event) {
    return event.target.value.substring(1).toUpperCase();
}

export function dimColour(hex, alpha = 0.4) {
    const c = hex.replace("#", "");
    return `rgba(${parseInt(c.substring(0, 2), 16)}, ${parseInt(c.substring(2, 4), 16)}, ${parseInt(c.substring(4, 6), 16)}, ${alpha})`;
}

// Border / text / fill of a button as the device lights it: the first colour when on,
// otherwise per its off style
export function buttonLook(one, two, offStyle, lit) {
    if (lit) return {borderColor: "#" + one, color: "#" + one, background: dimColour(one, 0.12)};
    let colour = dimColour(one);
    if (offStyle === "Colour2") colour = "#" + two;
    else if (offStyle === "DimmedColour2") colour = dimColour(two);
    return {borderColor: colour, color: colour, background: "transparent"};
}

// The one value all targets share, or null when they differ
export function shared(values) {
    const set = new Set(values);
    return set.size === 1 ? [...set][0] : null;
}
