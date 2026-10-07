"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icons";
import { profile } from "@/data/profile";
import { on } from "@/lib/bus";
import { useEscape, useFocusTrap, useScrollLock } from "@/components/motion/hooks";
import { NodeDetail } from "./node-detail";
import { UniverseMap } from "./universe-map";
import { UNIVERSE_BY_ID, UNIVERSE_EDGES, UNIVERSE_NODES } from "./universe-data";

/* ==================================================================
   UNIVERSE OVERLAY — mở vũ trụ ở chế độ toàn màn hình.
   ---------------------------------------------------------------
   Chỉ mount khi đang mở: không tốn gì khi người đọc chưa từng bấm.
   Mở được từ avatar ở hero, từ section, từ command palette — tất cả
   qua bus, không component nào phải biết nhau.

   Overlay nằm trong section nên phải đẩy lên document.body: `<main>`
   có transform lúc chuyển trang, mà một tổ tiên có transform sẽ biến
   `position: fixed` thành "fixed theo tổ tiên" — overlay lệch khỏi màn
   hình. Portal là cách sạch và không phụ thuộc CSS của tổ tiên.
   ================================================================== */
export function UniverseOverlay() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  // overlay rộng hơn section nhiều nên để chính bản đồ tự quyết
  const [stacked, setStacked] = useState(true);

  useScrollLock(open);
  useEscape(open, useCallback(() => setOpen(false), []));
  useFocusTrap(dialog, open, () => setOpen(false));

  /* lệnh từ bên ngoài */
  useEffect(() => {
    const offOpen = on("universe:open", () => setOpen(true));
    const offClose = on("universe:close", () => setOpen(false));
    return () => {
      offOpen();
      offClose();
    };
  }, []);

  const active = UNIVERSE_BY_ID.get(activeId ?? "") ?? UNIVERSE_BY_ID.get("core")!;

  // chỉ chạm vào document sau khi đã mở, tức là chắc chắn ở client
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label="Vũ trụ số"
      className="universe-overlay fixed inset-0 z-[94] flex flex-col"
    >
      {/* nền */}
      <div aria-hidden className="universe-overlay__bg" />

      <header className="shell-wide flex shrink-0 items-center justify-between gap-4 py-4">
        <div className="min-w-0">
          <p className="label flex items-center gap-2">
            <span className="text-iris">MY DIGITAL UNIVERSE</span>
          </p>
          <p className="mt-1 truncate text-[13px] text-muted">
            {profile.name} · {profile.roleShort}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden font-mono text-[10px] tracking-[0.14em] text-muted-2 sm:block">
            {UNIVERSE_NODES.length} nút · {UNIVERSE_EDGES.length} liên kết
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="glass grid size-10 place-items-center rounded-full text-fg-2 transition-colors hover:text-fg"
            aria-label="Đóng vũ trụ (Esc)"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      </header>

      {/* bản đồ + bảng đọc */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-[76rem] flex-col gap-3">
          <UniverseMap
            activeId={activeId}
            onSelect={setActiveId}
            onLayout={setStacked}
            variant="overlay"
          />

          <NodeDetail node={active} compact />

          <p className="text-center font-mono text-[10px] tracking-[0.14em] text-muted-2">
            {stacked
              ? "Chạm một nút để đọc chi tiết"
              : "Kéo để di chuyển · lăn để phóng · Tab để duyệt nút"}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}