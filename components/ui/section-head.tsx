"use client";

import type { ReactNode } from "react";
import { SplitText } from "@/components/motion/reveal";
import { Eyebrow, TONE_VAR, type Tone } from "@/components/ui/primitives";

/* ==================================================================
   SECTION HEAD — chữ ký định dạng tiêu đề của cả trang.
   Không dùng pill/gradient: chỉ một số thứ tự kỹ thuật, một
   gạch, một tiêu đề lớn, một đoạn dẫn. Sạch để nội dung đứng
   trước, nặng để khung đứng sau.
   ================================================================== */
export function SectionHead({
  index,
  label,
  title,
  description,
  tone = "ice",
  meta,
  className = "",
}: {
  index: string;
  label: string;
  title: string;
  description?: string;
  tone?: Tone;
  /** ghi chú bên phải (ví dụ: số lượng mục) */
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`mb-12 sm:mb-16 ${className}`}>
      <div className="flex items-baseline justify-between gap-6 border-b border-line pb-4">
        <Eyebrow tone={tone}>
          <span className="tnum">{index}</span>
          <span className="text-muted-2">/</span>
          {label}
        </Eyebrow>
        {meta ? <div className="shrink-0">{meta}</div> : null}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-10">
        <h2 className="display-l lg:col-span-7">
          <SplitText
            lines={[{ text: title }]}
            step={26}
            className="text-balance"
          />
        </h2>

        {description ? (
          <p className="body-md max-w-xl text-muted lg:col-span-5 lg:pt-2">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------
   SectionRule — đường kẻ trang trí kết thúc section
   ------------------------------------------------------------------ */
export function SectionRule({ tone = "ice" }: { tone?: Tone }) {
  return (
    <div aria-hidden className="shell mt-[clamp(4rem,9vh,7rem)]">
      <div className="relative h-px w-full bg-line">
        <span
          className="absolute top-1/2 left-0 h-px w-16 -translate-y-1/2"
          style={{
            background: `linear-gradient(90deg, ${TONE_VAR[tone]}, transparent)`,
          }}
        />
      </div>
    </div>
  );
}
