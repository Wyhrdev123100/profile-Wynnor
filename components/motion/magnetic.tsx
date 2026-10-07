"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { useFinePointer, useReducedMotion } from "@/components/motion/hooks";

/* ==================================================================
   Magnetic — phần tử nghiêng theo con trỏ.
   Chỉ bật trên thiết bị có con trỏ thật. Vùng hút rộng hơn vùng
   element để cảm giác "bị kéo" đúng như mong đợi.
   ================================================================== */
export function Magnetic({
  children,
  className = "",
  strength = 0.28,
  radius = 90,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** 0..1 — mức độ bị hút */
  strength?: number;
  /** bán kính vùng kích hoạt (px) tính từ mép element */
  radius?: number;
  as?: ElementType;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  useEffect(() => setEnabled(fine && !reduced), [fine, reduced]);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !enabled) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let active = false;

    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      raf =
        Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05 ? requestAnimationFrame(loop) : 0;
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cxr = r.left + r.width / 2;
      const cyr = r.top + r.height / 2;
      const dx = e.clientX - cxr;
      const dy = e.clientY - cyr;
      const reachX = r.width / 2 + radius;
      const reachY = r.height / 2 + radius;

      if (Math.abs(dx) < reachX && Math.abs(dy) < reachY) {
        active = true;
        tx = dx * strength;
        ty = dy * strength;
        el.dataset.pulled = "true";
      } else if (active) {
        active = false;
        tx = 0;
        ty = 0;
        delete el.dataset.pulled;
      }
      kick();
    };

    const onLeave = () => {
      active = false;
      tx = 0;
      ty = 0;
      delete el.dataset.pulled;
      kick();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeave);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, [enabled, strength, radius]);

  return (
    <Tag
      ref={wrap}
      className={`will-change-transform ${className}`}
      style={{ transform: "translate3d(0,0,0)" }}
    >
      {children}
    </Tag>
  );
}
