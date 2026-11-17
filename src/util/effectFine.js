// Fine controls for every effect, as shown under "Fine controls" on the Effects page cards.
// Ranges, index tables and the odd value conversions are taken from the original effect components
// (ReverbEffect, EchoEffect, PitchEffect, MegaphoneEffect, RobotEffect, HardTuneEffect).
//
// Each row: { id, i18n, min, max, value(effect), text(effect, t), apply(effect, v) -> command }
// `effect` is store.getActiveDevice().effects.current[<name>]; apply() also updates it locally.

const DECAY = (() => {
    const map = [];
    for (let v = 10; v < 1000; v += 20) map.push(v);
    for (let v = 1000; v <= 20000; v += 100) map.push(v);
    return map;
})();

const ROBOT_WIDTH = [0.10, 0.11, 0.12, 0.14, 0.18, 0.22, 0.25, 0.28, 0.31, 0.35, 0.40, 0.46, 0.54,
    0.63, 0.74, 0.87, 1.00, 1.18, 1.36, 1.56, 1.79, 2.04, 2.34, 2.68, 3.09, 3.58, 4.16,
    4.84, 5.64, 6.57, 7.61, 8.77, 10.00];
const ROBOT_LOW_FREQ = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
    37, 38, 39, 40, 41, 42, 44, 45, 46, 48, 49, 50, 52, 53, 55, 57, 58, 60,
    62, 63, 65, 67, 69, 71, 73, 76, 78, 80, 82, 85, 87, 90, 92, 95, 98, 101, 104,
    107, 110, 113, 116, 120, 123, 127, 131, 135, 138, 143, 147, 151, 155, 160, 165,
    170, 174, 180, 185, 190, 196, 202, 207, 214, 220, 226, 233, 240, 247, 254];
const ROBOT_MID_FREQ = [240, 247, 254, 261, 269, 277, 285, 293, 302, 311, 320, 329, 339, 349, 359,
    370, 381, 392, 403, 415, 427, 440, 453, 466, 479, 494, 508, 523, 538, 554, 570,
    587, 604, 622, 640, 659, 678, 698, 718, 739, 761, 783, 806, 830, 854, 879, 905,
    932, 959, 987, 1016, 1046, 1076, 1108, 1140, 1174, 1208, 1244, 1280, 1318, 1356,
    1396, 1437, 1479, 1522, 1567, 1613, 1660, 1709, 1759, 1810, 1863, 1918, 1974, 2032,
    2091, 2153, 2216, 2281, 2348, 2416, 2487, 2560, 2635, 2712, 2792, 2874, 2958, 3044,
    3134, 3225, 3320, 3417, 3517, 3620, 3726, 3836, 3948, 4064];
const ROBOT_HIGH_FREQ = [3836, 3948, 4064, 4183, 4305, 4432, 4561, 4695, 4833, 4974, 5120, 5270, 5424,
    5583, 5747, 5915, 6089, 6267, 6451, 6640, 6834, 7035, 7241, 7453, 7617, 7896,
    8127, 8366, 8611, 8863, 9123, 9390, 9665, 9948, 10240, 10540, 10849, 11167, 11494,
    11831, 12177, 12534, 12902, 13280, 13996, 14069, 14482, 14906, 15343, 15792, 16255,
    16731, 17222, 17726, 18246, 18780, 19331, 19897, 20480];

const db = (v) => (v > 0 ? "+" : "") + v + " dB";
const ms = (v) => v + " ms";
const pct = (v) => v + "%";
const hz = (v) => v >= 1000 ? (v / 1000).toFixed(1) + " kHz" : v + " Hz";

// A plain "store key <-> command" row
function plain(key, i18n, min, max, command, fmt = (v) => String(v)) {
    return {
        id: key, i18n: i18n, min: min, max: max,
        value: (e) => e[key],
        text: (e) => fmt(e[key]),
        apply: (e, v) => {
            e[key] = v;
            return {[command]: v};
        },
    };
}

// Robot gain / width for one band
function robotBand(band, prefix, i18nPrefix) {
    return [
        {
            id: prefix + "_gain", i18n: i18nPrefix + "Gain", min: -12, max: 12,
            value: (e) => e[prefix + "_gain"], text: (e) => db(e[prefix + "_gain"]),
            apply: (e, v) => {
                e[prefix + "_gain"] = v;
                return {"SetRobotGain": [band, v]};
            },
        },
        null, // frequency row is inserted per band below
        {
            id: prefix + "_width", i18n: i18nPrefix + "Width", min: 0, max: ROBOT_WIDTH.length - 1,
            value: (e) => e[prefix + "_width"], text: (e) => ROBOT_WIDTH[e[prefix + "_width"]].toFixed(2),
            apply: (e, v) => {
                e[prefix + "_width"] = v;
                return {"SetRobotWidth": [band, v]};
            },
        },
    ];
}

// Low frequency uses a non-linear index on the device (from RobotEffect.getLowFreqValue / setLowFreqValue)
const lowFreqIndex = (freq) => {
    if (freq > ROBOT_LOW_FREQ.length) return ROBOT_LOW_FREQ.length - 1;
    if (freq === 0) return 0;
    if (freq === 1 || freq === 2) return 3;
    if (freq === 3) return 7;
    return Math.min(ROBOT_LOW_FREQ.length - 1, freq + 4);
};
const lowFreqSend = (index) => {
    let sent = index === 0 ? 0 : (index <= 2 ? 3 : (index === 3 ? 7 : index + 4));
    if (sent > ROBOT_LOW_FREQ.length) sent = ROBOT_LOW_FREQ.length - 1;
    return sent;
};

function robotRows() {
    const low = robotBand("Low", "low", "low");
    low[1] = {
        id: "low_freq", i18n: "lowFrequency", min: 0, max: ROBOT_LOW_FREQ.length - 1,
        value: (e) => lowFreqIndex(e.low_freq), text: (e) => hz(ROBOT_LOW_FREQ[lowFreqIndex(e.low_freq)]),
        apply: (e, v) => {
            e.low_freq = lowFreqSend(v);
            return {"SetRobotFreq": ["Low", lowFreqSend(v)]};
        },
    };
    const mid = robotBand("Medium", "mid", "mid");
    mid[1] = {
        id: "mid_freq", i18n: "midFrequency", min: 0, max: ROBOT_MID_FREQ.length - 1,
        value: (e) => e.mid_freq - 86, text: (e) => hz(ROBOT_MID_FREQ[e.mid_freq - 86] ?? 0),
        apply: (e, v) => {
            e.mid_freq = v + 86;
            return {"SetRobotFreq": ["Medium", v + 86]};
        },
    };
    const high = robotBand("High", "high", "high");
    high[1] = {
        id: "high_freq", i18n: "highFrequency", min: 0, max: ROBOT_HIGH_FREQ.length - 1,
        value: (e) => e.high_freq - 182, text: (e) => hz(ROBOT_HIGH_FREQ[e.high_freq - 182] ?? 0),
        apply: (e, v) => {
            e.high_freq = v + 182;
            return {"SetRobotFreq": ["High", v + 182]};
        },
    };
    return [
        ...low, ...mid, ...high,
        plain("waveform", "waveform", 0, 2, "SetRobotWaveform"),
        plain("pulse_width", "pulseWidth", 0, 100, "SetRobotPulseWidth", pct),
        plain("threshold", "threshold", -36, 0, "SetRobotThreshold", db),
        plain("dry_mix", "dryMix", -36, 0, "SetRobotDryMix", db),
    ];
}

export const FINE = {
    reverb: [
        {
            id: "decay", i18n: "decay", min: 0, max: DECAY.length - 1,
            // values under a second can arrive 10 ms off the 20 ms grid (see ReverbEffect.getDecayValue)
            value: (e) => {
                let d = e.decay;
                if (d < 1000 && DECAY.indexOf(d) === -1) d -= 10;
                return Math.max(0, DECAY.indexOf(d));
            },
            text: (e) => ms(e.decay),
            apply: (e, v) => {
                e.decay = DECAY[v];
                return {"SetReverbDecay": DECAY[v]};
            },
        },
        plain("early_level", "earlyLevel", -25, 0, "SetReverbEarlyLevel", db),
        plain("tail_level", "tailLevel", -25, 0, "SetReverbTailLevel", db),
        plain("pre_delay", "preDelay", 0, 100, "SetReverbPreDelay", ms),
        plain("lo_colour", "lowColour", -50, 50, "SetReverbLowColour"),
        plain("hi_colour", "highColour", -50, 50, "SetReverbHighColour"),
        plain("hi_factor", "highFactor", -25, 25, "SetReverbHighFactor"),
        plain("diffuse", "diffuse", -50, 50, "SetReverbDiffuse"),
        plain("mod_speed", "modSpeed", -25, 25, "SetReverbModSpeed"),
        plain("mod_depth", "modDepth", -25, 25, "SetReverbModDepth"),
    ],
    echo: [
        plain("feedback", "feedback", 0, 100, "SetEchoFeedback", pct),
        plain("tempo", "tempo", 45, 300, "SetEchoTempo", (v) => v + " BPM"),
        plain("delay_left", "delayLeft", 0, 2500, "SetEchoDelayLeft", ms),
        plain("delay_right", "delayRight", 0, 2500, "SetEchoDelayRight", ms),
        plain("feedback_left", "feedbackLeft", 0, 100, "SetEchoFeedbackLeft", pct),
        plain("feedback_right", "feedbackRight", 0, 100, "SetEchoFeedbackRight", pct),
        plain("feedback_xfb_l_to_r", "xfbLeftToRight", 0, 100, "SetEchoFeedbackXFBLtoR", pct),
        plain("feedback_xfb_r_to_l", "xfbRightToLeft", 0, 100, "SetEchoFeedbackXFBRtoL", pct),
    ],
    pitch: [
        plain("character", "character", 0, 100, "SetPitchCharacter", pct),
    ],
    gender: [],
    megaphone: [
        plain("post_gain", "postGain", -20, 20, "SetMegaphonePostGain", db),
    ],
    robot: robotRows(),
    hard_tune: [
        plain("rate", "rate", 0, 100, "SetHardTuneRate", pct),
        plain("window", "window", 0, 600, "SetHardTuneWindow", ms),
    ],
};

export const HARD_TUNE_SOURCES = ["All", "Music", "LineIn", "System"];
