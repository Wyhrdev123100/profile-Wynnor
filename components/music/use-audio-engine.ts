"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MUSIC_DEFAULTS, type Track } from "@/data/music";
import { publishAudio, setSpectrum } from "@/components/music/audio-bus";
import { on as onBus } from "@/lib/bus";

/* ==================================================================
   USE AUDIO ENGINE
   ------------------------------------------------------------------
   Một <audio> tạo bằng JS (không nằm trong cây DOM → không dính
   layout, không bị preloader nhặt mất). Đồ thị Web Audio chỉ được
   dựng ĐÚNG MỘT LẦN, lúc người dùng bấm phát — vừa đúng luật
   autoplay, vừa không tốn tài nguyên khi chưa ai nghe.

   Phân tách trạng thái:
   - rời rạc (đang phát, bài nào, volume) → React state
   - liên tục (biên độ, thời gian) → audio-bus, subscriber tự ghi
     vào DOM. Không có setState nào trong vòng lặp frame.
   ================================================================== */

export type AudioStatus = "idle" | "loading" | "playing" | "paused" | "error";

type Store = { volume: number; trackId: string | null };

function readStore(): Store {
  const fallback: Store = { volume: MUSIC_DEFAULTS.volume as number, trackId: null };
  try {
    const raw = localStorage.getItem(MUSIC_DEFAULTS.store);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      // 0 hợp lệ: người dùng đã kéo hết cỡ → coi như đang tắt tiếng
      volume:
        typeof parsed.volume === "number" && parsed.volume >= 0 && parsed.volume <= 1
          ? parsed.volume
          : fallback.volume,
      trackId: typeof parsed.trackId === "string" ? parsed.trackId : null,
    };
  } catch {
    return fallback;
  }
}

function writeStore(store: Store) {
  try {
    localStorage.setItem(MUSIC_DEFAULTS.store, JSON.stringify(store));
  } catch {
    /* private mode — không sao, chỉ mất nhớ */
  }
}

/** Ngữ cảnh chỉ tồn tại sau một cú bấm, nên bọc mọi thứ có thể ném lỗi */
type Ctx = AudioContext & { __qhvn?: true };

function createCtx(): Ctx | null {
  const Impl =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Impl) return null;
  try {
    return new Impl() as Ctx;
  } catch {
    return null;
  }
}

export function useAudioEngine(tracks: readonly Track[]) {
  const list = useMemo(() => tracks.filter((t) => Boolean(t.src)), [tracks]);

  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [volume, setVolume] = useState<number>(MUSIC_DEFAULTS.volume);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audio = useRef<HTMLAudioElement | null>(null);
  const ctx = useRef<Ctx | null>(null);
  const gain = useRef<GainNode | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const bins = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const raf = useRef(0);
  const smoothed = useRef({ level: 0, bass: 0, treble: 0, energy: 0 });

  /* các giá trị cần đọc trong callback cũ mà không làm callback đó
     phụ thuộc lại vào state (tránh effect chạy lại vô nghĩa) */
  const live = useRef({ index: 0, volume: MUSIC_DEFAULTS.volume as number, muted: false });
  live.current = { index, volume, muted };

  const track = list[index] ?? list[0] ?? null;

  /* ----------------------------------------------------------------
     Tiện ích phẳng (không phụ thuộc state → khai báo trước để effect
     và callback dùng được ngay)
     ---------------------------------------------------------------- */
  const applyGain = useCallback(() => {
    const g = gain.current;
    const el = audio.current;
    const { volume: v, muted: m } = live.current;
    if (g) {
      g.gain.value = m ? 0 : v;
      return;
    }
    if (el) el.volume = m ? 0 : v;
  }, []);

  const stopLoop = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
  }, []);

  /* ----------------------------------------------------------------
     Đồ thị âm thanh — dựng một lần, sau cú bấm đầu tiên
     ---------------------------------------------------------------- */
  const ensureGraph = useCallback(() => {
    const el = audio.current;
    if (!el) return false;

    if (ctx.current) {
      if (ctx.current.state === "suspended") void ctx.current.resume();
      return true;
    }

    const c = createCtx();
    if (!c) return false;

    try {
      const source = c.createMediaElementSource(el);
      const g = c.createGain();
      const an = c.createAnalyser();
      an.fftSize = MUSIC_DEFAULTS.fftSize;
      an.smoothingTimeConstant = 0.78;
      source.connect(g);
      g.connect(an);
      an.connect(c.destination);
      ctx.current = c;
      gain.current = g;
      analyser.current = an;
      bins.current = new Uint8Array(an.frequencyBinCount);
      setSpectrum(bins.current);
      applyGain();
      return true;
    } catch {
      // Không dựng được đồ thị → vẫn nghe được bằng cách đặt volume
      // trực tiếp trên element, chỉ mất visualizer.
      return false;
    }
  }, [applyGain]);

  /* ----------------------------------------------------------------
     Dừng trọn vẹn dấu vết âm thanh — pause/lỗi/unmount đều dùng.
     Không làm vậy thì visualizer đứng hình ở frame cuối và glow
     vẫn sáng sau khi đã tắt nhạc.
     ---------------------------------------------------------------- */
  const quiesce = useCallback(() => {
    stopLoop();
    const s = smoothed.current;
    s.level = 0;
    s.bass = 0;
    s.treble = 0;
    s.energy = 0;
    bins.current?.fill(0);
    publishAudio({ playing: false, level: 0, bass: 0, treble: 0, energy: 0 });
  }, [stopLoop]);

  /* ----------------------------------------------------------------
     Vòng lặp frame — chỉ chạy khi đang phát.
     Khai báo trước effect khởi tạo vì onPlaying cần hẹn frame đầu.
     Chỉ đọc ref nên useCallback([]) là ổn định suốt vòng đời.
     ---------------------------------------------------------------- */
  const tick = useCallback(() => {
    raf.current = 0;
    const el = audio.current;
    if (!el || el.paused) return;

    let level = 0;
    let bass = 0;
    let treble = 0;

    const an = analyser.current;
    const data = bins.current;
    if (an && data) {
      an.getByteFrequencyData(data);
      const n = data.length;
      const lowEnd = Math.max(2, Math.floor(n * 0.16));
      const highStart = Math.floor(n * 0.55);
      let sum = 0;
      let lowSum = 0;
      let highSum = 0;
      for (let i = 0; i < n; i += 1) {
        const v = data[i] / 255;
        sum += v;
        if (i < lowEnd) lowSum += v;
        if (i >= highStart) highSum += v;
      }
      level = sum / n;
      bass = lowSum / lowEnd;
      treble = highSum / Math.max(1, n - highStart);
    }

    // làm trơn để không nhảy giật; đồng thời giữ biên độ ở mức rất thấp
    const s = smoothed.current;
    s.level += (level - s.level) * 0.18;
    s.bass += (bass - s.bass) * 0.2;
    s.treble += (treble - s.treble) * 0.2;
    s.energy += (Math.min(1, s.level * 2.2) - s.energy) * 0.045;

    publishAudio({
      playing: true,
      level: s.level,
      bass: s.bass,
      treble: s.treble,
      energy: s.energy,
      time: el.currentTime,
      duration: Number.isFinite(el.duration) ? el.duration : 0,
    });

    raf.current = requestAnimationFrame(tick);
  }, []);

  /* ----------------------------------------------------------------
     Khởi tạo: tạo element + đọc lại lựa chọn đã lưu
     ---------------------------------------------------------------- */
  useEffect(() => {
    if (!list.length) return;

    const saved = readStore();
    const found = saved.trackId ? list.findIndex((t) => t.id === saved.trackId) : -1;
    const start = found >= 0 ? found : 0;

    const el = new Audio();
    el.preload = "none";
    el.loop = true;
    el.volume = 1; // âm lượng do GainNode đảm nhiệm khi có AudioContext
    el.src = list[start].src;
    el.dataset.src = list[start].src;
    audio.current = el;
    live.current.index = start;

    setIndex(start);
    setVolume(saved.volume);
    setMuted(saved.volume === 0);
    live.current.volume = saved.volume;
    live.current.muted = saved.volume === 0;
    applyGain(); // chưa có AudioContext → đặt thẳng el.volume theo lựa chọn đã lưu

    const onEnded = () => setStatus("paused");
    const onError = () => {
      setStatus("error");
      setError("Không tải được tệp nhạc");
      quiesce();
    };
    const onPlaying = () => {
      setStatus("playing");
      // chỉ giữ một vòng lặp: tick tự hẹn frame kế tiếp
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setStatus((s) => (s === "error" ? s : "paused"));
      quiesce();
    };
    const onLoaded = () => {
      publishAudio({ duration: Number.isFinite(el.duration) ? el.duration : 0 });
    };

    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);
    el.addEventListener("playing", onPlaying);
    el.addEventListener("pause", onPause);
    el.addEventListener("loadedmetadata", onLoaded);

    publishAudio({ duration: Number.isFinite(el.duration) ? el.duration : 0, time: 0 });

    return () => {
      quiesce();
      el.pause();
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("loadedmetadata", onLoaded);
      el.src = "";
      audio.current = null;
      ctx.current?.close().catch(() => {});
      ctx.current = null;
      gain.current = null;
      analyser.current = null;
      bins.current = null;
      setSpectrum(null);
      publishAudio({ time: 0, duration: 0 });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, quiesce, tick]);

  /* ----------------------------------------------------------------
     Điều khiển
     ---------------------------------------------------------------- */
  const load = useCallback(
    (next: number) => {
      const el = audio.current;
      if (!el) return;
      const t = list[next];
      if (!t) return;
      if (el.dataset.src !== t.src) {
        el.dataset.src = t.src;
        el.src = t.src;
        el.load();
      }
      publishAudio({ time: 0, duration: 0 });
    },
    [list],
  );

  const play = useCallback(async () => {
    const el = audio.current;
    if (!el) return;
    setError(null);
    setStatus("loading");
    ensureGraph();
    // nếu không dựng được AudioContext thì applyGain đặt thẳng el.volume
    applyGain();
    try {
      await el.play();
    } catch {
      setStatus("paused");
      setError("Trình duyệt chặn phát tự động — bấm phát một lần nữa");
      quiesce();
    }
  }, [applyGain, ensureGraph, quiesce]);

  const pause = useCallback(() => {
    audio.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) void play();
    else pause();
  }, [pause, play]);

  const goTo = useCallback(
    (next: number) => {
      if (!list.length) return;
      const wrapped = (next + list.length) % list.length;
      setIndex(wrapped);
      live.current.index = wrapped;
      setError(null);
      load(wrapped);
      const id = list[wrapped].id;
      writeStore({ volume: live.current.volume, trackId: id });
      const el = audio.current;
      if (el && !el.paused) void play();
      else if (el) {
        // người dùng chưa mở nhạc: chỉ chọn bài, không tự phát
        publishAudio({ time: 0 });
      }
    },
    [list, load, play],
  );

  const next = useCallback(() => goTo(live.current.index + 1), [goTo]);
  const prev = useCallback(() => {
    // giữa track thì lùi về đầu track, đúng như mọi trình phát
    const el = audio.current;
    if (el && el.currentTime > 3) {
      el.currentTime = 0;
      publishAudio({ time: 0 });
      return;
    }
    goTo(live.current.index - 1);
  }, [goTo]);

  const seek = useCallback((to: number) => {
    const el = audio.current;
    if (!el || !Number.isFinite(el.duration)) return;
    el.currentTime = Math.min(Math.max(0, to), el.duration);
    publishAudio({ time: el.currentTime });
  }, []);

  const setVolumeLevel = useCallback(
    (v: number) => {
      const clamped = Math.min(1, Math.max(0, v));
      setVolume(clamped);
      live.current = { ...live.current, volume: clamped, muted: clamped === 0 };
      applyGain();
      writeStore({ volume: clamped, trackId: list[live.current.index]?.id ?? null });
      setMuted(clamped === 0);
    },
    [applyGain, list],
  );

  const toggleMute = useCallback(() => {
    const nextMuted = !live.current.muted;
    setMuted(nextMuted);
    live.current = { ...live.current, muted: nextMuted };
    applyGain();
  }, [applyGain]);

  /* ----------------------------------------------------------------
     Media Session — khoá màn hình trên di động có điều khiển nhạc
     ---------------------------------------------------------------- */
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator) || !track) return;
    const session = navigator.mediaSession;
    session.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: "PROFILE.SYS — ambient",
      artwork: track.cover ? [{ src: track.cover, sizes: "320x320", type: "image/svg+xml" }] : [],
    });
    try {
      session.setActionHandler("play", () => void play());
      session.setActionHandler("pause", pause);
      session.setActionHandler("nexttrack", next);
      session.setActionHandler("previoustrack", prev);
    } catch {
      /* vài trình duyệt chỉ hỗ trợ một phần action */
    }
    return () => {
      try {
        session.setActionHandler("play", null);
        session.setActionHandler("pause", null);
        session.setActionHandler("nexttrack", null);
        session.setActionHandler("previoustrack", null);
      } catch {
        /* bỏ qua */
      }
    };
  }, [track, play, pause, next, prev]);

  /* ----------------------------------------------------------------
     Phím tắt toàn trang
     ---------------------------------------------------------------- */
  useEffect(() => {
    if (!list.length) return;
    const typing = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        node.isContentEditable === true
      );
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (typing(e.target)) return;
      const k = e.key.toLowerCase();
      if (k === "m") {
        e.preventDefault();
        toggle();
      } else if (k === "]") {
        e.preventDefault();
        next();
      } else if (k === "[") {
        e.preventDefault();
        prev();
      }
    };

    window.addEventListener("keydown", onKey);
    const off = onBus("music:toggle", () => toggle());
    return () => {
      window.removeEventListener("keydown", onKey);
      off();
    };
  }, [list.length, next, prev, toggle]);

  return {
    tracks: list,
    track,
    index,
    status,
    error,
    volume,
    muted,
    playing: status === "playing",
    toggle,
    play,
    pause,
    next,
    prev,
    goTo,
    seek,
    setVolume: setVolumeLevel,
    toggleMute,
  };
}

export type AudioEngine = ReturnType<typeof useAudioEngine>;