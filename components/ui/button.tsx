"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconProps } from "@/components/icons";
import { Magnetic } from "@/components/motion/magnetic";

/* ==================================================================
   BUTTON
   ---------------------------------------------------------------
   Biến thể: primary · glass · ghost · quiet
   Kích thước: sm · md · lg
   Trạng thái: hover · focus-visible · active · disabled · loading
   Tuỳ chọn: icon, hút theo con trỏ (chỉ desktop), full width.
   ================================================================== */

type Variant = "primary" | "glass" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

const BASE =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 " +
  "rounded-full font-medium tracking-[-0.01em] whitespace-nowrap " +
  "transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-200 " +
  "ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.975] " +
  "disabled:pointer-events-none disabled:opacity-40 disabled:saturate-50 " +
  "aria-disabled:pointer-events-none aria-disabled:opacity-40";

const VARIANT: Record<Variant, string> = {
  // nền sáng đặc, chữ tối — mạnh nhất, chỉ dùng cho CTA chính
  primary:
    "bg-fg text-bg hover:bg-white hover:shadow-[0_10px_40px_-8px_color-mix(in_oklab,var(--ice)_45%,transparent)]",
  // kính: nền mờ + viền 1px
  glass:
    "border border-line-2 bg-s2 text-fg backdrop-blur-md hover:border-line-3 hover:bg-s3",
  // không viền, chữ mờ
  ghost: "text-muted hover:bg-s2 hover:text-fg",
  // nhỏ, kỹ thuật, viền mảnh
  quiet: "border border-line bg-transparent text-fg-2 hover:border-line-3 hover:text-fg",
};

const SIZE: Record<Size, string> = {
  // chạm tối thiểu 36px, không bao giờ nhỏ hơn 40px trên touch
  sm: "h-9 px-3.5 text-[13px] [&_svg]:size-3.5",
  md: "h-11 px-5 text-sm [&_svg]:size-4",
  lg: "h-12 px-6 text-[15px] [&_svg]:size-[18px] sm:h-[52px] sm:px-7",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  icon,
  iconRight,
  loading = false,
  disabled,
  magnetic = false,
  fullWidth = false,
  className = "",
  type = "button",
  onClick,
  ariaLabel,
  ...rest
}: {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  icon?: IconProps["name"];
  iconRight?: IconProps["name"];
  loading?: boolean;
  disabled?: boolean;
  magnetic?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  ariaLabel?: string;
} & Record<string, unknown>) {
  const cls = `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${
    fullWidth ? "w-full" : ""
  } ${className}`;

  const inner = (
    <>
      {loading ? (
        <span
          aria-hidden
          className="size-[0.9em] shrink-0 animate-spin rounded-full border-[1.5px] border-current/25 border-t-current"
        />
      ) : icon ? (
        <Icon name={icon} />
      ) : null}

      {children ? (
        <span className={loading ? "opacity-70" : undefined}>{children}</span>
      ) : null}

      {iconRight && !loading ? (
        <Icon
          name={iconRight}
          className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-0.5"
        />
      ) : null}
    </>
  );

  const disabledState = disabled || loading;

  const node = href ? (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-disabled={disabledState || undefined}
      className={cls}
      {...rest}
    >
      {inner}
    </Link>
  ) : (
    <button
      type={type}
      onClick={onClick}
      disabled={disabledState}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      className={cls}
      {...rest}
    >
      {inner}
    </button>
  );

  if (!magnetic) return node;

  return (
    <Magnetic className="inline-flex" strength={0.22} radius={40}>
      {node}
    </Magnetic>
  );
}

/* ==================================================================
   ICON BUTTON — 40px chạm, dùng cho navbar
   ================================================================== */
export function IconButton({
  name,
  label,
  onClick,
  active,
  className = "",
  children,
  ...rest
}: {
  name?: IconProps["name"];
  label: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`grid size-10 shrink-0 place-items-center rounded-full border text-muted-2
        transition-[color,border-color,background-color,transform] duration-200
        hover:border-line-3 hover:bg-s2 hover:text-fg active:scale-95
        ${active ? "border-line-3 bg-s2 text-fg" : "border-line bg-transparent"}
        ${className}`}
      {...rest}
    >
      {children ?? (name ? <Icon name={name} size={17} /> : null)}
    </button>
  );
}
