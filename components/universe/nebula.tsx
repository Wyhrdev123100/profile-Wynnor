"use client";

import { px } from "@/lib/num";
import type { Layout } from "./universe-data";

/* ==================================================================
   NEBULA — các đám mây màu khí.
   Không canvas: gradient + blur + keyframe là đủ, và để GPU lo.
   Cường độ biến thiên theo --audio-energy nên nhạc "thở" cùng cả
   vũ trụ mà không cần JS.
   ================================================================== */
export function Nebula({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`universe__nebula ${className}`}>
      <span className="universe__cloud universe__cloud--ice" />
      <span className="universe__cloud universe__cloud--iris" />
      <span className="universe__cloud universe__cloud--ember" />
      <span className="universe__haze" />
    </div>
  );
}

/* ==================================================================
   ORBITS — vành quỹ đạo.
   Mỗi vành có một chấm đánh dấu chạy quanh để cảm giác chuyển động
   đến từ chính hình học chứ không phải từ hiệu ứng rời rạc.
   ================================================================== */
export function Orbits({ layout }: { layout: Layout }) {
  const stacked = layout.rings.length === 0;
  if (stacked) {
    return (
      <svg
        viewBox={`0 0 ${layout.w} ${layout.h}`}
        className="absolute inset-0 size-full"
        fill="none"
        aria-hidden
        preserveAspectRatio="none"
      >
        {/* trục giữa của bản xếp dọc */}
        <line
          x1={px(layout.w / 2)}
          y1="16"
          x2={px(layout.w / 2)}
          y2={px(layout.h - 16)}
          stroke="var(--line)"
          strokeWidth="1"
          strokeDasharray="2 10"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${layout.w} ${layout.h}`}
      className="absolute inset-0 size-full overflow-visible"
      fill="none"
      aria-hidden
    >
      {layout.rings.map((g, i) => (
        <g key={i}>
          <ellipse
            cx={px(layout.w / 2)}
            cy={px(layout.h / 2)}
            rx={px(g.rx)}
            ry={px(g.ry)}
            stroke={i === 0 ? "var(--line-2)" : "var(--line-2)"}
            strokeWidth="1"
            strokeDasharray={i === 0 ? "2 8" : "1 12"}
            opacity={i === 0 ? 0.95 : 0.6}
          />
          {/* vòng tròn hoàn hảo tương ứng — gợi ý quỹ đạo nghiêng */}
          <ellipse
            cx={px(layout.w / 2)}
            cy={px(layout.h / 2)}
            rx={px((g.rx + g.ry) / 2)}
            ry={px((g.rx + g.ry) / 2)}
            stroke="var(--line)"
            strokeWidth="0.6"
            opacity="0.5"
          />
          {/* chấm đánh dấu chạy quanh vành — transform-origin lấy
              theo viewBox nên quay đúng quanh tâm vũ trụ */}
          <g
            className="origin-center animate-spin-slower"
            style={{ animationDuration: `${64 + i * 26}s` }}
          >
            <circle
              cx={px(layout.w / 2)}
              cy={px(layout.h / 2 - g.ry)}
              r={i === 0 ? 2 : 1.6}
              fill={i === 0 ? "var(--ice)" : "var(--iris)"}
              opacity={0.7}
            />
          </g>
        </g>
      ))}
    </svg>
  );
}