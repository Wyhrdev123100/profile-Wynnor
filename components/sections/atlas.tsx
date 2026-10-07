"use client";

import { useMemo, useState } from "react";
import { atlas, type Branch } from "@/data/profile";
import { px } from "@/lib/num";
import { SectionShell } from "@/components/ui/primitives";
import { SectionHead } from "@/components/ui/section-head";
import { Reveal } from "@/components/motion/reveal";
import { Icon } from "@/components/icons";
import { TONE_VAR } from "@/components/ui/primitives";

/* ==================================================================
   ATLAS — sơ đồ thông tin dạng node graph.
   ---------------------------------------------------------------
   SVG chỉ lo phần đường nét; các nút thật là <button> HTML đặt
   chồng lên (absolute) để có focus ring, tooltip và bàn phím
   hoàn toàn đúng chuẩn. Toạ độ tính bằng hàm thuần, không đo DOM.
   ================================================================== */

const VB = { w: 1100, h: 620 };
const C = { x: 550, y: 310 };
const R = { x: 398, y: 212 };

type Node = Branch & { x: number; y: number; side: "top" | "bottom" | "left" | "right" };

function buildNodes(branches: readonly Branch[]): Node[] {
  const n = branches.length;
  return branches.map((b, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const side: Node["side"] =
      sin < -0.55 ? "top" : sin > 0.55 ? "bottom" : cos > 0 ? "right" : "left";
    return {
      ...b,
      // làm tròn để server và client luôn render ra cùng một chuỗi
      x: px(C.x + cos * R.x),
      y: px(C.y + sin * R.y),
      side,
    };
  });
}

export default function Atlas() {
  const nodes = useMemo(() => buildNodes(atlas.branches), []);
  const [activeId, setActiveId] = useState<string>(atlas.branches[0].id);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const shownId = hoverId ?? activeId;
  const active = nodes.find((n) => n.id === shownId) ?? nodes[0];

  return (
    <SectionShell id="atlas">
      <SectionHead
        index="02"
        label="Atlas"
        tone="mint"
        title="Sơ đồ hồ sơ"
        description="Một nút gốc tỏa ra các nhánh, mỗi nhánh là một phần của trang này. Chọn một nhánh để xem chi tiết và điều hướng tới."
        meta={
          <span className="label hidden sm:inline">
            {nodes.length} nhánh · {nodes.reduce((n, b) => n + b.leaves.length, 0)} lá
          </span>
        }
      />

      {/* ================= DESKTOP ================= */}
      <Reveal dir="scale" distance="2rem" className="hidden lg:block">
        <div className="relative mx-auto max-w-[68rem]">
          <div
            className="relative w-full"
            style={{ aspectRatio: `${VB.w} / ${VB.h}` }}
            onMouseLeave={() => setHoverId(null)}
          >
            {/* --- đường nét --- */}
            <svg
              viewBox={`0 0 ${VB.w} ${VB.h}`}
              className="absolute inset-0 size-full"
              fill="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="atlas-sig" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--ice)" />
                  <stop offset="100%" stopColor="var(--iris)" />
                </linearGradient>
                <filter id="atlas-blur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="9" />
                </filter>
              </defs>

              {/* vàng elip quanh gốc */}
              <ellipse cx={C.x} cy={C.y} rx={R.x + 66} ry={R.y + 66} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 10" />
              <ellipse cx={C.x} cy={C.y} rx={R.x - 118} ry={R.y - 60} stroke="var(--line)" strokeWidth="1" />

              {/* từng nhánh: đường cong + quầng sáng khi active */}
              {nodes.map((n) => {
                const on = n.id === shownId;
                const mx = px((C.x + n.x) / 2);
                const my = px((C.y + n.y) / 2);
                // uốn nhẹ theo hướng tiếp tuyến để cụm "tay quay"
                const dx = n.x - C.x;
                const dy = n.y - C.y;
                const len = px(Math.hypot(dx, dy)) || 1;
                const qx = px(mx + (-dy / len) * 34);
                const qy = px(my + (dx / len) * 34);
                const d = `M ${C.x} ${C.y} Q ${qx} ${qy} ${n.x} ${n.y}`;

                return (
                  <g key={n.id}>
                    {on ? (
                      <path
                        d={d}
                        stroke={TONE_VAR[n.tone]}
                        strokeWidth="6"
                        strokeLinecap="round"
                        opacity="0.22"
                        filter="url(#atlas-blur)"
                      />
                    ) : null}
                    <path
                      d={d}
                      stroke={on ? TONE_VAR[n.tone] : "var(--line-2)"}
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      style={{ transition: "stroke 320ms var(--e-out), opacity 320ms" }}
                    />
                    {/* nút trung gian */}
                    <circle
                      cx={px((C.x + qx) / 2)}
                      cy={px((C.y + qy) / 2)}
                      r="2.5"
                      fill={on ? TONE_VAR[n.tone] : "var(--line-3)"}
                      style={{ transition: "fill 320ms" }}
                    />
                  </g>
                );
              })}

              {/* quầng sáng gốc */}
              <circle cx={C.x} cy={C.y} r="72" fill="url(#atlas-sig)" opacity="0.1" />
              <circle
                cx={C.x}
                cy={C.y}
                r="72"
                stroke="url(#atlas-sig)"
                strokeWidth="1"
                opacity="0.35"
              />
            </svg>

            {/* --- nút thật --- */}
            {nodes.map((n) => {
              const on = n.id === shownId;
              const pctX = px((n.x / VB.w) * 100);
              const pctY = px((n.y / VB.h) * 100);
              return (
                <button
                  key={n.id}
                  type="button"
                  onMouseEnter={() => setHoverId(n.id)}
                  onFocus={() => setHoverId(n.id)}
                  onClick={() => setActiveId(n.id)}
                  aria-pressed={n.id === activeId}
                  style={{
                    left: `${pctX}%`,
                    top: `${pctY}%`,
                    ["--tone" as string]: TONE_VAR[n.tone],
                  }}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 text-left"
                >
                  {/* chấm + vòng */}
                  <span className="relative grid size-9 place-items-center">
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full border transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-visible:scale-110"
                      style={{
                        borderColor: on ? TONE_VAR[n.tone] : "var(--line-2)",
                        opacity: on ? 0.55 : 1,
                        transform: on ? "scale(1.18)" : "scale(1)",
                      }}
                    />
                    <span
                      aria-hidden
                      className="size-2 rounded-full transition-all duration-300"
                      style={{
                        background: on ? TONE_VAR[n.tone] : "var(--muted-2)",
                        transform: on ? "scale(1.5)" : "scale(1)",
                      }}
                    />
                  </span>

                  {/* nhãn — đặt theo hướng của node */}
                  <span
                    className={`pointer-events-none absolute flex flex-col gap-0.5 whitespace-nowrap transition-opacity duration-300 ${
                      on ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                    } ${
                      n.side === "top"
                        ? "bottom-[calc(100%+2px)] items-center"
                        : n.side === "bottom"
                          ? "top-[calc(100%+2px)] items-center"
                          : n.side === "right"
                            ? "left-[calc(100%+2px)] items-start"
                            : "right-[calc(100%+2px)] items-end"
                    }`}
                  >
                    <span className="font-mono text-[10px] tracking-[0.16em] text-muted-2">
                      {n.index}
                    </span>
                    <span
                      className="text-[13px] tracking-[-0.015em] transition-colors"
                      style={{ color: on ? TONE_VAR[n.tone] : "var(--fg)" }}
                    >
                      {n.label}
                    </span>
                  </span>

                  <span className="sr-only">
                    {n.label}: {n.question}. {n.leaves.join(", ")}
                  </span>
                </button>
              );
            })}

            {/* --- nút gốc --- */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${px((C.x / VB.w) * 100)}%`, top: `${px((C.y / VB.h) * 100)}%` }}
            >
              <span className="relative grid size-[5.5rem] place-items-center">
                <span
                  aria-hidden
                  className="animate-spin-slow absolute inset-0 rounded-full border border-dashed border-line-2"
                />
                <span className="relative grid size-[4.25rem] place-items-center rounded-full border border-line-2 bg-surface/85 backdrop-blur-md">
                  <span className="text-center">
                    <span className="block font-mono text-[13px] font-medium tracking-tight">
                      {atlas.root.label}
                    </span>
                    <span className="mt-0.5 block font-mono text-[9px] tracking-[0.14em] text-muted-2">
                      ROOT
                    </span>
                  </span>
                </span>
              </span>
            </div>
          </div>

          {/* --- bảng đọc --- */}
          <Readout node={active} />
        </div>
      </Reveal>

      {/* ================= MOBILE — accordion ================= */}
      <div className="lg:hidden">
        <Reveal dir="up">
          <ul className="border-t border-line">
            {nodes.map((n, i) => (
              <li key={n.id} className="border-b border-line">
                <MobileBranch node={n} defaultOpen={i === 0} />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------
   READOUT — bảng đọc của nhánh đang chọn
   ------------------------------------------------------------------ */
function Readout({ node }: { node: Node }) {
  return (
    <div
      key={node.id}
      className="animate-rise mt-2 grid gap-5 rounded-2xl border border-line bg-s2/60 px-6 py-5 backdrop-blur-sm sm:grid-cols-[minmax(0,15rem)_1fr_auto] sm:items-center"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-lg border font-mono text-[11px]"
          style={{
            borderColor: TONE_VAR[node.tone],
            background: `color-mix(in oklab, ${TONE_VAR[node.tone]} 12%, transparent)`,
            color: TONE_VAR[node.tone],
          }}
        >
          {node.index}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium tracking-[-0.015em]">{node.label}</p>
          <p className="truncate text-[13px] text-muted">{node.question}</p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-1.5">
        {node.leaves.map((leaf) => (
          <li
            key={leaf}
            className="rounded-md border border-line bg-surface/60 px-2 py-[3px] font-mono text-[11px] text-muted"
          >
            {leaf}
          </li>
        ))}
      </ul>

      <a
        href={`#${node.id}`}
        className="group inline-flex items-center gap-2 text-[13px] font-medium whitespace-nowrap transition-colors"
        style={{ color: TONE_VAR[node.tone] }}
      >
        Mở section
        <Icon
          name="arrow"
          size={14}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------
   MOBILE BRANCH — accordion
   ------------------------------------------------------------------ */
function MobileBranch({ node, defaultOpen }: { node: Node; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className="tnum w-6 shrink-0 font-mono text-[10px]"
            style={{ color: TONE_VAR[node.tone] }}
          >
            {node.index}
          </span>
          <span>
            <span className="block text-[15px] font-medium tracking-[-0.015em]">
              {node.label}
            </span>
            <span className="block text-[12.5px] text-muted">{node.question}</span>
          </span>
        </span>
        <Icon
          name="chevron"
          size={15}
          className={`shrink-0 text-muted transition-transform duration-300 ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-wrap gap-1.5 pb-4">
            {node.leaves.map((leaf) => (
              <li
                key={leaf}
                className="rounded-md border border-line bg-s2 px-2 py-[3px] font-mono text-[11px] text-muted"
              >
                {leaf}
              </li>
            ))}
          </ul>
          <a
            href={`#${node.id}`}
            className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium"
            style={{ color: TONE_VAR[node.tone] }}
          >
            Mở section
            <Icon name="arrow" size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
