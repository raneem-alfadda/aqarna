"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  User,
  LogOut,
  BarChart3,
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Layers,
  Download,
  Printer,
  Info,
  Building2,
  Calendar,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from "recharts";

/* ================= Mock Data & Utils ================= */
type Period = "3m" | "6m" | "12m";
type Building = "برج الندى" | "برج الياسمين" | "مجمع الهدى";

const COLORS = ["#0ea5e9", "#10b981", "#34d399", "#22c55e", "#16a34a", "#4ade80", "#86efac"];

const SEED: Record<Building, number> = {
  "برج الندى": 1,
  "برج الياسمين": 2,
  "مجمع الهدى": 3,
};

function seededRand(seed: number) {
  let s = seed * 16807 % 2147483647;
  return () => (s = s * 16807 % 2147483647) / 2147483647;
}

function genData(building: Building) {
  const rnd = seededRand(SEED[building]);
  const months = ["يناير","فبراير ","مارس","ابريل ","مايو","يونيو","يوليو","اغسطس","سبتمبر","اكتوبر","نوفمبر","ديسمبر"];

  const monthly = months.map((k) => {
    const charges = 1600 + Math.round(rnd() * 1200);
    const paid = Math.max(0, charges - Math.round(rnd() * 400));
    const overdue = Math.max(0, charges - paid);
    return { k, charges, paid, overdue };
  });

  const breakdown = [
    { label: "صيانة المصاعد", amount: 3500 + Math.round(rnd() * 2500) },
    { label: "أمن وحراسة", amount: 3000 + Math.round(rnd() * 2400) },
    { label: "نظافة وخدمات", amount: 2400 + Math.round(rnd() * 2200) },
    { label: "تكييف مركزي", amount: 1800 + Math.round(rnd() * 1800) },
    { label: "حدائق ومسطحات", amount: 1200 + Math.round(rnd() * 1400) },
  ];

  return { monthly, breakdown };
}

function toCSV(rows: (string|number)[][]) {
  return rows.map(r => r.map(f => `"${String(f).replace(/"/g,'""')}"`).join(",")).join("\n");
}
function downloadCSV(filename: string, rows: (string|number)[][]) {
  const csv = "\uFEFF" + toCSV(rows);
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
function printSection(html: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

function labelForPeriod(p: Period) {
  return p === "3m" ? "٣ أشهر" : p === "6m" ? "٦ أشهر" : "١٢ شهرًا";
}

/* ================= Page ================= */
export default function UsageDashboardPage() {
  const router = useRouter();
  const [period, setPeriod] = React.useState<Period>("12m");
  const [building, setBuilding] = React.useState<Building>("برج الندى");
  const [categoryFilter, setCategoryFilter] = React.useState<string | "الكل">("الكل");
  const [menuOpen, setMenuOpen] = React.useState(false);

  const base = React.useMemo(() => genData(building), [building]);

  const monthly = React.useMemo(() => {
    const all = base.monthly;
    if (period === "3m") return all.slice(-3);
    if (period === "6m") return all.slice(-6);
    return all;
  }, [base.monthly, period]);

  const breakdownAll = base.breakdown;
  const breakdown =
    categoryFilter === "الكل" ? breakdownAll : breakdownAll.filter(b => b.label === categoryFilter);

  const totalCharges = monthly.reduce((s, x) => s + x.charges, 0);
  const totalPaid    = monthly.reduce((s, x) => s + x.paid, 0);
  const totalOverdue = monthly.reduce((s, x) => s + x.overdue, 0);
  const payRate      = Math.round((totalPaid / Math.max(1, totalCharges)) * 100);

  const maxMonth = monthly.reduce((m, x) => (x.charges > m.charges ? x : m), monthly[0]);
  const growth =
    monthly.length > 1
      ? Math.round(((monthly.at(-1)!.charges - monthly[0].charges) / Math.max(1, monthly[0].charges)) * 100)
      : 0;

  const totalBreakdown = breakdown.reduce((s, x) => s + x.amount, 0);
function exportBreakdownCSV() {
  const rows = [["البند","المبلغ"]];
  let total = 0;

  breakdownAll.forEach(b => {
    const amt = Number(b.amount) || 0; // نتأكد إنه رقم
    rows.push([b.label, amt.toString()]);
    total += amt;
  });

  rows.push(["الإجمالي", total.toString()]);
  downloadCSV("usage-breakdown.csv", rows);
}


  function printReport() {
    const html = `
      <html dir="rtl"><head>
        <meta charset="utf-8"/>
        <title>تقرير الاستخدام</title>
        <style>
          body{font-family: system-ui, -apple-system, Segoe UI, Roboto; padding:24px; color:#0f172a}
          h1{margin:0 0 8px; color:#064e3b}
          table{width:100%; border-collapse:collapse; margin-top:12px}
          th,td{border:1px solid #e5e7eb; padding:8px; font-size:13px}
          th{background:#ecfdf5; text-align:right}
        </style>
      </head>
      <body>
        <h1>تقرير استخدام الرسوم</h1>
        <div>المبنى: ${building} • الفترة: ${labelForPeriod(period)}</div>
        <table>
          <thead><tr><th>الشهر</th><th>مستحق</th><th>مدفوع</th><th>متأخر</th></tr></thead>
          <tbody>
            ${monthly.map(m=>`<tr><td>${m.k}</td><td>${m.charges.toLocaleString()}</td><td>${m.paid.toLocaleString()}</td><td>${m.overdue.toLocaleString()}</td></tr>`).join("")}
          </tbody>
        </table>
      </body></html>`;
    printSection(html);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/owner")}
            className="inline-flex items-center gap-2 text-sm hover:text-emerald-700"
          >
            <ArrowRight className="size-4" />
            لوحة المالك
          </button>

          <Link href="/" className="flex items-center gap-2" aria-label="الصفحة الرئيسية">
            <span className="font-semibold text-emerald-900">عـقـارنـا </span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white px-3 py-1.5 text-sm hover:bg-emerald-50"
            >
              <User className="size-4 text-emerald-700" />
              <span className="hidden sm:inline">حساب: رنيم عبد العزيز</span>
              <ChevronDown className="size-4" />
            </button>
            {menuOpen && (
              <div
                className="absolute left-0 mt-2 w-56 rounded-xl border bg-white shadow-lg text-sm overflow-hidden"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <Link href="/owner" className="block px-4 py-2 hover:bg-emerald-50 text-emerald-900">
                  لوحة المالك
                </Link>
                <Link href="/owner/settings" className="block px-4 py-2 hover:bg-emerald-50 text-emerald-900">
                  بيانات المالك
                </Link>
                <button
                  onClick={() => { try { localStorage.clear(); } catch {} location.href = "/"; }}
                  className="w-full text-right px-4 py-2 hover:bg-emerald-50 text-rose-700 inline-flex items-center gap-2"
                >
                  <LogOut className="size-4" />
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero / Filters */}
      <div className="bg-gradient-to-b from-emerald-100 via-white to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">لوحة تقارير الاستخدام</h1>
              <p className="text-sm text-slate-600 mt-1">
                تحليل شامل للمستحق/المدفوع والمتأخر حسب الوقت والبنود.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FilterPill icon={<Calendar className="size-4" />} label="الفترة">
                <PeriodSwitch value={period} onChange={setPeriod} />
              </FilterPill>
              <FilterPill icon={<Building2 className="size-4" />} label="المبنى">
                <select
                  value={building}
                  onChange={(e)=>setBuilding(e.target.value as Building)}
                  className="rounded-full border px-3 py-1.5 text-sm"
                >
                  <option>برج الندى</option>
                  <option>برج الياسمين</option>
                  <option>مجمع الهدى</option>
                </select>
              </FilterPill>
              <FilterPill icon={<Filter className="size-4" />} label="البند">
                <select
                  value={categoryFilter}
                  onChange={(e)=>setCategoryFilter(e.target.value as any)}
                  className="rounded-full border px-3 py-1.5 text-sm"
                >
                  <option>الكل</option>
                  {base.breakdown.map(b => <option key={b.label}>{b.label}</option>)}
                </select>
              </FilterPill>
              <button onClick={exportBreakdownCSV} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-white">
                <Download className="size-4" /> CSV
              </button>
              <button onClick={printReport} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-white">
                <Printer className="size-4" /> طباعة
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-10 flex-1 space-y-6">
        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={<CircleDollarSign className="size-5" />}
            label="إجمالي المستحق"
            value={`${totalCharges.toLocaleString()} ر.س`}
            hint={`لـ ${labelForPeriod(period)}`}
          />
          <StatCard
            icon={<Receipt className="size-5" />}
            label="مدفوع"
            value={`${totalPaid.toLocaleString()} ر.س`}
            hint={`نسبة السداد ${payRate}%`}
            trend={payRate >= 90 ? "good" : payRate >= 70 ? "ok" : "bad"}
          />
          <StatCard
            icon={<TrendingDown className="size-5" />}
            label="متأخر"
            value={`${totalOverdue.toLocaleString()} ر.س`}
            trend={totalOverdue === 0 ? "good" : "bad"}
          />
          <StatCard
            icon={<BarChart3 className="size-5" />}
            label="أعلى شهر صرفًا"
            value={`${maxMonth.k} — ${maxMonth.charges.toLocaleString()} ر.س`}
            hint={growth >= 0 ? `اتجاه +${growth}%` : `اتجاه ${growth}%`}
          />
        </section>

        {/* Stacked / Composed */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <GlassCard title="المستحق والمدفوع والمتأخر (Composed)" subtitle={`الفترة: ${labelForPeriod(period)}`}>
            <div className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="k" />
                  <YAxis />
                  <Tooltip formatter={(v: any)=>`${Number(v).toLocaleString()} ر.س`} />
                  <Legend />
                  <Bar dataKey="charges" name="مستحق" fill="#10b981" radius={[8,8,0,0]} />
                  <Bar dataKey="paid"    name="مدفوع" fill="#0ea5e9" radius={[8,8,0,0]} />
                  <Line type="monotone" dataKey="overdue" name="متأخر" stroke="#f59e0b" strokeWidth={2}/>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard title="اتجاه المدفوع مقابل المتأخر (Area)">
            <div className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly.map(m=>({k:m.k, paid:m.paid, overdue:m.overdue}))}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="k" />
                  <YAxis />
                  <Tooltip formatter={(v: any)=>`${Number(v).toLocaleString()} ر.س`} />
                  <Legend />
                  <Area type="monotone" dataKey="paid" name="مدفوع" stroke="#10b981" fill="#10b98133" strokeWidth={2}/>
                  <Area type="monotone" dataKey="overdue" name="متأخر" stroke="#f59e0b" fill="#f59e0b33" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </section>

        {/* Breakdown + Donut */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <GlassCard title="تفصيل بنود الصرف" subtitle={`إجمالي: ${totalBreakdown.toLocaleString()} ر.س`}>
            <ul className="space-y-2 text-sm">
              {breakdownAll.map((x, i) => (
                <li key={x.label} className="flex items-center gap-3 rounded-xl border p-3 bg-white">
                  <span className="inline-block size-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <div className="flex-1">
                    <div className="font-medium">{x.label}</div>
                    <div className="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((x.amount / totalBreakdown) * 100)}%`,
                          background: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="font-semibold" dir="ltr">{x.amount.toLocaleString()} ر.س</div>
                    <div className="text-xs text-slate-500">{Math.round((x.amount/totalBreakdown)*100)}%</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-xs text-emerald-900 flex items-start gap-2">
              <Info className="size-4 mt-0.5" />
              يمكن لاحقًا ربط البنود بفاتورات فعلية وعرض Drill-down لكل بند.
            </div>
          </GlassCard>

          <GlassCard title="نسب الصرف (Donut)">
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdownAll} dataKey="amount" nameKey="label" innerRadius={75} outerRadius={115} paddingAngle={3}>
                    {breakdownAll.map((e,i)=><Cell key={e.label} fill={COLORS[i%COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v:any)=>`${Number(v).toLocaleString()} ر.س`}/>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </section>

        {/* Heat-like calendar + Top table */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <GlassCard title="كثافة المصروف الشهري (Heat)">
            <div className="grid grid-cols-6 gap-2">
              {monthly.map((m,i)=>{
                const pct = Math.min(1, m.charges / (maxMonth.charges || 1));
                return (
                  <div key={i} className="rounded-xl border p-3">
                    <div className="text-sm font-medium mb-2">{m.k}</div>
                    <div className="h-24 rounded-lg" style={{ background: `linear-gradient(to top, #10b981 ${Math.round(pct*100)}%, #e2e8f0 ${Math.round((1-pct)*100)}%)`}} />
                    <div className="mt-2 text-xs text-slate-600" dir="ltr">{m.charges.toLocaleString()} ر.س</div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard title="أفضل البنود تكلفة">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50/60 text-emerald-900">
                <tr>
                  <th className="p-3 text-right">البند</th>
                  <th className="p-3 text-right">المبلغ</th>
                  <th className="p-3 text-right">نسبة</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {breakdownAll
                  .slice()
                  .sort((a,b)=>b.amount-a.amount)
                  .map((x,i)=>(
                  <tr key={x.label} className="hover:bg-emerald-50/30">
                    <td className="p-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-block size-2.5 rounded-full" style={{background:COLORS[i%COLORS.length]}}/>
                        {x.label}
                      </span>
                    </td>
                    <td className="p-3" dir="ltr">{x.amount.toLocaleString()} ر.س</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full" style={{width:`${Math.round((x.amount/totalBreakdown)*100)}%`, background:COLORS[i%COLORS.length]}}/>
                        </div>
                        <span className="text-xs text-slate-600">{Math.round((x.amount/totalBreakdown)*100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-8 bg-emerald-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FooterCol />
            <LinksCol />
            <SupportCol />
            <SocialCol />
          </div>
          <div className="mt-8 pt-6 text-xs">© {new Date().getFullYear()} منصة عـقـارنـا. جميع الحقوق محفوظة.</div>
        </div>
      </footer>
    </div>
  );
}

/* ================= UI Pieces ================= */
function PeriodSwitch({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const Btn = ({ k, label }: { k: Period; label: string }) => (
    <button
      onClick={() => onChange(k)}
      className={`rounded-full px-3 py-1.5 text-sm border transition ${
        value === k ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-emerald-50"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex items-center gap-2">
      <Btn k="3m" label="٣ أشهر" />
      <Btn k="6m" label="٦ أشهر" />
      <Btn k="12m" label="١٢ شهرًا" />
    </div>
  );
}

function FilterPill({icon,label,children}:{icon:React.ReactNode;label:string;children:React.ReactNode}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm">
      <span className="text-emerald-700">{icon}</span>
      <span className="text-slate-700">{label}:</span>
      {children}
    </div>
  );
}

function StatCard({
  icon, label, value, hint, trend,
}:{
  icon:React.ReactNode; label:string; value:React.ReactNode; hint?:string;
  trend?: "good"|"ok"|"bad";
}) {
  const trendCls =
    trend === "good" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
    trend === "ok"   ? "text-amber-700 bg-amber-50 border-amber-200" :
    trend === "bad"  ? "text-rose-700 bg-rose-50 border-rose-200" : "";
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm">
      <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-slate-600">{label}</div>
        <div className="text-lg font-semibold mt-0.5" dir="ltr">{value}</div>
        {hint && <div className="text-xs text-slate-500 mt-0.5">{hint}</div>}
      </div>
      {trend && <span className={`rounded-full px-2 py-0.5 text-xs border ${trendCls}`}>{trend==="good"?"جيد":trend==="ok"?"متوسط":"منخفض"}</span>}
    </div>
  );
}

function GlassCard({title,subtitle,children}:{title:string;subtitle?:string;children:React.ReactNode}) {
  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/70 backdrop-blur shadow-sm overflow-hidden">
      <div className="p-5 border-b border-emerald-900/10 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-emerald-900">{title}</h2>
          {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <Layers className="size-4" /> تقرير تفاعلي
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

/* Footer columns */
function FooterCol() {
  return (
    <div>
      <h3 className="mb-3 font-semibold">نبذة عامة</h3>
      <ul className="space-y-2 text-sm/6">
        <li><Link className="hover:underline" href="/about">الأسئلة</Link></li>
        <li><Link className="hover:underline" href="/about">الخصوصية والاستخدام</Link></li>
        <li><Link className="hover:underline" href="/about">الأحكام والشروط</Link></li>
      </ul>
    </div>
  );
}
function LinksCol() {
  return (
    <div>
      <h3 className="mb-3 font-semibold">روابط مهمة</h3>
      <ul className="space-y-2 text-sm/6">
        <li><a className="hover:underline" href="#">خريطة الموقع</a></li>
        <li><a className="hover:underline" href="#">الهيئة العامة للعقار</a></li>
        <li><a className="hover:underline" href="#">الربط مع الجهات الحكومية</a></li>
      </ul>
    </div>
  );
}
function SupportCol() {
  return (
    <div>
      <h3 className="mb-3 font-semibold">الدعم والتواصل</h3>
      <ul className="space-y-2 text-sm/6">
        <li>مركز الملاحظات</li>
        <li>تواصل معنا</li>
        <li>دليل المستخدم</li>
      </ul>
    </div>
  );
}
function SocialCol() {
  return (
    <div>
      <h3 className="mb-3 font-semibold">مواقع التواصل الاجتماعي</h3>
      <div className="flex items-center gap-3">
        <a aria-label="X" href="#" className="hover:underline">X</a>
        <a aria-label="LinkedIn" href="#" className="hover:underline">in</a>
        <a aria-label="YouTube" href="#" className="hover:underline">YT</a>
        <a aria-label="Instagram" href="#" className="hover:underline">IG</a>
      </div>
    </div>
  );
}

