"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/components/motion/scroll";

/* ==================================================================
   FAVICON ĐỘNG
   ---------------------------------------------------------------
   Không trình duyệt nào render favicon SVG có chuyển động, nên bản
   động được vẽ bằng canvas 64×64 rồi đổi `href` của <link rel=icon>.
   Bốn điều kiện giữ nó không ảnh hưởng tốc độ trang:
     - chỉ chạy sau khi trong tải xong và trình duyệt rảnh
     - dừng hẳn khi tab bị ẩn, trả lại favicon tĩnh
     - 24 bước / vòng, 100ms một bước → một lần vẽ rất nhỏ
     - tôn trọng prefers-reduced-motion: không chạy gì cả
   Bản tĩnh (favicon.svg / favicon.png) luôn được khai báo sẵn trong
   metadata, nên đây chỉ là lớp trang trí tuỳ chọn.
   ================================================================== */

const SIZE = 64;
const RAD = 15;
const STEPS = 22;
const STEP_MS = 140;
const STATIC_FALLBACK = "/favicon.svg";

const ICE = [122, 215, 255] as const;
const IRIS = [169, 155, 255] as const;

const mix = (a: readonly number[], b: readonly number[], t: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(
    a[2] + (b[2] - a[2]) * t,
  )})`;

function roundRect(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(SIZE, 0, SIZE, SIZE, r);
  ctx.arcTo(SIZE, SIZE, 0, SIZE, r);
  ctx.arcTo(0, SIZE, 0, 0, r);
  ctx.arcTo(0, 0, SIZE, 0, r);
  ctx.closePath();
}

/** Cùng dấu hiệu với favicon.svg: hai nét chéo + chấm, viewBox 24.
 *  Canvas 64px đang phục vụ viewBox 32 nên mọi hệ số nhân đôi. */
function mark(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.translate(-1.12, -1.12);
  ctx.scale(2.76, 2.76);

  const g = ctx.createLinearGradient(5, 19, 19, 5);
  g.addColorStop(0, mix(ICE, IRIS, 0));
  g.addColorStop(0.52, "#dfe9ff");
  g.addColorStop(1, mix(ICE, IRIS, 1));
  ctx.strokeStyle = g;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  ctx.stroke(new Path2D("M5 19 19 5"));
  ctx.stroke(new Path2D("M9.5 19 19 9.5"));

  ctx.fillStyle = "#dff1ff";
  ctx.beginPath();
  ctx.arc(5, 19, 1.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function paint(ctx: CanvasRenderingContext2D, step: number) {
  const ang = (step / STEPS) * Math.PI * 2;

  ctx.clearRect(0, 0, SIZE, SIZE);
  roundRect(ctx, RAD);
  ctx.fillStyle = "#06070a";
  ctx.fill();

  const glow = ctx.createRadialGradient(SIZE * 0.28, SIZE * 0.2, 0, SIZE * 0.28, SIZE * 0.2, SIZE * 0.92);
  glow.addColorStop(0, "rgba(122,215,255,0.30)");
  glow.addColorStop(0.55, "rgba(169,155,255,0.10)");
  glow.addColorStop(1, "rgba(122,215,255,0)");
  ctx.fillStyle = glow;
  ctx.fill();

  mark(ctx);

  // vành quỹ đạo quay chậm, cùng ngôn ngữ với avatar
  ctx.save();
  roundRect(ctx, RAD);
  ctx.clip();
  ctx.translate(SIZE / 2, SIZE / 2);
  ctx.rotate(ang);
  ctx.strokeStyle = "rgba(122,215,255,0.55)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, SIZE * 0.44, -0.55, 0.55);
  ctx.stroke();
  ctx.restore();

  // reflection quét qua
  ctx.save();
  roundRect(ctx, RAD);
  ctx.clip();
  ctx.globalCompositeOperation = "lighter";
  ctx.translate(SIZE / 2, SIZE / 2);
  ctx.rotate(ang);
  ctx.translate(-SIZE / 2, -SIZE / 2);
  const sheen = ctx.createLinearGradient(0, 0, SIZE, 0);
  sheen.addColorStop(0, "rgba(255,255,255,0)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.13)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.restore();
}

function iconLink(): HTMLLinkElement {
  const doc = document;
  const found = doc.querySelector<HTMLLinkElement>('link[rel~="icon"]');
  if (found) return found;
  const link = doc.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  doc.head.appendChild(link);
  return link;
}

export function FaviconMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const link = iconLink();
    const staticHref = link.getAttribute("href") ?? STATIC_FALLBACK;

    let step = 0;
    let id = 0;
    let teardown: (() => void) | null = null;

    const frame = () => {
      paint(ctx, step);
      link.href = canvas.toDataURL("image/png");
      step = (step + 1) % STEPS;
    };

    const start = () => {
      if (id || document.hidden) return;
      frame();
      id = window.setInterval(frame, STEP_MS);
    };

    const stop = () => {
      if (id) clearInterval(id);
      id = 0;
      if (link.getAttribute("href") !== staticHref) link.href = staticHref;
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    const kick = () => {
      if (teardown) return;
      start();
      document.addEventListener("visibilitychange", onVisibility);
      teardown = () => {
        document.removeEventListener("visibilitychange", onVisibility);
        stop();
      };
    };

    // Race giữa requestIdleCallback và setTimeout: bảo đảm favicon
    // động luôn khởi động, kể cả khi idle callback bị trì hoãn.
    const begin = () => {
      const ric = window.requestIdleCallback;
      if (typeof ric === "function") ric(kick, { timeout: 3000 });
      window.setTimeout(kick, 3000);
    };

    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });

    return () => {
      window.removeEventListener("load", begin);
      teardown?.();
      teardown = null;
      stop();
    };
  }, []);

  return null;
}