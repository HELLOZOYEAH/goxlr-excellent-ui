import {store} from "@/store";
import {websocket} from "@/util/sockets";
import en from "@/lang/languages/en_GB";

// Put a channel on a fader and write the channel's name on that fader's screen, so the screen
// never shows the old channel (e.g. "Voice Chat" over Music). The user can still edit the text after.
// The screen font has no Thai, so the name is always English.
// When the channel is already on another fader the daemon swaps the two faders and their screens
// travel with them, so the text is left alone in that case.
export function assignFaderChannel(serial, fader, channel) {
    const faders = store.getActiveDevice().fader_status;
    const swapping = Object.keys(faders).some(other => other !== fader && faders[other].channel === channel);
    websocket.send_command(serial, {"SetFader": [fader, channel]});
    if (!swapping) {
        websocket.send_command(serial, {"SetScribbleText": [fader, en.message.channels[channel] || channel]});
    }
}
