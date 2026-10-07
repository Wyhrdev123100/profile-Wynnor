"use client";

import { useEffect, useRef } from "react";
import { onAudio } from "@/components/music/audio-bus";
import { prefersReducedMotion } from "@/components/motion/scroll";

/* ==================================================================
   STAR FIELD — nền sao của vũ trụ
   ---------------------------------------------------------------
   Canvas 2D thay vì WebGL: đúng một draw pass mỗi frame, DPR giới
   hạn 2, số sao co lại trên màn nhỏ. Ba lớp chiều sâu cho parallax.

   - sao nhấp nháy nhẹ, tốc độ nhân với biên độ nhạc đang phát
   - dừng hẳn khi: tab ẩn, ra khỏi khung nhìn, hoặc reduced-motion
     (khi đó vẽ đúng một frame tĩnh)
   ================================================================== */

type Star = {
  x: number;
  y: number;
  z: number;
  r: number;
  a: number;
  /** pha nhấp nháy riêng */
  p: number;
};

export function StarField({
  className = "",
  density = 0.00012,
  /** 0–1: mức parallax tối đa theo con trỏ */
  parallax = 1,
  interactive = true,
}: {
  className?: string;
  density?: number;
  parallax?: number;
  interactive?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const level = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });

  useEffect(() => onAudio((s) => (level.current = s.level)), []);

  useEffect(() => {
    const cv = canvas.current;
    const host = wrap.current;
    if (!cv || !host) return;

    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let raf = 0;
    let running = false;
    let inView = false;
    const reduced = prefersReducedMotion();

    const resize = () => {
      const r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const scale = w < 520 ? 0.45 : w < 1024 ? 0.75 : 1;
      const count = Math.min(300, Math.max(60, Math.round(w * h * density * scale)));
      // seed cố định: server và client cùng bộ sao, không nhảy khi hydrate
      let seed = 90210;
      const rnd = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };
      stars = Array.from({ length: count }, () => {
        const z = rnd();
        return {
          x: rnd(),
          y: rnd(),
          z,
          r: 0.4 + z * 1.5,
          a: 0.22 + (1 - z) * 0.55,
          p: rnd() * Math.PI * 2,
        };
      });
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const amp = level.current;
      const s = smooth.current;
      // parallax rất nhẹ: 6px ở lớp gần nhất
      const depth = 6 * parallax;

      for (const st of stars) {
        const drift = amp * 0.35;
        const twinkle = reduced ? 1 : 0.72 + Math.sin(t * 0.0011 + st.p) * 0.28;
        const alpha = Math.min(1, st.a * twinkle);
        if (alpha < 0.03) continue;

        const x =
          ((st.x * w + s.x * depth * (0.35 + st.z)) % (w + 8) + w + 8) % (w + 8) - 4;
        const y =
          ((st.y * h + s.y * depth * (0.35 + st.z) + t * 0.0006 * drift * (0.3 + st.z)) %
            (h + 8) +
            h +
            8) %
            (h + 8) -
          4;

        ctx.beginPath();
        ctx.arc(x, y, st.r * (1 + amp * 0.35), 0, Math.PI * 2);
        ctx.fillStyle =
          st.z > 0.82
            ? `rgba(169, 155, 255, ${alpha})`
            : st.z > 0.55
              ? `rgba(190, 220, 255, ${alpha})`
              : `rgba(235, 242, 255, ${alpha * 0.85})`;
        ctx.fill();
      }
    };

    const frame = (t: number) => {
      raf = 0;
      if (!running) return;
      const s = smooth.current;
      s.x += (pointer.current.x - s.x) * 0.06;
      s.y += (pointer.current.y - s.y) * 0.06;
      draw(t);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || document.hidden || reduced) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2;
      pointer.current.y = ((e.clientY - r.top) / Math.max(1, r.height) - 0.5) * 2;
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(host);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(host);

    const onVisibility = () => (document.hidden ? stop() : inView && start());

    resize();
    if (reduced) draw(0);
    else start();

    if (interactive) window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density, parallax, interactive]);

  return (
    <div ref={wrap} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <canvas ref={canvas} />
    </div>
  );
}