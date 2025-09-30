"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  User,
  LogOut,
  UploadCloud,
  Paperclip,
  AlertCircle,
  FileText,
  CheckCircle2,
  Circle,
  X,
  Info,
  Loader2,
} from "lucide-react";

/* ===== Helpers & Const ===== */
const inputBase =
  "w-full rounded-xl border border-emerald-900/20 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-600/30";
const MAX_FILES = 5;
const MAX_MB = 5;
const ALLOWED = [".pdf", "image/"];
const DRAFT_KEY = "objection_draft";
const FALLBACK_OWNER = "رنيم عبد العزيز";

function fmtSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}
function allowFile(f: File) {
  const okType =
    ALLOWED.some((a) => (a.startsWith(".") ? f.name.toLowerCase().endsWith(a) : f.type.startsWith(a))) ||
    false;
  const okSize = f.size <= MAX_MB * 1024 * 1024;
  return okType && okSize;
}

/* ===== Page ===== */
export default function NewObjectionPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const invoiceId = sp.get("invoice") || "";

  const ownerName = React.useMemo(() => {
    try {
      const s = localStorage.getItem("owner_profile");
      if (!s) return FALLBACK_OWNER;
      const p = JSON.parse(s);
      return p?.name || FALLBACK_OWNER;
    } catch {
      return FALLBACK_OWNER;
    }
  }, []);

  // Steps UI
  type Step = 1 | 2 | 3;
  const [step, setStep] = React.useState<Step>(1);

  // State
  const [title, setTitle] = React.useState(invoiceId ? `اعتراض على الفاتورة ${invoiceId}` : "اعتراض على الرسوم");
  const [reason, setReason] = React.useState("");
  const [category, setCategory] = React.useState<
    "billing_calc" | "duplicate_charge" | "service_quality" | "other"
  >("billing_calc");
  const [impact, setImpact] = React.useState<"low" | "med" | "high">("med");
  const [files, setFiles] = React.useState<File[]>([]);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [agree, setAgree] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Autosave draft
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setTitle(d.title ?? title);
        setReason(d.reason ?? "");
        setCategory(d.category ?? "billing_calc");
        setImpact(d.impact ?? "med");
        setAgree(!!d.agree);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    try {
      const draft = { title, reason, category, impact, agree };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }, [title, reason, category, impact, agree]);

  function validate(full = false) {
    const errs: string[] = [];
    if (title.trim().length < 3 || title.trim().length > 120) errs.push("العنوان يجب أن يكون بين 3 و 120 حرفًا.");
    if (reason.trim().length < 20) errs.push("سبب الاعتراض يجب ألا يقل عن 20 حرفًا.");
    if (full && !agree) errs.push("يجب الإقرار بصحة المعلومات.");
    if (files.length > MAX_FILES) errs.push(`الحد الأقصى للمرفقات ${MAX_FILES} ملفات.`);
    for (const f of files) {
      const okType = ALLOWED.some((a) => (a.startsWith(".") ? f.name.toLowerCase().endsWith(a) : f.type.startsWith(a)));
      if (!okType) errs.push(`نوع ملف غير مدعوم: ${f.name}`);
      if (f.size > MAX_MB * 1024 * 1024) errs.push(`الملف ${f.name} يتجاوز ${MAX_MB}MB (${fmtSize(f.size)}).`);
    }
    setErrors(errs);
    return errs.length === 0;
  }

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files ? Array.from(e.target.files) : [];
    const safe = chosen.filter(allowFile).slice(0, MAX_FILES);
    setFiles(safe);
  }
  function onDrop(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault();
    const dropped = Array.from(ev.dataTransfer.files || []);
    const safe = dropped.filter(allowFile).slice(0, MAX_FILES);
    setFiles(safe);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(true)) return;
    setSubmitting(true);
    try {
      // TODO: call backend create objection + upload files
      await new Promise((r) => setTimeout(r, 800));
      const newId = `OBJ-${Math.floor(Math.random() * 9000 + 1000)}`;
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      router.push(`/objections/${newId}?created=1`);
    } finally {
      setSubmitting(false);
    }
  }

  // Quick templates per category
  const templates: Record<string, string[]> = {
    billing_calc: [
      "الرجاء مراجعة آلية احتساب النسبة، حيث يظهر اختلاف بين الفاتورة والمبلغ المتفق عليه.",
      "تم تطبيق بند غير مذكور في العقد على ما يبدو، أطلب تفسيرًا وتعديل الرسوم إن لزم.",
    ],
    duplicate_charge: [
      "لاحظت تكرار رسوم للشهر ذاته، أطلب حذف الرسوم المكررة والإبقاء على المستحق الصحيح.",
      "تم تحصيل نفس البند مرتين بفاتورتين مختلفتين، أرفقت صورًا للتوضيح.",
    ],
    service_quality: [
      "انخفض مستوى الخدمة عن المعتاد خلال الفترة الماضية، لذا أطلب خصمًا أو مراجعة الرسوم.",
      "تكرار انقطاع/تأخر الخدمة أثّر على الاستخدام، أرجو معالجة السبب وإعادة التقدير.",
    ],
    other: [
      "لدي اعتراض عام على الرسوم الحالية وأحتاج توضيح البنود بالتفصيل.",
    ],
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 text-slate-900 flex flex-col relative">
      {/* soft blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm hover:text-emerald-700">
            <ArrowRight className="size-4" /> رجوع
          </button>

          <Link href="/" className="flex items-center gap-2" aria-label="الصفحة الرئيسية">
            <Image src="/logo.png" alt="منصة بينة" width={28} height={28} className="rounded-full" />
            <span className="hidden sm:inline font-semibold text-emerald-900">عـقـارنـا </span>
          </Link>

          <div className="relative">
            <button onClick={() => setMenuOpen((s) => !s)} className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white px-3 py-1.5 text-sm hover:bg-emerald-50">
              <User className="size-4 text-emerald-700" />
              <span className="hidden sm:inline">حساب: {ownerName}</span>
              <ChevronDown className="size-4" />
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl border bg-white shadow-lg text-sm overflow-hidden" onMouseLeave={() => setMenuOpen(false)}>
                <Link href="/owner" className="block px-4 py-2 hover:bg-emerald-50 text-emerald-900">لوحة المالك</Link>
                <Link href="/owner/settings" className="block px-4 py-2 hover:bg-emerald-50 text-emerald-900">بيانات المالك</Link>
                <button onClick={() => { try { localStorage.clear(); } catch {} ; location.href = "/"; }} className="w-full text-right px-4 py-2 hover:bg-emerald-50 text-rose-700 inline-flex items-center gap-2">
                  <LogOut className="size-4" /> تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-5">
        {/* Title + invoice pill */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-emerald-900">تقديم اعتراض</h1>
          {invoiceId && (
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-emerald-50 border-emerald-200" dir="ltr">
              <FileText className="size-4 text-emerald-700" /> فاتورة: <b className="font-mono">{invoiceId}</b>
            </span>
          )}
        </div>

        {/* Stepper */}
        <Stepper step={step} setStep={setStep} labels={["تفاصيل", "مرفقات", "إقرار & إرسال"]} />

        {/* Errors */}
        {errors.length > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="size-4 mt-0.5" />
              <ul className="list-disc ps-4 space-y-1">{errors.map((e, i) => (<li key={i}>{e}</li>))}</ul>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} className="rounded-2xl border bg-white p-5 shadow-sm space-y-5">
          {step === 1 && (
            <section className="space-y-4">
              {invoiceId && (
                <Field label="رقم الفاتورة">
                  <input value={invoiceId} readOnly className={inputBase + " bg-slate-50 font-mono"} />
                </Field>
              )}

              <Field label="الموضوع">
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputBase} maxLength={120} placeholder="مثال: اعتراض على احتساب رسوم الخدمات المشتركة" />
                <CharHint current={title.length} max={120} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="نوع الاعتراض">
                  <select value={category} onChange={(e) => setCategory(e.target.value as any)} className={inputBase}>
                    <option value="billing_calc">احتساب الرسوم/النسبة</option>
                    <option value="duplicate_charge">رسوم مكررة</option>
                    <option value="service_quality">جودة الخدمة</option>
                    <option value="other">أخرى</option>
                  </select>
                </Field>
                <Field label="درجة التأثير">
                  <select value={impact} onChange={(e) => setImpact(e.target.value as any)} className={inputBase}>
                    <option value="low">منخفض</option>
                    <option value="med">متوسط</option>
                    <option value="high">مرتفع</option>
                  </select>
                </Field>
              </div>

              <Field label="سبب الاعتراض">
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} className={inputBase + " h-40"} placeholder="اشرح السبب مع تفاصيل داعمة (تواريخ، مبالغ، مراسلات…)" />
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <Info className="size-3" />
                  بإمكانك استخدام قوالب سريعة:
                  {templates[category].map((t, i) => (
                    <button key={i} type="button" onClick={() => setReason((r) => (r ? r + "\n" + t : t))} className="rounded-full border px-2 py-0.5 hover:bg-emerald-50">
                      + {i + 1}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="flex items-center justify-end">
                <button type="button" onClick={() => { if (validate()) setStep(2); }} className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
                  متابعة للمرفقات
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              <Field label="مرفقات (اختياري)">
                <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} className="rounded-xl border-2 border-dashed border-emerald-300/70 bg-emerald-50/40 p-5 text-center">
                  <UploadCloud className="mx-auto size-6 text-emerald-700" />
                  <div className="mt-2 text-sm">اسحب وأفلت ملفات هنا أو</div>
                  <label className="mt-1 inline-flex items-center gap-2 text-sm cursor-pointer">
                    <span className="rounded-full border px-3 py-1 hover:bg-white">اختيار ملفات (PDF / صور)</span>
                    <input type="file" multiple accept=".pdf,image/*" className="hidden" onChange={onPickFiles} />
                  </label>
                  <div className="mt-2 text-xs text-slate-500">حتى {MAX_FILES} ملفات • {MAX_MB}MB للملف كحد أقصى</div>
                </div>

                {files.length > 0 && (
                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border p-2">
                        <PreviewIcon file={f} />
                        <div className="min-w-0">
                          <div className="truncate text-sm" title={f.name}>{f.name}</div>
                          <div className="text-xs text-slate-500">{fmtSize(f.size)}</div>
                        </div>
                        <button type="button" onClick={() => setFiles((arr) => arr.filter((_, idx) => idx !== i))} className="ms-auto rounded-full p-1 hover:bg-slate-100" aria-label="إزالة">
                          <X className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Field>

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setStep(1)} className="rounded-xl border px-4 py-2 hover:bg-slate-50">رجوع</button>
                <button type="button" onClick={() => setStep(3)} className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">متابعة للإقرار</button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4">
              <div className="rounded-2xl border bg-emerald-50/60 p-4">
                <h3 className="font-semibold text-emerald-900">مراجعة سريعة</h3>
                <ul className="mt-2 text-sm space-y-1">
                  <li><b>العنوان:</b> {title || "—"}</li>
                  <li><b>النوع:</b> {labelOf(category)} — <b>الأثر:</b> {impact === "low" ? "منخفض" : impact === "high" ? "مرتفع" : "متوسط"}</li>
                  {invoiceId && <li><b>الفاتورة:</b> <span className="font-mono" dir="ltr">{invoiceId}</span></li>}
                  <li className="whitespace-pre-wrap"><b>السبب:</b> {reason || "—"}</li>
                  <li><b>المرفقات:</b> {files.length} ملف/ملفات</li>
                </ul>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>أقرّ بصحة المعلومات والمستندات المقدّمة.</span>
              </label>

              <div className="flex items-center gap-2">
                <button type="submit" disabled={submitting} className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60 inline-flex items-center gap-2">
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} إرسال الاعتراض
                </button>
                <button type="button" onClick={() => setStep(2)} className="rounded-xl border px-4 py-2 hover:bg-slate-50">رجوع</button>
              </div>
            </section>
          )}
        </form>
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

  function labelOf(cat: string) {
    switch (cat) {
      case "billing_calc": return "احتساب الرسوم/النسبة";
      case "duplicate_charge": return "رسوم مكررة";
      case "service_quality": return "جودة الخدمة";
      default: return "أخرى";
    }
  }
}

/* ===== UI bits ===== */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <div className="mb-1 text-slate-700">{label}</div>
      {children}
    </label>
  );
}
function CharHint({ current, max }: { current: number; max: number }) {
  return <div className="mt-1 text-xs text-slate-500">{current}/{max}</div>;
}

function Stepper({ step, setStep, labels }: { step: number; setStep: (s: any) => void; labels: string[] }) {
  return (
    <div className="flex items-center gap-3">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <React.Fragment key={i}>
            <button onClick={() => setStep(n as any)} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${ active ? "bg-emerald-600 text-white border-emerald-600" : done ? "bg-emerald-50 border-emerald-200" : "hover:bg-emerald-50"}`}>
              {done ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />} {label}
            </button>
            {i < labels.length - 1 && <span className="h-px flex-1 bg-emerald-200" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function PreviewIcon({ file }: { file: File }) {
  const isImg = file.type.startsWith("image/");
  const url = React.useMemo(() => (isImg ? URL.createObjectURL(file) : null), [file]);
  React.useEffect(() => { return () => { if (url) URL.revokeObjectURL(url); }; }, [url]);
  if (isImg && url) return <img src={url} alt={file.name} className="h-10 w-10 rounded object-cover border" />;
  return <Paperclip className="size-5 text-slate-500" />;
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