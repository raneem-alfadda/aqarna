"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown, LogOut, Filter, Info, Building2, ShieldCheck, Gauge,
  Download, Users2, CheckCircle2, AlertTriangle, Search
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from "recharts";

/* ======================= Types ======================= */
type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
type Region =
  | "الكل" | "الرياض" | "مكة" | "الشرقية" | "المدينة" | "عسير"
  | "تبوك" | "حائل" | "جازان" | "نجران" | "القصيم" | "الباحة" | "الجوف";

type NationalRow = {
  month: string;            // "2025-05"
  region: Region;
  owner_satisfaction: number; // 0-100
  payment_rate: number;       // 0-100
  objections_open: number;    // count
  compliance_rate: number;    // 0-100
};

type ObjStatus = "جديد" | "قيد المراجعة" | "مقبول" | "مرفوض";
type Objection = {
  id: string;
  title: string;
  union: string;         // اسم اتحاد الملاك
  region: Region;
  created: string;       // YYYY-MM-DD
  status: ObjStatus;
};

type UnionSite = {
  name: string;
  region: Region;
  units: number;
  openObjections: number;
  satisfaction: number;  // 0-100
  collection: number;    // 0-100
};

/* ============== Constants ============== */
const YEARS = [2025, 2024];
const REGIONS: Region[] = ["الكل","الرياض","مكة","الشرقية","المدينة","عسير","تبوك","حائل","جازان","نجران","القصيم","الباحة","الجوف"];
const QUARTERS: Quarter[] = ["Q1","Q2","Q3","Q4"];

/* ======================= Pro Data (Mock, but rich) ======================= */
const seed: NationalRow[] = [
  // ——— الرياض ———
  { month:"2025-04", region:"الرياض", owner_satisfaction:82, payment_rate:87, objections_open:98,  compliance_rate:91 },
  { month:"2025-05", region:"الرياض", owner_satisfaction:83, payment_rate:88, objections_open:96,  compliance_rate:92 },
  { month:"2025-06", region:"الرياض", owner_satisfaction:82, payment_rate:87, objections_open:100, compliance_rate:92 },
  // ——— الشرقية ———
  { month:"2025-04", region:"الشرقية", owner_satisfaction:78, payment_rate:83, objections_open:64, compliance_rate:88 },
  { month:"2025-05", region:"الشرقية", owner_satisfaction:79, payment_rate:84, objections_open:63, compliance_rate:88 },
  { month:"2025-06", region:"الشرقية", owner_satisfaction:79, payment_rate:84, objections_open:61, compliance_rate:89 },
  // ——— مكة ———
  { month:"2025-04", region:"مكة", owner_satisfaction:75, payment_rate:81, objections_open:90, compliance_rate:85 },
  { month:"2025-05", region:"مكة", owner_satisfaction:76, payment_rate:81, objections_open:89, compliance_rate:86 },
  { month:"2025-06", region:"مكة", owner_satisfaction:77, payment_rate:82, objections_open:88, compliance_rate:86 },
  // ——— المدينة ———
  { month:"2025-04", region:"المدينة", owner_satisfaction:80, payment_rate:84, objections_open:45, compliance_rate:90 },
  { month:"2025-05", region:"المدينة", owner_satisfaction:81, payment_rate:85, objections_open:44, compliance_rate:90 },
  { month:"2025-06", region:"المدينة", owner_satisfaction:81, payment_rate:85, objections_open:43, compliance_rate:91 },
  // ——— القصيم ———
  { month:"2025-04", region:"القصيم", owner_satisfaction:79, payment_rate:83, objections_open:32, compliance_rate:88 },
  { month:"2025-05", region:"القصيم", owner_satisfaction:79, payment_rate:84, objections_open:30, compliance_rate:88 },
  { month:"2025-06", region:"القصيم", owner_satisfaction:80, payment_rate:85, objections_open:28, compliance_rate:89 },
];

/** اعتراضات غنية لتجربة التتبع */
const seedObjections: Objection[] = [
  { id:"OBJ-22101", title:"مراجعة احتساب رسوم الحديقة", union:"اتحاد برج الندى", region:"الرياض",  created:"2025-06-06", status:"قيد المراجعة" },
  { id:"OBJ-22102", title:"ازدواجية فاتورة مايو",       union:"اتحاد مجمع الروابي", region:"الرياض", created:"2025-05-28", status:"جديد" },
  { id:"OBJ-22103", title:"رسوم صيانة مبالغ فيها",       union:"اتحاد برج الأعمال", region:"مكة",   created:"2025-05-21", status:"مقبول" },
  { id:"OBJ-22104", title:"مطالبة متأخرة غير دقيقة",     union:"اتحاد برج اليسر",   region:"الشرقية", created:"2025-06-01", status:"مرفوض" },
  { id:"OBJ-22105", title:"إلغاء خدمة لم تُستخدم",       union:"اتحاد حي النور",    region:"المدينة", created:"2025-06-04", status:"قيد المراجعة" },
  { id:"OBJ-22106", title:"خطأ في ربط الوحدة",           union:"اتحاد تلال القصيم", region:"القصيم",  created:"2025-06-05", status:"جديد" },
];

/** مواقع اتحادات (لعرضها في الجدول بجانب الصورة) */
const unionSites: UnionSite[] = [
  { name:"اتحاد برج الندى",     region:"الرياض",  units:96, openObjections:3, satisfaction:84, collection:88 },
  { name:"اتحاد مجمع الروابي",  region:"الرياض",  units:64, openObjections:1, satisfaction:82, collection:87 },
  { name:"اتحاد برج الأعمال",  region:"مكة",     units:120, openObjections:2, satisfaction:77, collection:82 },
  { name:"اتحاد برج اليسر",     region:"الشرقية", units:80, openObjections:1, satisfaction:79, collection:84 },
  { name:"اتحاد حي النور",      region:"المدينة", units:52, openObjections:1, satisfaction:81, collection:85 },
  { name:"اتحاد تلال القصيم",   region:"القصيم",  units:44, openObjections:1, satisfaction:80, collection:85 },
];

/* ======================= Helpers ======================= */
const monthLabel = (iso: string) => {
  const d = new Date(iso + "-01");
  return d.toLocaleDateString("ar-SA", { month: "short" });
};
const toCSV = (rows: (string|number)[][]) =>
  rows.map(r => r.map(f => `"${String(f).replace(/"/g,'""')}"`).join(",")).join("\n");
const avgNonZero = (a:number[]) => {
  const v = a.filter(n=>n>0);
  return v.length ? Math.round(v.reduce((s,x)=>s+x,0)/v.length) : 0;
};

/* ======================= Page ======================= */
export default function AuthorityPage(){
  const [menuOpen, setMenuOpen] = React.useState(false);

  // فلاتر عامة
  const [year, setYear] = React.useState<number>(2025);
  const [quarter, setQuarter] = React.useState<Quarter>("Q2");
  const [region, setRegion] = React.useState<Region>("الكل");

  // فلاتر الاعتراضات
  const [objStatus, setObjStatus] = React.useState<ObjStatus | "الكل">("الكل");
  const [objQuery, setObjQuery] = React.useState("");

  const qToMonths: Record<Quarter, number[]> = { Q1:[1,2,3], Q2:[4,5,6], Q3:[7,8,9], Q4:[10,11,12] };
  const months = qToMonths[quarter];

  // تصفية وطني
  const filtered = seed.filter(r => {
    const y = Number(r.month.slice(0,4));
    const m = Number(r.month.slice(5,7));
    const byYear = y === year;
    const byQuarter = months.includes(m);
    const byRegion = region === "الكل" ? true : r.region === region;
    return byYear && byQuarter && byRegion;
  });

  // تجميع شهري
  const groupedByMonth = months.map(m => {
    const label = new Date(year, m-1, 1).toISOString().slice(0,7);
    const rows = filtered.filter(r => Number(r.month.slice(5,7)) === m);
    const avg = (arr:number[]) => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0;
    const sum = (arr:number[]) => arr.reduce((a,b)=>a+b,0);
    return {
      monthISO: label,
      m: monthLabel(label),
      owner_satisfaction: avg(rows.map(x=>x.owner_satisfaction)),
      payment_rate:       avg(rows.map(x=>x.payment_rate)),
      objections_open:    sum(rows.map(x=>x.objections_open)),
      compliance_rate:    avg(rows.map(x=>x.compliance_rate)),
    };
  });

  const kpis = {
    satisfaction: avgNonZero(groupedByMonth.map(x=>x.owner_satisfaction)),
    payment:      avgNonZero(groupedByMonth.map(x=>x.payment_rate)),
    compliance:   avgNonZero(groupedByMonth.map(x=>x.compliance_rate)),
    objections:   groupedByMonth.reduce((s,x)=>s+x.objections_open,0),
  };

  // اعتراضات — فلترة وبحث
  const objections = seedObjections.filter(o => {
    const byRegion = region === "الكل" ? true : o.region === region;
    const byStatus = objStatus === "الكل" ? true : o.status === objStatus;
    const q = objQuery.trim().toLowerCase();
    const byQuery = !q ? true : [o.id, o.title, o.union].some(v => v.toLowerCase().includes(q));
    return byRegion && byStatus && byQuery;
  });

  /* ======== Export CSV ======== */
  function exportCSV(){
    const headers = ["السنة","الربع","المنطقة","الشهر","رضا الملاك","نسبة التحصيل","اعتراضات مفتوحة","التزام المعايير"];
    const rows = filtered.map(r=>[
      r.month.slice(0,4), quarter, r.region, r.month,
      r.owner_satisfaction, r.payment_rate, r.objections_open, r.compliance_rate
    ]);
    const csv = toCSV([headers, ...rows]);
    const blob = new Blob(["\uFEFF"+csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `national-index-${year}-${quarter}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-slate-900 flex flex-col">
      {/* ======= Header ======= */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur shadow-sm">
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="الصفحة الرئيسية">
            <Image src="/logo.png" alt="الهيئة العامة للعقار" width={36} height={36} className="rounded-lg" />
            <div className="leading-tight">
              <div className="font-bold text-emerald-900 text-lg">عـقـارنـا</div>
              <div className="text-[11px] text-slate-500">المؤشر الوطني لاتحاد الملاك</div>
            </div>
          </Link>

          {/* فلاتر سريعة */}
          <div className="hidden md:flex items-center gap-2">
            <Select value={year} onChange={e=>setYear(Number(e.target.value))} options={YEARS} />
            <Select value={quarter} onChange={e=>setQuarter(e.target.value as Quarter)} options={QUARTERS} />
            <Select value={region} onChange={e=>setRegion(e.target.value as Region)} options={REGIONS} />
          </div>

          {/* حساب */}
          <div className="relative">
            <button
              onClick={()=>setMenuOpen(s=>!s)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-emerald-50 shadow-sm"
              aria-haspopup="menu" aria-expanded={menuOpen}
            >
              <Building2 className="size-4 text-emerald-700" />
              <span className="hidden sm:inline">حساب: الهيئة</span>
              <ChevronDown className="size-4"/>
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl border bg-white shadow-lg text-sm overflow-hidden"
                   onMouseLeave={()=>setMenuOpen(false)} role="menu">
                <button
                  onClick={()=>{ try{localStorage.clear();}catch{}; location.href="/"; }}
                  className="w-full text-right px-4 py-2 hover:bg-emerald-50 text-rose-700 inline-flex items-center gap-2" role="menuitem"
                >
                  <LogOut className="size-4"/> تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>

        {/* شريط معلومات */}
        <div className="border-t border-slate-200 bg-slate-50/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <Filter className="size-4"/> بيانات مجمّعة — {year} • {quarter} • {region}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={exportCSV} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm hover:bg-white shadow-sm">
                <Download className="size-4" /> تصدير CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ======= Content ======= */}
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPI icon={<Gauge className="size-6" />}   label="المؤشر الوطني لرضا الملاك" value={`${kpis.satisfaction}%`} sub="متوسط مرجّح حسب المناطق" />
          <KPI icon={<CheckCircle2 className="size-6" />} label="نسبة التحصيل" value={`${kpis.payment}%`} sub="مستوى السداد خلال الفترة" />
          <KPI icon={<ShieldCheck className="size-6" />} label="التزام المعايير" value={`${kpis.compliance}%`} sub="مطابقة اتحادات الملاك" />
          <KPI icon={<AlertTriangle className="size-6" />} label="اعتراضات مفتوحة" value={kpis.objections.toLocaleString()} sub="إجمالي خلال الفترة" amber />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="اتجاه المؤشر الوطني لرضا الملاك" subtitle="متوسط شهري داخل الفترة المحددة">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={groupedByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="m" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area dataKey="owner_satisfaction" name="الرضا (%)" type="monotone" stroke="#10b981" fill="#10b98133" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="نسبة التحصيل مقابل الاعتراضات" subtitle="تحليل تقاربي">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupedByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="m" />
                  <YAxis yAxisId="left" domain={[0, 100]}/>
                  <YAxis yAxisId="right" orientation="right"/>
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="payment_rate" name="التحصيل (%)" fill="#0ea5e9" radius={[6,6,0,0]}/>
                  <Bar yAxisId="right" dataKey="objections_open" name="الاعتراضات" fill="#f59e0b" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* صورة بدل الخريطة */}
        <Card title="التغطية الجغرافية (صورة ثابتة)" subtitle="مواقع اتحادات مختارة — زر (فتح في Google Maps) داخل الجدول يفتح الموقع مباشرة">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border overflow-hidden bg-slate-100">
              <Image
                src="/قوقل ماب.PNG"   // ضع الصورة داخل مجلد public
                alt="خريطة Google"
                width={1200}
                height={420}
                priority
                className="w-full h-[420px] object-cover"
              />
            </div>
            <div className="lg:col-span-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 text-right">الاتحاد</th>
                    <th className="p-3 text-right">المنطقة</th>
                    <th className="p-3 text-right">الوحدات</th>
                    <th className="p-3 text-right">اعتراضات مفتوحة</th>
                    <th className="p-3 text-right">الرضا (%)</th>
                    <th className="p-3 text-right">التحصيل (%)</th>
                    <th className="p-3 text-right">الموقع</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(region==="الكل" ? unionSites : unionSites.filter(s=>s.region===region)).map(site=>(
                    <tr key={site.name} className="hover:bg-slate-50">
                      <td className="p-3">{site.name}</td>
                      <td className="p-3">{site.region}</td>
                      <td className="p-3">{site.units}</td>
                      <td className="p-3">{site.openObjections}</td>
                      <td className="p-3">{site.satisfaction}%</td>
                      <td className="p-3">{site.collection}%</td>
                      <td className="p-3">
                        <a
                          className="text-emerald-700 hover:underline"
                          target="_blank" rel="noopener"
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.name + " " + site.region)}`}
                        >
                          فتح في Google Maps
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* متابعة الاعتراضات */}
        <Card title="متابعة الاعتراضات" subtitle="عرض وتتبع حالات الاعتراضات الواردة من اتحادات الملاك">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-full border bg-white p-1">
              <PillButton active={objStatus==="الكل"} onClick={()=>setObjStatus("الكل")}>الكل</PillButton>
              <PillButton active={objStatus==="جديد"} onClick={()=>setObjStatus("جديد")}>جديد</PillButton>
              <PillButton active={objStatus==="قيد المراجعة"} onClick={()=>setObjStatus("قيد المراجعة")}>قيد المراجعة</PillButton>
              <PillButton active={objStatus==="مقبول"} onClick={()=>setObjStatus("مقبول")}>مقبول</PillButton>
              <PillButton active={objStatus==="مرفوض"} onClick={()=>setObjStatus("مرفوض")}>مرفوض</PillButton>
            </div>
            <div className="relative">
              <input
                value={objQuery}
                onChange={(e)=>setObjQuery(e.target.value)}
                placeholder="بحث بالعنوان / الاتحاد / رقم الاعتراض…"
                className="w-80 rounded-full border border-slate-300 bg-white px-4 py-2 pe-9 text-sm outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-emerald-900">
                <tr>
                  <th className="p-3 text-right">المعرف</th>
                  <th className="p-3 text-right">العنوان</th>
                  <th className="p-3 text-right">الاتحاد</th>
                  <th className="p-3 text-right">المنطقة</th>
                  <th className="p-3 text-right">الحالة</th>
                  <th className="p-3 text-right">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {objections.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-500">لا توجد نتائج مطابقة.</td></tr>
                ) : objections.map(o=>(
                  <tr key={o.id} className="hover:bg-emerald-50/40">
                    <td className="p-3 font-mono" dir="ltr">{o.id}</td>
                    <td className="p-3">{o.title}</td>
                    <td className="p-3">{o.union}</td>
                    <td className="p-3">{o.region}</td>
                    <td className="p-3"><StatusBadge status={o.status} /></td>
                    <td className="p-3" dir="ltr">{o.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* منهجية مختصرة */}
        <Card title="منهجية المؤشر الوطني" subtitle="وصف موجز — للاطلاع التفصيلي انتقل لصفحة المنهجية">
          <ul className="list-disc ps-6 text-sm space-y-1">
            <li>مصادر البيانات: بوابة اتحادات الملاك، مزوّدو الدفع، أنظمة البلاغات.</li>
            <li>التجميع: ترجيح حسب عدد الوحدات النشطة في كل منطقة.</li>
            <li>التحقق: تنظيف الشذوذ، إزالة التكرارات، ومطابقة الهوية المؤسسية.</li>
            <li>التحديث الدوري: شهري، مع إصدارات ربع سنوية معتمدة.</li>
          </ul>
          <div className="mt-3 text-xs text-slate-500 inline-flex items-center gap-2">
            <Info className="size-4"/>
          </div>
        </Card>
      </main>

      {/* ======= Footer ======= */}
      <footer className="mt-10 bg-gradient-to-r from-emerald-950 to-emerald-800 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="mb-3 font-semibold text-lg">عن الهيئة</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/authority/methodology" className="hover:underline">منهجية المؤشر</Link></li>
                <li><Link href="/about" className="hover:underline">الخصوصية والاستخدام</Link></li>
                <li><Link href="/about" className="hover:underline">الأحكام والشروط</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-semibold text-lg">تقارير</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:underline">التقرير ربع السنوي</a></li>
                <li><a href="#" className="hover:underline">النشرة الإحصائية</a></li>
                <li><a href="#" className="hover:underline">واجهات برمجة التطبيقات</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-semibold text-lg">تواصل</h3>
              <ul className="space-y-2 text-sm">
                <li>مركز الاتصال</li>
                <li>الدعم الفني</li>
                <li>الأسئلة الشائعة</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-semibold text-lg">قنوات الهيئة</h3>
              <div className="flex items-center gap-4 text-xl">
                <a href="#" aria-label="X" className="hover:text-emerald-300">X</a>
                <a href="#" aria-label="LinkedIn" className="hover:text-emerald-300">in</a>
                <a href="#" aria-label="YouTube" className="hover:text-emerald-300">YT</a>
                <a href="#" aria-label="Instagram" className="hover:text-emerald-300">IG</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 text-xs border-t border-white/20 text-center">
            © {new Date().getFullYear()} منصة عـقـارنـا. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ======================= UI Components ======================= */
function Select<T extends string | number>({
  value, onChange, options,
}:{
  value: T;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: T[];
}){
  return (
    <select
      value={value}
      onChange={onChange}
      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-slate-50"
    >
      {options.map((o)=> <option key={String(o)} value={String(o)}>{String(o)}</option>)}
    </select>
  );
}

function KPI({
  icon,label,value,sub,amber
}:{icon:React.ReactNode;label:string;value:string|number;sub?:string;amber?:boolean}){
  return (
    <div className={`rounded-2xl p-5 shadow-sm bg-gradient-to-br ${
      amber ? "from-amber-500 to-amber-400" : "from-emerald-600 to-emerald-500"
    } text-white hover:shadow-md transition will-change-transform hover:scale-[1.01]`}>
      <div className="flex items-start gap-3">
        <div className="grid size-12 place-items-center rounded-full bg-white/20">{icon}</div>
        <div>
          <div className="text-sm/5 text-white/80">{label}</div>
          <div className="text-3xl font-extrabold mt-1" dir="ltr">{value}</div>
          {sub && <div className="text-xs text-white/75 mt-1">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function Card({title,subtitle,children}:{title:string;subtitle?:string;children:React.ReactNode}){
  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/80 backdrop-blur shadow-sm overflow-hidden">
      <div className="p-4 border-b border-emerald-900/10 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-emerald-900">{title}</h2>
          {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function PillButton({active, children, onClick}:{active:boolean; children:React.ReactNode; onClick:()=>void}){
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-full transition ${
        active ? "bg-emerald-600 text-white shadow" : "hover:bg-emerald-50"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({status}:{status: ObjStatus}){
  const map: Record<ObjStatus, string> = {
    "جديد":"bg-blue-50 text-blue-700 border-blue-200",
    "قيد المراجعة":"bg-amber-50 text-amber-800 border-amber-200",
    "مقبول":"bg-emerald-50 text-emerald-800 border-emerald-200",
    "مرفوض":"bg-rose-50 text-rose-700 border-rose-200",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${map[status]}`}>{status}</span>;
}
