"use client";

import { onAudio } from "@/components/music/audio-bus";
import { useEffect, useState } from "react";
import { UNIVERSE_NODES, UNIVERSE_STATS, type Layout } from "./universe-data";

/* ==================================================================
   UNIVERSE HUD — bảng số liệu + nhãn hệ thống.
   ---------------------------------------------------------------
   Mọi con số đếm từ dữ liệu thật trong data/profile.ts (§73): thêm
   một dự án thì số tự đổi, không bao giờ phải sửa tay ở đây.

   `CORE ONLINE` chỉ là nhãn trang trí; trạng thái đèn thì đọc thật
   từ audio-bus nên không bịa.
   ================================================================== */

export function UniverseHUD({ className = "" }: { className?: string }) {
  return (
    <div className={`universe__hud ${className}`} aria-hidden>
      <p className="universe__hud-title">DIGITAL UNIVERSE</p>
      <dl className="universe__hud-grid">
        <Row k="nodes" v={UNIVERSE_STATS.nodes} />
        <Row k="links" v={UNIVERSE_STATS.edges} />
        <Row k="planets" v={UNIVERSE_STATS.projects} />
        <Row k="skills" v={UNIVERSE_STATS.skills} />
        <Row k="tools" v={UNIVERSE_STATS.tools} />
        <Row k="portals" v={UNIVERSE_STATS.channels} />
      </dl>
      <div className="universe__hud-foot">
        <Signal label="CORE ONLINE" live={false} />
        <Signal label="AUDIO FEED" live />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: number }) {
  return (
    <div className="universe__hud-row">
      <dt>{k}</dt>
      <dd className="tnum">{String(v).padStart(2, "0")}</dd>
    </div>
  );
}

/** Nhãn trạng thái. `live` = đèn sáng khi nhạc đang chạy, đọc thẳng
 *  từ bus nên không phải đèn giả. Nhãn ghi đúng thứ đèn đang báo:
 *  "CORE ONLINE" là chữ trang trí tĩnh, còn "AUDIO FEED" mới thật sự
 *  phản ánh trạng thái âm thanh — gắn đèn nhạc vào nhãn "core" sẽ
 *  trông như số liệu bịa. */
function Signal({ label, live = false }: { label: string; live?: boolean }) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => (live ? onAudio((s) => setPlaying(s.playing)) : undefined), [live]);
  return (
    <span className="universe__signal" data-live={live && playing || undefined}>
      <span className="universe__signal-dot" />
      {label}
    </span>
  );
}

/* ==================================================================
   MINI MAP — bản đồ thu nhỏ để định vị khi đang kéo/phóng.
   Chỉ hiện khi bản đồ thật đã lệch khỏi giữa; về giữa là ẩn đi.
   ================================================================== */
export function UniverseMiniMap({
  layout,
  activeId,
  offCentre,
}: {
  layout: Layout;
  activeId: string | null;
  offCentre: boolean;
}) {
  return (
    <div className="universe__mini" data-show={offCentre || undefined} aria-hidden>
      {UNIVERSE_NODES.map((n) => {
        const p = layout.pos[n.id];
        if (!p) return null;
        return (
          <span
            key={n.id}
            className="universe__mini-dot"
            data-core={n.kind === "core" || undefined}
            data-active={n.id === activeId || undefined}
            style={{
              left: `${(p.x / layout.w) * 100}%`,
              top: `${(p.y / layout.h) * 100}%`,
            }}
          />
        );
      })}
      <span className="universe__mini-frame" />
    </div>
  );
}