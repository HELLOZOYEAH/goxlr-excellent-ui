import {store} from "@/store";
import {websocket, getBaseHTTPAddress} from "@/util/sockets";

// Upload audio files from the PC and add them to one pad, one after another (same steps as the
// Device page's pad panel). progress: a reactive {busy, done, total, added, current, errors}.
// t: the page's $t, for the error messages.

export function emptyImport() {
    return {busy: false, done: 0, total: 0, added: 0, current: "", errors: []};
}

// Waits until the daemon has finished working out a sample's gain (and, with name, until it is on the pad)
async function waitForSample(serial, bank, pad, t, name = null) {
    const deadline = Date.now() + 120000;
    while (Date.now() < deadline) {
        const response = await websocket.get_status();
        const sampler = response.Status?.mixers[serial]?.sampler;
        if (!sampler) throw new Error(t('message.device.sampleDeviceDisconnected'));
        store.replaceData(response);
        const state = sampler.processing_state;
        if (state.progress === null) {
            if (name && state.last_error) throw new Error(state.last_error);
            if (!name || sampler.banks[bank][pad].samples.some(sample => sample.name === name)) return;
        }
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    throw new Error(t('message.device.sampleImportTimeout'));
}

export async function importSampleFiles(files, {serial, bank, pad, t, progress}) {
    if (!files.length || progress.busy) return;
    Object.assign(progress, {busy: true, done: 0, total: files.length, added: 0, current: "", errors: []});
    try {
        for (const file of files) {
            progress.current = file.name;
            try {
                if (!/\.(wav|mp3|ogg|flac)$/i.test(file.name)) throw new Error(t('message.device.sampleFormatsOnly'));
                if (file.size > 128 * 1024 * 1024) throw new Error(t('message.device.sampleSizeLimit'));
                await waitForSample(serial, bank, pad, t);
                const body = new FormData();
                body.append("file", file, file.name);
                const response = await fetch(getBaseHTTPAddress() + "sample-upload", {method: "POST", body});
                const result = await response.json();
                if (!response.ok || result.Error || !result.name) throw new Error(result.Error || t('message.device.sampleUploadFailed'));
                await websocket.send_command(serial, {ClearSampleProcessError: []});
                await websocket.send_command(serial, {AddSample: [bank, pad, result.name]});
                // AddSample starts working out the gain; wait before sending the next one
                await waitForSample(serial, bank, pad, t, result.name);
                progress.added++;
            } catch (error) {
                progress.errors.push(file.name + ": " + (error.message || String(error)));
            }
            progress.done++;
        }
    } finally {
        progress.busy = false;
    }
}

// True when a drag carries files from the PC (not text or an app chip)
export function dragHasFiles(event) {
    return Array.from(event.dataTransfer?.types || []).includes("Files");
}
