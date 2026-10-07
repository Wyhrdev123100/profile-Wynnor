"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "@/components/motion/hooks";
import { clamp, easeOutExpo } from "@/components/motion/scroll";

/* ==================================================================
   Counter — đếm số khi lọt khung nhìn.
   Dùng rAF thuần, chỉ ghi vào textContent (không re-render React).
   ================================================================== */
export function Counter({
  value,
  duration = 1500,
  decimals = 0,
  className = "",
}: {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const write = (n: number) => {
      el.textContent =
        decimals > 0
          ? n.toFixed(decimals).replace(".", ",")
          : Math.round(n).toLocaleString("vi-VN");
    };

    if (reduced) {
      write(value);
      return;
    }
    write(0);
  }, [reduced, value, decimals]);

  useInView(
    ref,
    () => {
      if (reduced) return;
      const el = ref.current;
      if (!el) return;
      let raf = 0;
      const start = performance.now();
      const write = (n: number) => {
        el.textContent =
          decimals > 0
            ? n.toFixed(decimals).replace(".", ",")
            : Math.round(n).toLocaleString("vi-VN");
      };
      const tick = (now: number) => {
        const t = clamp((now - start) / duration);
        write(easeOutExpo(t) * value);
        if (t < 1) raf = requestAnimationFrame(tick);
        else write(value);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    },
    { threshold: 0.4, enabled: !reduced },
  );

  return (
    <span ref={ref} className={`tnum ${className}`}>
      0
    </span>
  );
}
