"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "@/components/icons";

/* ==================================================================
   TOAST — thông báo nhỏ, tự ẩn, đọc được bằng screen reader.
   Dùng chung cho: sao chép email, gửi form, mở link ngoài.
   ================================================================== */

type ToastTone = "ok" | "info" | "error";
type Toast = { id: number; message: string; tone: ToastTone };

const ToastCtx = createContext<{
  push: (message: string, tone?: ToastTone) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast phải nằm trong <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const push = useCallback((message: string, tone: ToastTone = "ok") => {
    const id = ++idRef.current;
    setItems((prev) => [...prev.slice(-2), { id, message, tone }]);
    timers.current.set(
      id,
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
        timers.current.delete(id);
      }, 2800),
    );
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-[95] flex flex-col items-center gap-2 px-4"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="animate-rise pointer-events-auto flex max-w-full items-center gap-2.5 rounded-full border border-line-2 bg-glass py-2 pr-4 pl-3 shadow-2 backdrop-blur-xl"
          >
            <span
              aria-hidden
              className={`grid size-5 shrink-0 place-items-center rounded-full ${
                t.tone === "ok"
                  ? "bg-mint/15 text-mint"
                  : t.tone === "error"
                    ? "bg-ember/15 text-ember"
                    : "bg-ice/15 text-ice"
              }`}
            >
              <Icon
                name={t.tone === "error" ? "close" : t.tone === "info" ? "arrow" : "check"}
                size={11}
                strokeWidth={2.4}
              />
            </span>
            <span className="truncate text-[13px] text-fg-2">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
