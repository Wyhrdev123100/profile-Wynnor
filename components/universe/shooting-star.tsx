"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/components/motion/scroll";

/* ==================================================================
   SHOOTING STAR — sao băng hiếm hoi.
   ---------------------------------------------------------------
   CSS thuần: một <span> được đặt lệch trên cạnh trên rồi chạy chéo
   qua khung. Chu kỳ 18–34 giây ngẫu nhiên để không bao giờ đoán được
   nhịp. Khi tab ẩn hoặc reduced-motion thì dừng hẳn.
   ================================================================== */
export function ShootingStar() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let timer = 0;

    const fire = () => {
      // tab ẩn thì đợi tiếp, đừng bắn ngầm rồi mất hiệu ứng
      if (!document.hidden) {
        el.style.setProperty("--sx", `${Math.round(-10 + Math.random() * 20)}%`);
        el.style.setProperty("--sy", `${Math.round(Math.random() * 26)}%`);
        el.style.setProperty("--srot", `${Math.round(24 + Math.random() * 14)}deg`);
        el.style.setProperty("--sdur", `${(1.5 + Math.random() * 0.7).toFixed(2)}s`);
        el.dataset.fire = "yes";
        window.setTimeout(() => delete el.dataset.fire, 2400);
      }
      // 18–34s ngẫu nhiên: không bao giờ đoán được nhịp, và luôn chờ
      // tới giữa đêm để không chen vào lúc trang vừa mở
      timer = window.setTimeout(fire, 18_000 + Math.random() * 16_000);
    };

    const onVisibility = () => {
      window.clearTimeout(timer);
      if (!document.hidden) fire();
    };

    document.addEventListener("visibilitychange", onVisibility);
    fire();

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <span ref={ref} className="universe__shooting" aria-hidden />;
}

/* ==================================================================
   COSMIC NOISE — lớp hạt phim rất mờ.
   ---------------------------------------------------------------
   Nền phẳng nhìn lâu sẽ "chết". Lớp này SVG turbulence hoá bằng
   data-URI nên không tốn request, không tốn JS, và chỉ bật ở màn
   rộng. Opacity cố ý rất thấp — không được phép lấn át chữ.
   ================================================================== */
export function CosmicNoise({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`universe__noise ${className}`} />;
}