"use client";

import { useEffect, useRef, useState } from "react";
import { work, type Tone } from "@/data/profile";
import { px } from "@/lib/num";
import { SectionShell } from "@/components/ui/primitives";
import { SectionHead } from "@/components/ui/section-head";
import { Reveal } from "@/components/motion/reveal";
import { Icon, StarFilled } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { TONE_VAR } from "@/components/ui/primitives";

/* ==================================================================
   WORK — danh mục dự án kiểu biên tập.
   ---------------------------------------------------------------
   Thay vì lưới 3 cột, đây là một danh mục: mỗi dự án là một hàng.
   Rê chuột → một thẻ xem trước lớn bay theo con trỏ, hiển thị
   hình ảnh thị giác sinh bằng CSS/SVG (không tải ảnh ngoài).
   Trên mobile, thẻ xem trước nằm tĩnh ngay trong hàng.
   Một dự án được đánh dấu "spotlight" đứng riêng phía trên —
   đủ lớn để người đọc dừng lại trước khi lướt tiếp.
   ================================================================== */

type Item = (typeof work.items)[number];
type Filter = (typeof work.filters)[number]["id"];

export default function Work() {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  // vị trí con trỏ để thẻ xem trước xuất hiện ngay tại chỗ, không bay từ góc
  const pointer = useRef({ x: 0, y: 0 });

  const spotlight = work.items.find((p) => p.featured) ?? work.items[0];
  const list = work.items.filter((p) => p.id !== spotlight?.id);
  const shown = filter === "all" ? list : list.filter((p) => p.kind === filter);

  /* các nhãn filter còn lại sẽ mất hết dự án khi lọc — chặn luôn */
  const countFor = (id: Filter) =>
    id === "all" ? list.length : list.filter((p) => p.kind === id).length;

  function track(e: React.MouseEvent) {
    pointer.current.x = e.clientX;
    pointer.current.y = e.clientY;
  }

  return (
    <SectionShell id="work">
      <SectionHead
        index="05"
        label="Work"
        tone="ice"
        title="Những thứ đã tồn tại"
        description="Từ ý tưởng, thiết kế, cho tới khi nó chạy trên máy thật. Mỗi dự án dưới đây đều đang ở trạng thái dùng được."
        meta={
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="open"
            className="group inline-flex items-center gap-2 text-[13px] font-medium text-fg transition-colors hover:text-ice"
          >
            <Icon name="github" size={15} />
            Tất cả trên GitHub
            <Icon
              name="arrow"
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </a>
        }
      />

      {/* ================= SPOTLIGHT ================= */}
      {spotlight ? <Spotlight item={spotlight} /> : null}

      {/* ================= BỘ LỌC ================= */}
      <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line pb-4">
        <p className="label">
          Bộ lọc
        </p>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {work.filters.map((f) => {
            const on = filter === f.id;
            const n = countFor(f.id);
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setFilter(f.id)}
                  aria-pressed={on}
                  className={`group relative flex items-center gap-1.5 py-1 text-[13px] tracking-[-0.01em] transition-colors duration-200 ${
                    on ? "text-fg" : "text-muted hover:text-fg-2"
                  }`}
                >
                  {f.label}
                  <span
                    className={`tnum font-mono text-[10px] transition-colors ${on ? "text-ice" : "text-muted-2"}`}
                  >
                    {n}
                  </span>
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 -bottom-[1px] h-px origin-left transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                    style={{ background: on ? "var(--ice)" : "var(--line-3)" }}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ================= DESKTOP: hàng + thẻ xem trước ================= */}
      <div
        className="hidden lg:block"
        onMouseLeave={() => setHoverId(null)}
      >
        {shown.length ? (
          <ul className="border-b border-line">
            {shown.map((item, i) => (
              <li key={item.id} className="border-t border-line">
                <WorkRow
                  item={item}
                  index={i}
                  onEnter={() => setHoverId(item.id)}
                  onLeave={() => setHoverId((v) => (v === item.id ? null : v))}
                  onMove={track}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState onReset={() => setFilter("all")} />
        )}

        <PreviewCard
          item={work.items.find((p) => p.id === hoverId) ?? null}
          pointer={pointer}
          onTrack={track}
        />
      </div>

      {/* ================= MOBILE ================= */}
      {shown.length ? (
        <ul className="mt-6 space-y-3 lg:hidden">
          {shown.map((item, i) => (
            <Reveal key={item.id} as="li" dir="up" delay={i * 70}>
              <article className="group overflow-hidden rounded-2xl border border-line bg-s2/50 backdrop-blur-sm">
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block"
                >
                  <div className="relative h-32 overflow-hidden">
                    <PreviewArt tone={item.tone} compact />
                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                      <span className="font-mono text-[10px] tracking-[0.16em] text-white/70">
                        {item.tags.join(" · ")}
                      </span>
                      <span className="label text-white/60">{item.year}</span>
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-medium tracking-[-0.02em]">{item.name}</h3>
                      <span className="mt-1 flex shrink-0 items-center gap-1 font-mono text-[11px] text-muted-2">
                        <StarFilled size={10} className="text-ice" />
                        {item.stars}
                      </span>
                    </div>
                    <p className="body-sm mt-2 text-muted">{item.description}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
                      <span className="label">{item.role}</span>
                      <Icon
                        name="external"
                        size={14}
                        className="text-muted-2 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-ice"
                      />
                    </div>
                  </div>
                </a>
              </article>
            </Reveal>
          ))}
        </ul>
      ) : (
        <div className="mt-6 lg:hidden">
          <EmptyState onReset={() => setFilter("all")} />
        </div>
      )}

      <Reveal delay={140} dir="up">
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-s2/50 px-6 py-5">
          <div>
            <p className="text-[15px] font-medium tracking-[-0.015em]">
              Muốn xem thứ gì khác?
            </p>
            <p className="body-sm mt-1 text-muted">
              Tôi có thể gửi bộ case study đầy đủ kèm số đo hiệu năng.
            </p>
          </div>
          <Button href="#contact" variant="quiet" size="md" iconRight="arrow">
            Xin bộ case study
          </Button>
        </div>
      </Reveal>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------
   SPOTLIGHT — dự án dẫn nhạc, chiếm gần hết bề ngang.
   Ảnh phóng to nhẹ theo scroll (transform thuần) + chữ vào sau.
   ------------------------------------------------------------------ */
function Spotlight({ item }: { item: Item }) {
  const art = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = art.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const p =
          1 -
          Math.min(
            1,
            Math.max(0, entry.boundingClientRect.top) / Math.max(1, window.innerHeight),
          );
        el.style.transform = `scale(${(1.06 - p * 0.08).toFixed(3)}) translate3d(0, ${(-p * 8).toFixed(2)}px, 0)`;
      },
      { threshold: [0, 0.25, 0.6, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const c = TONE_VAR[item.tone];

  return (
    <Reveal dir="clip" className="overflow-hidden rounded-3xl border border-line bg-surface/70">
      <article>
        {/* ảnh */}
        <div className="relative h-[42vh] max-h-[26rem] min-h-[13rem] overflow-hidden sm:h-[52vh]">
          <div ref={art} className="absolute inset-0 will-change-transform">
            <PreviewArt tone={item.tone} />
          </div>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, color-mix(in oklab, var(--bg) 92%, transparent), transparent 62%)",
            }}
          />
          <span
            aria-hidden
            className="absolute top-5 left-5 rounded-full border border-white/15 bg-black/25 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] text-white/85 uppercase backdrop-blur-md"
          >
            Spotlight · {item.year}
          </span>
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px"
            style={{ background: `linear-gradient(90deg, ${c}, transparent)` }}
          />
        </div>

        {/* nội dung */}
        <div className="grid gap-6 px-6 py-7 sm:px-9 sm:py-9 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="label" style={{ color: c }}>
              Dự án dẫn nhạc
            </p>
            <h3 className="mt-4 text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.02] font-medium tracking-[-0.04em]">
              {item.name}
            </h3>
            <p className="body-lg mt-4 max-w-xl text-muted">{item.description}</p>
            <p className="mt-4 font-mono text-[11px] tracking-[0.06em] text-muted-2">
              {item.role}
            </p>
          </div>

          <div className="lg:col-span-5 lg:pl-6">
            <dl className="grid grid-cols-3 gap-4 border-y border-line py-4">
              {(item.metrics ?? []).map((m) => (
                <div key={m.k}>
                  <dt className="label">{m.k}</dt>
                  <dd
                    className="mt-1.5 font-mono text-[clamp(0.95rem,2vw,1.25rem)] tracking-[-0.02em] tnum"
                    style={{ color: c }}
                  >
                    {m.v}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="open"
                className="group/btn inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium tracking-[-0.01em] whitespace-nowrap text-bg transition-[background-color,box-shadow,transform] duration-200 hover:bg-white hover:shadow-[0_10px_40px_-8px_color-mix(in_oklab,var(--ice)_45%,transparent)] active:scale-[0.975]"
              >
                Mở dự án
                <Icon
                  name="arrow"
                  size={16}
                  className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0.5"
                />
              </a>
              {item.live ? (
                <a
                  href={item.live}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-fg"
                >
                  <Icon name="external" size={14} />
                  Bản chạy thật
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/* ------------------------------------------------------------------
   EMPTY — lọc không ra gì
   ------------------------------------------------------------------ */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 py-14">
      <p className="font-mono text-[13px] text-muted">0 dự án khớp bộ lọc này.</p>
      <Button variant="quiet" size="sm" onClick={onReset}>
        Bỏ lọc
      </Button>
    </div>
  );
}


/* ------------------------------------------------------------------
   Hàng danh mục
   ------------------------------------------------------------------ */
function WorkRow({
  item,
  index,
  onEnter,
  onLeave,
  onMove,
}: {
  item: Item;
  index: number;
  onEnter: () => void;
  onLeave: () => void;
  onMove: (e: React.MouseEvent) => void;
}) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer noopener"
      data-cursor="view"
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative grid grid-cols-[3.5rem_1fr] items-center gap-x-5 py-7 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:px-5 sm:grid-cols-[3.5rem_minmax(0,17rem)_1fr_auto] sm:gap-x-7"
    >
      {/* nền quét */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-full origin-left scale-x-0 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
        style={{
          background: `linear-gradient(90deg, color-mix(in oklab, ${TONE_VAR[item.tone]} 8%, transparent), transparent 55%)`,
        }}
      />
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
        style={{ background: TONE_VAR[item.tone] }}
      />

      {/* số thứ tự */}
      <span className="tnum relative font-mono text-[11px] text-muted-2">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* tên + mô tả */}
      <span className="relative min-w-0">
        <span className="flex items-center gap-2.5">
          <span className="truncate text-[clamp(1.35rem,2.4vw,1.9rem)] leading-tight font-medium tracking-[-0.03em] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
            {item.name}
          </span>
          {item.live ? (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-mint/30 bg-mint/10 px-1.5 py-[2px] font-mono text-[9px] tracking-[0.14em] text-mint uppercase"
            >
              Live
            </span>
          ) : null}
        </span>
        <span className="mt-1.5 block max-w-md truncate text-[13px] text-muted">
          {item.description}
        </span>
      </span>

      {/* tags — cột riêng, biến mất dần khi rê để nhường chỗ cho số đo */}
      <span className="relative hidden flex-wrap gap-1.5 sm:flex">
        {item.tags.map((t) => (
          <span
            key={t}
            className="rounded-md border border-line bg-s2 px-2 py-[3px] font-mono text-[11px] text-muted transition-colors duration-300 group-hover:border-line-2 group-hover:text-fg-2"
          >
            {t}
          </span>
        ))}
      </span>

      {/* số đo */}
      <span className="relative col-span-2 mt-3 flex items-center justify-between gap-4 sm:col-span-1 sm:mt-0 sm:justify-end sm:gap-8">
        <span className="label hidden sm:inline">{item.year}</span>
        <span className="flex items-center gap-1.5 font-mono text-[12px] text-muted-2">
          <StarFilled size={11} className="text-ice" />
          {item.stars}
        </span>
        <Icon
          name="arrow"
          size={16}
          className="text-muted-2 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
          style={{ color: TONE_VAR[item.tone] }}
        />
      </span>
    </a>
  );
}

/* ------------------------------------------------------------------
   Thẻ xem trước — bay theo con trỏ
   ------------------------------------------------------------------ */
function PreviewCard({
  item,
  pointer,
  onTrack,
}: {
  item: Item | null;
  pointer: React.RefObject<{ x: number; y: number }>;
  onTrack: (e: React.MouseEvent) => void;
}) {
  const card = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, cx: 0, cy: 0 });

  // xuất hiện đúng tại vị trí con trỏ, không bay từ giữa màn hình
  useEffect(() => {
    const el = card.current;
    if (!el || !item) return;
    const p = pos.current;
    p.x = p.cx = pointer.current.x;
    p.y = p.cy = pointer.current.y;
    el.style.transform = `translate3d(${p.cx}px, ${p.cy}px, 0) translate(-50%, -50%)`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  function follow(e: React.MouseEvent) {
    const el = card.current;
    if (!el) return;
    onTrack(e);
    const p = pos.current;
    p.x = e.clientX;
    p.y = e.clientY;
    if (el.dataset.raf) return;

    el.dataset.raf = "1";
    const tick = () => {
      p.cx += (p.x - p.cx) * 0.13;
      p.cy += (p.y - p.cy) * 0.13;
      el.style.transform = `translate3d(${p.cx.toFixed(1)}px, ${p.cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
      if (Math.abs(p.x - p.cx) < 0.6 && Math.abs(p.y - p.cy) < 0.6) {
        delete el.dataset.raf;
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }

  return (
    <div
      ref={card}
      onPointerMove={follow}
      aria-hidden
      className={`pointer-events-none fixed z-[68] w-[19rem] transition-opacity duration-300 will-change-transform sm:w-[21rem] ${
        item ? "opacity-100" : "opacity-0"
      }`}
      style={{ transform: "translate3d(-50%, -50%, 0)", left: "50%", top: "38%" }}
    >
      {item ? (
        <div
          key={item.id}
          className="animate-rise overflow-hidden rounded-2xl border border-line-2 bg-glass shadow-3 backdrop-blur-xl"
        >
          <div className="relative h-32 overflow-hidden">
            <PreviewArt tone={item.tone} />
            <span className="absolute top-3 left-3 rounded-full border border-white/20 bg-black/25 px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] text-white/85 uppercase backdrop-blur">
              {item.year}
            </span>
          </div>
          <div className="p-4">
            <p className="text-[15px] font-medium tracking-[-0.02em]">{item.name}</p>
            <p className="body-sm mt-1.5 line-clamp-3 text-muted">{item.description}</p>
            <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3">
              <span className="label">{item.role}</span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-muted-2">
                <StarFilled size={10} style={{ color: TONE_VAR[item.tone] }} />
                {item.stars}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------
   PREVIEW ART — hình ảnh thị giác sinh bằng CSS + SVG.
   Không tải ảnh ngoài: nhanh, sắc nét mọi DPI, không request thêm.
   ------------------------------------------------------------------ */
function PreviewArt({ tone, compact = false }: { tone: Tone; compact?: boolean }) {
  const c = TONE_VAR[tone];

  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, color-mix(in oklab, var(--surface) 92%, transparent), color-mix(in oklab, ${c} 22%, var(--surface)))`,
      }}
    >
      <svg className="absolute inset-0 size-full" viewBox="0 0 400 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`pa-${tone}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c} stopOpacity="0.85" />
            <stop offset="100%" stopColor={c} stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* lưới phối cảnh */}
        {Array.from({ length: 13 }).map((_, i) => (
          <line
            key={i}
            x1={i * 33}
            y1="0"
            x2={200 + (i * 33 - 200) * 0.35}
            y2="160"
            stroke="var(--line)"
            strokeWidth="0.7"
          />
        ))}
        {[42, 74, 108].map((y, i) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="var(--line)" strokeWidth={px(0.7 + i * 0.2)} />
        ))}

        {/* đường biểu đồ khái quát */}
        {!compact && (
          <path
            d="M0 128 C 46 122, 70 96, 106 104 S 168 62, 206 74 S 268 40, 306 52 S 366 26, 400 32"
            fill="none"
            stroke={`url(#pa-${tone})`}
            strokeWidth="2.25"
            strokeLinecap="round"
          />
        )}
      </svg>

      {/* quầng sáng */}
      <div
        className="absolute -top-1/3 -right-1/4 size-3/4 rounded-full opacity-45 blur-3xl"
        style={{ background: `radial-gradient(circle, ${c}, transparent 68%)` }}
      />
      <div className="scanlines absolute inset-0 opacity-50" />
    </div>
  );
}
