"use client";

import { ProfileAvatar } from "@/components/brand/avatar";
import { Logo } from "@/components/logos/logo";
import { TONE_VAR } from "@/components/ui/primitives";
import { px } from "@/lib/num";
import type { Layout, UniNode } from "./universe-data";

/* ==================================================================
   UNIVERSE NODE — nút thật của vũ trụ.
   ---------------------------------------------------------------
   Vẫn là <button> HTML đặt chồng lên SVG (như Atlas) để có focus
   ring, aria-pressed và bàn phím đúng chuẩn.

   Bốn lớp, từ ngoài vào:
     aura   quầng sáng tone   — chỉ sáng khi node được chọn
     ring   vành mảnh         — nở ra khi rê chuột
     orbit  cung quay chậm    — chạy khi node đang active
     orb    quả cầu kính chứa mark

   Node không có mark thương hiệu (lõi, miền năng lực, chặng năm) dùng
   ký hiệu trừu tượng tô bằng tone — không bịa logo cho thứ không có.

   Nhãn: node có tên riêng (lõi, miền, dự án, chặng, kênh) hiện nhãn
   thường; kỹ năng và công cụ quá nhiều để ghi chữ, nên tên của chúng
   nằm ở tooltip + bảng đọc + nhãn trợ năng.
   ================================================================== */

/** node nào hiện nhãn thường — phần còn lại đọc ở tooltip */
const LABELLED: ReadonlySet<UniNode["kind"]> = new Set([
  "core",
  "domain",
  "project",
  "epoch",
  "channel",
]);

/* --- ký hiệu trừu tượng cho node không có mark ----------------------
   Mỗi miền năng lực một hình riêng: lớp giao diện, kho dữ liệu,
   cụm máy, kim khắc. Không dùng lại một ký hiệu cho cả bốn — nhìn
   là biết đang ở miền nào mà không phải đọc chữ. */
function DomainGlyph({ id, tone }: { id: string; tone: string }) {
  const s = { stroke: tone, strokeWidth: 1.25, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  if (id.endsWith("frontend")) {
    // các lớp giao diện chồng nhau
    return (
      <svg viewBox="0 0 24 24" width="58%" height="58%" aria-hidden focusable="false">
        <path d="M12 3.4 20.6 7.6 12 11.8 3.4 7.6z" {...s} />
        <path d="M4.4 12.1 12 16.1l7.6-4" {...s} opacity="0.62" />
        <path d="M4.4 16.3 12 20.3l7.6-4" {...s} opacity="0.38" />
      </svg>
    );
  }

  if (id.endsWith("backend")) {
    // trụ cơ sở dữ liệu
    return (
      <svg viewBox="0 0 24 24" width="56%" height="56%" aria-hidden focusable="false">
        <ellipse cx="12" cy="6.8" rx="7.2" ry="3" {...s} />
        <path d="M4.8 6.8v10.4c0 1.7 3.2 3 7.2 3s7.2-1.3 7.2-3V6.8" {...s} />
        <path d="M4.8 12c0 1.7 3.2 3 7.2 3s7.2-1.3 7.2-3" {...s} opacity="0.55" />
      </svg>
    );
  }

  if (id.endsWith("infra")) {
    // cụm máy: một lõi và ba nút vệ tinh
    return (
      <svg viewBox="0 0 24 24" width="58%" height="58%" aria-hidden focusable="false">
        <path d="M10.7 6.6 6.8 14.6M13.3 6.6l3.9 8M7.4 17.2h9.2" {...s} opacity="0.55" />
        <circle cx="12" cy="12" r="3" fill={tone} stroke="none" />
        <circle cx="12" cy="4.8" r="1.7" {...s} />
        <circle cx="5.4" cy="16.2" r="1.7" {...s} />
        <circle cx="18.6" cy="16.2" r="1.7" {...s} />
      </svg>
    );
  }

  // craft: kim khắc
  return (
    <svg viewBox="0 0 24 24" width="56%" height="56%" aria-hidden focusable="false">
      <path d="M12 3.2 19.4 12 12 20.8 4.6 12z" {...s} />
      <path d="M12 8.4 15.6 12 12 15.6 8.4 12z" {...s} opacity="0.6" />
      <circle cx="12" cy="12" r="1" fill={tone} stroke="none" />
    </svg>
  );
}

/* --- ký hiệu trừu tượng cho node không có mark ---------------------- */
function Glyph({ node, tone }: { node: UniNode; tone: string }) {
  if (node.kind === "core") return null; // lõi dùng avatar thật

  if (node.kind === "domain") return <DomainGlyph id={node.id} tone={tone} />;

  // chặng đường: ngôi sao bốn cánh của chòm sao
  return (
    <svg viewBox="0 0 24 24" width="56%" height="56%" aria-hidden focusable="false">
      <path
        d="M12 2.6 13.7 10 21.4 12 13.7 14 12 21.4 10.3 14 2.6 12 10.3 10Z"
        fill={tone}
        stroke="none"
      />
      <circle cx="12" cy="12" r="9.4" stroke={tone} strokeWidth="1.25" fill="none" opacity="0.42" />
    </svg>
  );
}

export function UniverseNode({
  node,
  layout,
  active,
  dimmed,
  /** thứ tự hiện ra trong chuỗi thức tỉnh */
  phase,
  awake,
  scale = 1,
  onSelect,
  onHover,
}: {
  node: UniNode;
  layout: Layout;
  active: boolean;
  dimmed: boolean;
  phase: number;
  awake: boolean;
  /** hệ số co theo bề rộng khung — giữ tỉ lệ node với bản đồ */
  scale?: number;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const p = layout.pos[node.id];
  const stacked = layout.rings.length === 0;
  const tone = TONE_VAR[node.tone];
  const isCore = node.kind === "core";

  const left = px((p.x / layout.w) * 100);
  const top = px((p.y / layout.h) * 100);

  /* Nhãn luôn nằm DƯỚI node. Trước đây nhãn đẩy ra phía ngoài tâm vũ
     trụ (trái/phải theo toạ độ), nhưng khi đó nhãn của node vành giữa
     lao vào khoảng trống giữa hai vành — đúng chỗ node vành trong
     đang đứng. Xuống dưới là hướng duy nhất không tranh chỗ với
     node khác ở mọi vị trí trên quỹ đạo. */
  const labelled = LABELLED.has(node.kind);
  // cỡ node trên bản xếp dọc nhỏ hơn một chút cho lưới 8 cột
  const size = Math.round((stacked ? node.size * 0.82 : node.size) * scale);

  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(node.id)}
      onBlur={() => onHover(null)}
      aria-pressed={active}
      className="universe__node"
      data-active={active || undefined}
      data-dim={dimmed || undefined}
      data-kind={node.kind}
      data-labelled={labelled || undefined}
      data-awake={awake || undefined}
      data-side="below"
      style={
        {
          left: `${left}%`,
          top: `${top}%`,
          "--tone": tone,
          "--size": `${size}px`,
          "--w": node.weight,
          "--i": phase,
        } as React.CSSProperties
      }
    >
      {/* quầng sáng khi active — không dùng blur để nhẹ máy */}
      <span
        aria-hidden
        className="universe__node-aura"
        style={{ background: `radial-gradient(circle, ${tone}, transparent 68%)` }}
      />

      {/* vành mỏng, nở ra khi rê chuột */}
      <span aria-hidden className="universe__node-ring" />

      {/* cung quay — bằng chứng node này đang "sống" */}
      <span aria-hidden className="universe__node-orbit" />

      {/* quả cầu kính chứa mark */}
      <span aria-hidden className="universe__node-orb">
        {isCore ? (
          <ProfileAvatar className="universe__node-avatar" />
        ) : node.logo ? (
          <Logo name={node.logo} size={Math.round(size * 0.56)} title={node.label} />
        ) : (
          <Glyph node={node} tone={tone} />
        )}
      </span>

      {labelled ? (
        <span className="universe__node-label">
          <span className="universe__node-index">{node.index}</span>
          <span className="universe__node-name" style={{ color: active ? tone : undefined }}>
            {node.label}
          </span>
        </span>
      ) : null}

      <span className="sr-only">
        {node.title}. {node.note}
      </span>
    </button>
  );
}