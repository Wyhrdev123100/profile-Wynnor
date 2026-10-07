"use client";

import { useEffect } from "react";
import { useFinePointer } from "@/components/motion/hooks";

/* ==================================================================
   AMBIENT — grain + vignette + cursor glow.
   Một listener pointermove duy nhất cho cả trang, ghi vào 2 CSS
   variable trên <html> nên không component nào phải re-render.
   ================================================================== */
export function Ambient() {
  const fine = useFinePointer();

  useEffect(() => {
    if (!fine) return;
    const root = document.documentElement;
    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 3;
    let cx = tx;
    let cy = ty;
    let visible = false;

    const settle = () => {
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      root.style.setProperty("--mx", `${cx.toFixed(1)}px`);
      root.style.setProperty("--my", `${cy.toFixed(1)}px`);
      raf =
        Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4 ? requestAnimationFrame(settle) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        root.dataset.pointerIn = "true";
      }
      if (!raf) raf = requestAnimationFrame(settle);
    };

    const onLeave = () => {
      delete root.dataset.pointerIn;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      delete root.dataset.pointerIn;
      root.style.removeProperty("--mx");
      root.style.removeProperty("--my");
    };
  }, [fine]);

  return (
    <>
      {/* hạt nhiễu phim — đè trên cùng, không chặn tương tác */}
      <div className="grain" aria-hidden />

      {/* tối viền: giữ mắt tập trung vào giữa trang */}
      <div
        aria-hidden
        className="ambient__vignette pointer-events-none fixed inset-0 z-[88]"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 55%, color-mix(in oklab, var(--bg) 70%, transparent) 100%)",
        }}
      />

      {/* ánh sáng bám con trỏ */}
      {fine ? <div aria-hidden className="cursor-glow" /> : null}
    </>
  );
}
