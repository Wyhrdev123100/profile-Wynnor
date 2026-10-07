import { BRANDS, type BrandKey } from "./brand";

/* ==================================================================
   LOGO — một mark thương hiệu trong vũ trụ.
   ------------------------------------------------------------------
   Mọi thứ về hình dạng đã nằm sẵn trong components/logos/brand.ts:
   viewBox thật của từng mark, màu thương hiệu, và cờ `inverse` cho
   mark quá tối trên nền vũ trụ. Ở đây chỉ còn việc vẽ.

   - `preserveAspectRatio="xMidYMid meet"` + viewBox gốc ⇒ không bao
     giờ méo, kể cả mark vốn không vuông (AWS 256×153).
   - Mark quá tối (Next.js, Vercel, Rust, X, GitHub, Prisma) vẽ bằng
     `currentColor` ⇒ giữ nguyên hình dạng, chỉ đổi chỗ để không
     chìm vào nền. Không mark nào bị bóp méo hay tẩy màu.
   - Logo luôn ở trong `aria-hidden`: nhãn đọc được do node/tooltip
     cung cấp, để screen reader không đọc hai lần.
   ================================================================== */

export type { BrandKey };

/** tra mark theo khoá; trả null để gọi tiện trong JSX */
export function getBrand(key: string | null | undefined) {
  if (!key) return null;
  return BRANDS[key as BrandKey] ?? null;
}

export function Logo({
  name,
  size = 24,
  className = "",
  /** ghi đè màu (thường là tone của node) */
  tone,
  title,
}: {
  /** khoá trong BRANDS */
  name: string | null | undefined;
  /** cạnh của hộp logo — luôn vuông, logo tự canh giữa bên trong */
  size?: number;
  className?: string;
  tone?: string;
  /** nhãn hiện dạng chữ thay logo (cho node lõi) */
  title?: string;
}) {
  const brand = getBrand(name);

  const body = (
    <svg
      viewBox={brand?.viewBox ?? "0 0 24 24"}
      width={size}
      height={size}
      fill="none"
      aria-hidden
      focusable="false"
      style={{ display: "block", overflow: "visible" }}
    >
      {brand?.paths.map((p, i) =>
        p.stroke ? (
          <path
            key={i}
            d={p.d}
            stroke="currentColor"
            strokeWidth={p.w ?? 1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path key={i} d={p.d} fill={p.fill ?? "currentColor"} />
        ),
      )}
      {brand?.dots?.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="currentColor" />
      ))}
    </svg>
  );

  /* không có mark trong kho → lùi về chữ cái đầu, không vẽ ô trống */
  const fallback = (
    <span
      aria-hidden
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: Math.round(size * 0.44),
        letterSpacing: "0.02em",
        color: tone ?? "currentColor",
        lineHeight: 1,
      }}
    >
      {title?.slice(0, 2).toUpperCase() ?? "?"}
    </span>
  );

  return (
    <span
      className={`logo ${className}`}
      data-variant={brand?.variant ?? "none"}
      data-inverse={brand?.inverse || undefined}
      style={{
        display: "grid",
        placeItems: "center",
        inlineSize: size,
        blockSize: size,
        /* màu mark: thương hiệu, trừ khi bị ép tone hoặc quá tối */
        color: tone ?? (brand?.hex && !brand.inverse ? brand.hex : undefined),
      }}
    >
      {brand ? (
        <span
          /* mark vuông của logo nằm trong lưới 24×24; các mark khác
             giữ viewBox gốc nên `meet` tự canh giữa, không méo */
          style={{ display: "grid", placeItems: "center", lineHeight: 0 }}
        >
          {body}
        </span>
      ) : (
        fallback
      )}
    </span>
  );
}