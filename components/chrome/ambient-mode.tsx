"use client";

import { useEffect } from "react";
import { subscribeScroll } from "@/components/motion/scroll";

/* ==================================================================
   AMBIENT MODE — rút lại lớp trang trí khi người đọc dừng lại
   ---------------------------------------------------------------
   Sau ~7s không cuộn/không di chuyển chuột, đặt data-ambient="1"
   lên <html>. CSS phản ứng: hạ grain, vignette, aurora xuống rất
   thấp. Nội dung chữ KHÔNG đổi — chỉ lớp trang trí.

   Không có setInterval: chỉ một timeout được đặt lại mỗi lần có
   hoạt động, và bị huỷ khi tab ẩn. Không tốn CPU khi người đọc
   đang lướt.
   ================================================================== */

const IDLE_MS = 7000;

export function AmbientMode() {
  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;

    const enter = () => {
      if (root.dataset.ambient === "1") return;
      root.dataset.ambient = "1";
    };

    const wake = () => {
      if (timer) clearTimeout(timer);
      if (root.dataset.ambient) delete root.dataset.ambient;
      timer = window.setTimeout(enter, IDLE_MS);
    };

    const off = subscribeScroll(wake);
    window.addEventListener("pointerdown", wake, { passive: true });
    window.addEventListener("keydown", wake, { passive: true });

    const onVisibility = () => {
      if (document.hidden) {
        if (timer) clearTimeout(timer);
        timer = 0;
      } else {
        wake();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    timer = window.setTimeout(enter, IDLE_MS);

    return () => {
      if (timer) clearTimeout(timer);
      off();
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
      document.removeEventListener("visibilitychange", onVisibility);
      delete root.dataset.ambient;
    };
  }, []);

  return null;
}