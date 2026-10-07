"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MUSIC_HINTS, playlist, type Track } from "@/data/music";
import { onAudio } from "@/components/music/audio-bus";
import { useAudioEngine } from "@/components/music/use-audio-engine";
import { AudioVisualizer } from "@/components/music/audio-visualizer";

/* ==================================================================
   MUSIC PLAYER — cố định góc trái dưới, không chen vào nội dung
   ------------------------------------------------------------------
   Ba trạng thái, tất cả điều khiển bằng cùng một component (không
   mount/unmount để tránh nháy):
     idle    → gọn một dòng "MUSIC"
     compact → đang phát, gọn: đĩa xoay + tên + cân bằng
     open    → panel đầy đủ: sóng, seek, transport, playlist

   Không có setState nào chạy theo nhịp nhạc: thời gian/biên độ đi
   qua audio-bus và được ghi thẳng vào DOM.
   ================================================================== */

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r < 10 ? "0" : ""}${r}`;
};

/* --- glyph tự vẽ, cùng nét 1.6 và viewBox 24 như icon set chung --- */
function Glyph({
  name,
  size = 14,
  className,
}: {
  name: "play" | "pause" | "next" | "prev" | "vol" | "mute" | "up" | "down";
  size?: number;
  className?: string;
}) {
  const p: Record<string, React.ReactNode> = {
    play: <path d="M7.5 4.8 19 12 7.5 19.2z" fill="currentColor" stroke="none" />,
    pause: (
      <>
        <rect x="7.2" y="5.5" width="3.4" height="13" rx="1.1" fill="currentColor" stroke="none" />
        <rect x="13.4" y="5.5" width="3.4" height="13" rx="1.1" fill="currentColor" stroke="none" />
      </>
    ),
    next: (
      <>
        <path d="M6 5.6 14.6 12 6 18.4z" fill="currentColor" stroke="none" />
        <path d="M17.4 5.6v12.8" />
      </>
    ),
    prev: (
      <>
        <path d="M18 5.6 9.4 12 18 18.4z" fill="currentColor" stroke="none" />
        <path d="M6.6 5.6v12.8" />
      </>
    ),
    vol: (
      <>
        <path d="M4.5 9.4h3l4-3.4v12l-4-3.4h-3z" />
        <path d="M15.2 9.6a3.6 3.6 0 0 1 0 4.8M17.6 7a7 7 0 0 1 0 10" />
      </>
    ),
    mute: (
      <>
        <path d="M4.5 9.4h3l4-3.4v12l-4-3.4h-3z" />
        <path d="m15.4 9.8 4.6 4.6M20 9.8l-4.6 4.6" />
      </>
    ),
    up: <path d="m6.5 14.5 5.5-5.5 5.5 5.5" />,
    down: <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {p[name]}
    </svg>
  );
}

/* --- thanh seek: max/value ghi tay, không re-render --- */
function SeekBar({ onSeek }: { onSeek: (t: number) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const total = useRef<HTMLSpanElement>(null);
  const grabbing = useRef(false);

  useEffect(
    () =>
      onAudio((s) => {
        const input = ref.current;
        const d = s.duration || 0;
        if (input) {
          input.max = String(d);
          if (!grabbing.current) input.value = String(s.time);
          input.style.setProperty("--p", d ? String(s.time / d) : "0");
          input.setAttribute("aria-valuetext", `${fmt(s.time)} trên ${fmt(d)}`);
        }
        if (time.current) time.current.textContent = fmt(s.time);
        if (total.current) total.current.textContent = d ? fmt(d) : "0:00";
      }),
    [],
  );

  const read = (el: HTMLInputElement) => Number(el.value);

  return (
    <div className="music__seek">
      <span ref={time} className="music__time">
        0:00
      </span>
      <input
        ref={ref}
        type="range"
        min={0}
        max={0}
        step={0.5}
        defaultValue={0}
        className="music__range"
        aria-label="Vị trí phát"
        onPointerDown={() => (grabbing.current = true)}
        onPointerUp={(e) => {
          grabbing.current = false;
          onSeek(read(e.currentTarget));
        }}
        onKeyUp={(e) => onSeek(read(e.currentTarget))}
        onChange={(e) => {
          if (grabbing.current) return;
          onSeek(read(e.currentTarget));
        }}
      />
      <span ref={total} className="music__time music__time--total">
        0:00
      </span>
    </div>
  );
}

/* --- hàng bài trong playlist --- */
function TrackRow({
  track,
  index,
  active,
  playing,
  onPick,
}: {
  track: Track;
  index: number;
  active: boolean;
  playing: boolean;
  onPick: () => void;
}) {
  const bars = [0, 1, 2];
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        className="music__row"
        data-active={active || undefined}
        aria-current={active ? "true" : undefined}
      >
        <span className="music__row-idx" aria-hidden>
          {active && playing ? (
            <span className="music__bars" data-live>
              {bars.map((b) => (
                <i key={b} style={{ animationDelay: `${b * 0.14}s` }} />
              ))}
            </span>
          ) : (
            String(index + 1).padStart(2, "0")
          )}
        </span>
        <span className="music__row-meta">
          <span className="music__row-title">{track.title}</span>
          <span className="music__row-note">{track.note}</span>
        </span>
        <span className="music__row-dur" aria-hidden>
          {active ? "♪" : ""}
        </span>
      </button>
    </li>
  );
}

export function MusicPlayer() {
  const audio = useAudioEngine(playlist);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  const { track, playing, status, index, volume, muted, error, tracks } = audio;
  const idle = !playing && !open;

  /* Esc đóng panel */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* Bấm ra ngoài thì đóng — bỏ qua bấm trong chính panel/dock */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (!wrap.current?.contains(target)) setOpen(false);
    };
    // trễ một nhịp để chính cú bấm mở panel không đóng ngay lại
    const id = window.setTimeout(() => window.addEventListener("pointerdown", onDown), 0);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const pick = useCallback(
    (i: number) => {
      if (i === index) {
        if (!playing) void audio.play();
        return;
      }
      audio.goTo(i);
    },
    [audio, index, playing],
  );

  if (!tracks.length) return null;

  return (
    <div
      ref={wrap}
      className="music"
      data-state={open ? "open" : idle ? "idle" : "compact"}
      data-playing={playing || undefined}
    >
      <div className="music__panel" id="music-panel" inert={!open}>
        <header className="music__head">
          <div>
            <p className="music__eyebrow">now playing</p>
            <p className="music__count">
              {String(index + 1).padStart(2, "0")} / {String(tracks.length).padStart(2, "0")}
            </p>
          </div>
          <button
            type="button"
            className="music__icon-btn"
            onClick={() => setOpen(false)}
            aria-label={`Đóng trình phát (${MUSIC_HINTS.close})`}
          >
            <Glyph name="down" />
          </button>
        </header>

        <div className="music__now">
          <div className="music__disc" data-spin={playing || undefined}>
            <picture>
              <img src={track?.cover} alt="" width={56} height={56} />
            </picture>
            <i className="music__disc-hole" aria-hidden />
          </div>
          <div className="music__now-text">
            <p className="music__track">{track?.title}</p>
            <p className="music__artist">{track?.artist}</p>
          </div>
        </div>

        <AudioVisualizer active={open} />

        <SeekBar onSeek={audio.seek} />

        <div className="music__transport">
          <button
            type="button"
            className="music__icon-btn"
            onClick={audio.prev}
            aria-label={`Bài trước (${MUSIC_HINTS.prev})`}
          >
            <Glyph name="prev" />
          </button>
          <button
            type="button"
            className="music__play"
            onClick={audio.toggle}
            aria-label={playing ? "Tạm dừng" : "Phát"}
            aria-pressed={playing}
            data-busy={status === "loading" || undefined}
          >
            <Glyph name={playing ? "pause" : "play"} size={18} />
          </button>
          <button
            type="button"
            className="music__icon-btn"
            onClick={audio.next}
            aria-label={`Bài sau (${MUSIC_HINTS.next})`}
          >
            <Glyph name="next" />
          </button>

          <div className="music__vol">
            <button
              type="button"
              className="music__icon-btn"
              onClick={audio.toggleMute}
              aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
              aria-pressed={muted}
            >
              <Glyph name={muted || volume === 0 ? "mute" : "vol"} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => audio.setVolume(Number(e.currentTarget.value))}
              className="music__range music__range--vol"
              aria-label="Âm lượng"
              style={{ "--p": String(muted ? 0 : volume) } as React.CSSProperties}
            />
          </div>
        </div>

        <ol className="music__list" aria-label="Danh sách phát">
          {tracks.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              index={i}
              active={i === index}
              playing={playing}
              onPick={() => pick(i)}
            />
          ))}
        </ol>

        <footer className="music__foot">
          <p className="music__error" role="status" aria-live="polite">
            {error ?? (status === "loading" ? "đang tải…" : "âm thanh tổng hợp · nguồn nội bộ")}
          </p>
          <p className="music__keys">
            <kbd>{MUSIC_HINTS.toggle}</kbd> phát/dừng · <kbd>{MUSIC_HINTS.prev}</kbd>
            <kbd>{MUSIC_HINTS.next}</kbd> đổi bài
          </p>
        </footer>
      </div>

      <div className="music__dock">
        <button
          type="button"
          className="music__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="music-panel"
        >
          <span className="music__dock-art" data-spin={playing || undefined} aria-hidden>
            {track?.cover ? (
              <picture>
                <img src={track.cover} alt="" width={26} height={26} />
              </picture>
            ) : null}
            <span className="music__bars" data-live={playing || undefined}>
              <i />
              <i />
              <i />
            </span>
          </span>

          <span className="music__dock-text">
            <span className="music__dock-title">{open ? track?.title : "MUSIC"}</span>
            <span className="music__dock-sub">
              {playing ? `${track?.title} · ${track?.artist}` : "ambient · gõ để mở"}
            </span>
          </span>

          <span className="music__dock-chev" aria-hidden>
            <Glyph name={open ? "down" : "up"} size={13} />
          </span>
        </button>

        <button
          type="button"
          className="music__icon-btn music__dock-play"
          onClick={audio.toggle}
          aria-label={playing ? "Tạm dừng" : "Phát nhạc nền"}
          aria-pressed={playing}
        >
          <Glyph name={playing ? "pause" : "play"} size={15} />
        </button>
      </div>
    </div>
  );
}