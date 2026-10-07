"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { useReducedMotion } from "@/components/motion/hooks";

/* ==================================================================
   PRELOADER — cửa mở của trang.
   ---------------------------------------------------------------
   Nguyên tắc số một: nó không được giữ người dùng lại. Bất kỳ chuyện
   gì xảy ra (rAF bị treo, tab chạy nền, người dùng đổi ý định giữa
   chừng, hydration lỗi…) thì rèm cũng phải mở.

   - chỉ chạy MỘT lần mỗi phiên (sessionStorage), lần sau vào thẳng;
   - không bao giờ chặn click (pointer-events: none);
   - có watchdog: quá HARD thì tự mở bằng mọi giá;
   - bấm/phím cuộn là mở ngay, không cần chờ;
   - prefers-reduced-motion thì không render gì;
   - không khóa scroll body: khoá scroll là cách nhanh nhất để biến một
     lỗi nhỏ thành "trang chết".
   ================================================================== */

const KEY = "boot";
const MAX = 900; // ms — thời gian chạy bình thường
const OUT = 520; // ms — thời gian mở rèm
const HARD = 2400; // ms — chốt chặn cuối cùng

type State = "idle" | "run" | "out";

export default function Preloader() {
  const reduced = useReducedMotion();
  const [state, setState] = useState<State>("idle");

  const bar = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);
  const timers = useRef<number[]>([]);
  const closed = useRef(false);

  const open = useCallback(
    (immediate = false) => {
      if (closed.current) return;
      closed.current = true;

      cancelAnimationFrame(raf.current);
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}

      setState((s) => (s === "idle" ? s : "out"));
      timers.current.push(
        window.setTimeout(() => setState("idle"), immediate ? 0 : OUT),
      );
    },
    [],
  );

  useEffect(() => {
    // Đã từng vào trong phiên này, hoặc người dùng muốn giảm chuyển động
    if (reduced) return;

    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      /* private mode — coi như chưa từng xem */
    }
    if (seen) return;

    // tài liệu đã sẵn sàng thì rút ngắn, đừng bắt người dùng chờ vô ích
    const quick = document.readyState === "complete";
    const duration = Math.max(260, quick ? MAX * 0.5 : MAX);
    const start = performance.now();

    setState("run");
    document.documentElement.dataset.boot = "loading";

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // easeOutExpo
      const p = Math.round(e * 100);
      if (bar.current) bar.current.style.transform = `scaleX(${e.toFixed(3)})`;
      if (pct.current) pct.current.textContent = String(p).padStart(3, "0");
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else open();
    };
    raf.current = requestAnimationFrame(tick);

    /* Trang đã tải xong thì không có lý do gì giữ rèm — mở ra ngay,
       kể cả khi thanh tiến trình chưa chạy tới cuối. */
    if (document.readyState !== "complete") {
      window.addEventListener(
        "load",
        () => open(),
        { once: true, passive: true },
      );
    }

    // chốt chặn: bất cứ điều gì, 2,4 giây là phải mở
    timers.current.push(window.setTimeout(() => open(true), HARD));

    // người dùng chạm vào → mở ngay, đừng bắt họ chờ
    const bail = () => open();
    const opts = { passive: true } as const;
    window.addEventListener("pointerdown", bail, opts);
    window.addEventListener("keydown", bail, opts);
    window.addEventListener("wheel", bail, opts);
    window.addEventListener("touchstart", bail, opts);

    return () => {
      cancelAnimationFrame(raf.current);
      timers.current.forEach(clearTimeout);
      timers.current = [];
      window.removeEventListener("pointerdown", bail);
      window.removeEventListener("keydown", bail);
      window.removeEventListener("wheel", bail);
      window.removeEventListener("touchstart", bail);
      delete document.documentElement.dataset.boot;
    };
  }, [reduced, open]);

  /* Người dùng bật giảm chuyển động giữa chừng → đóng ngay, không chờ */
  useEffect(() => {
    if (reduced && state !== "idle") open(true);
  }, [reduced, state, open]);

  /* Rèm đã mở xong thì gỡ hẳn khỏi DOM, kể cả khi unmount */
  useEffect(() => {
    if (state === "idle") delete document.documentElement.dataset.boot;
  }, [state]);

  if (state === "idle") return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] flex items-end"
      style={{
        background: "var(--bg)",
        transition: `clip-path ${OUT}ms cubic-bezier(0.76, 0, 0.24, 1)`,
        clipPath: state === "out" ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)",
      }}
    >
      {/* quầng sáng rất nhẹ phía dưới — báo hiệu "đang mở" */}
      <div
        aria-hidden
        className="animate-drift-b pointer-events-none absolute inset-x-0 -bottom-1/3 h-2/3 opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 100%, var(--acc-glow), transparent 70%)",
        }}
      />

      <div className="shell relative w-full pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="flex items-end justify-between gap-6">
          <p className="animate-fade label">
            {profile.handle} · loading
          </p>
          <p className="tnum font-mono text-[11px] tracking-[0.18em] text-muted-2">
            <span ref={pct}>000</span>
            <span className="text-muted-2/60"> %</span>
          </p>
        </div>

        {/* thanh tiến trình 1px */}
        <div className="mt-3 h-px w-full overflow-hidden bg-line">
          <span
            ref={bar}
            className="block h-full origin-left will-change-transform"
            style={{
              background: "linear-gradient(90deg, var(--ice), var(--iris))",
              transform: "scaleX(0)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
