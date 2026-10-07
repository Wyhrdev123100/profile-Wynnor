"use client";

import { useEffect, useRef, useState } from "react";
import { useFinePointer, useReducedMotion } from "@/components/motion/hooks";

/* ==================================================================
   CUSTOM CURSOR
   ---------------------------------------------------------------
   - chấm nhỏ bám chính xác (không nội suy) → cảm giác "chính xác"
   - vòng lớn nội suy chậm → cảm giác "có trọng lượng"
   - phóng to + đổi nhãn khi đứng trên phần tử có data-cursor
   - chỉ chạy khi thiết bị có con trỏ chuột thật và người dùng
     không bật giảm chuyển động.
   Toàn bộ trạng thái nằm trên DOM, không re-render React.
   ================================================================== */

const LABELS: Record<string, string> = {
  view: "Xem",
  open: "Mở",
  drag: "Kéo",
  copy: "Sao chép",
};

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(fine && !reduced), [fine, reduced]);

  useEffect(() => {
    if (!ready) return;
    const d = dot.current;
    const r = ring.current;
    const l = label.current;
    if (!d || !r || !l) return;

    document.documentElement.classList.add("cursor-none");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;
    let shown = false;
    let mode = "";
    let rafText = 0;

    const place = () => {
      d.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    };

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      place();
      raf =
        Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1 ? requestAnimationFrame(loop) : 0;
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      if (!shown) {
        shown = true;
        d.style.opacity = "1";
        r.style.opacity = "1";
      }
      kick();

      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      const next = el?.dataset.cursor ?? "";
      if (next !== mode) {
        mode = next;
        const text = LABELS[next] ?? el?.dataset.cursorLabel ?? "";
        l.textContent = text;
        r.dataset.mode = next || "idle";
        cancelAnimationFrame(rafText);
        rafText = requestAnimationFrame(() => {
          l.dataset.ready = text ? "true" : "false";
        });
      }
    };

    const onDown = () => {
      r.dataset.down = "true";
    };
    const onUp = () => {
      delete r.dataset.down;
    };
    const onLeave = () => {
      shown = false;
      d.style.opacity = "0";
      r.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("cursor-none");
      if (raf) cancelAnimationFrame(raf);
      cancelAnimationFrame(rafText);
    };
  }, [ready]);

  if (!ready) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[99]" data-custom-cursor>
      {/* vòng nội suy */}
      <div
        ref={ring}
        className="fixed left-0 top-0 grid size-9 place-items-center rounded-full border border-line-3/70 opacity-0 backdrop-blur-[1px] transition-[width,height,background-color,border-color,opacity,scale] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] data-[down=true]:scale-90 data-[mode=view]:size-[70px] data-[mode=view]:border-transparent data-[mode=view]:bg-fg data-[mode=open]:size-[54px] data-[mode=copy]:size-[54px]"
        style={{ willChange: "transform" }}
      >
        <span
          ref={label}
          className="scale-90 text-[11px] leading-none font-medium tracking-[-0.01em] text-bg opacity-0 transition-[opacity,transform] duration-200 data-[ready=true]:scale-100 data-[ready=true]:opacity-100"
        />
      </div>

      {/* chấm chính xác */}
      <div
        ref={dot}
        className="fixed left-0 top-0 size-1 rounded-full bg-ice opacity-0 transition-opacity duration-300"
        style={{ willChange: "transform" }}
      />
    </div>
  );
}
