# Thư mục nhạc nền

Ba file `.mp3` ở đây là **ambient tổng hợp** (drone + LFO chậm, không có bản
ghi hay bản nhạc có bản quyền), sinh bằng ffmpeg để trang có nhạc thật mà
không phải commit tài nguyên lớn. Mỗi file ~400KB, mono 64kbps, **chỉ tải về
khi người dùng bấm play** — không ảnh hưởng tốc độ tải trang.

| File | Nội dung |
| --- | --- |
| `track-01-drift-field.mp3` | drone 55–165Hz, chậm, "rộng không gian" |
| `track-02-orbital-drift.mp3` | tầng trung 110–330Hz, rung nhẹ |
| `track-03-data-stream.mp3` | shimmer 220–660Hz, có nhịp "gói dữ liệu" |

Ảnh bìa là SVG tự vẽ (`.svg`) — sắc nét mọi DPI, vài KB, không request thêm.

## Đổi sang nhạc của bạn

1. Bỏ file `.mp3`/`.m4a`/`.ogg` vào `public/music/`.
2. Bỏ ảnh bìa vào cùng thư mục (SVG hoặc WebP).
3. Sửa danh sách trong [`data/music.ts`](../../data/music.ts):

```ts
{
  title: "Tên bài",
  artist: "Tên nghệ sĩ",
  src: "/music/ten-bai.mp3",   // đường dẫn trong public/
  cover: "/music/ten-bai.svg",
}
```

`src` cũng nhận URL tuyệt đối (CDN, S3…) nếu bạn không muốn để file trong repo.

## Quy tắc giữ nhẹ

- Ưu tiên file < 8MB mỗi bài; loop ngắn 30–90s nghe không mệt.
- Không tự phát khi vào trang — trình duyệt chặn autoplay có tiếng, và người
  dùng cũng không muốn bị bật nhạc ngoài ý muốn. Player chỉ chạy sau khi bấm.
- Toàn bộ xử lý audio nằm ở client: không API key, không gửi tên bài đi đâu.