"use client";

import { useId } from "react";
import { px } from "@/lib/num";
import type { Layout, UniEdge, UniNode } from "./universe-data";

/* ==================================================================
   CONNECTION LINES — mạng nối giữa các node.
   ---------------------------------------------------------------
   SVG chỉ vẽ đường; node là <button> HTML đè lên trên (xem
   universe-node.tsx) để giữ nguyên focus ring và bàn phím.

   - toàn cạnh nằm trong một <g> theo tone để đổi màu cả khối
   - cạnh mức 2 (miền → công nghệ của miền) chỉ hiện khi chính miền
     đó đang được chọn: đây là "ưu tiên liên kết", không phải vẽ tất
   - cạnh nối với node đang chọn được vẽ đè: quầng sáng + nét đậm
   - có "chấm chạy" chậm chạy dọc cạnh để vũ trụ không đứng yên
   ================================================================== */

type Props = {
  layout: Layout;
  edges: readonly UniEdge[];
  nodes: readonly UniNode[];
  /** node đang chọn (click) */
  activeId: string | null;
  /** node đang rê — mạng sáng theo cả hai */
  hoverId: string | null;
  reduced?: boolean;
};

export function ConnectionLines({ layout, edges, nodes, activeId, hoverId, reduced }: Props) {
  // section và overlay cùng render lúc bản đồ đang mở → id filter phải
  // riêng, nếu không url(#uni-glow) sẽ trỏ nhầm sang bản còn lại
  const glowId = `uni-glow-${useId().replace(/:/g, "")}`;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const pos = layout.pos;

  /** node nào đang chi phối hiển thị: rê thắng chọn */
  const focusId = hoverId ?? activeId;
  const focus = new Set<string>();
  if (focusId) {
    focus.add(focusId);
    for (const e of edges) {
      if (e.a === focusId) focus.add(e.b);
      if (e.b === focusId) focus.add(e.a);
    }
  }

  const cx = px(layout.w / 2);
  const stacked = layout.rings.length === 0;

  return (
    <svg
      viewBox={`0 0 ${layout.w} ${layout.h}`}
      className="absolute inset-0 size-full overflow-visible"
      fill="none"
      aria-hidden
    >
      <defs>
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {edges.map((e) => {
        const a = pos[e.a];
        const b = pos[e.b];
        if (!a || !b) return null;

        // cạnh mức 2 im lặng trừ khi miền của nó đang được chọn
        if (e.level === 2 && !focus.has(e.a) && !focus.has(e.b)) return null;

        const on = focus.has(e.a) && focus.has(e.b);
        const near = focus.has(e.a) || focus.has(e.b);
        const anchor = focus.has(e.a) ? e.a : e.b;
        const tone = on ? byId.get(anchor)?.tone : null;

        // uốn nhẹ: điểm giữa cộng với lệch vuông góc, tay quay ngược
        // phía sát node để các cạnh không chồng lên nhau
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const mx = px((a.x + b.x) / 2);
        const my = px((a.y + b.y) / 2);
        const bow = px(stacked ? 0 : Math.min(38, len * 0.11));
        const qx = px(mx + (-dy / len) * bow);
        const qy = px(my + (dx / len) * bow);
        const d = `M ${a.x} ${a.y} Q ${qx} ${qy} ${b.x} ${b.y}`;
        const color = tone ? `var(--${tone})` : "var(--line-2)";

        return (
          <g
            key={`${e.a}-${e.b}`}
            opacity={focus.size ? (on ? 1 : 0.22) : e.level === 2 ? 0.5 : 1}
            style={{ transition: "opacity 400ms var(--e-out)" }}
          >
            {on ? (
              <path
                d={d}
                stroke={color}
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.2"
                filter={`url(#${glowId})`}
              />
            ) : null}
            <path
              d={d}
              stroke={color}
              strokeWidth={on ? 1.6 : e.level === 2 ? 0.9 : 1}
              strokeLinecap="round"
              opacity={on ? 0.95 : e.level === 2 ? 0.5 : near ? 0.3 : 0.55}
              style={{ transition: "stroke 300ms var(--e-out), stroke-width 300ms var(--e-out)" }}
            />
            {/* điểm giữa cạnh */}
            <circle
              cx={px((a.x + qx + b.x) / 2)}
              cy={px((a.y + qy + b.y) / 2)}
              r={on ? 2 : 1.4}
              fill={color}
              opacity={on ? 0.95 : 0.4}
            />
            {/* chấm chạy dọc cạnh = dòng dữ liệu chảy, chỉ khi cạnh sáng */}
            {on && !reduced ? (
              <circle r="2.4" fill={color}>
                <animateMotion dur="4.4s" repeatCount="indefinite" path={d} />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="4.4s"
                  repeatCount="indefinite"
                />
              </circle>
            ) : null}
          </g>
        );
      })}

      {/* trục giữa của bản xếp cột */}
      {stacked ? (
        <g opacity="0.9">
          <circle cx={cx} cy={pos.core.y} r="4" fill="var(--ice)" />
        </g>
      ) : null}
    </svg>
  );
}