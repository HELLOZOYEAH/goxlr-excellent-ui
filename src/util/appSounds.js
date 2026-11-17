import {reactive} from "vue";
import {getBaseHTTPAddress} from "@/util/sockets";

// Apps playing sound on the PC the GoXLR is plugged into, and moving one to a GoXLR channel
// (daemon: GET /api/apps, POST /api/apps/route). Polls only while a page uses it and the
// window is visible.
const POLL_MS = 2000;

// Channels an app can be moved to (the GoXLR's Windows playback devices)
export const APP_CHANNELS = ["System", "Game", "Music", "Chat", "Sample"];

// Friendlier names for common executables; anything else shows its file name
const NAMES = {
    msedge: "Microsoft Edge", msedgewebview2: "Edge WebView", chrome: "Chrome", firefox: "Firefox",
    steam: "Steam", steamwebhelper: "Steam", spotify: "Spotify", discord: "Discord",
    obs64: "OBS Studio", wallpaper64: "Wallpaper Engine", vlc: "VLC", claude: "Claude",
};

export function appName(app) {
    return NAMES[app.name.toLowerCase()] || app.name;
}

// list: [{name, path, pids, channel, device, playing}] · error: text when the daemon can't list apps
export const appSounds = reactive({list: [], loaded: false, error: ""});

let users = 0, running = false, timer = null, listening = false;

async function poll() {
    if (!running) return;
    try {
        const response = await fetch(`${getBaseHTTPAddress()}api/apps`);
        if (response.status === 404) {
            appSounds.error = "unsupported";
        } else if (!response.ok) {
            appSounds.error = await response.text();
        } else {
            appSounds.list = await response.json();
            appSounds.error = "";
        }
    } catch (e) {
        appSounds.error = "unreachable";
    }
    appSounds.loaded = true;
    if (running) timer = setTimeout(poll, POLL_MS);
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

// Start listing apps; call the returned function to stop
export function useAppSounds() {
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

// Move an app (by its executable path) to a GoXLR channel, or back to Windows' default with null.
// Shows the move straight away, then the next poll confirms what Windows actually did.
export async function moveApp(path, channel) {
    const app = appSounds.list.find(a => a.path === path);
    const before = app ? app.channel : null;
    if (app) app.channel = channel;
    const response = await fetch(`${getBaseHTTPAddress()}api/apps/route`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({path, channel}),
    }).catch(() => null);
    if (!response || !response.ok) {
        if (app) app.channel = before;
        throw new Error(response ? await response.text() : "unreachable");
    }
    clearTimeout(timer);
    if (running) timer = setTimeout(poll, 600);
}
