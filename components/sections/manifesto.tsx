"use client";

import { manifesto } from "@/data/profile";
import { SectionShell } from "@/components/ui/primitives";
import { SectionHead } from "@/components/ui/section-head";
import { Reveal, SplitText } from "@/components/motion/reveal";
import { PointerSpotlight } from "@/components/motion/parallax";
import { Icon } from "@/components/icons";
import { TONE_TEXT, TONE_VAR } from "@/components/ui/primitives";

/* ==================================================================
   MANIFESTO
   ---------------------------------------------------------------
   Cột trái: tuyên ngôn đặt cỡ chữ lớn, có gạch chú kỹ thuật
              neo theo lề (đọc như một trang tạp chí).
   Cột phải: 4 nguyên tắc — số thứ tự lớn, viền mọc, sáng bám
              chuột khi rê.
   ================================================================== */

const MARKS = ["01 / Quan điểm", "02 / Thực hành", "03 / Tiêu chuẩn"];

export default function Manifesto() {
  return (
    <SectionShell id="manifesto">
      <SectionHead
        index="01"
        label="Manifesto"
        tone="iris"
        title="Tôi nghĩ gì về nghề này"
        description="Không phải lời tự trào chuyện dài — chỉ là những điều tôi thực sự tin, và cách tôi biến chúng thành sản phẩm."
        meta={
          <span className="label hidden sm:inline">
            {manifesto.paragraphs.length} đoạn · 4 nguyên tắc
          </span>
        }
      />

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        {/* ---------- Tuyên ngôn ---------- */}
        <div className="lg:col-span-7">
          <Reveal dir="up" blur>
            <p className="text-[clamp(1.35rem,2.55vw,1.95rem)] leading-[1.32] font-normal tracking-[-0.025em] text-fg text-balance">
              <SplitText lines={[{ text: manifesto.title }]} step={18} />
            </p>
          </Reveal>

          {/* các đoạn văn, chú thích neo theo lề trái */}
          <div className="mt-12 space-y-9 border-t border-line pt-10">
            {manifesto.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 110} dir="up">
                <div className="grid gap-3 sm:grid-cols-[8.5rem_1fr] sm:gap-6">
                  <p className="label pt-1 text-muted-2">{MARKS[i]}</p>
                  <p className="body-md text-fg-2">{p}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Chữ ký — chi tiết nhỏ, đắt */}
          <Reveal delay={260} dir="up">
            <div className="mt-12 flex items-end justify-between gap-6 border-t border-line pt-7">
              <div>
                <p className="italic-serif text-2xl text-muted">
                  Code tốt nhất là code mà
                  <br />
                  đội ngũ sau vẫn đọc được.
                </p>
                <p className="label mt-3">— {manifesto.principles[3].title}</p>
              </div>
              <span aria-hidden className="hidden shrink-0 sm:block">
                <svg viewBox="0 0 120 48" className="h-12 w-[7.5rem] text-muted-2" fill="none">
                  <path
                    d="M4 40c14-3 22-12 30-24 4-6 8-9 12-8 5 1 3 12 8 15 6 4 16 2 24-3 9-6 14-14 22-14 5 0 8 4 16 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
          </Reveal>
        </div>

        {/* ---------- Nguyên tắc ---------- */}
        <div className="lg:col-span-5 lg:pl-4">
          <ul className="border-t border-line">
            {manifesto.principles.map((p, i) => (
              <Reveal key={p.id} as="li" delay={i * 90} dir="up" className="border-b border-line">
                <PointerSpotlight
                  color={TONE_VAR[p.tone]}
                  intensity={0.13}
                  radius={360}
                  className="group/px px-4 py-6 transition-colors duration-300 -mx-4 sm:px-5 sm:-mx-5"
                >
                  <span aria-hidden className="iridescent-edge" />

                  <div className="flex items-start gap-4">
                    {/* số thứ tự lớn, mờ, dịch lên khi rê */}
                    <span
                      className={`tnum shrink-0 font-mono text-[2.1rem] leading-none font-medium tracking-[-0.04em] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/px:-translate-y-1 group-hover/px:opacity-100 ${TONE_TEXT[p.tone]} opacity-35`}
                    >
                      {p.index}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <Icon name={p.icon} size={15} className={TONE_TEXT[p.tone]} />
                        <h3 className="text-[15px] font-medium tracking-[-0.015em]">
                          {p.title}
                        </h3>
                      </div>
                      <p className="body-sm mt-2 text-muted">{p.body}</p>
                    </div>

                    <Icon
                      name="arrow"
                      size={15}
                      className="mt-1 shrink-0 text-muted-2 opacity-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/px:translate-x-0 group-hover/px:opacity-100 -translate-x-1.5"
                    />
                  </div>
                </PointerSpotlight>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={420} dir="up">
            <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-line bg-s2/60 px-4 py-3.5">
              <span className="label">Cam kết</span>
              <span className="flex items-center gap-2 text-[13px] text-fg-2">
                <Icon name="check" size={14} className="text-mint" />
                Lighthouse 90+ trên mọi trang
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}
