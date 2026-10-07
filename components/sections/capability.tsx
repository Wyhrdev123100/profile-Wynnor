"use client";

import { useRef, useState } from "react";
import { capability, type Domain } from "@/data/profile";
import { SectionShell } from "@/components/ui/primitives";
import { SectionHead } from "@/components/ui/section-head";
import { Reveal } from "@/components/motion/reveal";
import { Icon } from "@/components/icons";
import { TONE_VAR } from "@/components/ui/primitives";
import { px } from "@/lib/num";

/* ==================================================================
   CAPABILITY — console năng lực.
   ---------------------------------------------------------------
   Bên trái là tablist dọc (mũi tên điều hướng, đúng chuẩn WAI-ARIA),
   bên phải là tabpanel với vòng đo tròn + lưới công cụ.
   Không dùng "thanh tiến độ" — đó là ngôn ngữ của template.
   ================================================================== */

export default function Capability() {
  const domains = capability.domains;
  const [idx, setIdx] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = domains[idx];

  function onKeyDown(e: React.KeyboardEvent) {
    const last = domains.length - 1;
    let next = idx;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = idx === last ? 0 : idx + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = idx === 0 ? last : idx - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setIdx(next);
    tabs.current[next]?.focus();
  }

  return (
    <SectionShell id="capability">
      <SectionHead
        index="03"
        label="Capability"
        tone="ice"
        title="Bốn miền, một cách làm"
        description="Mỗi miền có mức tự tin khác nhau và tôi nói thẳng con số đó. Dùng phím ↑ ↓ để chuyển miền."
        meta={
          <span className="label hidden sm:inline">
            {capability.domains.reduce((n, d) => n + d.items.length, 0)} công cụ
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* ---------- Tablist ---------- */}
        <div className="lg:col-span-5">
          <Reveal dir="left">
            <div
              role="tablist"
              aria-label="Miền năng lực"
              aria-orientation="vertical"
              onKeyDown={onKeyDown}
              className="flex flex-col border-t border-line"
            >
              {domains.map((d, i) => (
                <DomainTab
                  key={d.id}
                  index={i}
                  innerRef={(el) => {
                    tabs.current[i] = el;
                  }}
                  domain={d}
                  selected={i === idx}
                  onSelect={() => setIdx(i)}
                  tabIndex={i === idx ? 0 : -1}
                />
              ))}
            </div>
          </Reveal>
        </div>

        {/* ---------- Panel ---------- */}
        <div className="lg:col-span-7">
          <Reveal dir="right" delay={90}>
            <div
              role="tabpanel"
              id={`panel-${active.id}`}
              aria-labelledby={`tab-${active.id}`}
              tabIndex={0}
              className="relative h-full overflow-hidden rounded-2xl border border-line bg-s2/50 p-6 backdrop-blur-sm sm:p-8"
            >
              <PanelBackdrop tone={active.tone} />

              <div className="relative grid gap-8 sm:grid-cols-[auto_1fr] sm:gap-10">
                {/* Vòng đo */}
                <Gauge domain={active} />

                {/* Nội dung */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="display-m">{active.name}</h3>
                    <span
                      className="tnum font-mono text-[11px] tracking-[0.14em] uppercase"
                      style={{ color: TONE_VAR[active.tone] }}
                    >
                      Mức tự tin
                    </span>
                  </div>
                  <p className="body-sm mt-2 text-muted">{active.blurb}</p>

                  <ul className="mt-7 grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2">
                    {active.items.map((it) => (
                      <li key={it.name}>
                        <div className="group flex items-baseline justify-between gap-3 border-b border-line py-2.5 transition-colors hover:border-line-2">
                          <span className="truncate font-mono text-[12.5px] text-fg-2 transition-colors group-hover:text-fg">
                            {it.name}
                          </span>
                          <span className="shrink-0 font-mono text-[10.5px] text-muted-2 transition-colors group-hover:text-muted">
                            {it.note}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ---------- Stack marquee ---------- */}
      <Reveal delay={160} dir="up" className="mt-14">
        <div className="flex items-center gap-5 overflow-hidden border-y border-line py-4">
          <span className="label shrink-0">Hàng ngày dùng</span>
          <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
            <div className="animate-marquee flex w-max items-center gap-6">
              {[...capability.stack, ...capability.stack].map((s, i) => (
                <span
                  key={`${s}-${i}`}
                  className="flex shrink-0 items-center gap-6 font-mono text-[13px] text-muted"
                >
                  {s}
                  <span aria-hidden className="size-1 rounded-full bg-ice/50" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------
   Tab — hàng dọc
   ------------------------------------------------------------------ */

type DomainTabProps = {
  domain: Domain;
  index: number;
  selected: boolean;
  onSelect: () => void;
  tabIndex: number;
  innerRef: (el: HTMLButtonElement | null) => void;
};

function DomainTab({ domain, index, selected, onSelect, tabIndex, innerRef }: DomainTabProps) {
  return (
    <button
      ref={innerRef}
      type="button"
      role="tab"
      id={`tab-${domain.id}`}
      aria-selected={selected}
      aria-controls={`panel-${domain.id}`}
      tabIndex={tabIndex}
      onClick={onSelect}
      className="group relative flex items-center justify-between gap-4 border-b border-line py-5 pr-1 pl-4 text-left transition-colors duration-300"
    >
      {/* thanh trạng thái trượt từ trái */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[2px] origin-top transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          background: TONE_VAR[domain.tone],
          transform: selected ? "scaleY(1)" : "scaleY(0)",
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-10 transition-opacity duration-400"
        style={{
          background: `linear-gradient(90deg, color-mix(in oklab, ${TONE_VAR[domain.tone]} 9%, transparent), transparent 62%)`,
          opacity: selected ? 1 : 0,
        }}
      />

      <span className="flex min-w-0 items-center gap-4">
        <span
          className="tnum shrink-0 font-mono text-[11px] transition-colors duration-300"
          style={{ color: selected ? TONE_VAR[domain.tone] : "var(--muted-2)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0">
          <span
            className={`block text-[17px] tracking-[-0.02em] transition-colors duration-300 ${
              selected ? "text-fg" : "text-fg-2 group-hover:text-fg"
            }`}
          >
            {domain.name}
          </span>
          <span className="mt-0.5 block truncate text-[12.5px] text-muted">
            {domain.blurb}
          </span>
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-3">
        <span className="hidden sm:block">
          <span className="block h-px w-14 overflow-hidden bg-line">
            <span
              className="block h-full origin-left transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                background: TONE_VAR[domain.tone],
                transform: selected ? "scaleX(1)" : "scaleX(0.35)",
              }}
            />
          </span>
        </span>
        <span
          className="tnum w-10 text-right font-mono text-[13px] tabular-nums transition-colors duration-300"
          style={{ color: selected ? TONE_VAR[domain.tone] : "var(--muted-2)" }}
        >
          {domain.level}
          <span className="text-[10px]">%</span>
        </span>
        <Icon
          name="chevron"
          size={14}
          className={`hidden shrink-0 transition-all duration-300 sm:block ${
            selected
              ? "translate-x-0 opacity-100"
              : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
          }`}
          style={{ color: TONE_VAR[domain.tone] }}
        />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------
   Gauge — vòng đo tròn, tự vẽ lại khi đổi miền
   ------------------------------------------------------------------ */
function Gauge({ domain }: { domain: Domain }) {
  const R = 46;
  // làm tròn chu vi để server/client render ra cùng một chuỗi
  const C = px(2 * Math.PI * R);

  return (
    <div className="relative grid size-[7.5rem] shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 size-full -rotate-90" fill="none">
        {/* vòng nền có vạch chia */}
        <circle cx="60" cy="60" r={R} stroke="var(--line)" strokeWidth="1" strokeDasharray="1 6" />
        <circle cx="60" cy="60" r={R - 9} stroke="var(--line)" strokeWidth="5" />

        {/* cung giá trị — chuyển động mượt khi đổi domain */}
        <circle
          key={domain.id}
          cx="60"
          cy="60"
          r={R - 9}
          stroke={TONE_VAR[domain.tone]}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={px(C * (1 - domain.level / 100))}
          style={{
            transition: "stroke-dashoffset 900ms var(--e-out)",
            filter: `drop-shadow(0 0 8px color-mix(in oklab, ${TONE_VAR[domain.tone]} 45%, transparent))`,
          }}
        />
      </svg>

      <div className="relative text-center">
        <p
          className="tnum text-[2.1rem] leading-none font-medium tracking-[-0.04em]"
          style={{ color: TONE_VAR[domain.tone] }}
        >
          {domain.level}
          <span className="text-[0.9rem]">%</span>
        </p>
        <p className="label mt-1.5 text-[9px]">{domain.items.length} công cụ</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Nền panel — quầng sáng theo tone, rất nhẹ
   ------------------------------------------------------------------ */
function PanelBackdrop({ tone }: { tone: Domain["tone"] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div
        key={tone}
        className="animate-fade absolute -top-24 -right-16 size-72 rounded-full opacity-[0.22] blur-[80px]"
        style={{ background: `radial-gradient(circle, ${TONE_VAR[tone]}, transparent 70%)` }}
      />
      <div className="dot-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_80%_70%_at_30%_0%,black,transparent)]" />
    </div>
  );
}
