/* ==================================================================
   SCROLL ENGINE (không phụ thuộc React)
   ---------------------------------------------------------------
   Một vòng lặp rAF duy nhất cho toàn trang thay vì N event listener.
   - Chỉ chạy khi có subscriber (lazy).
   - Chỉ chạy khi thực sự có thay đổi → không tốn CPU lúc đứng yên.
   - Đọc scrollY đúng 1 lần mỗi frame rồi chia sẻ cho mọi subscriber.
   ================================================================== */

export type ScrollCb = (y: number, vh: number, maxScroll: number) => void;

const subs = new Set<ScrollCb>();
let raf = 0;
let vh = 0;
let maxScroll = 0;
let pending = -1;

function measure() {
  vh = window.innerHeight;
  maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
}

function flush(y: number) {
  raf = 0;
  pending = -1;
  for (const cb of subs) cb(y, vh, maxScroll);
}

function onScroll() {
  if (raf) return;
  pending = Math.max(0, window.scrollY);
  raf = requestAnimationFrame(() => flush(pending));
}

function remeasure() {
  measure();
  flush(Math.max(0, window.scrollY));
}

/** Đăng ký callback nhận (scrollY, viewportHeight, maxScroll). Tự dọn dẹp. */
export function subscribeScroll(cb: ScrollCb): () => void {
  subs.add(cb);
  if (subs.size === 1) {
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure, { passive: true });
    window.addEventListener("orientationchange", remeasure, { passive: true });
    cb(Math.max(0, window.scrollY), vh, maxScroll);
  }
  return () => {
    subs.delete(cb);
    if (subs.size === 0) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("orientationchange", remeasure);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** clamp giá trị trong [min,max] */
export const clamp = (v: number, min = 0, max = 1) => (v < min ? min : v > max ? max : v);

/** easeOutExpo — dùng cho counter & parallax settle */
export const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
