"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { activityGrid, capability, consoleData, profile, work } from "@/data/profile";
import { SectionShell } from "@/components/ui/primitives";
import { SectionHead } from "@/components/ui/section-head";
import { Reveal } from "@/components/motion/reveal";
import { Icon } from "@/components/icons";
import { useInView, useReducedMotion } from "@/components/motion/hooks";
import { Counter } from "@/components/motion/counter";

/* ==================================================================
   CONSOLE — hai tầng kỹ thuật của trang.
   ---------------------------------------------------------------
   1. Terminal thật: gõ lệnh, nhận câu trả lời. Không phải ảnh chụp
      màn hình, cũng không phải video — nó chạy được bằng bàn phím.
   2. Nhịp code: lưới 26 tuần. Dữ liệu hiện là minh hoạ và được
      ghi rõ ngay trên panel — không giả vờ là số liệu thật.
   ================================================================== */

type Line =
  | { kind: "out"; text: string }
  | { kind: "dim"; text: string }
  | { kind: "err"; text: string }
  | { kind: "cmd"; text: string };

export default function Console() {
  const reduced = useReducedMotion();

  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [typed, setTyped] = useState("");

  const termRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  /* Kịch bản mở đầu chạy đúng một lần, lần đầu lọt vào khung nhìn */
  const booted = useRef(false);
  useInView(termRef, () => {
    if (booted.current) return;
    booted.current = true;
    boot();
  });

  /* Dọn toàn bộ timer khi unmount */
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    [],
  );

  /* Luôn cuộn xuống đáy khi có dòng mới */
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [lines, typed]);

  const push = useCallback((line: Line, delay: number) => {
    const id = window.setTimeout(() => {
      setLines((prev) => [...prev, line]);
    }, delay);
    timers.current.push(id);
  }, []);

  /** in một loạt dòng, lệch nhịp nhẹ cho giống người gõ */
  function emit(out: Line[], step = 55) {
    out.forEach((line, i) => push(line, step * i));
    return out.length * step;
  }

  function boot() {
    const boot = consoleData.boot.map((text) => ({ kind: "dim", text }) as Line);
    if (reduced) {
      setLines(boot);
      return;
    }
    const done = emit(boot, 90);
    timers.current.push(window.setTimeout(() => run("whoami", true), done + 240));
  }

  /** tra cứu lệnh gần nhất — dùng để gợi ý khi người dùng gõ sai */
  function suggest(raw: string) {
    let best: string | null = null;
    let score = Infinity;
    for (const c of consoleData.commands) {
      for (const t of c.tokens) {
        const d = distance(raw, t);
        if (d < score) {
          score = d;
          best = t;
        }
      }
    }
    return score <= Math.max(1, Math.floor(raw.length / 3)) ? best : null;
  }

  /** sinh câu trả lời cho một lệnh */
  function answer(cmd: string): Line[] {
    const key = cmd.trim().toLowerCase();

    if (key === "help") {
      return [
        { kind: "out", text: "Lệnh khả dụng:" },
        ...consoleData.commands.map((c) => ({
          kind: "out" as const,
          text: `  ${c.cmd.padEnd(10)} ${c.about}`,
        })),
        { kind: "dim", text: "Mẹo: dùng ↑ ↓ để gọi lại lệnh đã chạy." },
      ];
    }

    if (key === "whoami" || key === "about") {
      return [
        { kind: "out", text: `${profile.name} — ${profile.role}` },
        { kind: "out", text: `${profile.location} · múi giờ ${profile.timezoneLabel}` },
        { kind: "out", text: profile.tagline },
        { kind: "dim", text: `Trạng thái: ${profile.availability} (${profile.availabilityDetail})` },
      ];
    }

    if (key === "stack" || key === "skills") {
      const line = capability.stack.join(" · ");
      return [
        { kind: "out", text: `Dùng hàng ngày (${capability.stack.length}):` },
        { kind: "out", text: line },
        {
          kind: "dim",
          text: capability.domains
            .map((d) => `${d.name} ${d.level}%`)
            .join("  ·  "),
        },
      ];
    }

    if (key === "projects" || key === "work") {
      return [
        { kind: "out", text: `${work.items.length} dự án nổi bật:` },
        ...work.items.map((p) => ({
          kind: "out" as const,
          text: `  ${p.year}  ${p.name.padEnd(16)} ${p.tags.join(", ")}`,
        })),
        { kind: "dim", text: "Xem chi tiết ở section #05 — Work." },
      ];
    }

    if (key === "contact" || key === "email") {
      return [
        { kind: "out", text: `Email: ${profile.email} (trả lời trong ${profile.responseTime})` },
        ...profile.socials.map((s) => ({ kind: "out" as const, text: `${s.label}: ${s.href}` })),
        { kind: "dim", text: "Hoặc dùng biểu mẫu ở cuối trang — cũng nhanh." },
      ];
    }

    const guess = suggest(key);
    return [
      { kind: "err", text: `command not found: ${key}` },
      guess
        ? { kind: "dim", text: `Ý bạn là "${guess}"?` }
        : { kind: "dim", text: 'Gõ "help" để xem danh sách lệnh.' },
    ];
  }

  /** chạy một lệnh (từ kịch bản hoặc từ ô nhập) */
  function run(raw: string, silent = false) {
    const key = raw.trim().toLowerCase();

    if (key === "clear") {
      setLines([]);
      setTyped("");
      return;
    }

    if (!silent) {
      setHistory((h) => [raw, ...h].slice(0, 20));
      setHIndex(-1);
      setBusy(true);
    }

    /* gõ dần ký tự để có nhịp máy đang "gõ", không phải chữ bật ra */
    if (reduced) {
      setTyped("");
      if (!silent) setBusy(false);
      setLines((prev) => [...prev, { kind: "cmd", text: raw }, ...answer(raw)]);
      return;
    }

    let i = 0;
    const tick = () => {
      i += 1;
      setTyped(raw.slice(0, i));
      if (i < raw.length) {
        timers.current.push(window.setTimeout(tick, 42));
        return;
      }
      setTyped("");
      const span = emit([{ kind: "cmd", text: raw }, ...answer(raw)], silent ? 30 : 45);
      if (!silent) {
        timers.current.push(window.setTimeout(() => setBusy(false), span));
      }
    };
    tick();
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    run(input);
    setInput("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(history.length - 1, hIndex + 1);
      if (next >= 0) {
        setHIndex(next);
        setInput(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = hIndex - 1;
      setHIndex(next);
      setInput(next >= 0 ? history[next] : "");
    } else if (e.key === "Escape") {
      /* bỏ con trỏ khỏi ô nhập, trang cuộn lại bình thường */
      e.currentTarget.blur();
    }
  }

  /* Khi bấm vào vùng terminal thì đưa con trỏ vào ô nhập */
  const focusInput = () => {
    if (!busy) inputRef.current?.focus();
  };

  return (
    <SectionShell id="console">
      <SectionHead
        index="06"
        label="Console"
        tone="mint"
        title="Hỏi trực tiếp, nhận câu trả lời thật"
        description="Một terminal chạy trong trang. Gõ lệnh như đang dùng máy thật — hoặc bấm vào một lệnh gợi ý để chạy thử."
        meta={
          <span className="label hidden sm:inline">
            {consoleData.commands.length} lệnh · không cần server
          </span>
        }
      />

      <div className="grid gap-5 lg:grid-cols-12">
        {/* ================= TERMINAL ================= */}
        <Reveal dir="up" className="lg:col-span-7">
          <div
            ref={termRef}
            onClick={focusInput}
            className="group/term flex h-full cursor-text flex-col overflow-hidden rounded-2xl border border-line bg-surface/85 shadow-1 backdrop-blur-xl"
          >
            {/* Thanh tiêu đề cửa sổ */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-2.5">
              <span aria-hidden className="flex items-center gap-1.5">
                <Dot tone="var(--ember)" />
                <Dot tone="var(--iris)" />
                <Dot tone="var(--mint)" />
              </span>
              <span className="truncate font-mono text-[11px] tracking-[0.06em] text-muted-2">
                {profile.handle} — bash
              </span>
              <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-muted-2 uppercase">
                <Icon name="terminal" size={12} />
                tty0
              </span>
            </div>

            {/* Màn hình */}
            <div
              ref={scroller}
              className="min-h-[19rem] flex-1 overflow-y-auto overscroll-contain px-4 py-4 font-mono text-[12.5px] leading-[1.75] sm:text-[13px]"
            >
              {lines.map((l, i) => (
                <p key={i} className={toneClass(l)}>
                  {l.kind === "cmd" ? (
                    <>
                      <span className="text-mint">guest@profile</span>
                      <span className="text-muted-2">:</span>
                      <span className="text-ice">~</span>
                      <span className="text-muted-2">$ </span>
                      {l.text}
                    </>
                  ) : (
                    l.text
                  )}
                </p>
              ))}

              {/* dòng đang gõ */}
              {busy ? (
                <p>
                  <span className="text-mint">guest@profile</span>
                  <span className="text-muted-2">:</span>
                  <span className="text-ice">~</span>
                  <span className="text-muted-2">$ </span>
                  {typed}
                  <span className="animate-caret ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[2px] bg-ice" />
                </p>
              ) : null}

              {/* con trỏ nhấp nháy ở dòng lệnh */}
              {!busy ? (
                <p>
                  <label htmlFor="console-input" className="sr-only">
                    Nhập lệnh cho console
                  </label>
                  <span aria-hidden className="text-mint">
                    guest@profile
                  </span>
                  <span aria-hidden className="text-muted-2">
                    :
                  </span>
                  <span aria-hidden className="text-ice">
                    ~
                  </span>
                  <span aria-hidden className="text-muted-2">
                    {" $ "}
                  </span>
                  <input
                    id="console-input"
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    onSubmit={onSubmit}
                    form="console-form"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-describedby="console-hint"
                    className="w-[min(18rem,55vw)] border-0 bg-transparent font-mono text-[12.5px] text-fg caret-transparent outline-none placeholder:text-muted-2 sm:text-[13px]"
                    placeholder="gõ help"
                  />
                  <span
                    aria-hidden
                    className="animate-caret ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[2px] bg-ice"
                  />
                </p>
              ) : null}
            </div>

            {/* Gợi ý lệnh + hint bàn phím */}
            <div className="shrink-0 border-t border-line px-4 py-3">
              <form id="console-form" onSubmit={onSubmit} className="hidden">
                <button type="submit">Chạy lệnh</button>
              </form>
              <ul className="flex flex-wrap gap-1.5">
                {consoleData.commands.map((c) => (
                  <li key={c.cmd}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInput("");
                        if (!busy) run(c.cmd);
                      }}
                      title={c.about}
                      className="rounded-md border border-line bg-s2 px-2 py-[3px] font-mono text-[11px] text-muted transition-[color,border-color,background-color,transform] duration-200 hover:border-mint/40 hover:bg-mint/10 hover:text-mint active:scale-95"
                    >
                      {c.cmd}
                    </button>
                  </li>
                ))}
              </ul>
              <p id="console-hint" className="label mt-2.5">
                ↑ ↓ lịch sử · Esc bỏ qua · con trỏ đã ẩn, gõ vẫn hiện
              </p>
            </div>
          </div>
        </Reveal>

        {/* ================= NHỊP CODE ================= */}
        <Reveal dir="up" delay={120} className="lg:col-span-5">
          <div className="flex h-full flex-col gap-5">
            <ActivityPanel />

            {/* ghi chú trung thực về nguồn số liệu */}
            <div className="rounded-2xl border border-line bg-s2/50 px-5 py-4">
              <p className="label">
                <Icon name="shield" size={12} className="mr-1.5 inline align-[-1px]" />
                Nguồn số liệu
              </p>
              <p className="body-sm mt-2 text-muted">
                {consoleData.activity.source}. Muốn số thật thì nối GitHub GraphQL — chỗ cần
                thay nằm ngay trong <code className="font-mono text-fg-2">data/profile.ts</code>.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------
   Dot — nút cửa sổ
   ------------------------------------------------------------------ */
function Dot({ tone }: { tone: string }) {
  return (
    <span
      aria-hidden
      className="size-2 rounded-full opacity-70"
      style={{ background: tone }}
    />
  );
}

/** khoảng cách Levenshtein — chỉ đủ dùng cho gợi ý lệnh */
function distance(a: string, b: string) {
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i += 1) {
    const cur = [i, ...new Array<number>(n).fill(0)];
    for (let j = 1; j <= n; j += 1) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[n];
}

function toneClass(l: Line) {
  if (l.kind === "out") return "text-fg-2 break-words";
  if (l.kind === "dim") return "text-muted-2 break-words";
  if (l.kind === "err") return "text-ember break-words";
  if (l.kind === "cmd") return "text-fg break-words";
  return "text-fg-2";
}

/* ------------------------------------------------------------------
   ACTIVITY PANEL — lưới 26 tuần + vài con số
   ------------------------------------------------------------------ */
function ActivityPanel() {
  const reduced = useReducedMotion();
  const { year, total, best, streak, weeks } = consoleData.activity;

  const cells = activityGrid.flatMap((week, w) =>
    week.map((level, d) => ({ w, d, level, key: `${w}-${d}` })),
  );

  return (
    <div className="flex-1 rounded-2xl border border-line bg-s2/50 p-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="label">
          Nhịp code · {year}
        </p>
        <p className="label tnum">{weeks} tuần</p>
      </div>

      {/* ô tổng */}
      <p className="mt-4 flex items-baseline gap-2">
        <Counter
          value={total}
          className="font-mono text-[clamp(2rem,5vw,2.75rem)] leading-none font-medium tracking-[-0.03em]"
        />
        <span className="text-[13px] text-muted">đóng góp</span>
      </p>

      {/* lưới */}
      <div
        className="mt-5 overflow-x-auto pb-1"
        role="img"
        aria-label={`Lưới hoạt động ${weeks} tuần, tổng ${total} đóng góp. Dữ liệu minh hoạ.`}
      >
        <div
          className="grid w-max grid-flow-col grid-rows-7 gap-[3px]"
          style={{ gridAutoColumns: `${reduced ? 10 : 11}px` }}
        >
          {cells.map((c) => (
            <span
              key={c.key}
              title={`Tuần ${c.w + 1} · ${["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"][c.d]} — mức ${c.level}`}
              className="size-[11px] rounded-[2px] transition-[transform,background-color] duration-200 hover:scale-125"
              style={{ background: heat(c.level) }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-3.5">
        <p className="label flex items-center gap-2">
          Ít
          {[0, 1, 2, 3, 4].map((l) => (
            <span
              key={l}
              aria-hidden
              className="size-[9px] rounded-[2px]"
              style={{ background: heat(l) }}
            />
          ))}
          Nhiều
        </p>
        <p className="label tnum">
          chuỗi {streak} ngày · đỉnh {best}
        </p>
      </div>
    </div>
  );
}

/** thang màu 5 bậc — dùng biến tone sẵn có, không thêm màu mới */
function heat(level: number) {
  if (level <= 0) return "var(--surface-3)";
  if (level === 1) return "color-mix(in oklab, var(--mint) 26%, var(--surface))";
  if (level === 2) return "color-mix(in oklab, var(--mint) 48%, var(--surface))";
  if (level === 3) return "color-mix(in oklab, var(--mint) 72%, var(--surface))";
  return "var(--mint)";
}
