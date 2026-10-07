"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { useMounted } from "@/components/motion/hooks";

/* ==================================================================
   THEME TOGGLE — tối là mặc định. Trạng thái đồng bộ qua sự kiện
   `themechange` để Command Palette đổi theme vẫn cập nhật nút này.
   ================================================================== */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const mounted = useMounted();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      title={dark ? "Giao diện sáng" : "Giao diện tối"}
      className={`grid size-10 shrink-0 place-items-center rounded-full border border-line text-muted-2
        transition-[color,border-color,background-color,transform] duration-200
        hover:border-line-3 hover:bg-s2 hover:text-fg active:scale-95 ${className}`}
    >
      <span
        aria-hidden
        className="relative block size-[18px] transition-transform duration-500 ease-[cubic-bezier(0.34,1.4,0.5,1)]"
        style={{ transform: mounted && !dark ? "rotate(180deg)" : "none" }}
      >
        <Icon
          name="moon"
          size={18}
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: mounted && dark ? 1 : 0 }}
        />
        <Icon
          name="sun"
          size={18}
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: mounted && dark ? 0 : 1 }}
        />
      </span>
    </button>
  );
}
