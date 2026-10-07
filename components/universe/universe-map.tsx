"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { useFinePointer, useReducedMotion } from "@/components/motion/hooks";
import { ConnectionLines } from "./connection-lines";
import { Nebula, Orbits } from "./nebula";
import { CosmicNoise, ShootingStar } from "./shooting-star";
import { StarField } from "./star-field";
import { UniverseMiniMap } from "./universe-hud";
import { UniverseNode } from "./universe-node";
import { UniverseTooltip } from "./universe-tooltip";
import {
  UNIVERSE_EDGES,
  UNIVERSE_NODES,
  UNIVERSE_BY_ID,
  buildStack,
  buildWide,
  neighboursOf,
  relatedOf,
  type Layout,
} from "./universe-data";

/* ==================================================================
   UNIVERSE MAP — khung vũ trụ: camera + các lớp.
   ---------------------------------------------------------------
   Camera KHÔNG dùng React state cho mỗi frame khi kéo: transform
   được ghi thẳng vào DOM, state chỉ giữ con số zoom để hiển thị.
   Kéo/zoom chỉ bật khi máy có con trỏ thật (fine pointer) — trên
   điện thoại không chiếm cử chỉ vuốt dọc của người đọc.

   Thức tỉnh (§67): lần đầu node lọt vào khung nhìn, các lớp hiện ra
   theo nhịp — lõi, vành quỹ đạo, hành tinh dự án, ngôi sao kỹ năng,
   cổng liên hệ, rồi tới đường nối. Bấm vào lõi thì chạy lại từ đầu.
   Người đã bật giảm chuyển động thì thấy ngay, không chờ.
   ================================================================== */

const MIN_K = 1;
const MAX_K = 2.6;

type Cam = { k: number; x: number; y: number };

/** nhịp thức tỉnh: chỉ số node càng nhỏ càng sớm (đơn vị 70ms) */
const PHASE: Record<string, number> = {
  core: 0,
  project: 1,
  domain: 2,
  epoch: 3,
  skill: 4,
  tool: 5,
  channel: 6,
};

/** dưới bề rộng này thì bản quỹ đạo chật quá, chuyển sang bản xếp dọc */
const STACK_BELOW = 900;
/** bản rộng được thiết kế cho; mọi thứ co theo tỉ lệ này */
const DESIGN_W = 1250;
/** bề rộng chuẩn của bản xếp dọc (xem STACK trong universe-data) */
const STACK_DESIGN_W = 360;

/** quyết định bố cục + hệ số co từ bề rộng thật của stage */
function boxFor(w: number) {
  const stacked = w > 0 && w < STACK_BELOW;
  const k = stacked
    ? Math.min(1.35, Math.max(1, w / STACK_DESIGN_W))
    : Math.min(1, Math.max(0.62, w / DESIGN_W));
  return { w, stacked, k };
}

export function UniverseMap({
  activeId,
  onSelect,
  onLayout,
  variant = "section",
  className = "",
}: {
  activeId: string | null;
  onSelect: (id: string | null) => void;
  /** báo cho ngoài biết đang xếp dọc hay xếp vòng, để đổi câu hướng dẫn */
  onLayout?: (stacked: boolean) => void;
  variant?: "section" | "overlay";
  className?: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  /* Hạt giống ban đầu lấy từ bề rộng cửa sổ. Nếu khởi tạo `stacked:
     true` thì CSS giới hạn bề rộng bản xếp dọc sẽ khiến stage co lại
     ngay, đo ra bề rộng nhỏ, rồi lại kết luận là xếp dọc — tự khóa
     luôn ở sai nhánh. Server không có `window` nên mặc định coi như
     bản rộng; vòng đo chạy ngay sau đó và sửa lại. */
  const [box, setBox] = useState(() =>
    typeof window === "undefined" ? boxFor(0) : boxFor(window.innerWidth),
  );

  /* Bề rộng thật mới là thứ quyết định — một media query không dùng
     được cho cả section lẫn overlay, vì overlay rộng hơn section nhiều.
     Ở bản xếp vòng, node co theo bản đồ (--k) nên không bao giờ chồng
     nhau, kể cả trên máy tính bảng nhỏ. */
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const measure = () => {
      /* Đo CHÍNH stage chứ không đo khung: bản xếp dọc bị giới hạn bề
         rộng bằng CSS, nên đo khung ra số lớn hơn thực tế và mọi thứ sẽ
         co sai tỉ lệ. */
      const next = boxFor(stage.current?.clientWidth ?? el.clientWidth);
      setBox((prev) => (prev.w === next.w && prev.k === next.k ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(stage.current ?? el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    onLayout?.(box.stacked);
  }, [box.stacked, onLayout]);

  const layout: Layout = useMemo(() => (box.stacked ? buildStack() : buildWide()), [box.stacked]);
  const cam = useRef<Cam>({ k: 1, x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [offCentre, setOffCentre] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [awake, setAwake] = useState(false);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  const apply = useCallback(() => {
    const el = stage.current;
    if (!el) return;
    const c = cam.current;
    el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) scale(${c.k})`;
    // minimap chỉ hiện khi bản đồ thật đã lệch
    setOffCentre(Math.abs(c.x) > 2 || Math.abs(c.y) > 2 || Math.abs(c.k - 1) > 0.01);
  }, []);

  /** giới hạn biên: không để người đọc kéo rơi mất bản đồ */
  const clampCam = useCallback(() => {
    const r = viewport.current?.getBoundingClientRect();
    if (!r) return;
    const c = cam.current;
    const lim = 0.26;
    c.x = Math.max(-r.width * lim, Math.min(r.width * lim, c.x));
    c.y = Math.max(-r.height * lim, Math.min(r.height * lim, c.y));
  }, []);

  const reset = useCallback(() => {
    cam.current = { k: 1, x: 0, y: 0 };
    apply();
    setZoom(1);
  }, [apply]);

  /* đổi bố cục (xoay màn hình, đóng/mở overlay) thì camera về gốc */
  useEffect(reset, [layout, reset]);

  /* ----------------------------------------------------------------
     Thức tỉnh — chạy một lần khi bản đồ lọt vào khung nhìn
     ---------------------------------------------------------------- */
  useEffect(() => {
    if (reduced) {
      setAwake(true);
      return;
    }
    const el = viewport.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setAwake(true);
        io.disconnect();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, layout]);

  /* ----------------------------------------------------------------
     Mạng sáng khi rê (§24): node liên quan sáng, node khác mờ đi
     ---------------------------------------------------------------- */
  const lit = useMemo(
    () => neighboursOf(hover ?? activeId, true),
    [hover, activeId],
  );
  const focusId = hover ?? activeId;

  /* tooltip liệt kê đúng những gì bản đồ đang làm sáng, kể cả cạnh
     mức 2 — nếu chỉ lấy cạnh mức 1 thì tooltip và đường sáng lệch nhau */
  const tipRelated = useMemo(() => (hover ? relatedOf(hover, true) : []), [hover]);

  /* ----------------------------------------------------------------
     Zoom bánh xe — neo điểm dưới con trỏ, giới hạn biên
     ---------------------------------------------------------------- */
  useEffect(() => {
    const el = viewport.current;
    if (!el || !fine) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 2) return;
      e.preventDefault();
      const c = cam.current;
      const nk = Math.max(MIN_K, Math.min(MAX_K, c.k * (e.deltaY > 0 ? 0.92 : 1.08)));
      const r = el.getBoundingClientRect();
      // giữ nguyên điểm dưới con trỏ khi phóng
      const sx = (e.clientX - r.left - c.x) / c.k;
      const sy = (e.clientY - r.top - c.y) / c.k;
      c.k = nk;
      c.x = e.clientX - r.left - sx * nk;
      c.y = e.clientY - r.top - sy * nk;
      clampCam();
      apply();
      setZoom(nk);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [apply, clampCam, fine]);

  /* ----------------------------------------------------------------
     Kéo để di chuyển — chỉ khi bắt đầu trên nền, không phải trên node
     ---------------------------------------------------------------- */
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!fine || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, a, input")) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const c = cam.current;
    c.x += e.clientX - d.x;
    c.y += e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    apply();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    clampCam();
    apply();
  };

  const zoomBy = (factor: number) => {
    const c = cam.current;
    const r = viewport.current?.getBoundingClientRect();
    const cx = (r?.width ?? 0) / 2;
    const cy = (r?.height ?? 0) / 2;
    const nk = Math.max(MIN_K, Math.min(MAX_K, c.k * factor));
    const sx = (cx - c.x) / c.k;
    const sy = (cy - c.y) / c.k;
    c.k = nk;
    c.x = cx - sx * nk;
    c.y = cy - sy * nk;
    apply();
    setZoom(nk);
  };

  /* bàn phím: mũi tên di chuyển, +/− phóng gần, 0 về gốc */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = 42;
    const c = cam.current;
    let handled = true;
    switch (e.key) {
      case "ArrowLeft":
        c.x += step;
        break;
      case "ArrowRight":
        c.x -= step;
        break;
      case "ArrowUp":
        c.y += step;
        break;
      case "ArrowDown":
        c.y -= step;
        break;
      case "+":
      case "=":
        zoomBy(1.18);
        return;
      case "-":
      case "_":
        zoomBy(0.85);
        return;
      case "0":
        reset();
        return;
      default:
        handled = false;
    }
    if (!handled) return;
    e.preventDefault();
    e.stopPropagation();
    apply();
  };

  /** bấm lõi = khoánh khắc "vũ trụ thức tỉnh": chạy lại chuỗi hiện.
   *  Tắt `awake` một nhịp rồi bật lại để CSS animation chạy lại từ đầu —
   *  không remount, nên canvas sao và camera không bị dựng lại. */
  const select = useCallback(
    (id: string) => {
      if (id === "core") {
        if (awake && !reduced) {
          setAwake(false);
          requestAnimationFrame(() => requestAnimationFrame(() => setAwake(true)));
        } else {
          setAwake(true);
        }
      }
      onSelect(activeId === id ? null : id);
    },
    [activeId, awake, reduced, onSelect],
  );

  return (
    <div
      className={`universe ${className}`}
      data-variant={variant}
      data-zoomable={fine || undefined}
      data-awake={awake || undefined}
      data-stacked={box.stacked || undefined}
    >
      <Nebula />
      <StarField />
      <ShootingStar />
      <CosmicNoise />

      <div
        ref={viewport}
        className="universe__viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="group"
        aria-label="Bản đồ vũ trụ số. Dùng Tab để duyệt từng nút, mũi tên để di chuyển."
      >
        <div
          ref={stage}
          className="universe__stage"
          style={
            {
              aspectRatio: `${layout.w} / ${layout.h}`,
              "--k": box.k,
            } as React.CSSProperties
          }
        >
          <Orbits layout={layout} />
          <ConnectionLines
            layout={layout}
            edges={UNIVERSE_EDGES}
            nodes={UNIVERSE_NODES}
            activeId={activeId}
            hoverId={hover}
            reduced={reduced}
          />

          {UNIVERSE_NODES.map((n) => (
            <UniverseNode
              key={n.id}
              node={n}
              layout={layout}
              active={activeId === n.id || hover === n.id}
              dimmed={focusId !== null && !lit.has(n.id)}
              phase={PHASE[n.kind] ?? 7}
              awake={awake}
              scale={box.k}
              onSelect={select}
              onHover={setHover}
            />
          ))}

          <UniverseTooltip
            node={hover ? (UNIVERSE_BY_ID.get(hover) ?? null) : null}
            layout={layout}
            related={tipRelated}
            visible={hover !== null}
          />
        </div>

        {/* bản đồ thu nhỏ — chỉ hiện khi đang kéo/phóng */}
        {fine && !box.stacked ? (
          <UniverseMiniMap layout={layout} activeId={focusId} offCentre={offCentre} />
        ) : null}

        {fine ? (
          <div className="universe__controls">
            <button
              type="button"
              onClick={() => zoomBy(1.18)}
              aria-label="Phóng to"
              disabled={zoom >= MAX_K - 0.01}
            >
              <Icon name="plus" size={13} />
            </button>
            <button
              type="button"
              onClick={() => zoomBy(0.85)}
              aria-label="Thu nhỏ"
              disabled={zoom <= MIN_K + 0.01}
            >
              <Icon name="minus" size={13} />
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Đưa bản đồ về giữa"
              disabled={zoom === 1 && !offCentre}
            >
              <Icon name="compass" size={13} />
            </button>
            <span className="universe__zoom tnum" aria-hidden>
              {Math.round(zoom * 100)}%
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}