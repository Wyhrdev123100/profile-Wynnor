"use client";

import { Logo } from "@/components/logos/logo";
import { TONE_VAR } from "@/components/ui/primitives";
import { px } from "@/lib/num";
import type { Layout, UniNode } from "./universe-data";

/* ==================================================================
   NODE TOOLTIP — bảng kính bám theo node đang rê chuột.
   ---------------------------------------------------------------
   Đặt TRONG stage nên tự đi theo camera (kéo/phóng) mà không cần
   nghe thêm sự kiện nào. Ngang nó sẽ vào tâm; trên nó luôn nằm trong
   khung, không bao giờ tràn ra ngoài bản đồ.

   Vì sao cần: bản rộng có 41 node, ghi tên lên tất cả sẽ thành
   mạng nhện chữ. Thay vào đó node nhỏ (kỹ năng, công cụ) đổi tên
   vào đây khi rê — vẫn đọc đủ, mà mặt bản đồ vẫn thở.
   ================================================================== */

const W = 216;

export function UniverseTooltip({
  node,
  layout,
  related,
  visible,
}: {
  node: UniNode | null;
  layout: Layout;
  /** các node nối trực tiếp — hiện tên để thấy node này dùng cho việc gì */
  related: readonly UniNode[];
  visible: boolean;
}) {
  if (!node) return null;

  const p = layout.pos[node.id];
  const tone = TONE_VAR[node.tone];

  // đặt trên nếu còn chỗ, không thì đặt dưới
  const above = p.y > layout.h * 0.34;
  const top = px(above ? p.y - node.size / 2 - 18 : p.y + node.size / 2 + 18);
  const left = px(Math.min(Math.max(p.x, W / 2 + 8), layout.w - W / 2 - 8));

  return (
    <div
      className="universe__tip"
      data-visible={visible || undefined}
      data-below={!above || undefined}
      style={
        {
          left: `${px((left / layout.w) * 100)}%`,
          top: `${px((top / layout.h) * 100)}%`,
          "--tone": tone,
        } as React.CSSProperties
      }
      /* con trỏ không được phủ lên tooltip, và không cần đọc bằng
         mắt vì nội dung đã có trong bảng đọc + nhãn trợ năng */
      aria-hidden
    >
      <span className="universe__tip-head">
        {node.logo ? (
          <span className="universe__tip-mark">
            <Logo name={node.logo} size={16} />
          </span>
        ) : (
          <span className="universe__tip-dot" style={{ background: tone }} />
        )}
        <span className="universe__tip-name">{node.label}</span>
        <span className="universe__tip-kind">{node.index}</span>
      </span>

      <span className="universe__tip-note">{node.note}</span>

      {related.length ? (
        <span className="universe__tip-links">
          {related.slice(0, 3).map((r) => (
            <span key={r.id} className="universe__tip-link" style={{ color: TONE_VAR[r.tone] }}>
              {r.label}
            </span>
          ))}
          {related.length > 3 ? (
            <span className="universe__tip-more">+{related.length - 3}</span>
          ) : null}
        </span>
      ) : (
        <span className="universe__tip-none">chưa có liên kết trực tiếp</span>
      )}
    </div>
  );
}