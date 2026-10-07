"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { subscribeScroll, prefersReducedMotion, clamp } from "@/components/motion/scroll";
import { useInView, useReducedMotion } from "@/components/motion/hooks";

/* ==================================================================
   Parallax — ghi thẳng transform vào DOM, không re-render.
   `depth` là phần trăm của chiều cao viewport mà phần tử trượt
   qua khi đi từ lúc lọt khung nhìn tới lúc rời khung nhìn.
   ================================================================== */
export function Parallax({
  children,
  depth = 12,
  axis = "y",
  className = "",
  as: Tag = "div",
  style,
  scale = 0,
}: {
  children: ReactNode;
  /** px trượt = depth% * viewportHeight */
  depth?: number;
  axis?: "y" | "x";
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
  /** phóng/thu nhẹ theo scroll (1 = không đổi) */
  scale?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useRef(false);

  useInView(
    ref,
    () => {
      active.current = true;
    },
    { once: false, threshold: 0, rootMargin: "20% 0px 20% 0px" },
  );

  useEffect(() => {
    if (reduced || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    return subscribeScroll((y, vh) => {
      if (!active.current) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;

      // -1 (dưới khung nhìn) .. 1 (trên khung nhìn)
      const center = r.top + r.height / 2;
      const p = clamp((vh / 2 - center) / vh, -1, 1);

      const offset = p * (vh / 100) * depth;
      const sc = scale ? 1 + p * scale : 1;

      el.style.transform =
        axis === "y"
          ? `translate3d(0, ${offset.toFixed(2)}px, 0)${scale ? ` scale(${sc.toFixed(4)})` : ""}`
          : `translate3d(${offset.toFixed(2)}px, 0, 0)${scale ? ` scale(${sc.toFixed(4)})` : ""}`;
    });
  }, [depth, axis, scale, reduced]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}

/* ==================================================================
   PointerSpotlight — lớp sáng bám con trỏ bên trong một vùng.
   Dùng CSS variables để `radial-gradient` đổi vị trí mà không
   cần re-render.
   ================================================================== */
export function PointerSpotlight({
  children,
  className = "",
  color = "var(--ice)",
  intensity = 0.1,
  radius = 420,
  as: Tag = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  intensity?: number;
  radius?: number;
  as?: ElementType;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;
    let tx = 50;
    let ty = 50;
    let cx = 50;
    let cy = 50;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
      if (!raf) raf = requestAnimationFrame(settle);
    };

    const settle = () => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      el.style.setProperty("--px", `${cx.toFixed(2)}%`);
      el.style.setProperty("--py", `${cy.toFixed(2)}%`);
      raf = Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05 ? requestAnimationFrame(settle) : 0;
    };

    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`group/spot relative isolate overflow-hidden ${className}`}
      style={
        {
          "--px": "50%",
          "--py": "50%",
          "--spot-color": color,
          "--spot-a": intensity,
          "--spot-r": `${radius}px`,
          ...style,
        } as CSSProperties
      }
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background:
            "radial-gradient(var(--spot-r) circle at var(--px) var(--py), color-mix(in oklab, var(--spot-color) calc(var(--spot-a) * 100%), transparent), transparent 62%)",
        }}
      />
      {children}
    </Tag>
  );
}
