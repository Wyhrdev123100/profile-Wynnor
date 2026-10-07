import type { ReactNode } from "react";
import type { Tone } from "@/data/profile";

export type { Tone };

/* ==================================================================
   PRIMITIVES THỪA DÙNG — đảm bảo mọi thứ trong repo có cùng
   ngôn ngữ thị giác: 1px viền, bo góc nhất quán, hover nhẹ.
   ================================================================== */

export const TONE_TEXT: Record<Tone, string> = {
  ice: "text-ice",
  iris: "text-iris",
  ember: "text-ember",
  mint: "text-mint",
};

export const TONE_VAR: Record<Tone, string> = {
  ice: "var(--ice)",
  iris: "var(--iris)",
  ember: "var(--ember)",
  mint: "var(--mint)",
};

export const TONE_LINE: Record<Tone, string> = {
  ice: "border-ice/25 bg-ice/8",
  iris: "border-iris/25 bg-iris/8",
  ember: "border-ember/25 bg-ember/8",
  mint: "border-mint/25 bg-mint/8",
};

/* ------------------------------------------------------------------
   Eyebrow — nhãn kỹ thuật kèm gạch kỹ thuật ở trước
   ------------------------------------------------------------------ */
export function Eyebrow({
  children,
  tone = "ice",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <p className={`label flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden
        className="h-px w-6 rounded-full transition-colors"
        style={{ background: "currentColor", color: TONE_VAR[tone] }}
      />
      <span style={{ color: TONE_VAR[tone] }}>{children}</span>
    </p>
  );
}

/* ------------------------------------------------------------------
   Tag — nhãn công nghệ
   ------------------------------------------------------------------ */
export function Tag({
  children,
  className = "",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-line bg-s2 px-2 py-[3px] font-mono text-[11px] leading-5 tracking-[-0.01em] text-muted transition-colors duration-200 ${
        interactive ? "hover:border-line-2 hover:bg-s3 hover:text-fg-2" : ""
      } ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------
   Panel — khối kính tiêu chuẩn, viền sáng chạy góc khi hover
   ------------------------------------------------------------------ */
export function Panel({
  children,
  className = "",
  interactive = false,
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  glow?: boolean;
}) {
  return (
    <div
      className={`iridescent ${interactive ? "iridescent-on" : ""} relative overflow-hidden rounded-2xl border border-line bg-s2/60 backdrop-blur-sm transition-[border-color,background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        interactive
          ? "hover:-translate-y-0.5 hover:border-line-2 hover:bg-s3/60 hover:shadow-2"
          : ""
      } ${glow ? "shadow-1" : ""} ${className}`}
    >
      <span aria-hidden className="iridescent-edge" />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------
   LiveDot — chấm trạng thái + nhãn
   ------------------------------------------------------------------ */
export function LiveDot({
  children,
  tone = "mint",
  className = "",
}: {
  children?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex size-1.5 shrink-0" aria-hidden>
        <span
          className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
          style={{ background: TONE_VAR[tone], animationDuration: "2.6s" }}
        />
        <span
          className="relative inline-flex size-1.5 rounded-full"
          style={{ background: TONE_VAR[tone] }}
        />
      </span>
      {children ? <span className="truncate">{children}</span> : null}
    </span>
  );
}

/* ------------------------------------------------------------------
   SectionShell — bao khung + tiêu đề chuẩn cho mọi section
   ------------------------------------------------------------------ */
export function SectionShell({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`band relative scroll-mt-28 py-[clamp(5rem,11vh,8.5rem)] ${className}`}
    >
      <div className="shell">{children}</div>
    </section>
  );
}
