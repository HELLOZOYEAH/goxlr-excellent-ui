import {reactive} from "vue";
import {store} from "@/store";
import {getBaseHTTPAddress, websocket} from "@/util/sockets";

// Live audio levels for the fader LEDs, shared by every page that shows them.
// Mic comes from the daemon's mic level; System / Game / Music / Chat / Sample from Windows' meters
// (/api/meters). Line In, Console and the outputs have no level source.
// Polling runs only while at least one page uses it and the window is visible.
const POLL_MS = 40;
const FLOOR_DB = -60;
const FALL = 0.35;        // how fast the bar drops back (fraction of the gap per poll)
const HOLD_MS = 700;      // the peak LED waits this long before falling
const PEAK_FALL = 0.04;   // then drops this much (of full scale) per poll

// channel -> {level, peak, peakAt}, levels as fractions of full scale (0 - 1)
export const liveMeters = reactive({});

let users = 0, running = false, timer = null, listening = false;

const fraction = (db) => Math.max(0, Math.min(1, (db - FLOOR_DB) / -FLOOR_DB));
const toDb = (peak) => peak > 0 ? 20 * Math.log10(peak) : FLOOR_DB;

function poll() {
    if (!running) return;
    const serial = store.getActiveSerial();
    const pc = fetch(`${getBaseHTTPAddress()}api/meters`).then(r => r.ok ? r.json() : {}).catch(() => ({}));
    const mic = serial ? websocket.get_mic_level(serial).then(d => d["MicLevel"]).catch(() => null) : Promise.resolve(null);
    Promise.all([pc, mic]).then(([peaks, micDb]) => {
        const readings = {};
        for (const [channel, peak] of Object.entries(peaks || {})) readings[channel] = fraction(toDb(peak));
        if (typeof micDb === "number") readings.Mic = fraction(micDb);
        const now = Date.now();
        for (const [channel, value] of Object.entries(readings)) {
            const old = liveMeters[channel] || {level: 0, peak: 0, peakAt: 0};
            const level = value > old.level ? value : old.level + (value - old.level) * FALL;
            let peak = old.peak, peakAt = old.peakAt;
            if (value >= peak) {
                peak = value;
                peakAt = now;
            } else if (now - peakAt > HOLD_MS) {
                peak = Math.max(level, peak - PEAK_FALL);
            }
            liveMeters[channel] = {level, peak, peakAt};
        }
    }).finally(() => {
        if (running) timer = setTimeout(poll, POLL_MS);
    });
}

function start() {
    if (running || users === 0 || document.hidden) return;
    running = true;
    poll();
}

function stop() {
    running = false;
    clearTimeout(timer);
}

function onVisibility() {
    if (document.hidden) stop();
    else start();
}

// Start using the meters; call the returned function to stop
export function useLiveMeters() {
    if (!listening) {
        listening = true;
        document.addEventListener("visibilitychange", onVisibility);
    }
    users++;
    start();
    let released = false;
    return () => {
        if (released) return;
        released = true;
        users--;
        if (users === 0) stop();
    };
}
