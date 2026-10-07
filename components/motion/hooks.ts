"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { subscribeScroll } from "@/components/motion/scroll";

/* ------------------------------------------------------------------
   useReducedMotion — luôn false ở server, đồng bộ sau mount để
   không gây hydration mismatch.
   ------------------------------------------------------------------ */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------------
   useInView — gọi cb một lần khi phần tử lọt khung nhìn.
   Giữ dự phòng cho trình duyệt không có IntersectionObserver.
   ------------------------------------------------------------------ */
export function useInView<T extends Element = HTMLDivElement>(
  ref: React.RefObject<T | null>,
  cb: (el: T) => void | (() => void),
  options: { once?: boolean; threshold?: number; rootMargin?: string; enabled?: boolean } = {},
) {
  const { once = true, threshold = 0.15, rootMargin = "0px 0px -8% 0px", enabled = true } =
    options;
  const saved = useRef(cb);
  saved.current = cb;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let cleanup: void | (() => void);

    if (typeof IntersectionObserver === "undefined") {
      cleanup = saved.current(el);
    } else {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            cleanup = saved.current(el);
            if (once) io.disconnect();
          }
        },
        { threshold, rootMargin },
      );
      io.observe(el);
      cleanup = () => io.disconnect();
    }

    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [ref, once, threshold, rootMargin, enabled]);
}

/* ------------------------------------------------------------------
   useScrollY — chỉ setState khi vượt ngưỡng, để không re-render
   liên tục.
   ------------------------------------------------------------------ */
export function useScrollY(threshold: number, cb?: (y: number) => void) {
  const [passed, setPassed] = useState(false);
  const cbRef = useRef(cb);
  cbRef.current = cb;

  useEffect(() => {
    return subscribeScroll((y) => {
      cbRef.current?.(y);
      setPassed((prev) => {
        const next = y > threshold;
        return prev === next ? prev : next;
      });
    });
  }, [threshold]);

  return passed;
}

/* ------------------------------------------------------------------
   useActiveSection — theo dõi section nào đang chiếm giữa khung nhìn.
   ------------------------------------------------------------------ */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>("");
  const ratios = useRef(new Map<string, number>());

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const map = ratios.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) map.set(e.target.id, e.intersectionRatio);
          else map.delete(e.target.id);
        }
        if (!map.size) return;
        let best = "";
        let bestRatio = -1;
        for (const [id, r] of map) {
          if (r > bestRatio) {
            best = id;
            bestRatio = r;
          }
        }
        setActive((prev) => (prev === best ? prev : best));
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.02, 0.15, 0.4] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

/* ------------------------------------------------------------------
   useMediaQuery
   ------------------------------------------------------------------ */
export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatch(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);
  return match;
}

/** Chỉ bật hiệu ứng con trỏ trên thiết bị có con trỏ chuột thật */
export function useFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/* ------------------------------------------------------------------
   useIsomorphicMounted
   ------------------------------------------------------------------ */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/** Ngăn cuộn body có hiệu ứng (dùng cho overlay / command palette) */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
    };
  }, [locked]);
}

/** Gọi handler khi bấm ra ngoài phần tử */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
  enabled = true,
) {
  const saved = useRef(handler);
  saved.current = handler;
  useEffect(() => {
    if (!enabled) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) saved.current();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [ref, enabled]);
}

/** Focus trap đơn giản cho dialog */
export function useFocusTrap<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  active: boolean,
  onEscape?: () => void,
) {
  const esc = useRef(onEscape);
  esc.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const prev = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        esc.current?.();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [ref, active]);
}

/** Đóng bằng Escape (dùng chung) */
export function useEscape(active: boolean, handler: () => void) {
  const saved = useCallback(handler, [handler]);
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        saved();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, saved]);
}
