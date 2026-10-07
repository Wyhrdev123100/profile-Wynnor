"use client";

import { useId, useRef } from "react";
import { prefersReducedMotion } from "@/components/motion/scroll";
import { useFinePointer } from "@/components/motion/hooks";
import { profile } from "@/data/profile";

/* ==================================================================
   LOGO 3D
   ---------------------------------------------------------------
   Giữ nguyên đúng dấu hiệu nhận diện đang chạy trên navbar: hai nét
   chéo cắt nhau trong ô bo góc nhỏ, cộng một chấm tròn ở góc dưới
   trái. Không đổi hình dạng — chỉ thêm chiều sâu:
     - lớp đuôi (depth) offset xuống phải, mờ dần
     - mặt trước vẽ bằng gradient kim loại ice → iris
     - highlight chạy qua khi rê chuột
     - nổi nhẹ (float) + nghiêng 3D rất nhẹ theo con trỏ
   Toàn bộ biến động ghi vào 3 CSS variable đăng ký sẵn trong
   globals.css nên không phát sinh re-render khi con trỏ di chuyển.
   ================================================================== */

/** Dấu hiệu gốc — viewBox 24, dùng lại cho favicon & OG image */
export const MARK_VIEWBOX = "0 0 24 24";
export const MARK_STROKES = "M5 19 19 5M9.5 19 19 9.5";
export const MARK_DOT = { cx: 5, cy: 19, r: 1.6 };

/** Kích thước KHÔNG đặt ở đây — nơi gọi quyết định (navbar dùng size-[18px]). */
export function Logo3D({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const fine = useFinePointer();
  const host = useRef<HTMLSpanElement>(null);

  const tilt = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!fine || prefersReducedMotion()) return;
    const el = host.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--logo-rx", `${(ny * -10).toFixed(2)}deg`);
    el.style.setProperty("--logo-ry", `${(nx * 16).toFixed(2)}deg`);
  };

  const rest = () => {
    const el = host.current;
    if (!el) return;
    el.style.setProperty("--logo-rx", "0deg");
    el.style.setProperty("--logo-ry", "0deg");
  };

  return (
    <span
      ref={host}
      className={`logo3d ${className}`}
      onPointerMove={tilt}
      onPointerLeave={rest}
      onBlur={rest}
    >
      <span className="logo3d__stage">
        <span className="logo3d__float">
          <svg viewBox={MARK_VIEWBOX} className="size-full" fill="none" aria-hidden focusable="false">
            <defs>
              <linearGradient id={`${uid}-metal`} x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="var(--ice)" />
                <stop offset="0.52" stopColor="var(--fg)" />
                <stop offset="1" stopColor="var(--iris)" />
              </linearGradient>
              <linearGradient id={`${uid}-depth`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--iris)" stopOpacity="0.5" />
                <stop offset="1" stopColor="var(--iris)" stopOpacity="0" />
              </linearGradient>
              <radialGradient id={`${uid}-dot`} cx="0.34" cy="0.28" r="0.85">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="0.55" stopColor="var(--ice)" />
                <stop offset="1" stopColor="var(--iris)" />
              </radialGradient>
            </defs>

            <g strokeLinecap="round" fill="none">
              {/* hai lớp đuôi — tạo cảm giác phay cắt */}
              <path
                d={MARK_STROKES}
                stroke={`url(#${uid}-depth)`}
                strokeWidth={2}
                transform="translate(.62 1.12)"
              />
              <path
                d={MARK_STROKES}
                stroke={`url(#${uid}-depth)`}
                strokeWidth={2}
                transform="translate(.34 .6)"
              />
              {/* mặt trước */}
              <path d={MARK_STROKES} stroke={`url(#${uid}-metal)`} strokeWidth={2} />
              <circle
                cx={MARK_DOT.cx}
                cy={MARK_DOT.cy}
                r={MARK_DOT.r}
                fill={`url(#${uid}-dot)`}
                stroke="none"
              />
            </g>
          </svg>
        </span>
      </span>
      <span className="logo3d__sheen" aria-hidden />
      <span className="sr-only">{profile.name}</span>
    </span>
  );
}