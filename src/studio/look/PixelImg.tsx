import React, { useEffect, useRef, useState } from 'react';
import { continueRender, delayRender, Img } from 'remotion';
import { hexToRgb } from '../motion';

/**
 * A photo redrawn in the picture's own material: low resolution, a handful of tones, ordered dither.
 * This is how an archive photo or a portrait enters a DA 2 frame — as a halftone print in the series palette,
 * not as a crisp rectangle pasted over a pixel world. If anything fails (decode, tainted canvas), the plain
 * image is shown instead: a card is never lost.
 */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);

export const PixelImg: React.FC<{
  src: string; width: number; height: number;
  /** size of one image pixel on screen (match the series look.px) */
  px?: number;
  /** dark → light; 3 to 5 colours work best */
  tones: string[];
  /** CSS-like focus point of the crop, e.g. "50% 25%" */
  focus?: string;
  /** extra zoom on the focus point (≥ 1) */
  zoom?: number;
  style?: React.CSSProperties;
}> = ({ src, width, height, px = 3, tones, focus = '50% 50%', zoom = 1, style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const [hold] = useState(() => delayRender(`PixelImg ${src}`, { timeoutInMilliseconds: 15000 }));
  const w = Math.max(8, Math.round(width / px)), h = Math.max(8, Math.round(height / px));
  const key = `${src}|${w}|${h}|${tones.join()}|${focus}|${zoom.toFixed(3)}`;
  useEffect(() => {
    let done = false;
    const finish = (ok: boolean) => { if (done) return; done = true; if (!ok) setFailed(true); continueRender(hold); };
    const img = new Image();
    img.onload = () => {
      try {
        const c = ref.current; if (!c) return finish(false);
        const ctx = c.getContext('2d', { willReadFrequently: true })!;
        // cover-fit around the focus point
        const [fx, fy] = focus.split(/\s+/).map((v) => parseFloat(v) / 100);
        const s = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
        const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, (w - dw) * (Number.isFinite(fx) ? fx : 0.5), (h - dh) * (Number.isFinite(fy) ? fy : 0.5), dw, dh);
        const data = ctx.getImageData(0, 0, w, h), d = data.data;
        // stretch the contrast between the 3rd and 97th percentile so every photo uses the whole ramp
        const lum = new Float32Array(w * h);
        for (let i = 0; i < w * h; i++) lum[i] = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
        const sorted = Float32Array.from(lum).sort();
        const lo = sorted[Math.floor(sorted.length * 0.03)], hi = Math.max(lo + 0.05, sorted[Math.floor(sorted.length * 0.97)]);
        const ramp = tones.map(hexToRgb), n = ramp.length - 1;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const i = y * w + x;
          const v = Math.min(1, Math.max(0, (lum[i] - lo) / (hi - lo)));
          const k = Math.min(n, Math.max(0, Math.floor(v * n + 0.5 + BAYER[(y % 4) * 4 + (x % 4)] * 0.9)));
          d[i * 4] = ramp[k][0] * 255; d[i * 4 + 1] = ramp[k][1] * 255; d[i * 4 + 2] = ramp[k][2] * 255; d[i * 4 + 3] = 255;
        }
        ctx.putImageData(data, 0, 0);
        finish(true);
      } catch (e) { console.warn(`[studio] PixelImg ${src}: ${e}`); finish(false); }
    };
    img.onerror = () => finish(false);
    img.src = src;
    return () => { finish(true); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  if (failed) return <Img src={src} style={{ width, height, objectFit: 'cover', objectPosition: focus, ...style }} />;
  return <canvas ref={ref} width={w} height={h} style={{ width, height, imageRendering: 'pixelated', display: 'block', ...style }} />;
};
