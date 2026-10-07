import { capability, profile, trajectory, work, type Tone } from "@/data/profile";
import { BRANDS, type BrandKey } from "@/components/logos/brand";
import { px } from "@/lib/num";

/* ==================================================================
   DỮ LIỆU VŨ TRỤ — suy ra 100% từ data/profile.ts
   ------------------------------------------------------------------
   Không có bảng node viết tay: mọi node là một mắt xích của hồ sơ
   đang có (identity → miền năng lực → công nghệ → dự án / chặng →
   kênh). Đổi profile.ts là vũ trụ đổi theo, không phải sửa thêm
   component. Cũng không thêm một con số nào không có trong hồ sơ.

   Vòng quỹ đạo (theo vai trò, không phải theo id):
     0  lõi        CORE        100%
     1  kỹ năng    SKILL STAR   vành trong
     2  miền/dự án/chặng        vành giữa
     3  công cụ/kênh            vành ngoài

   Toạ độ dùng hàm thuần + px() để server và client luôn render ra
   cùng một chuỗi (xem lib/num.ts).
   ================================================================== */

export type UniKind = "core" | "domain" | "project" | "skill" | "tool" | "epoch" | "channel";

/** nhãn tiếng Việt của từng loại node — dùng cho legend + HUD */
export const KIND_LABEL: Record<UniKind, string> = {
  core: "lõi",
  domain: "miền",
  project: "hành tinh dự án",
  skill: "ngôi sao kỹ năng",
  tool: "tiểu hành tinh công cụ",
  epoch: "sao chặng",
  channel: "cổng liên hệ",
};

export type UniNode = {
  id: string;
  kind: UniKind;
  /** số thứ tự hiển thị, dùng làm nhãn HUD */
  index: string;
  /** nhãn ngắn hiện cạnh node */
  label: string;
  /** tiêu đề đầy đủ trong bảng đọc */
  title: string;
  /** một dòng mô tả */
  note: string;
  /** đoạn mô tả dài */
  detail: string;
  tone: Tone;
  href?: string;
  /** khoá mark trong components/logos/brand.ts */
  logo: BrandKey | null;
  /** phân loại phụ của công nghệ, hiện ở tooltip */
  tech?: "language" | "framework" | "library" | "platform" | "database" | "standard" | "design";
  /** cặp khoá/giá trị cho bảng đọc */
  meta: { k: string; v: string }[];
  /** trọng số quang học 0–1: quyết định cỡ, độ sáng và nhãn */
  weight: number;
  /** đường kính node (px, trên bản rộng) */
  size: number;
};

export type UniEdge = {
  a: string;
  b: string;
  /** độ đậm của đường nối */
  w: number;
  /** mức ưu tiên: 1 = nền, 2 = chỉ hiện khi miền đang mở */
  level: 1 | 2;
  /** nhóm đường, dùng để tô màu */
  kind: "core" | "work" | "history" | "tech";
};

const host = (href: string) => href.replace(/^https?:\/\//, "").replace(/\/$/, "");

/* ------------------------------------------------------------------
   PHÂN LOẠI CÔNG NGHỆ
   ------------------------------------------------------------------
   Một mục trong capability.domains[].items là "kỹ năng" khi nó là
   ngôn ngữ / framework / thư viện / chuẩn, và là "công cụ" khi nó là
   thứ cài đặt hoặc triển khai lên. Đây là bảng tra *tên công nghệ*
   nên thêm công nghệ mới chỉ cần thêm một dòng.
   ------------------------------------------------------------------ */
type TechKind = "language" | "framework" | "library" | "platform" | "database" | "standard" | "design";

const TECH: Record<string, { kind: TechKind; logo: BrandKey }> = {
  // ngôn ngữ
  TypeScript: { kind: "language", logo: "typescript" },
  Python: { kind: "language", logo: "python" },
  Rust: { kind: "language", logo: "rust" },
  // framework
  React: { kind: "framework", logo: "react" },
  "Next.js": { kind: "framework", logo: "nextjs" },
  "Node.js": { kind: "platform", logo: "nodejs" },
  // thư viện / chuẩn
  Tailwind: { kind: "library", logo: "tailwindcss" },
  tRPC: { kind: "library", logo: "trpc" },
  Prisma: { kind: "library", logo: "prisma" },
  "Web Animations": { kind: "standard", logo: "web-animations" },
  "REST / GraphQL": { kind: "standard", logo: "graphql" },
  "WCAG 2.2": { kind: "standard", logo: "wcag" },
  Motion: { kind: "design", logo: "motion" },
  "UX Writing": { kind: "design", logo: "ux-writing" },
  "Design System": { kind: "design", logo: "design-system" },
  // cơ sở dữ liệu
  PostgreSQL: { kind: "database", logo: "postgresql" },
  Redis: { kind: "database", logo: "redis" },
  // nền tảng / công cụ
  Docker: { kind: "platform", logo: "docker" },
  "GitHub Actions": { kind: "platform", logo: "githubactions" },
  Vercel: { kind: "platform", logo: "vercel" },
  AWS: { kind: "platform", logo: "aws" },
  Terraform: { kind: "platform", logo: "terraform" },
  Grafana: { kind: "platform", logo: "grafana" },
  Figma: { kind: "design", logo: "figma" },
  Blender: { kind: "design", logo: "blender" },
  // chỉ có trong capability.stack
  Playwright: { kind: "platform", logo: "playwright" },
  WebGPU: { kind: "standard", logo: "webgpu" },
  WebSocket: { kind: "standard", logo: "websocket" },
};

/** tên trong capability.stack có thể là viết tắt của một mục đã có */
const ALIAS: Record<string, string> = {
  "Tailwind CSS": "Tailwind",
};

const TECH_NOTE: Record<TechKind, string> = {
  language: "Ngôn ngữ",
  framework: "Framework",
  library: "Thư viện",
  platform: "Nền tảng",
  database: "Cơ sở dữ liệu",
  standard: "Chuẩn / API",
  design: "Thiết kế",
};

/** chuẩn hoá tên để ghép tag của dự án / chặng với công nghệ đã khai báo */
const norm = (s: string) => s.trim().toLowerCase();

/* ------------------------------------------------------------------
   BUILD — chạy một lần, module scope là đủ (dữ liệu tĩnh)
   ------------------------------------------------------------------ */

/** id + thông tin của một công nghệ đã biết, để ghép cạnh về sau */
const techIndex = new Map<string, { id: string; label: string }>();

function techNodeId(label: string) {
  return `tech-${norm(label).replace(/[^a-z0-9]+/g, "-")}`;
}

/** công nghệ đã gom, giữ thứ tự và nguồn để sinh node */
type TechEntry = {
  name: string;
  tech: TechKind;
  /** miền sở hữu, null nếu không thuộc miền nào */
  domain: string | null;
  tone: Tone;
  note: string;
};

/** gom MỌI công nghệ trong hồ sơ: miền → stack → tag của dự án/chặng.
 *  Quét cả ba chỗ để không bỏ sót thứ chỉ xuất hiện ở một danh sách
 *  (ví dụ WebSocket chỉ nằm trong tag dự án). */
function collectTech(): TechEntry[] {
  const out: TechEntry[] = [];
  const seen = new Set<string>();

  const add = (raw: string, e: Omit<TechEntry, "name" | "tech">) => {
    const name = ALIAS[raw] ?? raw;
    const key = norm(name);
    if (seen.has(key)) return;
    const tech = TECH[name];
    if (!tech) return;
    seen.add(key);
    out.push({ name, tech: tech.kind, ...e });
  };

  for (const d of capability.domains) {
    for (const it of d.items) add(it.name, { domain: d.name, tone: d.tone, note: it.note });
  }
  for (const raw of capability.stack) add(raw, { domain: null, tone: "iris", note: "" });
  for (const p of work.items) {
    for (const tag of p.tags) add(tag, { domain: null, tone: p.tone, note: "" });
  }
  for (const t of trajectory.items) {
    for (const tag of t.tags) add(tag, { domain: null, tone: "ember", note: "" });
  }
  return out;
}

const TECH_ENTRIES = collectTech();

for (const e of TECH_ENTRIES) {
  techIndex.set(norm(e.name), { id: techNodeId(e.name), label: e.name });
}

function buildNodes(): UniNode[] {
  const out: UniNode[] = [];
  let i = 0;
  const idx = () => String(++i).padStart(2, "0");

  /* ---------------- CORE ---------------- */
  out.push({
    id: "core",
    kind: "core",
    index: idx(),
    label: profile.initials,
    title: profile.name,
    note: profile.roleShort,
    detail: `${profile.role}. ${profile.location} · ${profile.timezoneLabel}. ${profile.availability}.`,
    tone: "ice",
    logo: null,
    meta: [
      { k: "role", v: profile.role },
      { k: "where", v: profile.location },
      { k: "zone", v: `${profile.timezoneLabel} (UTC+7)` },
      { k: "status", v: profile.availability },
    ],
    weight: 1,
    size: 88,
  });

  /* ---------------- MIỀN NĂNG LỰC ---------------- */
  for (const d of capability.domains) {
    out.push({
      id: `domain-${d.id}`,
      kind: "domain",
      index: idx(),
      label: d.name,
      title: `${d.name} — ${d.level}%`,
      note: d.blurb,
      detail: `${d.blurb}. ${d.items.length} công nghệ dùng hàng ngày trong miền này.`,
      tone: d.tone,
      logo: null,
      meta: [
        { k: "level", v: `${d.level}/100` },
        { k: "tools", v: `${d.items.length}` },
        ...d.items.slice(0, 3).map((it) => ({ k: it.name, v: it.note })),
      ],
      weight: 0.86,
      size: 58,
    });

    /* ---- công nghệ của miền: kỹ năng hay công cụ ---- */
    for (const e of TECH_ENTRIES) {
      if (e.domain !== d.name) continue;
      const isTool = e.tech === "platform" && e.name !== "Node.js";

      out.push({
        id: techNodeId(e.name),
        kind: isTool ? "tool" : "skill",
        index: idx(),
        label: e.name,
        title: `${e.name} — ${TECH_NOTE[e.tech]}`,
        note: `${d.name}${e.note ? ` · ${e.note}` : ""}`,
        detail: `${e.name} thuộc miền ${d.name} trong hồ sơ.${e.note ? ` Ghi chú: ${e.note}.` : ""}`,
        tone: e.tone,
        logo: TECH[e.name].logo,
        tech: e.tech,
        meta: [
          { k: "loại", v: TECH_NOTE[e.tech] },
          { k: "miền", v: d.name },
          ...(e.note ? [{ k: "phiên bản", v: e.note }] : []),
        ],
        weight: isTool ? 0.42 : 0.6,
        size: isTool ? 34 : 40,
      });
    }
  }

  /* ---- công nghệ không thuộc miền nào: lấy từ stack / tag dự án ---- */
  for (const e of TECH_ENTRIES) {
    if (e.domain !== null) continue;
    const isTool = e.tech === "platform";

    out.push({
      id: techNodeId(e.name),
      kind: isTool ? "tool" : "skill",
      index: idx(),
      label: e.name,
      title: `${e.name} — ${TECH_NOTE[e.tech]}`,
      note: "Công nghệ dùng hàng ngày",
      detail: `${e.name} nằm trong danh sách công nghệ chính của hồ sơ.`,
      tone: e.tone,
      logo: TECH[e.name].logo,
      tech: e.tech,
      meta: [
        { k: "loại", v: TECH_NOTE[e.tech] },
        { k: "nguồn", v: "capability.stack" },
      ],
      weight: isTool ? 0.4 : 0.56,
      size: isTool ? 34 : 40,
    });
  }

  /* ---------------- DỰ ÁN ---------------- */
  for (const p of work.items) {
    out.push({
      id: `project-${p.id}`,
      kind: "project",
      index: idx(),
      label: p.name,
      title: `${p.name} · ${p.year}`,
      note: p.description,
      detail: `${p.description}. Vai trò: ${p.role}. ${p.stars} lượt theo dõi.`,
      tone: p.tone,
      href: p.href,
      logo: "zephi",
      meta: [
        { k: "year", v: p.year },
        { k: "role", v: p.role },
        { k: "kind", v: p.kind },
        ...p.tags.map((t) => ({ k: "stack", v: t })),
      ],
      weight: 0.92,
      size: 66,
    });
  }

  /* ---------------- CHẶNG ĐƯỜNG ---------------- */
  for (const t of trajectory.items) {
    out.push({
      id: `epoch-${t.year}`,
      kind: "epoch",
      index: idx(),
      label: t.year,
      title: `${t.title} · ${t.org}`,
      note: t.description,
      detail: `${t.description} (${t.range}, ${t.location}).`,
      tone: "ember",
      logo: null,
      meta: [
        { k: "range", v: t.range },
        { k: "org", v: t.org },
        { k: "where", v: t.location },
        ...t.metrics.map((m) => ({ k: m.k, v: m.v })),
      ],
      weight: 0.78,
      size: 54,
    });
  }

  /* ---------------- CỔNG LIÊN HỆ ---------------- */
  for (const s of profile.socials) {
    out.push({
      id: `channel-${s.icon}`,
      kind: "channel",
      index: idx(),
      label: s.label,
      title: s.label,
      note: host(s.href),
      detail: `${s.label} — kênh công khai.`,
      tone: "mint",
      href: s.href,
      logo: s.icon as BrandKey,
      meta: [
        { k: "url", v: host(s.href) },
        { k: "handle", v: profile.handle },
      ],
      weight: 0.7,
      size: 46,
    });
  }

  /* email cũng là một cổng — lấy từ chính profile.email */
  out.push({
    id: "channel-email",
    kind: "channel",
    index: idx(),
    label: "Email",
    title: "Email",
    note: profile.email,
    detail: `Gửi thư trực tiếp tới ${profile.name}.`,
    tone: "mint",
    href: `mailto:${profile.email}`,
    logo: "email",
    meta: [
      { k: "mail", v: profile.email },
      { k: "trả lời", v: profile.responseTime },
    ],
    weight: 0.66,
    size: 46,
  });

  return out;
}

/* ------------------------------------------------------------------
   CẠNH — theo thứ bật ưu tiên, không nối mọi thứ với mọi thứ
     1  lõi → miền
     2  miền → công nghệ của miền   (mức 2: chỉ hiện khi mở miền)
     3  dự án → công nghệ nó dùng
     4  chặng → công nghệ của chặng đó
     5  cổng → lõi
   ------------------------------------------------------------------ */
function buildEdges(nodes: readonly UniNode[]): UniEdge[] {
  const has = new Set(nodes.map((n) => n.id));
  const seen = new Set<string>();
  const edges: UniEdge[] = [];

  const push = (
    a: string,
    b: string,
    w: number,
    kind: UniEdge["kind"],
    level: 1 | 2,
  ) => {
    if (!has.has(a) || !has.has(b) || a === b) return;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ a, b, w, kind, level });
  };

  /** id node của một công nghệ theo tên (dùng ALIAS) */
  const techId = (name: string) => techIndex.get(norm(ALIAS[name] ?? name))?.id;

  for (const d of capability.domains) push("core", `domain-${d.id}`, 1, "core", 1);

  /* 2 + 3 + 4: công nghệ của miền, của dự án, của chặng */
  for (const d of capability.domains) {
    for (const it of d.items) {
      const id = techId(it.name);
      if (id) push(`domain-${d.id}`, id, 0.55, "tech", 2);
    }
  }

  for (const p of work.items) {
    for (const tag of p.tags) {
      const id = techId(tag);
      if (id) push(`project-${p.id}`, id, 0.9, "work", 1);
    }
  }

  for (const t of trajectory.items) {
    for (const tag of t.tags) {
      const id = techId(tag);
      if (id) push(`epoch-${t.year}`, id, 0.75, "history", 1);
    }
  }

  /* công nghệ chỉ có trong stack không thuộc miền nào → nối thẳng lõi */
  for (const n of nodes) {
    if ((n.kind === "skill" || n.kind === "tool") && !edges.some((e) => e.a === n.id || e.b === n.id)) {
      push("core", n.id, 0.4, "core", 1);
    }
  }

  /* 5: cổng liên hệ → lõi */
  for (const n of nodes) {
    if (n.kind === "channel") push(n.id, "core", 0.7, "core", 1);
  }

  return edges;
}

export const UNIVERSE_NODES = buildNodes();
export const UNIVERSE_EDGES = buildEdges(UNIVERSE_NODES);

/** tra node theo id — dùng nhiều nơi, tránh lặp `find` */
export const UNIVERSE_BY_ID = new Map(UNIVERSE_NODES.map((n) => [n.id, n]));

/** node đang chọn + hàng xóm trực tiếp của nó.
 *  `includeLevel2` mở thêm cạnh "miền → công nghệ" — bảng đọc gọn thì
 *  tắt, tooltip thì bật để khớp với đường đang sáng trên bản đồ. */
export function relatedOf(id: string | null, includeLevel2 = false): UniNode[] {
  if (!id) return [];
  const out: UniNode[] = [];
  const seen = new Set<string>([id]);
  for (const e of UNIVERSE_EDGES) {
    if (e.level === 2 && !includeLevel2) continue;
    const other = e.a === id ? e.b : e.b === id ? e.a : null;
    if (!other || seen.has(other)) continue;
    seen.add(other);
    const n = UNIVERSE_BY_ID.get(other);
    if (n) out.push(n);
  }
  return out;
}

/** hàng xóm dùng để tô sáng mạng khi rê chuột (§24) */
export function neighboursOf(id: string | null, includeLevel2 = true): Set<string> {
  const set = new Set<string>();
  if (!id) return set;
  set.add(id);
  for (const e of UNIVERSE_EDGES) {
    if (!includeLevel2 && e.level === 2) continue;
    if (e.a === id) set.add(e.b);
    if (e.b === id) set.add(e.a);
  }
  return set;
}

/* ------------------------------------------------------------------
   BỐ CỤC
   ------------------------------------------------------------------
   wide : màn rộng — 3 vành elip quanh lõi, mỗi vành một lớp vai trò
   stack: màn hẹp — lõi trên cùng, node lớn đảo hai bên, còn kỹ năng
           và công cụ xếp thành lưới logo để màn hình không bị kéo dài
           vô tận
   ------------------------------------------------------------------ */
export type Layout = {
  w: number;
  h: number;
  /** toạ độ node sau khi bố trí */
  pos: Record<string, { x: number; y: number }>;
  /** vành quỹ đạo (wide) hoặc rỗng (stack) */
  rings: { rx: number; ry: number }[];
};

/* Khoảng cách giữa các vành không phải chuyện thẩm mỹ: nhãn của node
   vành giữa nằm ngay trong khe hở giữa vành trong và vành ngoài. Khe hở
   phải rộng hơn chiều cao một nhãn (~36px) thì nhãn mới không đè lên
   node kế bên. 122px là khoảng dư rộng tay; thu nhỏ thì nhãn "Backend"
   đè lên Blender. */
const RINGS_WIDE = [
  { rx: 360, ry: 208 },
  { rx: 520, ry: 330 },
  { rx: 660, ry: 452 },
];

/* Lề ngoài vành cuối đủ cho nhãn của node ngoài cùng (GitHub, LinkedIn…)
   mà không bị khung cắt. */
const WIDE = { w: 1560, h: 1000, cx: 780, cy: 500 };

/** vành của từng node — cũng là thứ tự hiển thị trong stack */
function ringOf(kind: UniKind): number {
  switch (kind) {
    case "core":
      return 0;
    case "skill":
      return 1;
    case "domain":
    case "project":
    case "epoch":
      return 2;
    default:
      return 3;
  }
}

export function buildWide(nodes = UNIVERSE_NODES): Layout {
  const pos: Layout["pos"] = {};
  const buckets = new Map<number, UniNode[]>();
  for (const n of nodes) {
    const r = ringOf(n.kind);
    const list = buckets.get(r) ?? [];
    list.push(n);
    buckets.set(r, list);
  }

  // sắp theo tên để bố cục không đổi khi thêm/bớt một node
  for (const list of buckets.values()) list.sort((a, b) => (a.id < b.id ? -1 : 1));

  for (const [ring, list] of buckets) {
    const geo = RINGS_WIDE[ring - 1];
    if (!geo || !list.length) continue;
    // lệch góc theo số node để các vành không đặt node chồng nhau
    const offset = -Math.PI / 2 + (ring % 2 ? 0.11 : 0);
    list.forEach((n, i) => {
      const a = offset + (i / list.length) * Math.PI * 2;
      pos[n.id] = {
        x: px(WIDE.cx + Math.cos(a) * geo.rx),
        y: px(WIDE.cy + Math.sin(a) * geo.ry),
      };
    });
  }

  pos.core = { x: px(WIDE.cx), y: px(WIDE.cy) };

  return { w: WIDE.w, h: WIDE.h, pos, rings: RINGS_WIDE };
}

/* --- bản xếp dọc: lõi → node có tên → lưới công nghệ --------------- */
const STACK = {
  w: 360,
  coreY: 58,
  majorTop: 130,
  majorH: 60,
  /** node có tên riêng (miền / dự án / chặng / kênh) — mỗi cái một hàng */
  gridCols: 8,
  gridH: 48,
  gridGap: 92,
};

/** các loại node được một hàng riêng trong bản xếp dọc */
const NAMED: UniKind[] = ["domain", "project", "epoch", "channel"];

export function buildStack(nodes = UNIVERSE_NODES): Layout {
  const pos: Layout["pos"] = {};

  const majors = nodes.filter((n) => NAMED.includes(n.kind));
  const dense = nodes.filter((n) => n.kind === "skill" || n.kind === "tool");

  // lõi ở trên cùng, node lớn đảo hai bên để nhãn không đè nhau
  let y = STACK.majorTop;
  for (const [i, n] of majors.entries()) {
    const side = i % 2 === 0 ? -1 : 1;
    pos[n.id] = { x: px(STACK.w / 2 + side * 80), y: px(y) };
    y += STACK.majorH;
  }

  // lưới logo: 8 cột, canh giữa
  const gridTop = y + (STACK.gridGap - STACK.majorH);
  const colW = (STACK.w - 20) / STACK.gridCols;
  dense.forEach((n, i) => {
    const col = i % STACK.gridCols;
    const row = (i / STACK.gridCols) | 0;
    pos[n.id] = {
      x: px(10 + colW * (col + 0.5)),
      y: px(gridTop + row * STACK.gridH),
    };
  });
  const gridRows = Math.max(1, Math.ceil(dense.length / STACK.gridCols));

  pos.core = { x: px(STACK.w / 2), y: px(STACK.coreY) };
  const h = px(gridTop + (gridRows - 1) * STACK.gridH + 86);

  return { w: STACK.w, h, pos, rings: [] };
}

/* ------------------------------------------------------------------
   SỐ LIỆU — đếm từ dữ liệu thật, không bịa (§73)
   ------------------------------------------------------------------ */
const count = (k: UniKind) => UNIVERSE_NODES.filter((n) => n.kind === k).length;

export const UNIVERSE_STATS = {
  nodes: UNIVERSE_NODES.length,
  edges: UNIVERSE_EDGES.length,
  rings: RINGS_WIDE.length,
  projects: count("project"),
  skills: count("skill"),
  tools: count("tool"),
  channels: count("channel"),
  epochs: count("epoch"),
  domains: count("domain"),
  /** mark đã có trong kho — dùng cho HUD */
  brands: Object.keys(BRANDS).length,
} as const;