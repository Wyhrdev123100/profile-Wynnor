"use client";

import { useEffect, useState } from "react";
import { contact, navLinks, profile } from "@/data/profile";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";

/* ==================================================================
   FOOTER
   ---------------------------------------------------------------
   Chữ ký cỡ lớn bị cắt ở mép dưới (kiểu biên tập), cột liên kết,
   đồng hồ sống, và dòng colophon kỹ thuật — những chi tiết nhỏ
   khiến nó trông như sản phẩm thật chứ không phải `<footer>` mặc định.
   ================================================================== */

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line">
      {/* Chữ watermark cỡ lớn, bị cắt ở mép */}
      <div aria-hidden className="relative overflow-hidden">
        <p className="shell pointer-events-none select-none whitespace-nowrap text-center text-[clamp(3.5rem,17vw,15rem)] leading-[0.8] font-medium tracking-[-0.055em] text-fg/[0.045]">
          {profile.name}
        </p>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="shell">
        {/* Hàng thông tin */}
        <div className="grid gap-10 border-t border-line py-12 sm:grid-cols-2 lg:grid-cols-12">
          {/* Thương hiệu */}
          <div className="lg:col-span-4">
            <p className="text-[15px] font-medium tracking-[-0.02em]">
              Cùng làm một thứ
              <br />
              <span className="italic-serif text-muted">đáng để mở ra.</span>
            </p>
            <p className="body-sm mt-4 max-w-xs text-muted">{profile.tagline}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button href={`mailto:${profile.email}`} size="sm" variant="quiet" icon="mail">
                {profile.email}
              </Button>
            </div>
          </div>

          {/* Điều hướng */}
          <nav aria-label="Điều hướng chân trang" className="lg:col-span-3">
            <p className="label">Trang</p>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    className="group inline-flex items-center gap-2 text-[13.5px] text-muted transition-colors hover:text-fg"
                  >
                    <span className="tnum font-mono text-[10px] text-muted-2">{l.index}</span>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kênh */}
          <div className="lg:col-span-3">
            <p className="label">Kênh</p>
            <ul className="mt-4 space-y-2.5">
              {contact.channels.slice(1).map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="open"
                    className="group inline-flex items-center gap-2 text-[13.5px] text-muted transition-colors hover:text-fg"
                  >
                    <Icon name={c.icon} size={14} />
                    {c.label}
                    <Icon
                      name="arrow"
                      size={12}
                      className="-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </a>
                </li>
              ))}
              {profile.socials
                .filter((s) => !contact.channels.some((c) => c.label === s.label))
                .map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-cursor="open"
                      className="group inline-flex items-center gap-2 text-[13.5px] text-muted transition-colors hover:text-fg"
                    >
                      <Icon name={s.icon} size={14} />
                      {s.label}
                      <Icon
                        name="arrow"
                        size={12}
                        className="-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Trạng thái */}
          <div className="lg:col-span-2">
            <p className="label">Trạng thái</p>
            <ul className="mt-4 space-y-3 text-[13px] text-muted">
              <li className="flex items-center gap-2">
                <span className="relative flex size-1.5 shrink-0" aria-hidden>
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint opacity-60 [animation-duration:2.6s]" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-mint" />
                </span>
                {profile.availability}
              </li>
              <li className="flex items-center gap-2">
                <Icon name="clock" size={13} />
                <LocalTime />
              </li>
              <li className="flex items-center gap-2">
                <Icon name="pin" size={13} />
                {profile.location}
              </li>
            </ul>
          </div>
        </div>

        {/* Colophon */}
        <div className="flex flex-col gap-4 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-muted-2">
            © {year} {profile.name} · Thiết kế & build tại Hà Nội
          </p>
          <Colophon />
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex items-center gap-2 font-mono text-[11px] text-muted-2 transition-colors hover:text-fg"
          >
            Lên đầu trang
            <Icon
              name="arrow"
              size={12}
              className="-rotate-90 transition-transform duration-300 group-hover:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------
   Đồng hồ sống — render sau mount để khỏi lệch hydration
   ------------------------------------------------------------------ */
function LocalTime() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: profile.timezone,
      hour12: false,
    });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return <span className="tnum">{t ?? "--:--"} {profile.timezoneLabel}</span>;
}

/* ------------------------------------------------------------------
   COLOPHON — chi tiết kỹ thuật, chỉ chạy ở client
   ------------------------------------------------------------------ */
function Colophon() {
  const [sys, setSys] = useState<string | null>(null);

  useEffect(() => {
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    setSys(
      [cores ? `${cores} luồng` : null, mem ? `${mem} GB` : null]
        .filter(Boolean)
        .join(" · ") || "trình duyệt hiện đại",
    );
  }, []);

  return (
    <p className="font-mono text-[11px] text-muted-2">
      Next.js · Tailwind · {sys ?? "…"}
    </p>
  );
}
