"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/components/motion/scroll";
import { useInView, useReducedMotion } from "@/components/motion/hooks";

/* ==================================================================
   AURORA FIELD — canvas 2D.
   Một mạng hạt nối bằng đường kẻ, cộng hưởng nhẹ với con trỏ.
   Ưu điểm so với WebGL/three: ~1KB logic, GPU-composited DOM
   không cần, DPR giới hạn 1.5, tự dừng khi tab ẩn / ra khỏi
   khung nhìn / người dùng giảm chuyển động.
   ================================================================== */

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
};

export function AuroraField({
  className = "",
  density = 0.00009,
  linkDist = 132,
  classNameCanvas = "",
}: {
  className?: string;
  /** số hạt trên mỗi px² */
  density?: number;
  /** khoảng cách nối dây (px) */
  linkDist?: number;
  classNameCanvas?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const visible = useRef(false);

  useInView(
    wrap,
    () => {
      visible.current = true;
    },
    { once: false, threshold: 0, rootMargin: "10% 0px" },
  );

  useEffect(() => {
    const cv = canvas.current;
    const host = wrap.current;
    if (!cv || !host) return;
    if (reduced || prefersReducedMotion()) return;

    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let raf = 0;
    let running = false;
    let mx = -999;
    let my = -999;

    const resize = () => {
      const r = host.getBoundingClientRect();
      // giới hạn DPR để không đốt GPU trên màn 3x
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // giảm mật độ trên màn nhỏ để không thành "nhiễu"
      const scale = w < 640 ? 0.55 : w < 1024 ? 0.8 : 1;
      const count = Math.min(88, Math.max(14, Math.round(w * h * density * scale)));

      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.1 + 0.5,
        a: Math.random() * 0.4 + 0.25,
      }));
    };

    const step = () => {
      raf = 0;
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      const D = linkDist * linkDist;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < -20) n.x = w + 20;
        else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        else if (n.y > h + 20) n.y = -20;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190, 220, 255, ${n.a})`;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > D) continue;
          const o = (1 - d2 / D) * 0.14;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = `rgba(150, 190, 255, ${o})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }

        // hút nhẹ về con trỏ
        const dx = mx - n.x;
        const dy = my - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 40000 && d2 > 1) {
          const f = (1 - d2 / 40000) * 0.014;
          n.x += dx * f;
          n.y += dy * f;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(169, 155, 255, ${(1 - d2 / 40000) * 0.16})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointer = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };
    const onLeave = () => {
      mx = -999;
      my = -999;
    };

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(host);

    resize();
    start();

    window.addEventListener("pointermove", onPointer, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible.current) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density, linkDist, reduced]);

  return (
    <div ref={wrap} aria-hidden className={`pointer-events-none ${className}`}>
      <canvas ref={canvas} className={classNameCanvas} />
    </div>
  );
}
