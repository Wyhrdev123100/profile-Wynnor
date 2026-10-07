/* ==================================================================
   NỘI DUNG WEBSITE — sửa file này là đủ, không cần đụng component.
   ------------------------------------------------------------------
   - identity : thông tin cốt lõi
   - hero     : câu chữ mở đầu + số liệu
   - manifesto: tuyên ngôn + nguyên tắc
   - atlas    : sơ đồ thông tin (node gốc → nhánh → lá)
   - capability: 4 miền năng lực
   - trajectory: dòng thời gian
   - work     : dự án
   - channels : kênh liên hệ
   ================================================================== */

export type Tone = "ice" | "iris" | "ember" | "mint";

export type IconName =
  | "github"
  | "linkedin"
  | "x"
  | "mail"
  | "globe"
  | "youtube"
  | "discord"
  | "telegram"
  | "dribbble"
  | "phone"
  | "layers"
  | "gauge"
  | "shield"
  | "spark"
  | "compass"
  | "code"
  | "palette"
  | "server"
  | "terminal"
  | "arrow"
  | "external"
  | "check"
  | "copy"
  | "star"
  | "clock"
  | "pin"
  | "search"
  | "close"
  | "menu"
  | "sun"
  | "moon"
  | "plus"
  | "minus"
  | "send"
  | "chevron";

/* ------------------------------------------------------------------
   IDENTITY
   ------------------------------------------------------------------ */
export const profile = {
  name: "Quách Hưng",
  handle: "@quachhungev",
  initials: "Wynnor",
  role: "Product Engineer & Interface Architect",
  roleShort: "Product Engineer",
  location: "Bắc Ninh, Việt Nam",
  timezone: "Asia/Ho_Chi_Minh",
  timezoneLabel: "ICT",
  avatar: "/avatar.gif",
  avatarWebp: "/avatar.webp",
  portrait: "/portrait.svg",

  tagline:
    "Tôi xây những sản phẩm vì đam mê nhưng vì cuôc đời nên đam mê cũng chỉ là ước muốn nhất thời.",

  heroLines: [
    { text: "Sản phẩm kỹ thuật", style: "solid" },
    { text: "cho những người", style: "solid" },
    { text: "không chấp nhận", style: "solid" },
    { text: "thứ tầm thường.", style: "serif" },
  ] as const,

  heroSub:
    "Tôi là Quách Hưng. Sau thời gian tôi đã trải qua rất nhiều bài hoc rất quý giá dúc kết lai rất nhiều bài hoc đáng quý . Và tôi xin khép lai quá trình làm coder tai dây . Cảm ơn vì đã là 1 phần thanh xuân của tôi.",

  heroNote: "Mở để tư vấn trực tiếp",

  availability: "Đang nhận dự án mới",
  availabilityDetail: "Off coding 09/2026",
  responseTime: "Mãi Mãi",

  email: "qhvn@david.dev",

  socials: [
    {
      label: "GitHub",
      href: "https://github.com/Wyhrdev123100",
      icon: "github" as IconName,
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/zzzzazia",
      icon: "linkedin" as IconName,
    },
    { label: "X", href: "https://x.com/wynnaaxa8l", icon: "x" as IconName },
    {
      label: "Dribbble",
      href: "https://dribbble.com/wynnorxaut",
      icon: "dribbble" as IconName,
    },
  ],

  resumeUrl: "qhvn.vercel.app",
};

/* ------------------------------------------------------------------
   SỐ LIỆU — có số đếm tăng dần
   ------------------------------------------------------------------ */
export const stats = [
  { value: 6, suffix: "+", label: "Năm kinh nghiệm", note: "từ cuối 2024" },
  {
    value: 12,
    suffix: "",
    label: "Sản phẩm đã ship",
    note: "web · SaaS · tooling",
  },
  { value: 1, suffix: "", label: "Công nghệ chính", note: "hàng ngày dùng" },
  {
    value: 31,
    suffix: "",
    label: "Lighthouse trung bình",
    note: "4 dự án gần nhất",
  },
] as const;

/* ------------------------------------------------------------------
   MANIFESTO
   ------------------------------------------------------------------ */
export const manifesto = {
  eyebrow: "Manifesto",
  title:
    "Tôi tin rằng phần lớn phần mềm đều chưa đủ tốt — và đó là lời hứa, không phải lời xin lỗi.",

  paragraphs: [
    "Tôi bắt đầu từ thiết kế giao diện, rồi đi sâu vào front-end, và giờ dành phần lớn thời gian cho kiến trúc hệ thống. Ba nước đi đó không phải ba sự nghiệp — chúng là ba lớp của cùng một nghề: làm cho một sản phẩm trở nên tự nhiên đến mức người dùng không phải nghĩ.",
    "Tôi ghét những giao diện cần hướng dẫn sử dụng. Ghét hiệu ứng tồn tại để khoe. Ghét một sản phẩm phải mất ba giây để tải xong. Nên phần lớn công việc của tôi là thứ không ai kịp nhận ra: một cách gạch chân không nhảy, một danh sách không giật khi có 10.000 dòng, một trang không nhấp nháy trên mạng yếu.",
    "Ngoài giờ làm, tôi viết bài, đóng góp mã nguồn mở và xây những side project nhỏ để liên tục học. Tôi đo mọi thứ bằng Core Web Vitals và bằng cảm giác của người dùng khi tay họ đang cầm điện thoại trên xe buýt.",
  ],

  principles: [
    {
      id: "p1",
      index: "01",
      title: "Tốc độ là một thị giác",
      body: "Một giao diện chậm 400ms không “chậm hơn” — nó khiến người ta nghi ngờ chất lượng phần còn lại. Tôi coi mọi millisecond là một quyết định thiết kế.",
      tone: "ice" as Tone,
      icon: "gauge" as IconName,
    },
    {
      id: "p2",
      index: "02",
      title: "Chi tiết cuối cùng mới là chi tiết đắt",
      body: "Padding lệch 2px, chữ không cùng baseline, icon đặt lệch 1px — người dùng không gọi tên được, nhưng vẫn cảm thấy. Tôi soi từng pixel một.",
      tone: "iris" as Tone,
      icon: "palette" as IconName,
    },
    {
      id: "p3",
      index: "03",
      title: "Ít hơn, nhưng sâu hơn",
      body: "Mọi chuyển động đều phải có lý do và phải dừng lại được. Một hiệu ứng hay hơn một tách dễ chịu là một tách dễ chịu.",
      tone: "mint" as Tone,
      icon: "spark" as IconName,
    },
    {
      id: "p4",
      index: "04",
      title: "Viết để người sau đọc được",
      body: "Code là tài liệu lâu dài. Tôi ưu tiên cấu trúc rõ, đặt tên đúng và bỏ mọi thừa — kể cả khi thừa là của chính mình.",
      tone: "ember" as Tone,
      icon: "code" as IconName,
    },
  ],
};

/* ------------------------------------------------------------------
   ATLAS — sơ đồ thông tin dạng node graph
   ------------------------------------------------------------------ */
export type Branch = {
  id: string;
  index: string;
  label: string;
  question: string;
  tone: Tone;
  leaves: string[];
};

export const atlas = {
  root: {
    label: "profile",
    detail: `${profile.handle} · ${profile.roleShort}`,
  },
  branches: [
    {
      id: "top",
      index: "01",
      label: "Identity",
      question: "Ai là tôi?",
      tone: "ice",
      leaves: [profile.name, profile.roleShort, profile.location],
    },
    {
      id: "manifesto",
      index: "02",
      label: "Manifesto",
      question: "Tôi nghĩ gì?",
      tone: "iris",
      leaves: ["Tuyên ngôn", "4 nguyên tắc", "Cam kết tốc độ"],
    },
    {
      id: "capability",
      index: "03",
      label: "Capability",
      question: "Tôi làm được gì?",
      tone: "mint",
      leaves: ["Frontend", "Backend", "Hạ tầng", "Craft"],
    },
    {
      id: "trajectory",
      index: "04",
      label: "Trajectory",
      question: "Tôi đã đi qua đâu?",
      tone: "ember",
      leaves: ["2024-2025", "2025-nay"],
    },
    {
      id: "work",
      index: "05",
      label: "Work",
      question: "Tôi đã build gì?",
      tone: "ice",
      leaves: [
        "Dashboard realtime",
        "Design system",
        "Edge tooling",
        "Offline-first",
        "Dashboard termul",
      ],
    },
    {
      id: "console",
      index: "06",
      label: "Console",
      question: "Hỏi trực tiếp máy?",
      tone: "mint",
      leaves: ["Lệnh tương tác", "Nhịp commit", "Mã nguồn mở"],
    },
    {
      id: "contact",
      index: "07",
      label: "Action",
      question: "Bắt đầu thế nào?",
      tone: "iris",
      leaves: [profile.email, "Hợp tác", "Tư vấn kiến trúc"],
    },
  ] satisfies Branch[],
};

/* ------------------------------------------------------------------
   CAPABILITY — console năng lực
   ------------------------------------------------------------------ */
export type Domain = {
  id: string;
  name: string;
  blurb: string;
  level: number;
  tone: Tone;
  items: { name: string; note: string }[];
};

export const capability = {
  domains: [
    {
      id: "frontend",
      name: "Frontend",
      blurb: "Giao diện nhanh, mượt, đúng chuẩn accessibility",
      level: 94,
      tone: "ice",
      items: [
        { name: "React", note: "19 · RSC" },
        { name: "Next.js", note: "App Router" },
        { name: "TypeScript", note: "strict" },
        { name: "Tailwind", note: "v4" },
        { name: "Web Animations", note: "GPU-only" },
        { name: "tRPC", note: "end-to-end types" },
      ],
    },
    {
      id: "backend",
      name: "Backend",
      blurb: "API, dữ liệu, xử lý bất đồng bộ ở quy mô thật",
      level: 86,
      tone: "iris",
      items: [
        { name: "Node.js", note: "22 LTS" },
        { name: "Python", note: "FastAPI" },
        { name: "PostgreSQL", note: "đọc tối ưu" },
        { name: "Prisma", note: "typed ORM" },
        { name: "Redis", note: "cache + queue" },
        { name: "REST / GraphQL", note: "thiết kế contract" },
      ],
    },
    {
      id: "infra",
      name: "Hạ tầng",
      blurb: "CI/CD, triển khai, quan sát hệ thống",
      level: 80,
      tone: "mint",
      items: [
        { name: "Docker", note: "multi-stage" },
        { name: "GitHub Actions", note: "CI matrix" },
        { name: "Vercel", note: "edge" },
        { name: "AWS", note: "ECS · Lambda" },
        { name: "Terraform", note: "IaC" },
        { name: "Grafana", note: "observability" },
      ],
    },
    {
      id: "craft",
      name: "Craft",
      blurb: "Thiết kế, hệ thống, chuẩn hoá nội dung",
      level: 78,
      tone: "ember",
      items: [
        { name: "Figma", note: "variables" },
        { name: "Design System", note: "tokens đầu-cuối" },
        { name: "WCAG 2.2", note: "AA trở lên" },
        { name: "Motion", note: "easing system" },
        { name: "UX Writing", note: "viết ngắn" },
        { name: "Blender", note: "3D / render" },
      ],
    },
  ] satisfies Domain[],

  stack: [
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Node.js",
    "PostgreSQL",
    "Prisma",
    "Docker",
    "AWS",
    "GitHub Actions",
    "Redis",
    "tRPC",
    "Figma",
    "Playwright",
    "Rust",
    "WebGPU",
  ],
};

/* ------------------------------------------------------------------
   TRAJECTORY — dòng thời gian
   ------------------------------------------------------------------ */
export const trajectory = {
  items: [
    {
      year: "2025",
      range: "2025 — nay",
      title: "Senior Product Engineer",
      org: "CTV HJ",
      location: "Bắc Ninh",
      description: "Tâp trung phát triển các web giải trí hay.",
      tags: ["React", "TypeScript", "Design System"],
      metrics: [
        { k: "LCP", v: "−71%" },
        { k: "Ship speed", v: "+40%" },
      ],
      featured: true,
    },
    {
      year: "2024",
      range: "2024 — 2025",
      title: "Fullstack Developer",
      org: "Startup XYZ",
      location: "Remote",
      description:
        "Xây SaaS từ 0 lên 1: kiến trúc, database, thanh toán và hạ tầng deploy phục vụ nhiều người ( Tuy Nhiên non trẻ nên cơ sở ha tầng dã bi sâp và thiêt hai lớn ).",
      tags: ["Next.js", "PostgreSQL", "AWS"],
      metrics: [{ k: "Users", v: "40k" }],
    },
  ],
};

/* ------------------------------------------------------------------
   WORK — dự án
   ------------------------------------------------------------------ */
export type WorkKind = "product" | "library" | "tool";

export const work = {
  filters: [
    { id: "all", label: "Tất cả" },
    { id: "product", label: "Sản phẩm" },
    { id: "library", label: "Thư viện" },
    { id: "tool", label: "Công cụ" },
  ] as const satisfies readonly { id: WorkKind | "all"; label: string }[],

  items: [
    {
      id: "Zephi",
      name: "Project Zephi",
      year: "2026",
      kind: "product" as WorkKind,
      role: "Kiến trúc & giao diện",
      description: "Dashboard termul",
      tags: ["Next.js", "WebSocket", "PostgreSQL"],
      stars: 128,
      href: "webdasap",
      live: "webdasap",
      tone: "ice" as Tone,
      featured: true,
      metrics: [
        { k: "Event/ngày", v: "197K" },
        { k: "p95 render", v: "9ms" },
        { k: "Bundle", v: "−38%" },
      ],
    },
  ],
};

/* ------------------------------------------------------------------
   CONTACT
   ------------------------------------------------------------------ */
export const contact = {
  eyebrow: "Mở kênh",
  titleLines: [
    { text: "Cùng tạo ra thứ gì đó", style: "solid" },
    { text: "đáng nhớ.", style: "serif" },
  ] as const,
  description:
    "Dự án mới, hợp tác dài hạn, tư vấn kiến trúc — hoặc đơn giản là muốn trao đổi về công nghệ. Tôi đọc mọi tin nhắn và trả lời thật lòng. (Tôi đã off rồi a)",

  budgets: [
    { id: "small", label: "Dưới 100k" },
    { id: "mid", label: "100 — 500k" },
    { id: "large", label: "Trên 500k" },
  ] as const,

  topics: [
    { id: "new", label: "Dự án mới" },
    { id: "consult", label: "Tư vấn kiến trúc" },
    { id: "audit", label: "Audit hiệu năng" },
    { id: "other", label: "Khác" },
  ] as const,

  channels: [
    {
      label: "Email",
      value: profile.email,
      href: `mailto:${profile.email}`,
      icon: "mail" as IconName,
      copyable: true,
    },
    {
      label: "GitHub",
      value: "github.com/Wyhrdev123100",
      href: "https://github.com/Wyhrdev123100",
      icon: "github" as IconName,
      copyable: false,
    },
    {
      label: "LinkedIn",
      value: "in/zs",
      href: "https://linkedin.com/zs",
      icon: "linkedin" as IconName,
      copyable: false,
    },
  ],
};

/* ------------------------------------------------------------------
   CONSOLE — câu lệnh tương tác + nhịp commit
   ------------------------------------------------------------------ */
export const consoleData = {
  /** dòng chào mừng khi terminal mở */
  boot: [`qhvn.vercel.app console ·'gõ "help" để xem danh sách lệnh.`],

  /** kịch bản tự chạy khi section lọt vào khung nhìn */
  intro: ["whoami"],

  /** lệnh hỗ trợ: mô tả ngắn + các gợi ý (token lệnh sẽ được tô bậc đậu) */
  commands: [
    { cmd: "help", about: "Liệt kê mọi lệnh", tokens: ["help"] },
    {
      cmd: "whoami",
      about: "Ai đang chạy phiên này",
      tokens: ["whoami", "about"],
    },
    {
      cmd: "stack",
      about: "Công nghệ dùng hàng ngày",
      tokens: ["stack", "skills"],
    },
    { cmd: "projects", about: "Danh sách dự án", tokens: ["projects", "work"] },
    { cmd: "contact", about: "Kênh liên hệ", tokens: ["contact", "email"] },
    { cmd: "clear", about: "Xoá màn hình", tokens: ["clear"] },
  ],
  activity: {
    demo: true,
    source: "Siuuuuuu",
    year: 2025,
    weeks: 12,
    total: 32,
    best: 1,
    streak: 9,
  },
};

/** Ma trận 26 tuần × 7 ngày, mức 0–4. Sinh một lần, có seed cố định
 *  nên server và client luôn render giống nhau (không lệch hydration). */
function seededWeeks(weeks: number, days = 7) {
  let seed = 20260101;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: days }, (_, d) => {
      const weekday = w * days + d;
      // cuối tuần thưa hơn, giữa tuần rộn hơn — trông giống dữ liệu thật
      const rest = d === 0 || d === 6 ? 0.45 : 1;
      const v = rnd() * rest;
      if (v < 0.32) return 0;
      if (v < 0.58) return 1;
      if (v < 0.78) return 2;
      if (v < 0.92) return 3;
      return weekday % 23 === 0 ? 4 : 3;
    }),
  );
}

export const activityGrid = seededWeeks(consoleData.activity.weeks);

/* ------------------------------------------------------------------
   ĐIỀU HƯỚNG
   ------------------------------------------------------------------ */
/** `wide: true` = mục rộng, chỉ hiện từ xl lên (navbar đã sát trần ở lg) */
export type NavLink = {
  id: string;
  label: string;
  index: string;
  hint: string;
  wide?: boolean;
};

export const navLinks: readonly NavLink[] = [
  { id: "manifesto", label: "Manifesto", index: "01", hint: "Tôi nghĩ gì" },
  { id: "atlas", label: "Atlas", index: "02", hint: "Sơ đồ hồ sơ" },
  { id: "capability", label: "Capability", index: "03", hint: "Bộ công cụ" },
  { id: "trajectory", label: "Trajectory", index: "04", hint: "Hành trình" },
  { id: "work", label: "Work", index: "05", hint: "Đã build gì" },
  { id: "console", label: "Console", index: "06", hint: "Hỏi máy trực tiếp" },
  { id: "contact", label: "Contact", index: "07", hint: "Bắt đầu" },
  { id: "universe", label: "Universe", index: "08", hint: "Vũ trụ số", wide: true },
];

export const railLinks: readonly { id: string; label: string }[] = [
  { id: "top", label: "Top" },
  ...navLinks.map((l) => ({ id: l.id, label: l.label })),
];
