"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  LayoutDashboard,
  FileText,
  BarChart3,
  AlertTriangle,
  LogOut,
  User,
  CircleDollarSign,
  Receipt,
  Search,
  Pencil,
  X,
  ShieldAlert,
  TrendingUp,
  Info as InfoIcon,
  Filter,
  MapPin,
  Building2,
  Home,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

/* ================= Types & Mock ================= */
type Period = "month" | "quarter" | "year";
type TabKey = "overview" | "usage" | "risk";

type MonthlyRow = { k: string; charges: number; paid: number; overdue: number };
type Invoice = {
  id: string;
  period: string;
  total: number;
  status: "مدفوع" | "غير مدفوع";
  due: string;
};

const COLORS = ["#22c55e", "#34d399", "#10b981", "#4ade80", "#16a34a"];
const fmt = (n: number) => `${n.toLocaleString()} ر.س`;

const baseProfile = {
  name: "رنيم عبد العزيز",
  nationalId: "1234567890",
  phone: "0553816630",
  email: "raneem@gmail.com",
  unit: "A-12",
  building: "برج الندى",
  city: "الرياض",
};

const baseMonthly: MonthlyRow[] = [
  { k: "يناير", charges: 1800, paid: 1800, overdue: 0 },
  { k: "فبراير", charges: 1800, paid: 1800, overdue: 0 },
  { k: "مارس", charges: 1800, paid: 1800, overdue: 0 },
  { k: "ابريل", charges: 2220, paid: 2220, overdue: 0 },
  { k: "ماي", charges: 1800, paid: 1800, overdue: 0 },
  { k: "يونيو", charges: 1800, paid: 1800, overdue: 0 },
  { k: "يوليو", charges: 1800, paid: 1800, overdue: 0 },
  { k: "اغسطس", charges: 1800, paid: 1620, overdue: 180 },
  { k: "سبتمبر", charges: 1800, paid: 0, overdue: 1800 },
  { k: "اكتوبر", charges: 1380, paid: 0, overdue: 1380 },
  { k: "نوفمبر", charges: 1800, paid: 0, overdue: 1800 },
  { k: "ديسمبر", charges: 1800, paid: 0, overdue: 1800 },
];

const baseAllocation = [
  { name: "صيانة كهرباء", value: 520 },
  { name: "تشغيل مصاعد", value: 320 },
  { name: "نظافة المرافق", value: 260 },
  { name: "أمن وحراسة", value: 180 },
  { name: "حدائق ومناظر", value: 100 },
];

const baseInvoices: Invoice[] = [
  { id: "INV-240113", period: "Q3 2025", total: 1380, status: "غير مدفوع", due: "2025-10-15" },
  { id: "INV-240071", period: "Q2 2025", total: 1800, status: "مدفوع", due: "2025-07-15" },
  { id: "INV-239999", period: "Q1 2025", total: 2220, status: "مدفوع", due: "2025-04-15" },
];

/* ============== خيارات متدرجة (مدينة ← مبنى ← شقة) ============== */
type CityKey = "riyadh" | "jeddah";

const FILTER_OPTIONS: Record<
  CityKey,
  { label: string; buildings: Record<string, string[]> }
> = {
  riyadh: { label: "الرياض", buildings: { "برج الندى": ["A-12", "A-14"] } },
  jeddah: { label: "جدة", buildings: { "برج الأعمال": ["B-3", "B-7"] } },
};

const DATA_BY_SELECTION: Record<
  string,
  {
    allocation: { name: string; value: number }[];
    monthly: MonthlyRow[];
    invoices: Invoice[];
  }
> = {
  "riyadh|برج الندى|A-12": { allocation: baseAllocation, monthly: baseMonthly, invoices: baseInvoices },
  "jeddah|برج الأعمال|B-3": {
    allocation: [
      { name: "تشغيل", value: 1200 },
      { name: "صيانة", value: 900 },
      { name: "أمن", value: 450 },
      { name: "نظافة", value: 350 },
      { name: "خدمات أخرى", value: 280 },
    ],
    monthly: baseMonthly.map((m) => ({
      ...m,
      charges: Math.round(m.charges * 2.2),
      paid: Math.round(m.paid * 2.0),
      overdue: Math.round(m.overdue * 2.4),
    })),
    invoices: baseInvoices.map((inv) => ({ ...inv, total: Math.round(inv.total * 2.1) })),
  },
};

/* ================= Utils ================= */
function slope(values: number[]) {
  if (values.length < 2) return 0;
  const n = values.length;
  const xs = Array.from({ length: n }, (_, i) => i + 1);
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * values[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);
  return (n * sumXY - sumX * sumY) / Math.max(1, n * sumX2 - sumX * sumX);
}
function daysUntil(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

/* ================= Page ================= */
export default function OwnerPage() {
  const router = useRouter();

  const [period, setPeriod] = React.useState<Period>("year");
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<TabKey>("overview");

  // بيانات التسجيل
  const [profile, setProfile] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("owner_profile");
      if (saved) return JSON.parse(saved);
    }
    return baseProfile;
  });

  // فلاتر متدرجة
  const [city, setCity] = React.useState<CityKey>("riyadh");
  const firstBuilding = Object.keys(FILTER_OPTIONS[city].buildings)[0];
  const [building, setBuilding] = React.useState<string>(firstBuilding);
  const [unit, setUnit] = React.useState<string>(FILTER_OPTIONS[city].buildings[firstBuilding][0]);

  React.useEffect(() => {
    const b = Object.keys(FILTER_OPTIONS[city].buildings)[0];
    setBuilding(b);
    setUnit(FILTER_OPTIONS[city].buildings[b][0]);
  }, [city]);

  React.useEffect(() => {
    const flats = FILTER_OPTIONS[city].buildings[building] || [];
    if (flats.length) setUnit(flats[0]);
  }, [building, city]);

  // بيانات الداشبورد
  const [allocation, setAllocation] = React.useState(baseAllocation);
  const [monthly, setMonthly] = React.useState<MonthlyRow[]>(baseMonthly);
  const [invoices, setInvoices] = React.useState<Invoice[]>(baseInvoices);
  const [editOpen, setEditOpen] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const key = `${city}|${building}|${unit}`;
      const pack =
        DATA_BY_SELECTION[key] ?? { allocation: baseAllocation, monthly: baseMonthly, invoices: baseInvoices };

      const fullMonthly = pack.monthly;
      const sliced =
        period === "month" ? fullMonthly.slice(-1) :
        period === "quarter" ? fullMonthly.slice(-3) :
        fullMonthly;

      setMonthly(sliced);
      setAllocation(pack.allocation);
      setInvoices(pack.invoices);
      setLoading(false);
    }, 180);
    return () => clearTimeout(t);
  }, [period, city, building, unit]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("owner_profile", JSON.stringify(profile));
    }
  }, [profile]);

  const totals = React.useMemo(() => {
    const charges = monthly.reduce((s, d) => s + d.charges, 0);
    const paid = monthly.reduce((s, d) => s + d.paid, 0);
    const overdue = monthly.reduce((s, d) => s + d.overdue, 0);
    const rate = Math.round((100 * paid) / Math.max(1, charges));
    const spark = monthly.slice(-6).map((m) => ({ k: m.k, v: m.paid }));
    return { charges, paid, overdue, rate, spark };
  }, [monthly]);

  const filteredInvoices = invoices.filter((i) =>
    [i.id, i.period, i.status].some((v) => v.toLowerCase().includes(query.toLowerCase()))
  );

  const risk = React.useMemo(() => {
    const last6 = monthly.slice(-6);
    const paySlope = slope(last6.map((m) => m.paid));
    const overdueRatio = totals.overdue / Math.max(1, totals.charges);
    const upcoming = invoices.find((i) => i.status !== "مدفوع");
    const days = upcoming ? daysUntil(upcoming.due) : 999;

    let score = 0;
    if (overdueRatio > 0.35) score += 50;
    else if (overdueRatio > 0.15) score += 25;
    else if (overdueRatio > 0) score += 10;

    if (paySlope <= 0) score += 20;

    if (days <= 7) score += 20;
    else if (days <= 15) score += 10;

    const level: "منخفض" | "متوسط" | "مرتفع" = score >= 60 ? "مرتفع" : score >= 25 ? "متوسط" : "منخفض";

    const signals = [
      { ok: overdueRatio === 0, label: overdueRatio === 0 ? "لا توجد متأخرات" : "يوجد متأخرات", value: `${Math.round(overdueRatio * 100)}%` },
      { ok: paySlope > 0, label: paySlope > 0 ? "اتجاه سداد صاعد" : "اتجاه سداد هابط/ثابت", value: paySlope.toFixed(1) },
      { ok: days > 15, label: days > 15 ? "الاستحقاق بعيد" : "استحقاق قريب", value: isFinite(days) ? `${days} يوم` : "—" },
    ];

    const actions = [
      overdueRatio > 0 && "تفعيل تنبيه فوري ورسالة تذكير بالسداد.",
      paySlope <= 0 && "اقتراح خطة تقسيط تلقائية للرصيد المتراكم.",
      days <= 15 && "إظهار زر سداد سريع في أعلى اللوحة.",
    ].filter(Boolean) as string[];

    return { score, level, signals, actions };
  }, [invoices, monthly, totals]);

  function handleLogout() {
    try {
      localStorage.removeItem("isRegistered");
      localStorage.removeItem("userType");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPhone");
    } catch {}
    router.push("/");
  }

  // مرجع القسم + قفز
  const ownerInfoRef = React.useRef<HTMLDivElement | null>(null);
  const jumpToOwnerInfo = React.useCallback(() => {
    setTab("overview");
    requestAnimationFrame(() => ownerInfoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 relative">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl" />

      <Header onLogout={handleLogout} profile={profile} onGoOwnerInfo={jumpToOwnerInfo} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[275px_1fr] gap-6">
        <Sidebar onLogout={handleLogout} />

        <main className="space-y-6">
          <Toolbar period={period} onPeriodChange={setPeriod} query={query} onQueryChange={setQuery} />

          <CascadingFilters
            city={city}
            building={building}
            unit={unit}
            onCity={setCity}
            onBuilding={setBuilding}
            onUnit={setUnit}
            ownerName={profile?.name || "المالك"}
          />

          <Tabs active={tab} onChange={setTab} />

          {tab === "overview" && (
            <div ref={ownerInfoRef} id="owner-info">
              <OverviewSection
                allocation={allocation}
                monthly={monthly}
                totals={totals}
                invoices={filteredInvoices}
                routerPush={(href: string) => router.push(href)}
                profile={profile}
                onEditOpen={() => setEditOpen(true)}
              />
            </div>
          )}

          {tab === "usage" && <UsageSection monthly={monthly} />}

          {tab === "risk" && <RiskSection risk={risk} monthly={monthly} invoices={invoices} />}
        </main>
      </div>

      <Footer />

      {editOpen && (
        <EditModal
          initial={profile}
          onClose={() => setEditOpen(false)}
          onSave={(p) => {
            setProfile(p);
            setEditOpen(false);
          }}
        />
      )}

      {loading && <PageLoader />}
    </div>
  );
}

/* ================= Layout ================= */
function Header({
  onLogout,
  profile,
  onGoOwnerInfo,
}: {
  onLogout: () => void;
  profile: any;
  onGoOwnerInfo: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const name = profile?.name || "المالك";
  const initials = name?.split(" ").map((p: string) => p[0]).join("").slice(0, 2) || "م";

  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="الصفحة الرئيسية">
          <Image src="/logo.png" alt="منصة بينة" width={28} height={28} className="rounded-full" />
          <span className="font-semibold text-emerald-900">عـقـارنـا</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="التنقل">
          <Link href="/" className="hover:text-emerald-700">الرئيسية</Link>
          <Link href="/about" className="hover:text-emerald-700">عن المنصة</Link>
          <Link href="/owner" className="hover:text-emerald-700">لوحة المالك</Link>
        </nav>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white px-3 py-1.5 text-sm hover:bg-emerald-50"
          >
            <span className="grid size-6 place-items-center rounded-full bg-emerald-600 text-white text-xs font-semibold">
              {initials}
            </span>
            <span className="max-w-[9rem] truncate">{name}</span>
          </button>

          {open && (
            <div className="absolute left-0 mt-2 w-56 rounded-xl border bg-white shadow-md overflow-hidden">
              <button
                onClick={() => {
                  setOpen(false);
                  onGoOwnerInfo();
                }}
                className="w-full text-right px-3 py-2 text-sm hover:bg-emerald-50"
              >
                بيانات المالك
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="w-full text-right px-3 py-2 text-sm hover:bg-emerald-50"
              >
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="h-fit rounded-2xl border border-emerald-900/10 bg-white/60 backdrop-blur shadow-sm">
      <div className="p-4 border-b border-emerald-900/10">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <User className="size-5" />
          </div>
          <div>
            <div className="font-semibold">حساب المالك</div>
            <div className="text-xs text-slate-600">إدارة الرسوم والاعتراضات</div>
          </div>
        </div>
      </div>

      <nav className="p-2 text-sm">
        <SideLink href="/owner" active icon={<LayoutDashboard className="size-4" />}>اللوحة</SideLink>
        <SideLink href="/owner/satisfaction" icon={<FileText className="size-4" />}>مؤشر الرضا</SideLink>
        <SideLink href="/payments" icon={<FileText className="size-4" />}>الفواتير والرسوم</SideLink>
        <SideLink href="/reports/usage" icon={<BarChart3 className="size-4" />}>التقارير والمؤشرات</SideLink>
        <SideLink href="/objections/id" icon={<AlertTriangle className="size-4" />}>الاعتراضات</SideLink>
      </nav>

      <div className="p-3 border-t border-emerald-900/10">
        <button onClick={onLogout} className="w-full inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-white">
          <LogOut className="size-4" /> تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}

function Footer() {
  return (
    <footer className="mt-8 bg-emerald-950 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-3 font-semibold">نبذة عامة</h3>
            <ul className="space-y-2 text-sm/6">
              <li><Link className="hover:underline" href="/about">الأسئلة</Link></li>
              <li><Link className="hover:underline" href="/about">الخصوصية والاستخدام</Link></li>
              <li><Link className="hover:underline" href="/about">الأحكام والشروط</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">روابط مهمة</h3>
            <ul className="space-y-2 text-sm/6">
              <li><a className="hover:underline" href="#">خريطة الموقع</a></li>
              <li><a className="hover:underline" href="#">الهيئة العامة للعقار</a></li>
              <li><a className="hover:underline" href="#">الربط مع الجهات الحكومية</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">الدعم والتواصل</h3>
            <ul className="space-y-2 text-sm/6">
              <li>مركز الملاحظات</li>
              <li>تواصل معنا</li>
              <li>دليل المستخدم</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">مواقع التواصل الاجتماعي</h3>
            <div className="flex items-center gap-3">
              <a aria-label="X" href="#" className="hover:underline">X</a>
              <a aria-label="LinkedIn" href="#" className="hover:underline">in</a>
              <a aria-label="YouTube" href="#" className="hover:underline">YT</a>
              <a aria-label="Instagram" href="#" className="hover:underline">IG</a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 text-xs">© {new Date().getFullYear()} منصة بينة. جميع الحقوق محفوظة.</div>
      </div>
    </footer>
  );
}

/* ================= Reusable UI ================= */
function SideLink({
  href, icon, children, active = false,
}: { href: string; icon: React.ReactNode; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${active ? "bg-emerald-100 text-emerald-900 border border-emerald-200" : "hover:bg-emerald-50 border border-transparent"}`}
    >
      <span className="text-emerald-700">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

function Toolbar({
  period, onPeriodChange, query, onQueryChange,
}: { period: Period; onPeriodChange: (p: Period) => void; query: string; onQueryChange: (s: string) => void; }) {
  return (
    <div className="rounded-2xl border border-emerald-900/10 bg-white/70 backdrop-blur shadow-sm p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2" role="tablist" aria-label="تبديل الفترة">
        <PeriodBtn active={period === "month"} onClick={() => onPeriodChange("month")}>شهر</PeriodBtn>
        <PeriodBtn active={period === "quarter"} onClick={() => onPeriodChange("quarter")}>ربع</PeriodBtn>
        <PeriodBtn active={period === "year"} onClick={() => onPeriodChange("year")}>سنة</PeriodBtn>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" aria-label="بحث في الفواتير">
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="بحث في الفواتير…"
            className="w-56 rounded-full border px-4 py-2 pe-9 text-sm outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
        </div>
      </div>
    </div>
  );
}

function PeriodBtn({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void; }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-sm transition ${active ? "bg-emerald-600 text-white shadow" : "border hover:bg-emerald-50"}`}>
      {children}
    </button>
  );
}

function CascadingFilters({
  city, building, unit, onCity, onBuilding, onUnit, ownerName,
}: {
  city: CityKey; building: string; unit: string;
  onCity: (c: CityKey) => void; onBuilding: (b: string) => void; onUnit: (u: string) => void;
  ownerName: string;
}) {
  const cityKeys = Object.keys(FILTER_OPTIONS) as CityKey[];
  const buildings = Object.keys(FILTER_OPTIONS[city].buildings);
  const units = FILTER_OPTIONS[city].buildings[building] || [];

  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/70 backdrop-blur shadow-sm p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Filter className="size-4" />
          <span>البيانات تحت حساب:</span>
          <b className="text-emerald-900">{ownerName}</b>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs text-slate-600 flex items-center gap-1">
            <MapPin className="size-4" /> المدينة
          </label>
          <select value={city} onChange={(e) => onCity(e.target.value as CityKey)} className="rounded-xl border px-3 py-1.5 text-sm">
            {cityKeys.map((k) => <option key={k} value={k}>{FILTER_OPTIONS[k].label}</option>)}
          </select>

          <label className="text-xs text-slate-600 flex items-center gap-1 ms-3">
            <Building2 className="size-4" /> المبنى
          </label>
          <select value={building} onChange={(e) => onBuilding(e.target.value)} className="rounded-xl border px-3 py-1.5 text-sm">
            {buildings.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          <label className="text-xs text-slate-600 flex items-center gap-1 ms-3">
            <Home className="size-4" /> الشقة
          </label>
          <select value={unit} onChange={(e) => onUnit(e.target.value)} className="rounded-xl border px-3 py-1.5 text-sm">
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}

function GlowCard({ children, glow = "emerald" }: { children: React.ReactNode; glow?: "emerald" | "amber"; }) {
  const ring = glow === "amber" ? "from-amber-400/40 to-transparent" : "from-emerald-400/40 to-transparent";
  return (
    <div className="relative rounded-2xl border border-emerald-900/10 bg-white/70 backdrop-blur p-4 overflow-hidden">
      <div className={`pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br ${ring} opacity-40 blur-2xl`} />
      <div className="relative">{children}</div>
    </div>
  );
}

function KPI({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</div>
      <div>
        <div className="text-xs text-slate-600">{label}</div>
        <div className="text-lg font-semibold" dir="ltr">{value}</div>
        {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function MiniSpark({ data }: { data: { k: string; v: number }[] }) {
  return (
    <div className="mt-3 h-[56px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}><Line dataKey="v" type="monotone" stroke="#10b981" strokeWidth={2} dot={false} /></LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniArea({ data }: { data: { k: string; v: number }[] }) {
  return (
    <div className="mt-3 h-[56px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}><Area dataKey="v" type="monotone" stroke="#0ea5e9" fill="#0ea5e933" strokeWidth={2} /></AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniLine({ data, stroke = "#f59e0b" }: { data: { k: string; v: number }[]; stroke?: string; }) {
  return (
    <div className="mt-3 h-[56px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}><Line dataKey="v" type="monotone" stroke={stroke} strokeWidth={2} dot={false} /></LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Tabs({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  const Item = ({ k, label, icon }: { k: TabKey; label: string; icon: React.ReactNode }) => (
    <button
      role="tab" aria-selected={active === k} onClick={() => onChange(k)}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border transition ${active === k ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-emerald-50"}`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="flex items-center gap-2" role="tablist" aria-label="الأقسام">
      <Item k="overview" label="نظرة عامة" icon={<LayoutDashboard className="size-4" />} />
      <Item k="usage" label="اتجاه الاستخدام" icon={<TrendingUp className="size-4" />} />
      <Item k="risk" label="المخاطر" icon={<ShieldAlert className="size-4" />} />
    </div>
  );
}

function GlassCard({
  title, subtitle, right, children,
}: { title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode; }) {
  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/70 backdrop-blur shadow-sm overflow-hidden">
      <div className="p-5 border-b border-emerald-900/10 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-emerald-900">{title}</h2>
          {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-emerald-900/10 bg-white/60 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function StatusChip({ status }: { status: Invoice["status"] }) {
  const cls = status === "مدفوع" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
  return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{status}</span>;
}

/* ================= Sections ================= */
function OverviewSection({
  allocation, monthly, totals, invoices, routerPush, profile, onEditOpen,
}: {
  allocation: { name: string; value: number }[];
  monthly: MonthlyRow[];
  totals: { charges: number; paid: number; overdue: number; rate: number; spark: { k: string; v: number }[]; };
  invoices: Invoice[];
  routerPush: (href: string) => void;
  profile: any;
  onEditOpen: () => void;
}) {
  return (
    <>
      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <GlowCard>
          <KPI icon={<CircleDollarSign className="size-5" />} label="إجمالي المستحقات" value={fmt(totals.charges)} sub="للفترة المحددة" />
          <MiniSpark data={totals.spark} />
        </GlowCard>

        <GlowCard>
          <KPI icon={<Receipt className="size-5" />} label="مدفوع" value={fmt(totals.paid)} sub={`نسبة السداد ${totals.rate}%`} />
          <MiniArea data={monthly.map((m) => ({ k: m.k, v: m.paid }))} />
        </GlowCard>

        <GlowCard glow="amber">
          <KPI icon={<AlertTriangle className="size-5" />} label="متأخرات" value={fmt(totals.overdue)} sub="المبالغ غير المسددة" />
          <MiniLine data={monthly.map((m) => ({ k: m.k, v: m.overdue }))} stroke="#f59e0b" />
        </GlowCard>

        <GlowCard>
          <div className="flex items-start justify-between">
            <KPI icon={<FileText className="size-5" />} label="فواتير مفتوحة" value={invoices.filter((i) => i.status !== "مدفوع").length} sub="بحاجة لاتخاذ إجراء" />
            <button className="rounded-full border px-3 py-1 text-xs hover:bg-emerald-50">إدارة</button>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            أقرب استحقاق: <span dir="ltr">{invoices[0]?.due || "—"}</span>
          </div>
        </GlowCard>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GlassCard title="أين ذهبت أموالك؟" subtitle={`إجمالي: ${fmt(allocation.reduce((s, x) => s + x.value, 0))}`}>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                  {allocation.map((e, i) => (<Cell key={e.name} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="المستحق والمدفوع (Stacked)">
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="k" />
                <YAxis />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Legend />
                <Bar dataKey="charges" name="مستحق" fill="#22c55e" stackId="a" radius={[8, 8, 0, 0]} />
                <Bar dataKey="paid" name="مدفوع" fill="#0ea5e9" stackId="a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_.6fr] gap-6">
        <GlassCard
          title="الفواتير"
          right={<Link href="/owner/fees" className="text-sm text-emerald-700 hover:underline">عرض الكل</Link>}
        >
          <div className="overflow-x-auto">
            <InvoicesTable invoices={invoices} routerPush={routerPush} />
          </div>
        </GlassCard>

        {/* قسم بيانات المالك */}
        <GlassCard
          title="بيانات المالك"
          right={
            <button onClick={onEditOpen} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs hover:bg-emerald-50">
              <Pencil className="size-4" /> تعديل
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-3 text-sm">
            <Info label="الاسم الكامل" value={profile.name} />
            <Info label="رقم الهوية" value={profile.nationalId} mono />
            <Info label="الجوال" value={profile.phone} mono />
            <Info label="البريد" value={profile.email} />
            <Info label="المدينة" value={profile.city} />
            <Info label="المبنى/الوحدة" value={`${profile.building} — ${profile.unit}`} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={onEditOpen} className="rounded-xl border px-3 py-2 text-center text-sm hover:bg-white">تعديل البيانات</button>
            <Link href="/owner/preferences" className="rounded-xl border px-3 py-2 text-center text-sm hover:bg-white">الإشعارات</Link>
          </div>
        </GlassCard>
      </section>
    </>
  );
}

function InvoicesTable({ invoices, routerPush }: { invoices: Invoice[]; routerPush: (href: string) => void; }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-emerald-50/60 text-emerald-900">
        <tr>
          <th className="p-3 text-right">رقم الفاتورة</th>
          <th className="p-3 text-right">الفترة</th>
          <th className="p-3 text-right">المبلغ</th>
          <th className="p-3 text-right">الاستحقاق</th>
          <th className="p-3 text-right">الحالة</th>
          <th className="p-3"></th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {invoices.map((inv) => (
          <tr key={inv.id} className="hover:bg-emerald-50/30 transition">
            <td className="p-3 font-mono" dir="ltr">{inv.id}</td>
            <td className="p-3">{inv.period}</td>
            <td className="p-3" dir="ltr">{fmt(inv.total)}</td>
            <td className="p-3" dir="ltr">{inv.due}</td>
            <td className="p-3"><StatusChip status={inv.status} /></td>
            <td className="p-3">
              <div className="flex items-center gap-2">
                {inv.status !== "مدفوع" && (
                  <button
                    onClick={() => routerPush(`/payments?invoice=${inv.id}`)}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
                  >
                    سداد
                  </button>
                )}
                <Link href={`/owner/fees/${inv.id}`} className="rounded-lg border px-3 py-1.5 hover:bg-white">
                  تفاصيل
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function UsageSection({ monthly }: { monthly: MonthlyRow[] }) {
  const last12 = monthly.slice(-12);
  const utilization = last12.map((m) => ({ k: m.k, rate: Math.round((100 * m.paid) / Math.max(1, m.charges)) }));
  const arrears = last12.map((m) => ({ k: m.k, amt: m.overdue }));

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <GlassCard title="اتجاه السداد (% من المستحق)">
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={utilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="k" />
              <YAxis domain={[0, 110]} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend />
              <Line dataKey="rate" name="نسبة السداد" type="monotone" stroke="#10b981" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard title="تغير المتأخرات شهريًا">
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={arrears}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="k" />
              <YAxis />
              <Tooltip formatter={(v) => fmt(Number(v))} />
              <Legend />
              <Bar dataKey="amt" name="المتأخرات" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard title="ملخص سريع">
        <ul className="text-sm list-disc ps-5 space-y-1">
          <li>
            متوسط نسبة السداد آخر 6 أشهر:{" "}
            {Math.round(utilization.slice(-6).reduce((a, b) => a + b.rate, 0) / Math.max(1, utilization.slice(-6).length))}%
          </li>
          <li>
            أعلى شهر التزام:{" "}
            {utilization.reduce((best, cur) => (cur.rate > (best?.rate ?? -1) ? cur : best), undefined as any)?.k || "—"}
          </li>
          <li>
            أعلى متأخرات:{" "}
            {arrears.reduce((best, cur) => (cur.amt > (best?.amt ?? -1) ? cur : best), undefined as any)?.k || "—"}
          </li>
        </ul>
      </GlassCard>
    </section>
  );
}

function RiskBadge({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <div className={`rounded-xl border px-3 py-2 text-sm inline-flex items-center gap-2 ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
      <span className="font-medium">{label}</span>
      <span className="opacity-70">({value})</span>
    </div>
  );
}

function RiskSection({
  risk, monthly, invoices,
}: {
  risk: { score: number; level: "منخفض" | "متوسط" | "مرتفع"; signals: { ok: boolean; label: string; value: string }[]; actions: string[]; };
  monthly: MonthlyRow[];
  invoices: Invoice[];
}) {
  return (
    <section className="space-y-6">
      <GlassCard
        title="تقييم المخاطر"
        subtitle="نموذج مبسط قابل للتطوير وربطه بمحرك قواعد"
        right={<div className="text-sm text-slate-600">النتيجة: <b>{risk.score}</b> / 100</div>}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm border ${
              risk.level === "مرتفع"
                ? "border-amber-400 bg-amber-50 text-amber-900"
                : risk.level === "متوسط"
                ? "border-yellow-300 bg-yellow-50 text-yellow-800"
                : "border-emerald-300 bg-emerald-50 text-emerald-800"
            }`}
          >
            <ShieldAlert className="size-4" /> مستوى الخطر: {risk.level}
          </span>

          {risk.signals.map((s, i) => <RiskBadge key={i} ok={s.ok} label={s.label} value={s.value} />)}
        </div>
      </GlassCard>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GlassCard title="اتجاهات تدعم التقييم">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly.slice(-6).map((m) => ({ k: m.k, paid: m.paid, overdue: m.overdue }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="k" />
                <YAxis />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Legend />
                <Line dataKey="paid" name="مدفوع" type="monotone" stroke="#10b981" strokeWidth={2} dot />
                <Line dataKey="overdue" name="متأخر" type="monotone" stroke="#f59e0b" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="إشعارات ومؤشرات" subtitle="أتمتة إجراءات استباقية">
          <ul className="text-sm space-y-2">
            {risk.actions.length === 0 && <li className="text-slate-500">لا يوجد إجراءات فورية حالياً.</li>}
            {risk.actions.map((a, i) => (
              <li key={i} className="flex items-start gap-2">
                <InfoIcon className="size-4 mt-1 text-slate-500" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-xs text-slate-500"></div>
        </GlassCard>
      </section>

      <GlassCard title="الفواتير ذات الأولوية">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-50 text-amber-900">
              <tr>
                <th className="p-3 text-right">الفاتورة</th>
                <th className="p-3 text-right">الفترة</th>
                <th className="p-3 text-right">المبلغ</th>
                <th className="p-3 text-right">الاستحقاق</th>
                <th className="p-3 text-right">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices
                .filter((i) => i.status !== "مدفوع")
                .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
                .map((inv) => (
                  <tr key={inv.id} className="hover:bg-amber-50/50">
                    <td className="p-3 font-mono" dir="ltr">{inv.id}</td>
                    <td className="p-3">{inv.period}</td>
                    <td className="p-3" dir="ltr">{fmt(inv.total)}</td>
                    <td className="p-3" dir="ltr">{inv.due}</td>
                    <td className="p-3"><StatusChip status={inv.status} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </section>
  );
}

/* ================= Modals & Helpers ================= */
function EditModal({ initial, onClose, onSave }: { initial: any; onClose: () => void; onSave: (p: any) => void; }) {
  const [form, setForm] = React.useState(initial);
  function set<K extends keyof typeof form>(k: K, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">تعديل بيانات المالك</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100" aria-label="إغلاق">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Field label="الاسم الكامل"><input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} /></Field>
          <Field label="رقم الهوية"><input value={form.nationalId} onChange={(e) => set("nationalId", e.target.value)} className={inputCls} /></Field>
          <Field label="الجوال"><input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} /></Field>
          <Field label="البريد"><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} /></Field>
          <Field label="المدينة"><input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} /></Field>
          <Field label="المبنى"><input value={form.building} onChange={(e) => set("building", e.target.value)} className={inputCls} /></Field>
          <Field label="الوحدة"><input value={form.unit} onChange={(e) => set("unit", e.target.value)} className={inputCls} /></Field>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border px-4 py-2 text-sm">إلغاء</button>
          <button onClick={() => onSave(form)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700">حفظ</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-emerald-900/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-600/30";

function PageLoader() {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-white/60 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-2 shadow-sm">
        <Bell className="size-4 animate-bounce" />
        <span className="text-sm">يتم تحديث البيانات…</span>
      </div>
    </div>
  );
}
