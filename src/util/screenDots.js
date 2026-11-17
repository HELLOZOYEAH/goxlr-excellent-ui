// The GoXLR's fader screens: 128 x 64 dots, one colour. Measured on the real device: 18 x 12 mm, so a dot
// is 1.33 times taller than it is wide, and screens are 7 mm apart (50 dots). Pictures here are arrays of
// 64 rows of 128 booleans (true = lit). The daemon gets them as 1024 bytes each in the GoXLR's own layout
// (SetCustomScreen, daemon/src/screens.rs) and plays them on the real screens.
// Screens page mockup: docs/mockups/2026-10-30-screens.
import {drawPixelText, pixelTextWidth} from "@/util/pixelFont";

export const W = 128, H = 64;
export const DOT_TALL = (12 / 64) / (18 / 128);     // 1.33
// Width in square dots, for drawing things that should look round on the real screen
const VW = Math.round(W / DOT_TALL);                // 96
export const blank = () => Array.from({length: H}, () => new Array(W).fill(false));
const vblank = () => Array.from({length: H}, () => new Array(VW).fill(false));
// Square-dot drawing stretched out to the real screen's 128 dots
const toScreen = v => v.map(row => Array.from({length: W}, (_, x) => row[Math.floor(x / DOT_TALL)]));
// Scrolling text and the preview: 10 pictures a second. The daemon moves screens on every 50 ms,
// so this lands on its ticks, and the real LCD (which smears fast movement) looks cleaner than at 16.
export const FRAME_MS = 100;
// Scrolling was tuned for 60 ms steps: scale it to the step used
const STEP = FRAME_MS / 60;
export const MIN_MS = 50;            // the daemon plays at most 20 a second
export const MAX_MS = 10000;         // up to 10 seconds per screen
export const DEFAULT_GAP = 50;       // dots between two screens (7 mm, screens are 18 mm wide)

/* ---------- To and from the daemon ---------- */
export function toBytes(pix) {
    const bytes = new Uint8Array(1024);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (pix[y][x]) bytes[128 * (y >> 3) + x] |= 1 << (y & 7);
    return bytes;
}

export function fromBytes(bytes, offset = 0) {
    return Array.from({length: H}, (_, y) => Array.from({length: W}, (_, x) => !!(bytes[offset + 128 * (y >> 3) + x] & (1 << (y & 7)))));
}

// [{pix, ms}] -> the daemon's CustomScreen
export function toCustomScreen(frames, ui) {
    const all = new Uint8Array(frames.length * 1024);
    frames.forEach((f, i) => all.set(toBytes(f.pix), i * 1024));
    let text = "";
    for (let i = 0; i < all.length; i += 0x8000) text += String.fromCharCode(...all.subarray(i, i + 0x8000));
    return {frames: btoa(text), ms: frames.map(f => Math.max(MIN_MS, Math.round(f.ms))), ui: JSON.stringify(ui)};
}

export function fromCustomScreen(screen) {
    const text = atob(screen.frames), bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
    const frames = [];
    for (let i = 0; i * 1024 < bytes.length; i++) frames.push({pix: fromBytes(bytes, i * 1024), ms: screen.ms[i] || 100});
    return frames;
}

/* ---------- Drawing the dots on a canvas (dot matrix, tall dots, cached) ---------- */
const hex = h => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const css = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
// Lit dots: the screen's light colour, as the real backlight shows it (a little lifted, like the glass)
const litColour = h => mix(hex(h), [255, 255, 255], .12);

// How bright a light colour is (0 - 1). Below DARK the real screen looks black.
export function colourBrightness(h) {
    const c = hex(h);
    return (c[0] * .3 + c[1] * .59 + c[2] * .11) / 255;
}
export const DARK = .18;
const dotCache = new Map();

function dotSprites(d, colour) {
    const key = d.toFixed(3) + colour;
    if (dotCache.has(key)) return dotCache.get(key);
    const lit = litColour(colour), dy = d * DOT_TALL, pad = Math.ceil(dy * 1.2), size = Math.ceil(dy) + pad * 2;
    const dot = document.createElement("canvas");
    dot.width = dot.height = size;
    const g = dot.getContext("2d");
    g.shadowColor = css(lit, .7);
    g.shadowBlur = d * 1.1;
    g.fillStyle = css(lit);
    g.beginPath();
    g.ellipse(size / 2, size / 2, d * .42, dy * .42, 0, 0, 7);
    g.fill();
    const bg = document.createElement("canvas");
    bg.width = Math.round(W * d);
    bg.height = Math.round(H * dy);
    const h = bg.getContext("2d");
    h.fillStyle = "#0c0e0e";
    h.fillRect(0, 0, bg.width, bg.height);
    h.fillStyle = css(mix([18, 22, 22], lit, .08));
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        h.beginPath();
        h.ellipse((x + .5) * d, (y + .5) * dy, d * .42, dy * .42, 0, 0, 7);
        h.fill();
    }
    const out = {dot, size, bg, dy};
    if (dotCache.size > 40) dotCache.clear();
    dotCache.set(key, out);
    return out;
}

// colour: "RRGGBB", the screen's light colour
export function renderDots(canvas, pix, colour) {
    const dpr = window.devicePixelRatio || 1;
    const d = Math.max(1, (canvas.clientWidth || 200) * dpr / W);
    const sw = Math.round(W * d), sh = Math.round(H * d * DOT_TALL);
    if (canvas.width !== sw || canvas.height !== sh) {
        canvas.width = sw;
        canvas.height = sh;
    }
    const g = canvas.getContext("2d"), sp = dotSprites(d, colour), off = sp.size / 2;
    g.drawImage(sp.bg, 0, 0);
    for (let y = 0; y < H; y++) {
        const row = pix[y];
        for (let x = 0; x < W; x++) if (row[x]) g.drawImage(sp.dot, (x + .5) * d - off, (y + .5) * sp.dy - off);
    }
    const shine = g.createLinearGradient(0, 0, 0, sh);
    shine.addColorStop(0, "rgba(255,255,255,.08)");
    shine.addColorStop(.42, "rgba(255,255,255,.02)");
    shine.addColorStop(.43, "rgba(255,255,255,0)");
    g.fillStyle = shine;
    g.fillRect(0, 0, sw, sh);
}

// The Device page's look: unlit dots black, lit dots see-through (the screen colour shows behind)
export function renderInk(canvas, pix) {
    const box = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(box.width * window.devicePixelRatio));
    const height = Math.max(1, Math.round(box.height * window.devicePixelRatio));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const g = canvas.getContext("2d");
    g.clearRect(0, 0, width, height);
    g.fillStyle = "#000";
    for (let y = 0; y < H; y++) {
        const y0 = Math.round(y * height / H), y1 = Math.round((y + 1) * height / H);
        for (let x = 0; x < W; x++) if (!pix[y][x]) {
            const x0 = Math.round(x * width / W), x1 = Math.round((x + 1) * width / W);
            g.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
        }
    }
}

/* ---------- Canvas pictures to dots (on the square-dot grid, then stretched for tall dots) ---------- */
let work = null;

function workCanvas() {
    if (!work) {
        work = document.createElement("canvas");
        work.width = VW;
        work.height = H;
    }
    return work.getContext("2d", {willReadFrequently: true});
}

function canvasToDots(ctx, threshold, dither, invert) {
    const img = ctx.getImageData(0, 0, VW, H).data;
    const lum = new Float32Array(VW * H);
    for (let i = 0; i < VW * H; i++) {
        const a = img[i * 4 + 3] / 255;
        lum[i] = (img[i * 4] * .3 + img[i * 4 + 1] * .59 + img[i * 4 + 2] * .11) * a;
    }
    const v = vblank();
    for (let y = 0; y < H; y++) for (let x = 0; x < VW; x++) {
        const i = y * VW + x, old = lum[i], on = old >= threshold;
        v[y][x] = invert ? !on : on;
        if (dither) {
            // Floyd-Steinberg: pass the rounding error on, so shades become dot patterns
            const err = old - (on ? 255 : 0);
            if (x + 1 < VW) lum[i + 1] += err * 7 / 16;
            if (y + 1 < H) {
                if (x > 0) lum[i + VW - 1] += err * 3 / 16;
                lum[i + VW] += err * 5 / 16;
                if (x + 1 < VW) lum[i + VW + 1] += err / 16;
            }
        }
    }
    return toScreen(v);
}

/* ---------- Your words ---------- */
// cfg: {text, font, size, align, long: "shrink" | "scroll", invert, bold}; t: picture number (for scrolling)
// font "pixel" is our own dot font (sharp, size in steps of 7 dots); other fonts are the app's own.
const pixelScale = size => Math.max(1, Math.round(size / 9));

export function textWidth(cfg) {
    if (cfg.font === "pixel") return pixelTextWidth(cfg.text, pixelScale(cfg.size)) + (cfg.bold ? 1 : 0);
    const ctx = workCanvas();
    ctx.font = `${cfg.bold ? 700 : 400} ${cfg.size}px "${cfg.font}", monospace`;
    return ctx.measureText(cfg.text).width;
}

function pixelTextFrame(cfg, t) {
    const v = vblank();
    if (cfg.invert) v.forEach(row => row.fill(true));
    let scale = pixelScale(cfg.size);
    let width = pixelTextWidth(cfg.text, scale);
    if (cfg.long === "shrink") while (width > VW - 4 && scale > 1) width = pixelTextWidth(cfg.text, --scale);
    let x;
    if (cfg.long === "scroll" && width > VW - 4) x = VW - ((t * 1.5 * STEP) % (width + VW * .6));
    else x = cfg.align === "left" ? 2 : cfg.align === "right" ? VW - 2 - width : (VW - width) / 2;
    drawPixelText(v, cfg.text, Math.round(x), Math.round((H - 7 * scale) / 2), scale, !cfg.invert, cfg.bold);
    return toScreen(v);
}

export function textFrame(cfg, t = 0) {
    if (cfg.font === "pixel") return pixelTextFrame(cfg, t);
    const ctx = workCanvas();
    ctx.fillStyle = cfg.invert ? "#fff" : "#000";
    ctx.fillRect(0, 0, VW, H);
    ctx.fillStyle = cfg.invert ? "#000" : "#fff";
    let size = cfg.size;
    const font = s => `${cfg.bold ? 700 : 400} ${s}px "${cfg.font}", monospace`;
    ctx.font = font(size);
    let width = ctx.measureText(cfg.text).width;
    if (cfg.long === "shrink") {
        while (width > VW - 4 && size > 8) {
            size--;
            ctx.font = font(size);
            width = ctx.measureText(cfg.text).width;
        }
    }
    ctx.textBaseline = "middle";
    let x;
    if (cfg.long === "scroll" && width > VW - 4) x = VW - ((t * 1.5 * STEP) % (width + VW * .6));
    else x = cfg.align === "left" ? 2 : cfg.align === "right" ? VW - 2 - width : (VW - width) / 2;
    ctx.fillText(cfg.text, x, H / 2 + 1);
    return canvasToDots(ctx, 128, false, false);
}

// Every picture of the text, for the daemon (one still picture, or one loop of the scroll)
export function textFrames(cfg) {
    if (!(cfg.long === "scroll" && textWidth(cfg) > VW - 4)) return [{pix: textFrame(cfg), ms: 1000}];
    const loop = Math.ceil((textWidth(cfg) + VW * .6) / (1.5 * STEP));
    const frames = [];
    for (let t = 0; t < Math.min(loop, MAX_MS / FRAME_MS); t++) frames.push({pix: textFrame(cfg, t), ms: FRAME_MS});
    return frames;
}

/* ---------- Pictures and GIFs ---------- */
// cfg: {fit: "fit" | "fill", threshold 0-255, dither, invert}
export function pictureFrame(img, cfg) {
    const ctx = workCanvas();
    const sw = img.width || img.naturalWidth, sh = img.height || img.naturalHeight;
    // Fit on the square-dot grid (96 x 64); stretching to 128 makes it right on the tall dots
    const s = cfg.fit === "fill" ? Math.max(VW / sw, H / sh) : Math.min(VW / sw, H / sh);
    const w = sw * s, h = sh * s;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, VW, H);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, (VW - w) / 2, (H - h) / 2, w, h);
    return canvasToDots(ctx, cfg.threshold, cfg.dither, cfg.invert);
}

// Reads a GIF (every picture, up to 60 s) or a still picture. Returns [{img, ms}] or throws.
export async function readPictureFile(file) {
    if ("ImageDecoder" in window && file.type === "image/gif") {
        const dec = new window.ImageDecoder({data: await file.arrayBuffer(), type: file.type});
        await dec.tracks.ready;
        const count = Math.min(dec.tracks.selectedTrack.frameCount, 1200);
        const all = [];
        let total = 0;
        for (let i = 0; i < count && total < 60000; i++) {
            const {image} = await dec.decode({frameIndex: i});
            // keep each picture small: the screen is only 128 x 64
            const scale = Math.min(1, 256 / image.displayWidth);
            const c = document.createElement("canvas");
            c.width = Math.round(image.displayWidth * scale);
            c.height = Math.round(image.displayHeight * scale);
            c.getContext("2d").drawImage(image, 0, 0, c.width, c.height);
            const ms = Math.max(10, (image.duration || 100000) / 1000);
            image.close();
            all.push({img: c, ms});
            total += ms;
        }
        return all;
    }
    const url = URL.createObjectURL(file);
    try {
        const img = new Image();
        img.src = url;
        await img.decode();
        return [{img, ms: 1000}];
    } finally {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}

// A long or very fast GIF is fixed automatically: pictures shown for less than 50 ms are merged into the
// next one, and only a 10 second part is kept, starting at startMs.
export function fitGif(all, startMs) {
    const merged = [];
    for (const fr of all) {
        const last = merged[merged.length - 1];
        if (last && last.ms < MIN_MS) last.ms += fr.ms;
        else merged.push({img: fr.img, ms: fr.ms});
    }
    const totalMs = merged.reduce((a, f) => a + f.ms, 0);
    const start = Math.min(startMs, Math.max(0, totalMs - MAX_MS));
    let at = 0;
    const part = [];
    for (const fr of merged) {
        const end = at + fr.ms;
        if (end > start && at < start + MAX_MS) part.push(fr);
        at = end;
    }
    return {frames: part.length ? part : merged.slice(0, 1), totalMs, start, merged: all.length - merged.length};
}

/* ---------- Line up: one straight line across all four screens ---------- */
export function lineFrame(index, gap) {
    const pix = blank();
    const step = W + gap, total = 4 * W + 3 * gap;
    for (let x = 0; x < W; x++) {
        const y = Math.round((index * step + x) / total * (H - 1));
        for (let k = -1; k <= 1; k++) if (y + k >= 0 && y + k < H) pix[y + k][x] = true;
    }
    return pix;
}
