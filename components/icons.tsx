import type { SVGProps } from "react";
import type { IconName } from "@/data/profile";

/* ==================================================================
   Icon set — tự vẽ, zero dependency, 1.6px stroke mặc định.
   Toàn bộ dùng cùng viewBox 24×24 + stroke-linecap round để
   khi đặt cạnh nhau, nét luôn cùng độ đậm.
   ================================================================== */

const STROKE: Record<IconName, React.ReactNode> = {
  github: (
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  ),
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v1.5A6 6 0 0 1 16 8z" />
      <rect x="2" y="9" width="4" height="12" rx="1" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  x: <path d="M4 4 20 20M20 4 4 20" />,
  mail: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 8 8.2 5.6a1.5 1.5 0 0 0 1.6 0L21 8" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.4 2.4 3.6 5.4 3.6 9S14.4 18.6 12 21c-2.4-2.4-3.6-5.4-3.6-9S9.6 5.4 12 3z" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10.5 9.5 5 2.5-5 2.5z" />
    </>
  ),
  discord: (
    <path d="M8.5 8.5a12 12 0 0 1 7 0M8 16.5a11 11 0 0 0 8 0M9.5 12.5h.01M14.5 12.5h.01M7.5 16.5c-1.3.9-1.7 2.2-1.8 3.3m10.8-3.3c1.3.9 1.7 2.2 1.8 3.3M8.6 6C9.5 5.6 10.7 5.4 12 5.4s2.5.2 3.4.6a13.2 13.2 0 0 1 5.8 11.6c-.4 2.6-1.7 4.5-1.7 4.5l-1.8-1.8s-1.8.4-4 .4-4-.4-4-.4L7.9 22s-1.3-1.9-1.7-4.5A13.2 13.2 0 0 1 8.6 6z" />
  ),
  telegram: <path d="m21.5 3-9 18-2.3-7.2L3 11.5zM21.5 3 10.2 13.8" />,
  dribbble: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.8 3.2A15 15 0 0 0 12 21M21 12a19 19 0 0 0-9.4-1.4A14.5 14.5 0 0 0 4.5 15M7.3 3.7A14.5 14.5 0 0 1 12 21a16.5 16.5 0 0 0 4.8-11.5c0-1.9-1-4.2-2.4-6.3" />
    </>
  ),
  phone: (
    <path d="M21.5 16.9v2.8a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.3 19.3 0 0 1-6-6 19.6 19.6 0 0 1-3-8.6A2 2 0 0 1 3.8 2h2.8a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.6 9.8a15.8 15.8 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2z" />
  ),

  layers: (
    <>
      <path d="m12 2.8 9 4.6-9 4.6-9-4.6z" />
      <path d="m3.5 12.2 8.5 4.3 8.5-4.3M3.5 16.6l8.5 4.3 8.5-4.3" />
    </>
  ),
  gauge: (
    <>
      <path d="M20.5 15a9 9 0 1 0-17 0" />
      <path d="M12 15 16.2 9" />
      <circle cx="12" cy="15.5" r="1.4" />
    </>
  ),
  shield: (
    <path d="M12 21.5s7.5-3.6 7.5-9.4V5.6L12 2.5 4.5 5.6v6.5c0 5.8 7.5 9.4 7.5 9.4zM9.3 12l1.9 1.9 3.6-3.7" />
  ),
  spark: (
    <path d="M12 2.5 13.9 8.4 20 10.3l-6.1 1.9L12 18.1l-1.9-5.9L4 10.3l6.1-1.9zM18.5 16.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7z" />
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.4 8.6-2 5.4-5.4 2 2-5.4z" />
    </>
  ),
  code: <path d="m8.5 8-4.5 4 4.5 4M15.5 8l4.5 4-4.5 4M13.8 4.5 10.2 19.5" />,
  palette: (
    <>
      <path d="M12 21a9 9 0 1 1 0-18c4.97 0 9 3.58 9 8 0 2.2-1.8 3.5-4 3.5h-1.6a2 2 0 0 0-1.5 2.6A1.9 1.9 0 0 1 12 21z" />
      <circle cx="7.6" cy="11.4" r="1.1" />
      <circle cx="10.4" cy="7.4" r="1.1" />
      <circle cx="15.2" cy="8.2" r="1.1" />
    </>
  ),
  server: (
    <>
      <rect x="3" y="3.5" width="18" height="7" rx="2" />
      <rect x="3" y="13.5" width="18" height="7" rx="2" />
      <path d="M7 7h.01M7 17h.01" />
    </>
  ),
  terminal: <path d="M5 7.5 9.5 12 5 16.5M12.5 17h6.5" />,

  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
  external: <path d="M14 4h6v6M20 4l-8.5 8.5M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10" />,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M15 6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15" />
    </>
  ),
  star: (
    <path d="m12 3.2 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.5s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0c0 5 6.5 11 6.5 11z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m20 20-4.4-4.4" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7.5h16M4 12h11M4 16.5h16" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  moon: <path d="M20.5 13.2A8.6 8.6 0 0 1 10.8 3.5a8.8 8.8 0 1 0 9.7 9.7z" />,
  send: <path d="M21 3 10.5 13.5M21 3l-6.8 18-3.7-7.5L3 9.8z" />,
  chevron: <path d="m9 5 7 7-7 7" />,
};

export type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
} & Omit<SVGProps<SVGSVGElement>, "name">;

export function Icon({
  name,
  size = 16,
  strokeWidth = 1.6,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      className={className ?? "shrink-0"}
      {...props}
    >
      {STROKE[name]}
    </svg>
  );
}

export function StarFilled({
  size = 12,
  className,
  ...props
}: { size?: number; className?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      aria-hidden="true"
      className={className ?? "shrink-0"}
      {...props}
    >
      <path d="m12 3.2 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </svg>
  );
}
