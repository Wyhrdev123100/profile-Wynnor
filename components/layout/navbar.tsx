"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { navLinks, profile } from "@/data/profile";
import { subscribeScroll } from "@/components/motion/scroll";
import { useActiveSection, useMounted, useScrollLock } from "@/components/motion/hooks";
import { Icon } from "@/components/icons";
import { Button, IconButton } from "@/components/ui/button";
import { Logo3D } from "@/components/brand/logo3d";
import ThemeToggle from "@/components/chrome/theme-toggle";
import CommandPalette from "@/components/chrome/command-palette";

/* ==================================================================
   NAVBAR
   ---------------------------------------------------------------
   - Nghỉ: trong suốt, không viền.
   - Cuộn: thu nhỏ, blur tăng, viền dưới mờ dần lên, bóng rất nhẹ.
   - Trạng thái "đang ở section N" được ghi bằng gạch dưới chạy
     (không phải pill nền — pill là template).
   ================================================================== */

export default function Navbar() {
  const mounted = useMounted();
  const ids = navLinks.map((l) => l.id);
  const active = useActiveSection(ids);

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useScrollLock(open);

  /* Thu gọn + blur khi cuộn (dùng chung scroll engine) */
  useEffect(() => {
    return subscribeScroll((y) => {
      setScrolled((prev) => {
        const next = y > 24;
        return prev === next ? prev : next;
      });
      if (bar.current) {
        bar.current.style.transform = `scaleX(${Math.min(1, y / 260).toFixed(3)})`;
      }
    });
  }, []);

  /* Chặn cuộn khi mở menu */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[75]"
        data-open={open ? "true" : undefined}
      >
        <div
          className={`relative transition-[background-color,backdrop-filter,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            scrolled && !open
              ? "border-b border-line bg-glass backdrop-blur-xl backdrop-saturate-150"
              : "border-b border-transparent bg-transparent"
          }`}
        >
          {/* gạch tiến trình mờ dần theo scroll — chi tiết nhỏ, rất "đắt" */}
          <div
            ref={bar}
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px origin-left"
            style={{
              background: "linear-gradient(90deg, transparent, var(--line-2), transparent)",
              opacity: scrolled ? 0.7 : 0,
              transition: "opacity 500ms var(--e-out)",
            }}
          />

          <nav
            aria-label="Điều hướng chính"
            className={`shell-wide flex items-center justify-between gap-4 transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              scrolled ? "h-14 md:h-16" : "h-18 md:h-22"
            }`}
          >
            {/* ---------- Logo ---------- */}
            <Link
              href="#top"
              className="group flex shrink-0 items-center gap-2.5 rounded-full"
              aria-label={`${profile.name} — về đầu trang`}
            >
              <Monogram />
              <span className="hidden flex-col leading-none sm:flex">
                <span className="text-[13px] font-medium tracking-[-0.015em]">
                  {profile.name}
                </span>
                <span className="mt-[3px] font-mono text-[10px] tracking-[0.06em] text-muted-2">
                  {profile.roleShort}
                </span>
              </span>
            </Link>

            {/* ---------- Menu desktop ---------- */}
            <ul className="hidden items-center gap-1 lg:flex">
              {navLinks.map((l) => {
                const on = mounted && active === l.id;
                return (
                  <li key={l.id} className={l.wide ? "hidden xl:block" : undefined}>
                    <button
                      type="button"
                      onClick={() => go(l.id)}
                      aria-current={on ? "true" : undefined}
                      className="group relative flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] tracking-[-0.01em] transition-colors duration-200"
                    >
                      <span
                        className={`tnum font-mono text-[10px] transition-colors duration-200 ${
                          on ? "text-ice" : "text-muted-2"
                        }`}
                      >
                        {l.index}
                      </span>
                      <span
                        className={
                          on
                            ? "text-fg"
                            : "text-muted transition-colors group-hover:text-fg"
                        }
                      >
                        {l.label}
                      </span>
                      <span
                        aria-hidden
                        className={`absolute inset-x-3 bottom-1 h-px origin-left bg-fg transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                        style={{ transitionProperty: "transform, opacity" }}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* ---------- Actions ---------- */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <CommandPalette />

              <span className="hidden md:block">
                <ThemeToggle />
              </span>

              <Button
                href="#contact"
                size="sm"
                className="hidden sm:inline-flex"
                iconRight="arrow"
              >
                Bắt đầu
              </Button>

              <IconButton
                name={open ? "close" : "menu"}
                label={open ? "Đóng menu" : "Mở menu"}
                onClick={() => setOpen((v) => !v)}
                className="lg:hidden"
              />
            </div>
          </nav>
        </div>
      </header>

      {/* ---------- Menu mobile ---------- */}
      <div
        className={`fixed inset-0 z-[74] lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Đóng menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-bg/80 backdrop-blur-2xl transition-opacity duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute inset-x-0 top-0 origin-top px-4 pt-[max(5.5rem,env(safe-area-inset-top))] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <nav
            aria-label="Điều hướng"
            className="overflow-hidden rounded-3xl border border-line bg-glass p-2 shadow-3 backdrop-blur-2xl"
          >
            <ul>
              {navLinks.map((l, i) => {
                const on = mounted && active === l.id;
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      tabIndex={open ? 0 : -1}
                      onClick={() => go(l.id)}
                      style={{ transitionDelay: open ? `${140 + i * 45}ms` : "0ms" }}
                      className={`group flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        open ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"
                      } ${on ? "bg-s3" : "hover:bg-s2"}`}
                    >
                      <span className="flex items-baseline gap-3">
                        <span className="tnum font-mono text-[10px] text-ice">{l.index}</span>
                        <span
                          className={`text-lg tracking-[-0.02em] ${
                            on ? "text-fg" : "text-fg-2"
                          }`}
                        >
                          {l.label}
                        </span>
                      </span>
                      <Icon
                        name="arrow"
                        size={15}
                        className="shrink-0 text-muted-2 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-ice"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-2 flex items-center justify-between gap-3 border-t border-line px-4 py-4">
              <span className="label">{profile.location}</span>
              <span className="flex items-center gap-1.5">
                <ThemeToggle />
              </span>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   MONOGRAM — dấu hiệu nhận diện: hai vạch chéo cắt nhau trong
   ô bo góc nhỏ, viền sáng chạy khi hover. Phần chữ được nâng
   cấp 3D (Logo3D) nhưng giữ nguyên hình dạng gốc.
   ================================================================== */
function Monogram() {
  return (
    <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl border border-line-2 bg-s2 transition-[border-color,box-shadow] duration-300 group-hover:border-line-3 group-hover:shadow-[0_0_18px_-2px_color-mix(in_oklab,var(--ice)_45%,transparent)]">
      <span
        aria-hidden
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(70% 70% at 30% 20%, color-mix(in oklab, var(--ice) 26%, transparent), transparent 70%)",
        }}
      />
      <Logo3D className="relative size-[18px]" />
    </span>
  );
}
