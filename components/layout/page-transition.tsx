"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { subscribeScroll } from "@/components/motion/scroll";

/* ==================================================================
   PAGE TRANSITION — mỗi lần đổi route (nếu có) sẽ cuộn lên đầu
   và báo cho CSS biết để chạy hiệu ứng vào.
   Trang hiện tại là single-page nên chủ yếu để tương thích.
   ================================================================== */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("js");
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;
    main.style.opacity = "0";
    main.style.transform = "translate3d(0, 10px, 0)";
    const id = requestAnimationFrame(() => {
      main.style.transition = "opacity 420ms var(--e-out), transform 420ms var(--e-out)";
      main.style.opacity = "1";
      main.style.transform = "none";
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // giữ thanh tiến trình đồng bộ khi chiều cao trang đổi (ảnh, font)
  useEffect(() => subscribeScroll(() => {}), []);

  return <>{children}</>;
}
