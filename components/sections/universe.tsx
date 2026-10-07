"use client";

import { useCallback, useMemo, useState } from "react";
import { profile } from "@/data/profile";
import { emit } from "@/lib/bus";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/motion/reveal";
import { SectionHead } from "@/components/ui/section-head";
import { SectionShell } from "@/components/ui/primitives";
import { NodeDetail } from "@/components/universe/node-detail";
import { UniverseHUD } from "@/components/universe/universe-hud";
import { UniverseMap } from "@/components/universe/universe-map";
import { UniverseOverlay } from "@/components/universe/universe-overlay";
import {
  KIND_LABEL,
  UNIVERSE_BY_ID,
  UNIVERSE_NODES,
  UNIVERSE_STATS,
  type UniKind,
} from "@/components/universe/universe-data";

/* ==================================================================
   SECTION 08 — MY DIGITAL UNIVERSE
   ------------------------------------------------------------------
   Không phải một infographic thêm: đây là cách nhìn khác về toàn
   bộ những gì đã nằm trong trang này. Dữ liệu lấy từ data/profile.ts
   nên không có nội dung nào bị lặp lần thứ hai.
   ================================================================== */

/** màu quen thuộc cho từng loại node, đúng với tone trong hồ sơ */
const KIND_TONE: Record<UniKind, "ice" | "iris" | "ember" | "mint"> = {
  core: "ice",
  domain: "mint",
  project: "ice",
  skill: "iris",
  tool: "mint",
  epoch: "ember",
  channel: "ember",
};

export default function Universe() {
  const [activeId, setActiveId] = useState<string | null>(null);
  // bản đồ tự đo bề rộng thật rồi báo lại, không đoán bằng media query
  const [stacked, setStacked] = useState(true);

  const active = useMemo(
    () => UNIVERSE_BY_ID.get(activeId ?? "") ?? UNIVERSE_BY_ID.get("core")!,
    [activeId],
  );

  const kinds = useMemo(() => {
    const seen = new Set<UniKind>();
    const out: UniKind[] = [];
    for (const n of UNIVERSE_NODES) {
      if (seen.has(n.kind)) continue;
      seen.add(n.kind);
      out.push(n.kind);
    }
    return out;
  }, []);

  const openOverlay = useCallback(() => emit("universe:open", { origin: "section" }), []);

  return (
    <SectionShell id="universe">
      <SectionHead
        index="08"
        label="Universe"
        tone="iris"
        title="MY DIGITAL UNIVERSE"
        description="Hồ sơ của tôi, vẽ thành quỹ đạo. Mỗi node là một phần đã có trong trang này — dự án, miền năng lực, công nghệ, chặng đường, cổng liên hệ. Bật nhạc và ngắm nó thở theo."
        meta={
          <span className="label hidden sm:inline">
            {UNIVERSE_STATS.nodes} node · {UNIVERSE_STATS.edges} liên kết
          </span>
        }
      />

      <Reveal dir="scale" distance="1.5rem">
        <div className="relative">
          <UniverseMap activeId={activeId} onSelect={setActiveId} onLayout={setStacked} />
          <UniverseHUD className="universe__hud--float" />
        </div>

        {/* --- gợi ý tương tác + mở toàn màn hình --- */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <ul className="universe__legend">
            {kinds.map((k) => (
              <li key={k} className="universe__legend-item">
                <span
                  className="universe__legend-dot"
                  style={{ color: `var(--${KIND_TONE[k]})` }}
                />
                {KIND_LABEL[k]}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-[10px] tracking-[0.14em] text-muted-2 sm:block">
              {stacked
                ? "Chạm một node để đọc"
                : "Rê để soi mạng · kéo để di chuyển · lăn để phóng"}
            </span>
            <Button variant="ghost" size="sm" onClick={openOverlay}>
              <Icon name="spark" size={14} />
              Mở toàn màn hình
            </Button>
          </div>
        </div>

        {/* --- bảng đọc --- */}
        <div className="mt-3">
          <NodeDetail node={active} />
        </div>
      </Reveal>

      <p className="mt-8 max-w-2xl text-[13px] leading-relaxed text-muted-2">
        Bản đồ này không có nội dung nào mới: mọi node đều trỏ về dữ liệu thật
        trong hồ sơ của {profile.name}. Rê vào một công nghệ để xem nó chạm
        tới dự án nào. Bật nhạc nền ở góc trái dưới rồi mở vũ trụ toàn màn
        hình nếu muốn xem phần còn lại của hồ sơ chớp theo nhịp.
      </p>

      <UniverseOverlay />
    </SectionShell>
  );
}