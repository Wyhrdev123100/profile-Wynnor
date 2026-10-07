import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Host được phép truy cập dev server.
 *
 * Mặc định Next chỉ nhận `localhost` / `127.0.0.1`. Mở trang qua domain
 * preview hay tunnel (Replit, ngrok, Cloudflare…) thì các file `/_next/*`
 * bị chặn và console in "Cross origin request detected".
 *
 * Lưu ý về cú pháp: pattern so khớp theo từng đoạn của hostname.
 * `*.replit.dev` chỉ khớp `abc.replit.dev`, KHÔNG khớp `abc.pike.replit.dev`;
 * muốn ăn sâu bao nhiêu tầng thì dùng `**` ở đúng chỗ đó.
 *
 * Cũng lưu ý: chỉ cần khai báo `allowedDevOrigins` là origin lạ chuyển từ
 * "chỉ cảnh báo" sang "chặn hẳn" (403), nên danh sách phải đúng với
 * hostname thật của bạn.
 */
const allowedDevOrigins = [
  "localhost",
  "127.0.0.1",
  "*.pike.replit.dev", // preview domain của Replit
  "**.replit.dev", // mọi subdomain của replit.dev, sâu bao nhiêu tầng
  "**.repl.co", // Replit domain cũ
  "**.ngrok-free.app",
  "**.ngrok.io",
  "**.trycloudflare.com",
  "**.localhost",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: dir,
  allowedDevOrigins,
};

export default nextConfig;
