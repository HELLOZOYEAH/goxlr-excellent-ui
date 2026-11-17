// GoXLR Link Pop out / Dock back: the main app's Link tab and its small pop-out window
// tell each other what they're doing over a BroadcastChannel (same origin, no daemon needed).
//
//   pop-out window -> "alive" every second, "closed" when it goes
//   main app       -> "who" when it loads (an open pop-out answers "alive"), "dock" to close it
import {reactive} from "vue";
import {closeWindow, inApp, openLinkPopout} from "@/util/appWindow";

const CHANNEL = "goxlr-link-popout";
const ALIVE_MS = 1000;
// No "alive" for this long: the pop-out was closed without saying so
const GONE_MS = 3000;

export const POPOUT_VIEW = "link-popout";

function channel() {
    return typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(CHANNEL);
}

// Main app side: is the Link popped out?
export const linkPopout = reactive({open: false, blocked: false});

let mainChannel = null;
let lastAlive = 0;
let popupWindow = null;

export function watchPopout() {
    if (mainChannel) return;
    mainChannel = channel();
    if (!mainChannel) return;
    mainChannel.onmessage = ({data}) => {
        if (data === "alive") {
            lastAlive = Date.now();
            linkPopout.open = true;
        } else if (data === "closed") {
            linkPopout.open = false;
        }
    };
    mainChannel.postMessage("who");
    setInterval(() => {
        if (linkPopout.open && Date.now() - lastAlive > GONE_MS) linkPopout.open = false;
    }, ALIVE_MS);
}

export function popOut(locale) {
    const url = `${location.pathname}?view=${POPOUT_VIEW}&lang=${encodeURIComponent(locale || "")}`;
    // In the app window: a frameless window of our own. A browser always draws its own frame.
    if (inApp()) {
        openLinkPopout(url);
        linkPopout.blocked = false;
        lastAlive = Date.now();
        linkPopout.open = true;
        return;
    }
    // Sized for the controller (it stacks into one column if the window is made narrower)
    popupWindow = window.open(url, "goxlr-link", "popup=yes,width=700,height=230");
    linkPopout.blocked = !popupWindow;
    if (popupWindow) {
        lastAlive = Date.now();
        linkPopout.open = true;
    }
}

export function dockBack() {
    if (mainChannel) mainChannel.postMessage("dock");
    if (popupWindow && !popupWindow.closed) popupWindow.close();
    popupWindow = null;
    linkPopout.open = false;
}

// Pop-out window side
export function isPopoutView() {
    return new URLSearchParams(location.search).get("view") === POPOUT_VIEW;
}

export function popoutLocale() {
    return new URLSearchParams(location.search).get("lang") || null;
}

function closePopout() {
    if (inApp()) closeWindow();
    else window.close();
}

export function runAsPopout() {
    // No frame in the app window: the page shows through to the desktop around the controller
    if (inApp()) document.documentElement.classList.add("linkPopoutWindow");
    const own = channel();
    if (!own) return closePopout;
    const alive = () => own.postMessage("alive");
    own.onmessage = ({data}) => {
        if (data === "who") alive();
        if (data === "dock") closePopout();
    };
    alive();
    setInterval(alive, ALIVE_MS);
    window.addEventListener("pagehide", () => own.postMessage("closed"));
    // The dock button inside the pop-out
    return () => {
        own.postMessage("closed");
        closePopout();
    };
}
