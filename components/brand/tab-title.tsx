"use client";

import { useEffect } from "react";
import { profile } from "@/data/profile";
import { prefersReducedMotion } from "@/components/motion/scroll";

/* ==================================================================
   TAB TITLE
   ---------------------------------------------------------------
   Tiêu đề tab đổi nhẹ giữa ba cách viết. Ba nguyên tắc:
     1. Giá trị đầu tiên luôn là tiêu đề gốc của trang → crawler đọc
        được đúng nội dung chuẩn, không bị ảnh hưởng.
     2. Chỉ chạy khi tab đang nhìn thấy; sang tab khác thì trả về
        tiêu đề gốc và dừng hẳn.
     3. Tôn trọng prefers-reduced-motion và không chạy khi người dùng
        đã cuộn/dùng trang (bỏ qua để không gây nhiễu).
   ================================================================== */

const SWAP_EVERY = 2400;

const VARIANTS = [
  `${profile.name} — ${profile.roleShort}`,
  `${profile.name} • ${profile.roleShort}`,
  `${profile.name} / ${profile.roleShort}`,
];

export function TabTitle() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const base = document.title;
    if (!base) return;

    let i = 0;
    let id = 0;

    const stop = () => {
      if (id) clearInterval(id);
      id = 0;
      if (document.title !== base) document.title = base;
    };

    const start = () => {
      if (id || document.hidden) return;
      i = 0;
      id = window.setInterval(() => {
        i = (i + 1) % VARIANTS.length;
        document.title = VARIANTS[i];
      }, SWAP_EVERY);
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    // chờ trang rảnh rồi mới bắt đầu, để không cạnh tranh LCP.
    // Race với setTimeout để chắc chắn khởi động kể cả khi
    // requestIdleCallback bị trì hoãn (tab nền, máy đang bận).
    const kick = () => {
      start();
      document.addEventListener("visibilitychange", onVisibility);
    };
    const ric = window.requestIdleCallback;
    if (typeof ric === "function") ric(kick, { timeout: 3000 });
    window.setTimeout(kick, 2600);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      document.title = base;
    };
  }, []);

  return null;
}