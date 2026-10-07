"use client";

import { useEffect, useRef, useState } from "react";
import { profile, stats, capability } from "@/data/profile";
import { AuroraField } from "@/components/chrome/aurora";
import { ProfileAvatar } from "@/components/brand/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { SplitText } from "@/components/motion/reveal";
import { Counter } from "@/components/motion/counter";
import { subscribeScroll } from "@/components/motion/scroll";
import { emit } from "@/lib/bus";
import { px } from "@/lib/num";

/* ==================================================================
   HERO
   ---------------------------------------------------------------
   Thứ tự lớp (từ sau ra trước):
     1. nền mực
     2. mảng sáng aurora (CSS thuần, trôi rất chậm)
     3. lưới phối cảnh hội tụ về điểm tụ
     4. canvas mạng hạt (AuroraField)
     5. nội dung
   Tiêu đề dùng animation CSS thuần (`SplitText mode="enter"`) để
   LCP được ghi nhận ở frame vẽ đầu tiên, không phụ thuộc JS.
   ================================================================== */

export default function Hero() {  const github = profile.socials.find((s) => s.icon === "github");
  const content = useRef<HTMLDivElement>(null);

  /* Trôi nhẹ + mờ dần khi cuộn qua hero */
  useEffect(() => {
    const el = content.current;
    if (!el) return;
    return subscribeScroll((y, vh) => {
      if (y > vh * 1.1) return;
      const p = Math.min(1, y / (vh * 0.92));
      el.style.opacity = String(1 - p * 0.92);
      el.style.transform = `translate3d(0, ${(p * 46).toFixed(2)}px, 0) scale(${(1 - p * 0.035).toFixed(4)})`;
    });
  }, []);

  return (
    <section id="top" className="relative isolate overflow-hidden pt-28 md:pt-36">
      {/* ================= NỀN ================= */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* mảng aurora: hai vệt sáng lớn, trôi chậm, không chớp */}
        <div
          className="animate-drift-a absolute -top-[22%] left-[2%] h-[42rem] w-[42rem] rounded-full opacity-[0.5] blur-[130px] will-change-transform"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, color-mix(in oklab, var(--ice) 34%, transparent), transparent 68%)",
          }}
        />
        <div
          className="animate-drift-b absolute -top-[10%] right-[0%] h-[38rem] w-[38rem] rounded-full opacity-[0.42] blur-[140px] will-change-transform"
          style={{
            background:
              "radial-gradient(circle at 60% 50%, color-mix(in oklab, var(--iris) 32%, transparent), transparent 66%)",
          }}
        />
        <div
          className="absolute top-[28%] left-[42%] h-[26rem] w-[26rem] rounded-full opacity-25 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--mint) 26%, transparent), transparent 70%)",
          }}
        />

        {/* lưới phối cảnh hội tụ — "optical" */}
        <PerspectiveGrid />

        {/* hạt nhiễu kỹ thuật */}
        <div className="scanlines absolute inset-0 opacity-40" />

        {/* mạng hạt */}
        <AuroraField className="absolute inset-0 h-full w-full" density={0.000075} linkDist={128} />

        {/* chân gradient để nội dung không bị cắt đột ngột */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
      </div>

      {/* ================= NỘI DUNG ================= */}
      <div className="shell">
        <div ref={content} className="grid items-center gap-y-14 lg:grid-cols-12 lg:gap-x-8">
          {/* ---------- Cột trái ---------- */}
          <div className="lg:col-span-7">
            {/* Trạng thái + địa điểm + đồng hồ */}
            <div className="animate-fade flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/8 py-1.5 pr-3 pl-2.5">
                <span className="relative flex size-1.5 shrink-0" aria-hidden>
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint opacity-70 [animation-duration:2.6s]" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-mint" />
                </span>
                <span className="font-mono text-[10px] tracking-[0.16em] text-mint uppercase">
                  {profile.availability}
                </span>
              </span>

              <span className="label flex items-center gap-2">
                <Icon name="pin" size={12} />
                {profile.location}
              </span>

              <span className="label tnum flex items-center gap-2" aria-label="Giờ Việt Nam">
                <Icon name="clock" size={12} />
                <LocalClock />
              </span>
            </div>

            {/* Tiêu đề */}
            <h1 className="mt-8">
              <span className="sr-only">
                Sản phẩm kỹ thuật cho những người không chấp nhận thứ tầm thường.
              </span>
              <span aria-hidden className="block">
                {profile.heroLines.map((line, i) => (
                  <span
                    key={i}
                    className={`block ${
                      line.style === "serif"
                        ? "italic-serif ink-iris animate-iris pb-[0.06em]"
                        : ""
                    }`}
                  >
                    <SplitText
                      lines={[{ text: line.text }]}
                      mode="enter"
                      start={i * 3}
                      step={62}
                      className={line.style === "serif" ? "" : "tracking-[-0.045em]"}
                      wordClassName={line.style === "serif" ? "text-[1.06em]" : ""}
                    />
                  </span>
                ))}
              </span>
            </h1>

            {/* Đoạn dẫn */}
            <p className="animate-rise body-lg mt-8 max-w-xl text-muted [animation-delay:520ms]">
              {profile.heroSub}
            </p>

            {/* CTA */}
            <div className="animate-rise mt-10 flex flex-wrap items-center gap-3 [animation-delay:620ms]">
              <Button href="#work" size="lg" magnetic iconRight="arrow">
                Xem dự án
              </Button>
              <Button href={`mailto:${profile.email}`} size="lg" variant="glass" icon="mail">
                {profile.email}
              </Button>
            </div>

            <div className="animate-rise mt-7 flex items-center gap-5 [animation-delay:720ms]">
              {profile.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor="open"
                  className="group flex items-center gap-2 text-[13px] text-muted transition-colors duration-200 hover:text-fg"
                >
                  <Icon name={s.icon} size={15} />
                  <span className="relative">
                    {s.label}
                    <span
                      aria-hidden
                      className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-100"
                    />
                  </span>
                </a>
              ))}
              {github ? (
                <span className="label ml-auto hidden sm:inline">{profile.heroNote}</span>
              ) : null}
            </div>
          </div>

          {/* ---------- Cột phải: dụng cụ quỹ đạo ---------- */}
          <div className="animate-rise lg:col-span-5 [animation-delay:340ms]">
            <OrbitalInstrument />
          </div>
        </div>

        {/* ---------- Dải số liệu ---------- */}
        <div className="animate-rise mt-20 border-t border-line pt-8 [animation-delay:820ms] md:mt-28">
          <StatsRow />
        </div>
      </div>
    </section>
  );
}

/* ==================================================================
   ĐỒNG HỒ — chỉ render sau khi mount để khỏi lệch hydration
   ================================================================== */
function LocalClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: profile.timezone,
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="tnum">
      {time ?? "--:--"} {profile.timezoneLabel}
    </span>
  );
}

/* ==================================================================
   PERSSPECTIVE GRID — các đường hội tụ về một điểm tụ phía trên,
   tạo chiều sâu kiểu HUD mà không cần WebGL.
   ================================================================== */
function PerspectiveGrid() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 top-0 h-[130%] opacity-[0.55]"
      style={{
        maskImage:
          "radial-gradient(ellipse 70% 55% at 50% 22%, black 10%, transparent 72%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 55% at 50% 22%, black 10%, transparent 72%)",
      }}
    >
      <svg
        className="h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        fill="none"
      >
        {/* đường hội tụ */}
        {Array.from({ length: 17 }).map((_, i) => {
          const x = (i / 16) * 100;
          return (
            <line
              key={`v${i}`}
              x1={x}
              y1="0"
              x2={50 + (x - 50) * 0.18}
              y2="100"
              stroke="var(--grid)"
              strokeWidth={0.16}
            />
          );
        })}
        {/* đường ngang, dành dần theo phối cảnh */}
        {[14, 22, 31, 42, 55, 70, 87].map((y, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="var(--grid)"
            strokeWidth={px(0.16 * (1 + i * 0.14))}
          />
        ))}
      </svg>
    </div>
  );
}

/* ==================================================================
   ORBITAL INSTRUMENT — dụng cụ quỹ đạo.
   Toàn bộ là SVG + CSS animation: nhẹ, sắc nét ở mọi DPI, và mỗi
   lớp quay độc lập nên trông "cơ khí" thay vì "đồ hoạ".
   ================================================================== */
function OrbitalInstrument() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      setTilt({ x: ny * -7, y: nx * 9 });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[26rem] lg:max-w-none">
      <div
        className="relative aspect-square w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: `perspective(1100px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* quầng sáng sau */}
        <div
          aria-hidden
          className="absolute inset-[12%] rounded-full opacity-70 blur-[70px]"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--ice) 22%, transparent), transparent 68%)",
          }}
        />

        <svg viewBox="0 0 400 400" className="relative size-full" fill="none">
          <defs>
            <linearGradient id="sig" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--ice)" />
              <stop offset="100%" stopColor="var(--iris)" />
            </linearGradient>
            <radialGradient id="core" cx="0.5" cy="0.4" r="0.6">
              <stop offset="0%" stopColor="var(--iris)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--ice)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* vành ngoài + vạch chia 72 phần */}
          <g className="origin-center">
            <circle cx="200" cy="200" r="186" stroke="var(--line)" strokeWidth="1" />
            <circle cx="200" cy="200" r="176" stroke="var(--line)" strokeWidth="1" strokeDasharray="1 7" />
            {Array.from({ length: 36 }).map((_, i) => {
              const a = (i / 36) * Math.PI * 2;
              const long = i % 3 === 0;
              const r1 = long ? 160 : 168;
              return (
                <line
                  key={i}
                  x1={px(200 + Math.cos(a) * r1)}
                  y1={px(200 + Math.sin(a) * r1)}
                  x2={px(200 + Math.cos(a) * 174)}
                  y2={px(200 + Math.sin(a) * 174)}
                  stroke={long ? "var(--line-3)" : "var(--line-2)"}
                  strokeWidth={long ? 1.4 : 1}
                />
              );
            })}
          </g>

          {/* vòng quét nhanh, cắt ở một đoạn */}
          <g className="animate-spin-slow origin-center">
            <circle
              cx="200"
              cy="200"
              r="146"
              stroke="url(#sig)"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeDasharray="120 800"
              opacity="0.85"
            />
          </g>

          {/* vòng đậm hơn, quay ngược chiều, chậm hơn */}
          <g className="animate-spin-slower origin-center">
            <circle
              cx="200"
              cy="200"
              r="124"
              stroke="var(--line-2)"
              strokeWidth="1"
              strokeDasharray="3 9"
            />
            <circle
              cx="200"
              cy="200"
              r="104"
              stroke="url(#sig)"
              strokeWidth="1"
              strokeDasharray="2 14"
              opacity="0.5"
            />
          </g>

          {/* quỹ đạo có nút di chuyển */}
          <g className="animate-spin-slower origin-center">
            <circle cx="200" cy="54" r="3.4" fill="var(--ice)" />
            <circle cx="200" cy="346" r="2.2" fill="var(--iris)" />
          </g>
          <g className="animate-spin-slow origin-center">
            <circle cx="330" cy="200" r="2.6" fill="var(--iris)" />
            <circle cx="70" cy="200" r="3" fill="var(--mint)" />
          </g>

          {/* cung mức trạng thái */}
          <path
            d="M 108 300 A 118 118 0 0 1 292 300"
            stroke="var(--line)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 108 300 A 118 118 0 0 1 292 300"
            stroke="url(#sig)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            pathLength={100}
            strokeDasharray="72 100"
            className="animate-draw-arc"
            style={{ animationDelay: "700ms" }}
          />

          {/* quầng sáng quanh lõi */}
          <circle cx="200" cy="200" r="78" fill="url(#core)" />
        </svg>

        {/* Lõi: ảnh đại diện động trong lớp kính. Chiếm đúng 29% bề
            rộng dụng cụ — tức là trùng vị trí và kích thước vòng tròn
            cũ, nên bố cục không đổi một pixel nào.
            Bấm vào lõi để mở "MY DIGITAL UNIVERSE" ở chế độ toàn màn
            hình — khoảnh khắc đáng nhớ nhất của trang. */}
        <button
          type="button"
          onClick={() => emit("universe:open", { origin: "hero" })}
          className="hero__core group absolute left-1/2 top-1/2 z-10 aspect-square w-[29%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          aria-label="Mở vũ trụ số của tôi"
        >
          <ProfileAvatar />
          <span aria-hidden className="hero__core-hint">
            Mở vũ trụ
          </span>
        </button>

        {/* Chip kính nổi, parallax bằng 2 biến CSS — không JS */}
        <FloatChip className="top-[8%] -left-1 sm:left-0" depth={0.028} delay={0}>
          {capability.domains[0].name}
          <span className="text-ice">{capability.domains[0].level}%</span>
        </FloatChip>
        <FloatChip className="top-[52%] -right-1 sm:right-0" depth={-0.038} delay={140}>
          <span className="text-iris">UTC+7</span>
          {profile.timezoneLabel}
        </FloatChip>
        <FloatChip className="bottom-[6%] left-[6%]" depth={0.02} delay={260}>
          <span className="inline-block size-1.5 rounded-full bg-mint" />
          Sẵn sàng
        </FloatChip>
        <FloatChip className="bottom-[6%] right-[6%]" depth={-0.026} delay={340}>
          {profile.initials}
        </FloatChip>
      </div>
    </div>
  );
}

/** Chip kính nhỏ, trôi theo con trỏ bằng calc() trên CSS variables */
function FloatChip({
  children,
  className = "",
  depth = 0.02,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  depth?: number;
  delay?: number;
}) {
  return (
    <span
      aria-hidden
      className={`animate-rise glass absolute flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10.5px] tracking-[0.06em] whitespace-nowrap text-muted-2 shadow-1 ${className}`}
      style={{
        animationDelay: `${delay + 900}ms`,
        transform: `translate3d(calc((var(--mx) - 50vw) * ${depth}), calc((var(--my) - 50vh) * ${depth}), 0)`,
        transition: "transform 700ms var(--e-out)",
      }}
    >
      {children}
    </span>
  );
}

/* ==================================================================
   STATS — số đếm tăng dần
   ================================================================== */
function StatsRow() {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="group relative">
          <dt className="sr-only">{s.label}</dt>
          <dd>
            <p className="flex items-baseline text-[clamp(2rem,4.4vw,2.9rem)] leading-none font-medium tracking-[-0.045em]">
              <Counter value={s.value} />
              <span className="text-ice">{s.suffix}</span>
            </p>
            <p className="mt-3 text-[13px] text-fg-2">{s.label}</p>
            <p className="mt-0.5 font-mono text-[10px] tracking-[0.1em] text-muted-2 uppercase">
              {s.note}
            </p>
          </dd>
          {/* gạch chân mọc lên khi rê chuột */}
          <span
            aria-hidden
            className="mt-4 block h-px w-full origin-left scale-x-25 bg-line transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
            style={{
              background:
                "linear-gradient(90deg, var(--ice), color-mix(in oklab, var(--iris) 60%, transparent), transparent)",
            }}
          />
        </div>
      ))}
    </dl>
  );
}
