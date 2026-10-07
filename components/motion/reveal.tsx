"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { useInView, useReducedMotion } from "@/components/motion/hooks";

/* ==================================================================
   Reveal — hiệu ứng xuất hiện khi lọt khung nhìn.
   Toàn bộ phần chuyển động nằm ở CSS (data-attribute) nên React
   chỉ setState đúng một lần cho mỗi phần tử.
   ================================================================== */

export type RevealDir = "up" | "left" | "right" | "scale" | "clip" | "clip-x" | "none";

export function Reveal({
  children,
  as: Tag = "div",
  dir = "up",
  delay = 0,
  distance,
  blur = false,
  className = "",
  style,
  ...rest
}: {
  children: ReactNode;
  as?: ElementType;
  dir?: RevealDir;
  /** độ trễ (ms) — dùng để stagger */
  delay?: number;
  distance?: string;
  blur?: boolean;
  className?: string;
  style?: CSSProperties;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useInView(
    ref,
    () => {
      ref.current?.setAttribute("data-shown", "true");
    },
    { enabled: !reduced, threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
  );

  return (
    <Tag
      ref={ref}
      data-reveal={dir === "none" ? "up" : dir}
      data-blur={blur ? "" : undefined}
      className={className}
      style={
        {
          "--rd": `${delay}ms`,
          ...(distance ? { "--ry": distance, "--rx": distance } : null),
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ==================================================================
   SplitText — tách từ, mỗi từ trượt lên từ trong một mask.
   ------------------------------------------------------------------
   mode="enter" : chạy ngay khi paint bằng CSS thuần (dùng cho hero
                  để không ảnh hưởng LCP).
   mode="inview": chạy khi phần tử lọt khung nhìn.
   `lines` cho phép ép mỗi dòng là một khối (tiêu đề hero).
   ================================================================== */

type Segment = { text: string; cls?: string };

export function SplitText({
  lines,
  mode = "inview",
  step = 42,
  start = 0,
  as: Tag = "span",
  className = "",
  wordClassName = "",
}: {
  lines: Segment[];
  mode?: "enter" | "inview";
  step?: number;
  start?: number;
  as?: ElementType;
  className?: string;
  wordClassName?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const inview = mode === "inview" && !reduced;

  useInView(
    ref,
    () => {
      ref.current?.setAttribute("data-shown", "true");
    },
    { enabled: inview, threshold: 0.15 },
  );

  let i = start;

  return (
    <Tag
      ref={ref}
      data-word-shown={mode === "enter" ? "true" : undefined}
      className={`${mode === "enter" ? "enter" : ""} ${className}`}
    >
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.text.split(" ").map((w, wi) => {
            const delay = i * step;
            i += 1;
            return (
              <span
                key={`${wi}-${w}`}
                className={`word ${wordClassName}`}
                style={{ "--d": `${delay}ms` } as CSSProperties}
              >
                <i>
                  {w}
                  {/* giữ khoảng trắng, không dùng &nbsp; để tránh wrap kỳ */}
                  {wi < line.text.split(" ").length - 1 ? " " : ""}
                </i>
              </span>
            );
          })}
          {line.cls ? <span className={line.cls} /> : null}
        </span>
      ))}
    </Tag>
  );
}

/* ==================================================================
   Stagger — cấp delay tự động cho các phần tử con
   ================================================================== */
export function Stagger({
  children,
  step = 70,
  as: Tag = "div",
  className = "",
  ...rest
}: {
  children: ReactNode[];
  step?: number;
  as?: ElementType;
  className?: string;
} & Record<string, unknown>) {
  return (
    <Tag className={className} {...rest}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * step}>
          {child}
        </Reveal>
      ))}
    </Tag>
  );
}
