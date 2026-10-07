"use client";

import { useRef, useState } from "react";
import { contact, profile } from "@/data/profile";
import { SectionShell } from "@/components/ui/primitives";
import { Reveal, SplitText } from "@/components/motion/reveal";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { TONE_VAR } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

/* ==================================================================
   CONTACT
   ---------------------------------------------------------------
   Có biểu mẫu thật với đủ trạng thái: rỗng → lỗi → đang gửi → xong.
   Không có backend nên bước gửi được mô phỏng bằng delay ngắn —
   phần validate/UI là thật, chỉ chỗ gửi là giả.
   ================================================================== */

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;
type Status = "idle" | "sending" | "done";

const EMPTY: Fields = { name: "", email: "", message: "" };

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Cho tôi biết bạn là ai.";
  else if (f.name.trim().length < 2) e.name = "Tên quá ngắn.";

  if (!f.email.trim()) e.email = "Cần email để tôi trả lời.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()))
    e.email = "Email chưa đúng định dạng.";

  if (!f.message.trim()) e.message = "Bạn muốn nói gì?";
  else if (f.message.trim().length < 20) e.message = "Thêm một chút chi tiết (tối thiểu 20 ký tự).";

  return e;
}

export default function Contact() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [budget, setBudget] = useState<string>("mid");
  const [topic, setTopic] = useState<string>("new");
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const set = (k: keyof Fields) => (v: string) => {
    setFields((p) => ({ ...p, [k]: v }));
    if (touched[k]) setErrors(validate({ ...fields, [k]: v }));
  };

  const blur = (k: keyof Fields) => () => {
    setTouched((p) => ({ ...p, [k]: true }));
    setErrors(validate(fields));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;

    const found = validate(fields);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });

    if (Object.keys(found).length) {
      const first = (["name", "email", "message"] as const).find((k) => found[k]);
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      toast.push("Kiểm tra lại các ô được đánh dấu", "error");
      return;
    }

    setStatus("sending");
    // TODO: thay bằng API thật
    await new Promise((r) => setTimeout(r, 1150));
    setStatus("done");
    toast.push("Đã gửi — tôi sẽ trả lời trong 24 giờ");
  }

  function reset() {
    setFields(EMPTY);
    setErrors({});
    setTouched({});
    setStatus("idle");
  }

  return (
    <SectionShell id="contact" className="pb-24 sm:pb-32">
      {/* ================= Tiêu đề ================= */}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <Reveal dir="up">
            <p className="label flex items-center gap-2.5 text-ice">
              <span aria-hidden className="h-px w-6 rounded-full bg-ice" />
              {contact.eyebrow}
            </p>
          </Reveal>

          <h2 className="display-l mt-6">
            <span className="sr-only">Cùng tạo ra thứ gì đó đáng nhớ.</span>
            <span aria-hidden className="block">
              {contact.titleLines.map((l, i) => (
                <span key={i} className={l.style === "serif" ? "italic-serif ink-iris animate-iris block pb-[0.06em]" : "block"}>
                  <SplitText
                    lines={[{ text: l.text }]}
                    mode="inview"
                    step={44}
                    className={l.style === "serif" ? "" : "tracking-[-0.04em]"}
                    wordClassName={l.style === "serif" ? "text-[1.07em]" : ""}
                  />
                </span>
              ))}
            </span>
          </h2>

          <Reveal delay={120}>
            <p className="body-lg mt-7 max-w-xl text-muted">{contact.description}</p>
          </Reveal>

          {/* Kênh liên hệ */}
          <ul className="mt-10 space-y-px border-t border-line">
            {contact.channels.map((c, i) => (
              <Reveal key={c.label} as="li" dir="up" delay={i * 80}>
                <div className="group flex items-center justify-between gap-4 border-b border-line py-4 transition-colors hover:border-line-2">
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer noopener"
                    className="flex min-w-0 items-center gap-3.5"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-s2 text-muted transition-colors group-hover:border-line-2 group-hover:text-ice">
                      <Icon name={c.icon} size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="label block">{c.label}</span>
                      <span className="mt-0.5 block truncate font-mono text-[13px] text-fg-2">
                        {c.value}
                      </span>
                    </span>
                  </a>

                  {c.copyable ? (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(c.value);
                          toast.push(`Đã sao chép ${c.label}`);
                        } catch {
                          toast.push("Trình duyệt chặn clipboard", "error");
                        }
                      }}
                      aria-label={`Sao chép ${c.label}`}
                      className="grid size-9 shrink-0 place-items-center rounded-lg border border-line text-muted-2 transition-[color,border-color,background-color] hover:border-line-2 hover:bg-s2 hover:text-fg"
                    >
                      <Icon name="copy" size={14} />
                    </button>
                  ) : (
                    <Icon
                      name="external"
                      size={14}
                      className="shrink-0 text-muted-2 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  )}
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* ================= Biểu mẫu ================= */}
        <div className="lg:col-span-5">
          <Reveal dir="right" delay={100}>
            <div className="relative overflow-hidden rounded-2xl border border-line bg-s2/55 p-6 backdrop-blur-md sm:p-8">
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div
                  className="absolute -top-20 -right-16 size-56 rounded-full opacity-25 blur-[70px]"
                  style={{
                    background: "radial-gradient(circle, var(--ice), transparent 70%)",
                  }}
                />
                <div className="dot-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_0%,black,transparent)]" />
              </div>

              {status === "done" ? (
                <SuccessPanel name={fields.name.trim()} onReset={reset} />
              ) : (
                <form ref={formRef} onSubmit={onSubmit} noValidate className="relative">
                  <p className="label mb-6">Gửi tin nhắn</p>

                  <div className="space-y-5">
                    <Field
                      id="c-name"
                      label="Tên của bạn"
                      value={fields.name}
                      onChange={set("name")}
                      onBlur={blur("name")}
                      error={touched.name ? errors.name : undefined}
                      autoComplete="name"
                      placeholder="Nguyễn Văn A"
                    />
                    <Field
                      id="c-email"
                      type="email"
                      label="Email"
                      value={fields.email}
                      onChange={set("email")}
                      onBlur={blur("email")}
                      error={touched.email ? errors.email : undefined}
                      autoComplete="email"
                      placeholder="ban@congty.vn"
                    />

                    <fieldset>
                      <legend className="label mb-2.5">Ngân sách dự kiến</legend>
                      <div className="flex flex-wrap gap-1.5">
                        {contact.budgets.map((b) => (
                          <Chip
                            key={b.id}
                            on={budget === b.id}
                            onClick={() => setBudget(b.id)}
                            label={b.label}
                          />
                        ))}
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend className="label mb-2.5">Bạn cần gì?</legend>
                      <div className="flex flex-wrap gap-1.5">
                        {contact.topics.map((t) => (
                          <Chip
                            key={t.id}
                            on={topic === t.id}
                            onClick={() => setTopic(t.id)}
                            label={t.label}
                          />
                        ))}
                      </div>
                    </fieldset>

                    <Field
                      id="c-message"
                      as="textarea"
                      label="Nội dung"
                      rows={4}
                      value={fields.message}
                      onChange={set("message")}
                      onBlur={blur("message")}
                      error={touched.message ? errors.message : undefined}
                      placeholder="Mô tả ngắn về dự án, thời gian mong muốn và ngân sách…"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={status === "sending"}
                    icon={status === "sending" ? undefined : "send"}
                    className="mt-7"
                  >
                    {status === "sending" ? "Đang gửi…" : "Gửi tin nhắn"}
                  </Button>

                  <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-muted-2">
                    <Icon name="clock" size={12} />
                    Trả lời trong {profile.responseTime} · không spam
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------
   Field — ô nhập có nhãn, lỗi và trạng thái focus đầy đủ
   ------------------------------------------------------------------ */
function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  as = "input",
  rows,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  type?: string;
  as?: "input" | "textarea";
  rows?: number;
  autoComplete?: string;
  placeholder?: string;
}) {
  const invalid = Boolean(error);
  const shared =
    "w-full rounded-xl border bg-s2/60 px-3.5 py-2.5 text-[14px] text-fg outline-none " +
    "transition-[border-color,background-color,box-shadow] duration-200 " +
    "placeholder:text-muted-2 focus:bg-s3/70 " +
    (invalid
      ? "border-ember/60 focus:border-ember focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--ember)_18%,transparent)]"
      : "border-line focus:border-ice/70 focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--ice)_16%,transparent)]");

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13px] text-fg-2">
        {label}
      </label>

      {as === "textarea" ? (
        <textarea
          id={id}
          name={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-err` : undefined}
          className={`${shared} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-err` : undefined}
          className={shared}
        />
      )}

      {error ? (
        <p
          id={`${id}-err`}
          className="animate-rise mt-1.5 flex items-center gap-1.5 text-[12px] text-ember"
        >
          <Icon name="close" size={11} strokeWidth={2.4} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------
   Chip — lựa chọn một
   ------------------------------------------------------------------ */
function Chip({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-3 py-1.5 text-[12.5px] transition-[color,border-color,background-color] duration-200 ${
        on
          ? "border-ice/40 bg-ice/10 text-ice"
          : "border-line bg-s2/50 text-muted hover:border-line-2 hover:text-fg-2"
      }`}
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------
   Trạng thái thành công
   ------------------------------------------------------------------ */
function SuccessPanel({ name, onReset }: { name: string; onReset: () => void }) {
  return (
    <div className="animate-rise relative py-6 text-center" role="status">
      <span
        className="mx-auto grid size-14 place-items-center rounded-full border border-mint/35"
        style={{ background: "color-mix(in oklab, var(--mint) 12%, transparent)" }}
      >
        <Icon name="check" size={22} className="text-mint" strokeWidth={2} />
      </span>

      <p className="display-m mt-6">Cảm ơn{name ? `, ${name}` : ""}.</p>
      <p className="body-sm mx-auto mt-3 max-w-xs text-muted">
        Tin nhắn đã tới. Tôi đọc và trả lời trong vòng {profile.responseTime} — thường sớm hơn.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        <Button
          href={`mailto:${profile.email}`}
          variant="quiet"
          size="sm"
          icon="mail"
        >
          Gửi bằng email
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Viết tin khác
        </Button>
      </div>

      <p
        aria-hidden
        className="label mt-8"
        style={{ color: TONE_VAR.mint }}
      >
        Trạng thái: đã gửi
      </p>
    </div>
  );
}
