"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { navLinks, profile, work } from "@/data/profile";
import { Icon } from "@/components/icons";
import {
  useFocusTrap,
  useMounted,
  useScrollLock,
} from "@/components/motion/hooks";
import { useToast } from "@/components/ui/toast";

/* ==================================================================
   COMMAND PALETTE — ⌘K / Ctrl+K
   ---------------------------------------------------------------
   Tìm section, hợp tác, liên kết. Tìm tiền tố không phải ký tự
   Unicode nào — chỉ "copy", "open", "go" — để tiếng Việt có dấu
   vẫn gõ được.
   ================================================================== */

type Item = {
  id: string;
  label: string;
  hint?: string;
  group: string;
  keywords?: string;
  icon: React.ReactNode;
  run: () => void;
};

/** So khớp không phân biệt hoa thường + dấu tiếng Việt */
function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const toast = useToast();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setIndex(0);
  }, []);

  useScrollLock(open);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useFocusTrap(dialogRef, open, close);

  const items = useMemo<Item[]>(() => {
    const scrollTo = (id: string) => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      close();
    };

    const nav: Item[] = navLinks.map((l) => ({
      id: `nav-${l.id}`,
      label: `Tới ${l.label}`,
      hint: l.hint,
      group: "Điều hướng",
      keywords: `${l.id} ${l.hint} section`,
      icon: <span className="tnum font-mono text-[11px] text-ice">{l.index}</span>,
      run: () => scrollTo(l.id),
    }));

    const projects: Item[] = work.items.map((p) => ({
      id: `work-${p.id}`,
      label: p.name,
      hint: `${p.year} · ${p.tags.join(", ")}`,
      group: "Dự án",
      keywords: `${p.description} ${p.role}`,
      icon: <Icon name="external" size={13} />,
      run: () => {
        window.open(p.href, "_blank", "noopener,noreferrer");
        close();
      },
    }));

    const email = profile.email;
    const actions: Item[] = [
      {
        id: "copy-email",
        label: copied ? "Đã sao chép email" : "Sao chép email",
        hint: email,
        group: "Hành động",
        keywords: "copy email lien he",
        icon: <Icon name="copy" size={13} />,
        run: async () => {
          try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            toast.push("Đã sao chép email vào clipboard");
            setTimeout(() => setCopied(false), 2000);
          } catch {
            toast.push("Trình duyệt chặn clipboard", "error");
          }
        },
      },
      {
        id: "mail",
        label: "Mở trình soạn thư",
        hint: email,
        group: "Hành động",
        keywords: "email mail lien he",
        icon: <Icon name="mail" size={13} />,
        run: () => {
          window.location.href = `mailto:${email}`;
          close();
        },
      },
      {
        id: "resume",
        label: "Tải CV",
        hint: "PDF · 1.2 MB",
        group: "Hành động",
        keywords: "resume cv download",
        icon: <Icon name="arrow" size={13} />,
        run: () => {
          toast.push("CV đang được chuẩn bị", "info");
          close();
        },
      },
      {
        id: "theme",
        label: "Đổi giao diện sáng / tối",
        group: "Hành động",
        keywords: "theme dark light theme sang toi",
        icon: <Icon name="moon" size={13} />,
        run: () => {
          const dark = document.documentElement.classList.contains("dark");
          document.documentElement.classList.toggle("dark", !dark);
          try {
            localStorage.setItem("theme", !dark ? "dark" : "light");
          } catch {}
          window.dispatchEvent(new Event("themechange"));
          toast.push(!dark ? "Đã chuyển sang giao diện tối" : "Đã chuyển sang giao diện sáng");
          close();
        },
      },
      {
        id: "top",
        label: "Lên đầu trang",
        group: "Hành động",
        keywords: "top len dau trang scroll",
        icon: <Icon name="arrow" size={13} className="-rotate-90" />,
        run: () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          close();
        },
      },
    ];

    const socials: Item[] = profile.socials.map((s) => ({
      id: `soc-${s.label}`,
      label: `Mở ${s.label}`,
      hint: s.href.replace(/^https?:\/\//, ""),
      group: "Liên kết",
      keywords: s.label,
      icon: <Icon name={s.icon} size={13} />,
      run: () => {
        window.open(s.href, "_blank", "noopener,noreferrer");
        close();
      },
    }));

    return [...nav, ...actions, ...projects, ...socials];
  }, [close, copied, toast]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return items;
    const terms = q.split(/\s+/);
    return items
      .map((it) => {
        const hay = normalize(`${it.label} ${it.hint ?? ""} ${it.keywords ?? ""}`);
        if (!terms.every((t) => hay.includes(t))) return null;
        // ưu tiên khớp ở đầu nhãn
        const score = normalize(it.label).startsWith(q) ? 0 : 1;
        return { it, score };
      })
      .filter(Boolean)
      .sort((a, b) => a!.score - b!.score)
      .map((x) => x!.it);
  }, [items, query]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-i="${index}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [index, open]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[index]?.run();
    }
  }

  const groups = filtered.reduce<Record<string, Item[]>>((acc, it) => {
    (acc[it.group] ??= []).push(it);
    return acc;
  }, {});

  let flat = -1;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-10 items-center gap-2 rounded-full border border-line pl-3.5 pr-2 text-[13px] text-muted-2 transition-[color,border-color,background-color] duration-200 hover:border-line-3 hover:bg-s2 hover:text-fg xl:flex"
      >
        <Icon name="search" size={15} />
        <span className="pr-6">Tìm kiếm</span>
        <kbd className="rounded-md border border-line bg-s2 px-1.5 py-0.5 font-mono text-[10px] text-muted">
          {mounted && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
            ? "⌘K"
            : "Ctrl K"}
        </kbd>
      </button>

      {/* Nút icon cho màn nhỏ */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mở bảng lệnh (Ctrl K)"
        className="grid size-10 place-items-center rounded-full border border-line text-muted-2 transition-[color,border-color,background-color] duration-200 hover:border-line-3 hover:bg-s2 hover:text-fg xl:hidden"
      >
        <Icon name="search" size={16} />
      </button>

      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Bảng lệnh"
          className="fixed inset-0 z-[92] flex items-start justify-center px-4 pt-[max(6rem,14vh)]"
        >
          <div
            aria-hidden="true"
            onClick={close}
            className="animate-fade absolute inset-0 bg-bg/75 backdrop-blur-md"
          />

          <div className="animate-rise relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line-2 bg-glass shadow-3 backdrop-blur-2xl">
            {/* Ô tìm kiếm */}
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Icon name="search" size={16} className="shrink-0 text-muted-2" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Tìm section, dự án, hành động…"
                aria-label="Tìm kiếm"
                autoComplete="off"
                spellCheck={false}
                className="h-14 w-full bg-transparent text-[15px] tracking-[-0.01em] outline-none placeholder:text-muted-2"
              />
              <kbd className="hidden shrink-0 rounded-md border border-line bg-s2 px-1.5 py-1 font-mono text-[10px] text-muted sm:block">
                ESC
              </kbd>
            </div>

            {/* Kết quả */}
            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
              {filtered.length === 0 ? (
                <div className="px-3 py-12 text-center">
                  <p className="text-sm text-muted">Không có kết quả cho “{query}”</p>
                  <p className="mt-1.5 text-[13px] text-muted-2">
                    Thử: <span className="text-ice">dự án</span>,{" "}
                    <span className="text-ice">email</span>,{" "}
                    <span className="text-ice">theme</span>
                  </p>
                </div>
              ) : (
                Object.entries(groups).map(([group, list]) => (
                  <div key={group}>
                    <p className="label px-3 pt-3 pb-2">{group}</p>
                    {list.map((it) => {
                      flat += 1;
                      const i = flat;
                      const on = i === index;
                      return (
                        <button
                          key={it.id}
                          type="button"
                          data-i={i}
                          onMouseEnter={() => setIndex(i)}
                          onClick={it.run}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-100 ${
                            on ? "bg-s3 text-fg" : "text-fg-2 hover:bg-s2"
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`grid size-6 shrink-0 place-items-center rounded-md border transition-colors ${
                              on
                                ? "border-ice/35 bg-ice/10 text-ice"
                                : "border-line bg-s2 text-muted-2"
                            }`}
                          >
                            {it.icon}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[13.5px]">{it.label}</span>
                          {it.hint ? (
                            <span className="hidden max-w-[40%] shrink-0 truncate font-mono text-[11px] text-muted-2 sm:block">
                              {it.hint}
                            </span>
                          ) : null}
                          <Icon
                            name="chevron"
                            size={13}
                            className={`shrink-0 text-muted-2 transition-all duration-150 ${
                              on ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Chân */}
            <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-2.5">
              <span className="flex items-center gap-3 font-mono text-[10px] text-muted-2">
                <span>
                  <kbd className="text-ice">↑↓</kbd> di chuyển
                </span>
                <span>
                  <kbd className="text-ice">↵</kbd> chạy
                </span>
              </span>
              <span className="label tnum">
                {filtered.length}/{items.length}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
