/* ==================================================================
   AUDIO BUS — đường duy nhất để "cả vũ trụ" nghe thấy nhạc.
   ------------------------------------------------------------------
   Engine đẩy biên độ vào đây mỗi frame khi đang phát. Từ đó:
     1. vài biến CSS trên <html>  → lớp nền/avatar phản ứng bằng CSS
     2. các subscriber (canvas)     → tự vẽ lại, KHÔNG re-render React
   Không có state ở đây: đây là bus, không phải store của UI.
   ================================================================== */

export type AudioSnapshot = {
  /** đang phát hay không */
  playing: boolean;
  /** biên độ tổng 0–1, đã làm trơn */
  level: number;
  /** 0–1, dải thấp */
  bass: number;
  /** 0–1, dải cao */
  treble: number;
  /** bao hình chậm 0–1 — dùng cho thứ chớp nhẹ (nebula, sao) */
  energy: number;
  /** giây đang phát — subscriber tự ghi vào DOM, không re-render */
  time: number;
  /** độ dài track (0 nếu chưa biết) */
  duration: number;
};

/** Mảng phổ tần — engine giữ sẵn buffer để không cấp phát lại mỗi frame */
let spectrum: Uint8Array<ArrayBuffer> | null = null;

export function setSpectrum(bins: Uint8Array<ArrayBuffer> | null): void {
  spectrum = bins;
}

export function getSpectrum(): Uint8Array<ArrayBuffer> | null {
  return spectrum;
}

type Listener = (s: AudioSnapshot) => void;

const snapshot: AudioSnapshot = {
  playing: false,
  level: 0,
  bass: 0,
  treble: 0,
  energy: 0,
  time: 0,
  duration: 0,
};

const listeners = new Set<Listener>();

/* Ghi biến CSS lên <html> làm style invalidation cho cả cây, nên chỉ
   làm ~20Hz: chậm hơn mắt thấy nhưng rẻ hơn nhiều lần ghi mỗi frame. */
let lastPaint = 0;

function paint(force = false) {
  const now = performance.now();
  if (!force && now - lastPaint < 50) return;
  lastPaint = now;

  const root = document.documentElement;
  const { level, bass, treble, energy } = snapshot;
  root.style.setProperty("--audio-level", level.toFixed(3));
  root.style.setProperty("--audio-bass", bass.toFixed(3));
  root.style.setProperty("--audio-treble", treble.toFixed(3));
  root.style.setProperty("--audio-energy", energy.toFixed(3));
  root.dataset.audio = snapshot.playing ? "playing" : "idle";
}

/** Đọc trạng thái hiện tại (không đăng ký theo dõi) */
export function audioSnapshot(): AudioSnapshot {
  return snapshot;
}

/** Đăng ký theo dõi. Gọi ngay 1 lần với giá trị hiện tại. */
export function onAudio(listener: Listener): () => void {
  listeners.add(listener);
  listener(snapshot);
  return () => {
    listeners.delete(listener);
  };
}

/** Engine gọi mỗi frame khi phát */
export function publishAudio(next: Partial<AudioSnapshot>): void {
  let changed = false;
  let discrete = false;
  for (const key of Object.keys(next) as (keyof AudioSnapshot)[]) {
    const v = next[key];
    if (v === undefined || snapshot[key] === v) continue;
    snapshot[key] = v as never;
    changed = true;
    if (key === "playing") discrete = true;
  }
  if (!changed) return;
  paint(discrete);
  for (const listener of listeners) listener(snapshot);
}

/** Khi component unmount mà engine còn sống — không gọi, chỉ để dọn dẹp */
export function resetAudio(): void {
  publishAudio({ playing: false, level: 0, bass: 0, treble: 0, energy: 0 });
}