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
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  Trash2,
  Copy,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

/* ================= Types & Seed ================= */
type StatusT = "قيد المراجعة" | "مقبول" | "مرفوض";
type Row = { id: string; title: string; created: string; status: StatusT };

const FALLBACK_OWNER = "رنيم عبد العزيز";
const SEED: Row[] = [
  { id: "OBJ-2207", title: "مراجعة احتساب رسوم 7%", created: "2025-09-10", status: "قيد المراجعة" },
  { id: "OBJ-2188", title: "رسوم مكرّرة على يوليو", created: "2025-08-22", status: "مقبول" },
  { id: "OBJ-2154", title: "طلب إعادة فحص استهلاك المياه", created: "2025-08-09", status: "مرفوض" },
];

/* ================= Page ================= */
export default function OwnerObjectionsList() {
  const router = useRouter();

  // owner name from registration if present
  const ownerName = React.useMemo(() => {
    try {
      const s = typeof window !== "undefined" ? localStorage.getItem("owner_profile") : null;
      if (!s) return FALLBACK_OWNER;
      const p = JSON.parse(s);
      return p?.name || FALLBACK_OWNER;
    } catch {
      return FALLBACK_OWNER;
    }
  }, []);

  const [rows, setRows] = React.useState<Row[]>(() => {
    try {
      const local = localStorage.getItem("owner_objections");
      if (local) return JSON.parse(local);
    } catch {}
    return SEED;
  });

  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"" | StatusT>("");
  const [sort, setSort] = React.useState<"new" | "old">("new");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    try { localStorage.setItem("owner_objections", JSON.stringify(rows)); } catch {}
  }, [rows]);

  const filtered = React.useMemo(() => {
    let list = rows.filter((r) => {
      const okQ = !q || r.id.toLowerCase().includes(q.toLowerCase()) || r.title.toLowerCase().includes(q.toLowerCase());
      const okS = !status || r.status === status;
      return okQ && okS;
    });
    list.sort((a, b) => (sort === "new" ? +new Date(b.created) - +new Date(a.created) : +new Date(a.created) - +new Date(b.created)));
    return list;
  }, [rows, q, status, sort]);

  // row helpers
  function onDelete(id: string) {
    if (!confirm("حذف الاعتراض؟")) return;
    setRows((r) => r.filter((x) => x.id !== id));
  }
  function onDuplicate(r: Row) {
    const copy: Row = { ...r, id: nextId(), created: today() };
    setRows((arr) => [copy, ...arr]);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 text-slate-900 flex flex-col relative">
      {/* soft blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => router.push("/owner")} className="inline-flex items-center gap-2 text-sm hover:text-emerald-700">
            <ArrowRight className="size-4" /> لوحة المالك
          </button>

          <Link href="/" className="flex items-center gap-2" aria-label="الصفحة الرئيسية">
            <Image src="/logo.png" alt="منصة بينة" width={28} height={28} className="rounded-full" />
          </Link>

          <AccountMenu ownerName={ownerName} />
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-5">
        {/* Title */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">الاعتراضات</h1>
            <p className="text-sm text-slate-600">إدارة ومتابعة اعتراضاتك. إجمالي: {filtered.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/objections/new" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 shadow-sm">
              <Plus className="size-4" /> إنشاء اعتراض
            </Link>
          </div>
        </div>

        {/* Controls */}
        <section className="rounded-2xl border border-emerald-900/10 bg-white/70 backdrop-blur shadow-sm p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-80">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث برقم/عنوان الاعتراض…" className="w-full rounded-full border px-4 py-2 pe-9 text-sm outline-none focus:ring-2 focus:ring-emerald-600/30" />
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="size-4 text-slate-500" />
              <Segmented value={status} onChange={setStatus as any} options={[
                { label: "الكل", value: "" },
                { label: "قيد المراجعة", value: "قيد المراجعة" },
                { label: "مقبول", value: "مقبول" },
                { label: "مرفوض", value: "مرفوض" },
              ]} />

              <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-xl border bg-white px-3 py-2 text-sm">
                <option value="new">الأحدث أولاً</option>
                <option value="old">الأقدم أولاً</option>
              </select>
            </div>
          </div>
        </section>

        {/* Table/Card list */}
        <section className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          {loading && (
            <div className="p-6 text-sm text-slate-600 flex items-center gap-2"><Loader2 className="size-4 animate-spin"/> يتم التحميل…</div>
          )}

          {filtered.length === 0 && !loading ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-emerald-50/70 text-emerald-900">
                  <tr>
                    <th className="p-3 text-right">رقم الاعتراض</th>
                    <th className="p-3 text-right">الموضوع</th>
                    <th className="p-3 text-right">تاريخ الإنشاء</th>
                    <th className="p-3 text-right">الحالة</th>
                    <th className="p-3 text-right">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-emerald-50/40 transition">
                      <td className="p-3 font-mono" dir="ltr">{r.id}</td>
                      <td className="p-3 max-w-[28ch] truncate" title={r.title}>{r.title}</td>
                      <td className="p-3" dir="ltr">{r.created}</td>
                      <td className="p-3"><Status s={r.status} /></td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/objections/${r.id}`} className="rounded-lg border px-3 py-1.5 hover:bg-white inline-flex items-center gap-2">
                            <FileText className="size-4" /> تفاصيل
                          </Link>
                          <button onClick={() => onDuplicate(r)} className="rounded-lg border px-3 py-1.5 hover:bg-white inline-flex items-center gap-2" aria-label="نسخ">
                            <Copy className="size-4" /> نسخ
                          </button>
                          <button onClick={() => onDelete(r.id)} className="rounded-lg border px-3 py-1.5 hover:bg-white inline-flex items-center gap-2 text-rose-700" aria-label="حذف">
                            <Trash2 className="size-4" /> حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

/* ================= UI Bits ================= */
function AccountMenu({ ownerName }: { ownerName: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((s) => !s)} className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white px-3 py-1.5 text-sm hover:bg-emerald-50">
        <User className="size-4 text-emerald-700" />
        <span className="hidden sm:inline">حساب: {ownerName}</span>
        <ChevronDown className="size-4" />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-56 rounded-xl border bg-white shadow-lg text-sm overflow-hidden" onMouseLeave={() => setOpen(false)}>
          <Link href="/owner" className="block px-4 py-2 hover:bg-emerald-50 text-emerald-900">لوحة المالك</Link>
          <Link href="/owner/settings" className="block px-4 py-2 hover:bg-emerald-50 text-emerald-900">بيانات المالك</Link>
          <button onClick={() => { try { localStorage.clear(); } catch {}; location.href = "/"; }} className="w-full text-right px-4 py-2 hover:bg-emerald-50 text-rose-700 inline-flex items-center gap-2">
            <LogOut className="size-4" /> تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[]; }) {
  return (
    <div className="inline-flex rounded-full border bg-white p-1 text-sm">
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)} className={`px-3 py-1.5 rounded-full transition ${ value === opt.value ? "bg-emerald-600 text-white shadow" : "hover:bg-emerald-50" }`}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Status({ s }: { s: StatusT }) {
  const map: Record<StatusT, { cls: string; icon: React.ReactNode }> = {
    "قيد المراجعة": { cls: "bg-blue-50 text-blue-700 border-blue-200", icon: <Clock className="size-4" /> },
    "مقبول": { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="size-4" /> },
    "مرفوض": { cls: "bg-rose-50 text-rose-700 border-rose-200", icon: <XCircle className="size-4" /> },
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs border ${map[s].cls}`}>
      {map[s].icon}
      {s}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto w-fit rounded-2xl border bg-white p-6 shadow-sm">
        <AlertCircle className="mx-auto size-8 text-emerald-600" />
        <h3 className="mt-3 text-base font-semibold text-emerald-900">ما في نتائج</h3>
        <p className="mt-1 text-sm text-slate-600">جرّب تغيير البحث أو الفلتر. تقدر بعد تضيف اعتراض جديد فورًا.</p>
        <Link href="/objections/new" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
          <Plus className="size-4" /> إنشاء اعتراض
        </Link>
      </div>
    </div>
  );
}

/* Footer columns (unchanged content, tidier spacing) */
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

/* utils */
function nextId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `OBJ-${rand}`;
}
function today() { return new Date().toISOString().slice(0, 10); }