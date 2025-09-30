"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  CheckCircle2,
  ArrowRight,
  User as UserIcon,
  Download,
} from "lucide-react";

/* ===================== الصفحة ===================== */
export default function SatisfactionPage() {
  const router = useRouter();

  const [score, setScore] = React.useState<number>(0);
  const [comment, setComment] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // اسم المالك المعروض في الهيدر
  const ownerName =
    React.useMemo(() => {
      if (typeof window === "undefined") return "المالك";
      const profile = localStorage.getItem("owner_profile");
      if (profile) {
        try {
          const p = JSON.parse(profile);
          return p?.name || "المالك";
        } catch {}
      }
      const n = localStorage.getItem("userName");
      return n || "المالك";
    }, []);

  // مجالات التقييم
  const areas = [
    { key: "billing", label: "وضوح الفواتير" },
    { key: "response", label: "سرعة معالجة الاعتراض" },
    { key: "communication", label: "التواصل مع اتحاد الملاك" },
  ] as const;

  const [areaScores, setAreaScores] = React.useState<Record<string, number>>({});
  const avgArea =
    Object.values(areaScores).length > 0
      ? Math.round(
          (Object.values(areaScores).reduce((a, b) => a + b, 0) /
            Object.values(areaScores).length) * 10
        ) / 10
      : 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (score === 0) {
      setError("الرجاء اختيار التقييم العام.");
      return;
    }

    const payload = {
      ownerName,
      score,
      areaScores,
      avgArea,
      comment,
      date: new Date().toISOString(),
    };

    // خزّن كل نموذج في مصفوفة (للاستخدام التحليلي لاحقاً)
    try {
      const key = "satisfaction_surveys";
      const prev: any[] = JSON.parse(localStorage.getItem(key) || "[]");
      prev.push(payload);
      localStorage.setItem(key, JSON.stringify(prev));
    } catch {}

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);

    // إعادة ضبط الحقول
    setScore(0);
    setComment("");
    setAreaScores({});
  }

  function exportCSV() {
    const key = "satisfaction_surveys";
    const rows: any[] = JSON.parse(localStorage.getItem(key) || "[]");
    if (!rows.length) return;

    const headers = [
      "المالك",
      "التقييم العام",
      "متوسط مجالات",
      "وضوح الفواتير",
      "سرعة المعالجة",
      "التواصل",
      "ملاحظات",
      "التاريخ",
    ];

    const csvRows = rows.map((r) => [
      r.ownerName ?? "",
      r.score ?? "",
      r.avgArea ?? "",
      r.areaScores?.billing ?? "",
      r.areaScores?.response ?? "",
      r.areaScores?.communication ?? "",
      (r.comment || "").replace(/\n/g, " "),
      r.date ?? "",
    ]);

    const csv =
      [headers, ...csvRows]
        .map((row) =>
          row
            .map((v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "satisfaction_surveys.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <Header ownerName={ownerName} />

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        {/* رجوع */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/owner")}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hover:bg-white"
          >
            <ArrowRight className="size-4" />
            <span>العودة إلى لوحة المالك</span>
          </button>
        </div>

        <h1 className="text-2xl font-bold text-emerald-900 mb-1">
          استبيان مؤشر الرضا
        </h1>
        <p className="text-sm text-slate-600 mb-5">
          ساعدنا في تحسين خدماتنا عبر مشاركتك برأيك. البيانات تُستخدم لتحسين
          جودة الخدمات بالتعاون مع الهيئة العامة للعقار.
        </p>

        <form
          onSubmit={submit}
          className="rounded-2xl border bg-white p-6 shadow-sm space-y-5"
        >
          {/* تقييم عام + نظرة سريعة */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium mb-1">التقييم العام</div>
              <Stars value={score} onChange={setScore} />
            </div>
            <div className="text-xs text-slate-500">
              متوسط المجالات:{" "}
              <span className="font-medium text-slate-700">{avgArea || "—"}</span> / 5
            </div>
          </div>

          {/* تقييم المجالات */}
          <div className="space-y-3">
            {areas.map((a) => (
              <div key={a.key} className="rounded-xl border p-3">
                <div className="mb-1 text-sm font-medium">{a.label}</div>
                <Stars
                  value={areaScores[a.key] || 0}
                  onChange={(v) =>
                    setAreaScores((prev) => ({ ...prev, [a.key]: v }))
                  }
                />
              </div>
            ))}
          </div>

          {/* ملاحظات */}
          <label className="block">
            <div className="mb-1 text-sm font-medium">ملاحظات إضافية (اختياري)</div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-emerald-900/20 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-600/30 h-28"
              placeholder="اكتب اقتراحاتك أو المشاكل التي واجهتك"
            />
          </label>

          {/* أخطاء */}
          {error && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          {/* أزرار */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition"
            >
              إرسال
            </button>
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-white"
              title="تصدير جميع الردود كملف CSV لاستخدام الهيئة"
            >
              <Download className="size-4" />
              تصدير الردود (CSV)
            </button>
          </div>

          {/* نجاح */}
          {submitted && (
            <div className="flex items-center gap-2 text-emerald-700 text-sm mt-2">
              <CheckCircle2 className="size-5" />
              <span>تم إرسال الاستبيان، شكرًا لمشاركتك 🌿</span>
            </div>
          )}
        </form>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

/* ===================== Stars Component ===================== */
function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = React.useState<number>(0);
  const active = hover || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          type="button"
          key={i}
          aria-label={`تقييم ${i} من 5`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className={`p-1 transition ${
            i <= active ? "text-amber-500" : "text-slate-300"
          }`}
        >
          <Star className="size-6 fill-current" />
        </button>
      ))}
    </div>
  );
}

/* ===================== Header ===================== */
function Header({ ownerName }: { ownerName: string }) {
  const initials =
    ownerName
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2) || "م";

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="الصفحة الرئيسية">
          <span className="font-semibold text-emerald-900"> عـقـارنـا</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-emerald-700">الرئيسية</Link>
          <Link href="/about" className="hover:text-emerald-700">عن المنصة</Link>
          <Link href="/owner" className="hover:text-emerald-700">لوحة المالك</Link>
        </nav>

        {/* شارة المالك */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white px-3 py-1.5 text-sm">
          <div className="grid size-6 place-items-center rounded-full bg-emerald-600 text-white text-xs font-semibold">
            {initials}
          </div>
          <span className="max-w-[10rem] truncate">{ownerName}</span>
        </div>
      </div>
    </header>
  );
}

/* ===================== Footer ===================== */
function Footer() {
  return (
    <footer className="mt-8 bg-emerald-950 text-emerald-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-3 font-semibold">نبذة عامة</h3>
            <ul className="space-y-2 text-sm/6 opacity-90">
              <li><Link className="hover:opacity-100" href="/about">الأسئلة</Link></li>
              <li><Link className="hover:opacity-100" href="/about">الخصوصية والاستخدام</Link></li>
              <li><Link className="hover:opacity-100" href="/about">الأحكام والشروط</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">روابط مهمة</h3>
            <ul className="space-y-2 text-sm/6 opacity-90">
              <li><a className="hover:opacity-100" href="#">خريطة الموقع</a></li>
              <li><a className="hover:opacity-100" href="#">الهيئة العامة للعقار</a></li>
              <li><a className="hover:opacity-100" href="#">الربط مع الجهات الحكومية</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">الدعم والتواصل</h3>
            <ul className="space-y-2 text-sm/6 opacity-90">
              <li>مركز الملاحظات</li>
              <li>تواصل معنا</li>
              <li>دليل المستخدم</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">مواقع التواصل الاجتماعي</h3>
            <div className="flex items-center gap-3 opacity-90">
              <a aria-label="X" href="#" className="hover:opacity-100">X</a>
              <a aria-label="LinkedIn" href="#" className="hover:opacity-100">in</a>
              <a aria-label="YouTube" href="#" className="hover:opacity-100">YT</a>
              <a aria-label="Instagram" href="#" className="hover:opacity-100">IG</a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-xs opacity-70">
          © {new Date().getFullYear()} منصة عـقـارنـا. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
