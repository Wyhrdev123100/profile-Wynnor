"use client";

import { useEffect, useRef } from "react";
import { getSpectrum, onAudio } from "@/components/music/audio-bus";
import { prefersReducedMotion } from "@/components/motion/scroll";

/* ==================================================================
   AUDIO VISUALIZER
   ------------------------------------------------------------------
   Phổ tần thật từ Web Audio, nhưng vẽ kiểu "spectrum tương lai":
   thanh bo tròn, gradient ice → iris, có phản chiếu mờ bên dưới
   và một đường chân mảnh.

   - DPR giới hạn 2, vẽ bằng một lần clear + fill mỗi frame.
   - Chỉ chạy khi `active` (panel đang mở) — đóng panel là không tốn
     một frame nào.
   - Không có phổ tần (chưa bấm phát / trình duyệt chặn) thì vẽ một
     sóng rất thấp: gợi ý "có gì đó ở đây" mà không giả vờ phát nhạc.
   ================================================================== */

const BARS = 26;

export function AudioVisualizer({
  active = true,
  className = "",
}: {
  active?: boolean;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv || !active) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const host = cv.parentElement ?? cv;
    const bars = new Float32Array(BARS);
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let t = 0;
    let ice = "#7ad7ff";
    let iris = "#a99bff";

    const resize = () => {
      const r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // createLinearGradient không hiểu CSS var → đọc biến thật
      const cs = getComputedStyle(cv);
      ice = cs.getPropertyValue("--ice").trim() || ice;
      iris = cs.getPropertyValue("--iris").trim() || iris;
    };

    const reduced = prefersReducedMotion();

    // Chỉ khi đang phát mới tin phổ tần. Analyser giữ nguyên frame cuối
    // sau khi pause, nếu không gate theo `playing` thì thanh đứng hình.
    let playing = false;

    const draw = () => {
      raf = 0;
      t += 1;

      const spectrum = playing ? getSpectrum() : null;
      const floor = reduced ? 0.06 : 0.04;

      for (let i = 0; i < BARS; i += 1) {
        let target = floor;
        if (spectrum) {
          // lấy mẫu theo thang log để dải thấp không bị dồn chật
          const p = i / BARS;
          const idx = Math.min(
            spectrum.length - 1,
            Math.round(Math.pow(p, 1.55) * (spectrum.length - 1)),
          );
          target = floor + (spectrum[idx] / 255) * 0.9;
        } else if (!reduced) {
          target = floor + Math.abs(Math.sin(t * 0.02 + i * 0.42)) * 0.05;
        }
        // reduced-motion: nhảy thẳng, không nội suy, không chạy vòng lặp
        bars[i] = reduced
          ? target
          : bars[i] + (target - bars[i]) * (target > bars[i] ? 0.34 : 0.12);
      }

      ctx.clearRect(0, 0, w, h);

      const gap = 2;
      const bw = Math.max(1.5, (w - gap * (BARS - 1)) / BARS);
      const base = h - 2;

      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, ice);
      grad.addColorStop(1, iris);

      // đường chân
      ctx.beginPath();
      ctx.moveTo(0, base + 1.5);
      ctx.lineTo(w, base + 1.5);
      ctx.strokeStyle = "color-mix(in oklab, var(--ice) 22%, transparent)";
      ctx.lineWidth = 1;
      ctx.stroke();

      for (let i = 0; i < BARS; i += 1) {
        const v = bars[i];
        const bh = Math.max(2, v * (h - 6));
        const x = i * (bw + gap);
        const y = base - bh;
        const r = Math.min(bw / 2, 2.2);

        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.34 + v * 0.66;
        roundRect(ctx, x, y, bw, bh, r);
        ctx.fill();

        // phản chiếu: cùng dữ liệu, mờ và lật
        ctx.globalAlpha = (0.1 + v * 0.16) * 0.7;
        roundRect(ctx, x, base + 2, bw, Math.max(1, bh * 0.32), r);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    // pause/phát lại vẫn cần một nhịp vẽ để thanh về đúng nhịp
    const off = onAudio((s) => {
      if (s.playing === playing) return;
      playing = s.playing;
      if (!raf) raf = requestAnimationFrame(draw);
    });

    resize();
    if (reduced) draw();
    else raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
    });
    ro.observe(host);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      off();
      ro.disconnect();
    };
  }, [active]);

  return (
    <div className={`relative h-9 w-full ${className}`} aria-hidden>
      <canvas ref={canvas} className="absolute inset-0 size-full" />
    </div>
  );
}

/** roundRect có sẵn ở đa số trình duyệt, nhưng vẽ tay cho chắc */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}