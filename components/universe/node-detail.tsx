"use client";

import { Icon } from "@/components/icons";
import { Logo } from "@/components/logos/logo";
import { TONE_VAR } from "@/components/ui/primitives";
import { relatedOf, type UniNode } from "./universe-data";

/* ==================================================================
   NODE DETAIL — bảng đọc của node đang chọn.
   Đặt dưới bản đồ (section) hoặc dưới overlay, cùng một component.

   Mark ở đây được vẽ lớn (48px) nên các logo dạng chữ (AWS,
   WebSocket) đọc được — ở node nhỏ chúng chỉ còn là một nét màu.
   ================================================================== */
export function NodeDetail({
  node,
  compact = false,
}: {
  node: UniNode;
  compact?: boolean;
}) {
  const tone = TONE_VAR[node.tone];
  const related = relatedOf(node.id);

  return (
    <div
      key={node.id}
      className={`animate-rise glass grid gap-4 rounded-2xl border border-line px-5 py-4 ${
        compact
          ? "sm:grid-cols-[minmax(0,18rem)_1fr] sm:items-center sm:gap-6"
          : "sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_auto] sm:items-center"
      }`}
      style={{ boxShadow: `0 0 0 1px color-mix(in oklab, ${tone} 18%, transparent)` }}
    >
      {/* --- định danh --- */}
      <div className="flex items-start gap-3">
        {node.kind === "core" ? (
          <span
            aria-hidden
            className="grid size-12 shrink-0 place-items-center rounded-xl border font-mono text-[11px]"
            style={{
              borderColor: tone,
              background: `color-mix(in oklab, ${tone} 12%, transparent)`,
              color: tone,
            }}
          >
            {node.index}
          </span>
        ) : (
          <span
            aria-hidden
            className="grid size-12 shrink-0 place-items-center rounded-xl border"
            style={{
              borderColor: `color-mix(in oklab, ${tone} 30%, transparent)`,
              background: `color-mix(in oklab, ${tone} 8%, transparent)`,
            }}
          >
            {node.logo ? (
              <Logo name={node.logo} size={26} />
            ) : (
              <span
                className="font-mono text-[11px]"
                style={{ color: tone }}
              >
                {node.index}
              </span>
            )}
          </span>
        )}

        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium tracking-[-0.015em]">
            {node.title}
          </p>
          <p className="line-clamp-2 text-[13px] text-muted">{node.note}</p>
        </div>
      </div>

      {/* --- số liệu --- */}
      <dl className="grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
        {node.meta.slice(0, compact ? 4 : 8).map((m) => (
          <div key={`${node.id}-${m.k}-${m.v}`} className="min-w-0">
            <dt className="font-mono text-[10px] tracking-[0.14em] text-muted-2 uppercase">
              {m.k}
            </dt>
            <dd className="truncate text-[13px] text-fg-2">{m.v}</dd>
          </div>
        ))}
      </dl>

      {/* --- liên kết --- */}
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {related.slice(0, 3).map((r) => (
          <span
            key={r.id}
            className="rounded-md border border-line bg-s2/70 px-2 py-[3px] font-mono text-[11px] text-muted"
          >
            <span style={{ color: TONE_VAR[r.tone] }}>{r.label}</span>
          </span>
        ))}
        {node.href ? (
          <a
            href={node.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors"
            style={{
              color: tone,
              borderColor: `color-mix(in oklab, ${tone} 34%, transparent)`,
              background: `color-mix(in oklab, ${tone} 8%, transparent)`,
            }}
          >
            Mở
            <Icon
              name="external"
              size={13}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        ) : null}
      </div>

      {!compact ? (
        <p className="col-span-full border-t border-line pt-3 text-[13px] leading-relaxed text-muted sm:col-span-none sm:border-0 sm:pt-0">
          {node.detail}
        </p>
      ) : null}
    </div>
  );
}