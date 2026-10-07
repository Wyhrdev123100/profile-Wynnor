import Link from "next/link";
import type { Metadata } from "next";
import { navLinks, profile } from "@/data/profile";
import { Button } from "@/components/ui/button";

/* ==================================================================
   404 — không phải trang lỗi, là một ngõ cụt có kiểu dáng.
   Ngôn ngữ terminal: gõ sai lệnh rồi đưa người dùng về đúng chỗ.
   ================================================================== */

export const metadata: Metadata = {
  title: "404 — Trang không tồn tại",
  description:
    "Đường dẫn này không dẫn tới đâu cả. Quay lại trang chủ hoặc nhảy tới một section.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-[86svh] items-center py-24">
      <div className="shell w-full">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* ---- cột trái: con trỏ ---- */}
          <div className="lg:col-span-6">
            <p className="label">
              <span className="text-ember">404</span>
              <span className="text-muted-2">/</span>
              not found
            </p>
            <h1 className="display-xl mt-7">
              <span className="block">Ngõ cụt,</span>
              <span className="italic-serif ink-iris animate-iris block">
                nhưng bản đồ vẫn còn.
              </span>
            </h1>
            <p className="body-lg mt-6 max-w-md text-muted">
              Đường dẫn bạn gõ không tồn tại — có thể tôi đã đổi tên section,
              hoặc bạn rơi vào một liên kết cũ. Dưới đây là những chỗ còn đang
              mở.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button href="/" size="md" iconRight="arrow">
                Về trang chủ
              </Button>
              <Button href="/#contact" variant="quiet" size="md" icon="mail">
                Liên hệ
              </Button>
            </div>
          </div>

          {/* ---- cột phải: terminal ---- */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-line bg-surface/85 shadow-1 backdrop-blur-xl">
              <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
                <span aria-hidden className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-ember opacity-70" />
                  <span className="size-2 rounded-full bg-iris opacity-70" />
                  <span className="size-2 rounded-full bg-mint opacity-70" />
                </span>
                <span className="font-mono text-[11px] tracking-[0.06em] text-muted-2">
                  {profile.handle} — bash
                </span>
              </div>

              <div className="px-4 py-4 font-mono text-[12.5px] leading-[1.85] sm:text-[13px]">
                <p>
                  <Prompt />
                  <span className="text-muted-2">pwd</span>
                </p>
                <p className="text-fg-2">/this/page/does/not/exist</p>

                <p className="mt-2">
                  <Prompt />
                  <span className="text-muted-2">ls</span>
                </p>
                <p className="text-ember">
                  ls: cannot access &lsquo;.&rsquo;: No such file or directory
                </p>

                <p className="mt-2">
                  <Prompt />
                  <span className="text-muted-2">cd ~</span>
                </p>
                <p className="text-fg-2">
                  OK — đã về nhà. Đây là những nơi còn mở:
                </p>

                <ul className="mt-2 space-y-1">
                  {navLinks.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/#${l.id}`}
                        className="group inline-flex items-baseline gap-3 text-muted transition-colors hover:text-ice"
                      >
                        <span className="tnum text-[11px] text-muted-2">
                          {l.index}
                        </span>
                        <span className="underline decoration-line-2 underline-offset-4 transition-colors group-hover:decoration-ice">
                          {l.label}
                        </span>
                        <span className="text-[11px] text-muted-2">
                          {l.hint}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <p className="mt-3">
                  <span className="text-mint">qhvndev@profile</span>
                  <span className="text-muted-2">:</span>
                  <span className="text-ice">~</span>
                  <span className="text-muted-2">$ </span>
                  <span className="animate-caret ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[2px] bg-ice" />
                </p>
              </div>
            </div>

            <p className="body-sm mt-4 text-muted-2">
              Nếu bạn đến từ một liên kết cũ,{" "}
              <a
                href={`mailto:${profile.email}`}
                className="text-fg-2 underline decoration-line-2 underline-offset-4 transition-colors hover:text-ice"
              >
                báo lại cho tôi
              </a>{" "}
              — tôi sẽ sửa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** dấu nhắc `guest@profile:~$` */
function Prompt() {
  return (
    <>
      <span className="text-mint">qhvndev@profile</span>
      <span className="text-muted-2">:</span>
      <span className="text-ice">~</span>
      <span className="text-muted-2">$ </span>
    </>
  );
}
