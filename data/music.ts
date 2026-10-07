/* ==================================================================
   NHẠC NỀN — cấu hình player
   ------------------------------------------------------------------
   Chỉ sửa file này để đổi bài. Không có API key, không gọi mạng:
   `src` là đường dẫn trong /public hoặc URL tuyệt đối (CDN).

   Vài nguyên tắc giữ cho phần này:
   - Không tự phát. Player chỉ chạy sau khi người dùng bấm.
   - File nhỏ. Mỗi bài dưới ~400KB là thoải mái; loop 30–90s nghe
     không mệt và không tốn băng thông.
   - Ảnh bìa nên là SVG hoặc WebP để không phát sinh request nặng.
   ================================================================== */

export type Track = {
  id: string;
  title: string;
  /** Tên hiển thị trên dòng phụ */
  artist: string;
  /** Đường dẫn trong /public, hoặc URL tuyệt đối */
  src: string;
  cover?: string;
  /** Ghi chú một dòng, hiện ở chân panel */
  note?: string;
};

export const playlist = [
  {
    id: "Giày Cao Gót Màu Đỏ",
    title: "Ẩn Danh",
    artist: "PROFILE.SYS",
    src: "/music/gcgmd.mp3",
    cover: "/music/cover-01-drift-field.svg",
    note: "drone 55–165Hz · chậm, sâu",
  },
  {
    id: "Ghé Qua",
    title: "Dick x PC x Tofu",
    artist: "PROFILE.SYS",
    src: "/music/gq.mp3",
    cover: "/music/cover-02-orbital-drift.svg",
    note: "tầng trung · rung nhẹ",
  },
] satisfies readonly Track[];

/** Mặc định khi vào trang: toàn nhỏ vừa đủ, không làm giật mình người đọc */
export const MUSIC_DEFAULTS = {
  volume: 0.55,
  /** thanh seek dùng giá trị này khi chưa biết duration */
  seekStep: 5,
  /** số bin của FFT đưa vào visualizer */
  fftSize: 128,
  /** khoá localStorage */
  store: "qhvn:music",
} as const;

/** Nhãn hiện trong panel + phím tắt (mô tả cho người dùng) */
export const MUSIC_HINTS = {
  toggle: "M",
  next: "]",
  prev: "[",
  close: "Esc",
} as const;
