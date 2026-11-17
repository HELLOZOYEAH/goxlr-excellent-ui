// The app window (goxlr-utility-ui.exe, Tauri) can float the device on the desktop with no frame.
// Only works inside that window; in a normal browser every call does nothing and inApp() is false.
// Window commands live in goxlr-ui-wrapper/src-tauri/src/main.rs.

const START_KEY = "goxlr.startDeviceView";
const FULL_SIZE_KEY = "goxlr.fullWindowSize";
const DEFAULT_FULL = {width: 1300, height: 910};

function tauri() {
    return window.__TAURI__?.core?.invoke ? window.__TAURI__.core : null;
}

export function inApp() {
    return !!tauri();
}

function call(command, args) {
    const core = tauri();
    if (!core) return Promise.resolve();
    return core.invoke(command, args).catch(e => console.warn(`App window: ${command} failed`, e));
}

// Shrink to a frameless, see-through window of this size (CSS pixels)
export function enterDeviceView(width, height) {
    try {
        // Not when the window is already device-sized (it can open that small after a restart)
        if (window.innerWidth > width + 100) {
            localStorage.setItem(FULL_SIZE_KEY, JSON.stringify({width: window.innerWidth, height: window.innerHeight}));
        }
    } catch (e) {
        // The full size falls back to the default
    }
    return call("device_view", {on: true, width: Math.round(width), height: Math.round(height), anchor: null});
}

// Grow to the size the app had before, centred on the middle of the device: the native side keeps
// the window on the screen. Pass the device's element.
export function leaveDeviceView(device) {
    let size = DEFAULT_FULL;
    try {
        size = JSON.parse(localStorage.getItem(FULL_SIZE_KEY)) || DEFAULT_FULL;
    } catch (e) {
        // default size
    }
    const box = device?.getBoundingClientRect();
    const anchor = box ? [box.left + box.width / 2, box.top + box.height / 2] : null;
    return call("device_view", {on: false, width: size.width, height: size.height, anchor});
}

// The GoXLR Link pop-out as a frameless window of its own (url is relative to this page)
export function openLinkPopout(url) {
    return call("link_popout", {url});
}

export function closeWindow() {
    return call("window_close");
}

export function minimiseWindow() {
    return call("window_minimize");
}

export function toggleMaximiseWindow() {
    return call("window_toggle_maximize");
}

// Same as the window's close button: the app goes to the tray
export function hideWindow() {
    return call("window_hide");
}

export function dragWindow() {
    return call("window_drag");
}

// "Start in device view" (System page), on unless turned off
export function startsInDeviceView() {
    try {
        return localStorage.getItem(START_KEY) !== "0";
    } catch (e) {
        return true;
    }
}

export function setStartsInDeviceView(on) {
    try {
        localStorage.setItem(START_KEY, on ? "1" : "0");
    } catch (e) {
        // not remembered
    }
}
