"use client";

import { useEffect, useRef } from "react";
import { trajectory } from "@/data/profile";
import { SectionShell } from "@/components/ui/primitives";
import { SectionHead } from "@/components/ui/section-head";
import { Reveal } from "@/components/motion/reveal";
import { Icon } from "@/components/icons";
import { subscribeScroll, prefersReducedMotion } from "@/components/motion/scroll";
import { PointerSpotlight } from "@/components/motion/parallax";

/* ==================================================================
   TRAJECTORY — hành trình.
   ---------------------------------------------------------------
   Trục dọc tự điền theo scroll (ghi thẳng vào DOM, không re-render).
   Năm đặt ở cột trái cỡ lớn, nội dung ở cột phải. Mục nổi bật
   được nhấc lên bằng một lớp kính + viền sáng, không dùng badge.
   ================================================================== */

export default function Trajectory() {
  const rail = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);

  function sync() {
    const r = rail.current;
    const f = fill.current;
    if (!r || !f) return;
    const rect = r.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 khi đỉnh list chạm 3/4 chiều cao màn hình, 1 khi chạm đáy
    const p = (vh * 0.78 - rect.top) / Math.max(1, rect.height);
    const v = Math.max(0, Math.min(1, p));
    f.style.transform = `scaleY(${v.toFixed(4)})`;
  }

  /* Ghi thẳng transform vào DOM — dùng chung scroll engine */
  useEffect(() => {
    if (prefersReducedMotion()) {
      if (fill.current) fill.current.style.transform = "scaleY(1)";
      return;
    }
    sync();
    return subscribeScroll(() => sync());
  }, []);

  return (
    <SectionShell id="trajectory">
      <SectionHead
        index="04"
        label="Trajectory"
        tone="ember"
        title="Hai chặng, hai năm"
        description="Không phải lịch sử  — chỉ là những giai đoạn tôi học được điều gì, và số đo để lại."
        meta={
          <span className="label hidden sm:inline">
            {trajectory.items.length} chặng · 2017 → nay
          </span>
        }
      />

      <div ref={rail} className="relative">
        {/* trục */}
        <div aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-line md:left-[9px]" />
        <div
          ref={fill}
          aria-hidden
          className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-gradient-to-b from-ice via-iris to-ember md:left-[9px]"
          style={{ transform: "scaleY(0)" }}
        />

        <ol className="ml-8 space-y-3 md:ml-12">
          {trajectory.items.map((item, i) => (
            <TrajectoryItem key={item.range} item={item} index={i} />
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------
   Một chặng
   ------------------------------------------------------------------ */
function TrajectoryItem({
  item,
  index,
}: {
  item: (typeof trajectory.items)[number];
  index: number;
}) {
  return (
    <Reveal as="li" dir="up" delay={index * 90} className="relative">
      {/* chấm trục */}
      <span
        aria-hidden
        className="absolute top-[1.65rem] -left-8 grid size-[15px] place-items-center rounded-full border border-line bg-bg md:-left-12"
      >
        <span
          className={`size-1.5 rounded-full transition-transform duration-500 ${
            item.featured ? "bg-ice" : "bg-muted-2"
          } group-hover/tj:scale-150`}
        />
      </span>

      <PointerSpotlight
        color={item.featured ? "var(--ice)" : "var(--iris)"}
        intensity={0.11}
        radius={420}
        className="group/tj overflow-hidden rounded-2xl border border-line bg-s2/40 p-5 backdrop-blur-sm transition-[border-color,background-color,transform,box-shadow] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-line-2 hover:bg-s3/40 hover:shadow-2 sm:p-7"
        style={
          item.featured
            ? {
                borderColor: "color-mix(in oklab, var(--ice) 26%, transparent)",
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--ice) 6%, transparent), transparent 55%)",
              }
            : undefined
        }
      >
        <div className="relative grid gap-4 sm:grid-cols-[7.5rem_1fr] sm:gap-8">
          {/* Cột trái: năm + địa điểm */}
          <div>
            <p className="italic-serif text-[2.4rem] leading-none text-muted-2 transition-colors duration-400 group-hover/tj:text-muted">
              {item.year}
            </p>
            <p className="label mt-2.5 text-muted-2">{item.range}</p>
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
              <Icon name="pin" size={11} />
              {item.location}
            </p>
          </div>

          {/* Cột phải: nội dung */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h3 className="text-[1.15rem] font-medium tracking-[-0.02em]">{item.title}</h3>
              <span className="text-[13px] text-muted">@ {item.org}</span>
              {item.featured ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-ice/30 bg-ice/10 px-2 py-[3px] font-mono text-[9.5px] tracking-[0.14em] text-ice uppercase">
                  Hiện tại
                </span>
              ) : null}
            </div>

            <p className="body-md mt-3 max-w-2xl text-fg-2">{item.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <ul className="flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-md border border-line bg-s2 px-2 py-[3px] font-mono text-[11px] text-muted transition-colors group-hover/tj:border-line-2 group-hover/tj:text-fg-2"
                  >
                    {t}
                  </li>
                ))}
              </ul>

              {item.metrics.length ? (
                <ul className="ml-auto flex gap-5">
                  {item.metrics.map((m) => (
                    <li key={m.k} className="text-right">
                      <p className="tnum text-[15px] leading-none font-medium tracking-[-0.02em] text-ice">
                        {m.v}
                      </p>
                      <p className="label mt-1 text-[9px]">{m.k}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </PointerSpotlight>
    </Reveal>
  );
}
