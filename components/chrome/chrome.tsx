"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeScroll } from "@/components/motion/scroll";
import { railLinks } from "@/data/profile";
import { useActiveSection, useScrollLock, useMounted } from "@/components/motion/hooks";
import { Icon } from "@/components/icons";

/* ==================================================================
   SCROLL PROGRESS — hairline 1px trên đỉnh trang.
   Ghi thẳng vào style (không setState mỗi frame).
   ================================================================== */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    el.style.transform = "scaleX(0)";
    return subscribeScroll((y, _vh, max) => {
      const p = max > 0 ? Math.min(1, y / max) : 0;
      el.style.transform = `scaleX(${p.toFixed(4)})`;
    });
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-px bg-line/40"
    >
      <div
        ref={bar}
        className="h-full origin-left"
        style={{
          background:
            "linear-gradient(90deg, var(--ice), var(--iris) 62%, transparent)",
          willChange: "transform",
        }}
      />
    </div>
  );
}

/* ==================================================================
   INDEX RAIL — thanh điều hướng dọc bên phải (≥1280px).
   Một dấu chấm mỗi section; section hiện tại nở ra kèm nhãn.
   Đây là thứ thay thế cho "dấu hiệu phần trăm đọc" kiểu blog.
   ================================================================== */
export function IndexRail() {
  const mounted = useMounted();
  const ids = railLinks.map((l) => l.id);
  const active = useActiveSection(ids);
  const [hovered, setHovered] = useState<string | null>(null);
  const open = hovered ?? active;
  const [mobileOpen, setMobileOpen] = useState(false);
  useScrollLock(mobileOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    if (mobileOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const go = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Desktop */}
      <nav
        aria-label="Mục lục trang"
        className="fixed top-1/2 right-5 z-50 hidden -translate-y-1/2 2xl:block"
      >
        <ul
          className="flex flex-col items-end gap-1"
          onMouseLeave={() => setHovered(null)}
        >
          {railLinks.map((l) => {
            const on = mounted && active === l.id;
            const showLabel = mounted && open === l.id;
            return (
              <li key={l.id} className="flex items-center justify-end">
                <span
                  className={`label mr-3 whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    showLabel
                      ? "translate-x-0 text-fg opacity-100"
                      : "pointer-events-none translate-x-1.5 text-muted opacity-0"
                  }`}
                >
                  {l.label}
                </span>
                <button
                  type="button"
                  onClick={() => go(l.id)}
                  onMouseEnter={() => setHovered(l.id)}
                  aria-label={`Đi tới ${l.label}`}
                  aria-current={on ? "true" : undefined}
                  className="group grid h-6 w-6 place-items-center"
                >
                  <span
                    aria-hidden
                    className={`block rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      on
                        ? "h-[18px] w-[2px] bg-ice"
                        : "h-[2px] w-[10px] bg-line-3 group-hover:w-[18px] group-hover:bg-fg-2"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile: nút mục lục nổi */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Mở mục lục"
        aria-expanded={mobileOpen}
        className="glass fixed right-4 bottom-4 z-[70] grid size-11 place-items-center rounded-full text-fg-2 transition-colors hover:text-fg sm:right-5 sm:bottom-5 2xl:hidden"
      >
        <Icon name={mobileOpen ? "close" : "menu"} size={18} />
      </button>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[69] 2xl:hidden" role="dialog" aria-label="Mục lục">
          <button
            type="button"
            aria-label="Đóng mục lục"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-bg/70 backdrop-blur-md"
          />
          <nav
            aria-label="Mục lục trang"
            className="absolute inset-x-4 top-20 rounded-2xl border border-line bg-glass p-2 shadow-3 backdrop-blur-2xl"
          >
            <ul className="flex flex-col">
              {railLinks.map((l, i) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => go(l.id)}
                    style={{ animationDelay: `${i * 38}ms` }}
                    className="animate-rise flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-s3"
                  >
                    <span
                      className={`text-[15px] tracking-[-0.01em] ${
                        active === l.id ? "text-ice" : "text-fg"
                      }`}
                    >
                      {l.label}
                    </span>
                    <span className="label tnum text-muted-2">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  );
}

/* ==================================================================
   BACK TO TOP
   ================================================================== */
export function BackToTop() {
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = btn.current;
    if (!el) return;
    return subscribeScroll((y) => {
      const on = y > 900;
      el.style.opacity = on ? "1" : "0";
      el.style.pointerEvents = on ? "auto" : "none";
      el.style.transform = `translate3d(0, ${on ? 0 : 14}px, 0)`;
    });
  }, []);

  return (
    <button
      ref={btn}
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Lên đầu trang"
      className="glass fixed bottom-[4.75rem] left-4 z-[70] grid size-11 place-items-center rounded-full text-muted opacity-0 transition-[color,background-color] duration-200 hover:text-fg sm:bottom-[4.5rem] sm:left-5 2xl:hidden"
      style={{ transitionProperty: "opacity, transform, color, background-color" }}
    >
      <Icon name="arrow" size={16} className="-rotate-90" />
    </button>
  );
}
