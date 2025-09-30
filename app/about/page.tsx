"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ShieldCheck, Sparkles, BarChart3, CreditCard, Settings2, FileText, CheckCircle2 } from "lucide-react";
import { motion, useInView } from "framer-motion";

/* ================= Utility: CountUp on View (محسّن) ================= */
function useCountUp(
  target: number,
  {
    durationMs = 1200,
    start = 0,
    decimals = 0,
    once = true,
    rootMargin = "-10% 0px",
  }: {
    durationMs?: number;
    start?: number;
    decimals?: number;
    once?: boolean;
    rootMargin?: string;
  } = {}
) {
  const [value, setValue] = React.useState<number>(start);
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { margin: rootMargin, once });

  const rafId = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!inView) return;

    const from = value ?? start;
    const to = target;
    if (from === to) {
      setValue(to);
      return;
    }

    const t0 = performance.now();
    const d = Math.max(1, durationMs);
    const factor = Math.pow(10, decimals);

    const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / d);
      const eased = easeOutCubic(p);
      const v = from + (to - from) * eased;
      setValue(Math.round(v * factor) / factor);

      if (p < 1) {
        rafId.current = requestAnimationFrame(tick);
      }
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [inView, target, durationMs, decimals]);

  return { ref, value };
}

/* ================= Accordion Item (FAQ) ================= */
function FAQItem({
  q,
  a,
  defaultOpen = false,
}: { q: string; a: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-emerald-900/15 bg-white/90 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-4 text-right"
      >
        <span className="font-medium text-emerald-900">{q}</span>
        <ChevronDown className={`size-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0 px-4 pb-4 text-sm leading-7 text-slate-700">
          {a}
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const s1 = useCountUp(95);   // % رضا
  const s2 = useCountUp(87);   // % تحصيل
  const s3 = useCountUp(48);   // منطقة/مدينة مغطّاة
  const s4 = useCountUp(1270); // اعتراض مُدار

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-emerald-900/15 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="منصة بينة" width={36} height={36} className="rounded-full"/>
              <span className="font-semibold">عـقـارنـا </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/" className="hover:text-emerald-700">الرئيسية</Link>
              <Link href="/about" className="text-emerald-800 font-medium">عن المنصة</Link>
              <Link href="/register" className="hover:text-emerald-700">التسجيل</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/backG.png" alt="خلفية" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-emerald-950/70" />
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_.8fr]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-white"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">
                <Sparkles className="size-4" /> عن المنصة
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">عـقـارنـا </h1>
              <p className="max-w-2xl text-base sm:text-lg leading-8 opacity-95">
                منصة <b>بينة</b> رقمية وطنية لإدارة رسوم اتحادات الملاك وفق أنظمة هيئة العقار.
                تُمكّن الملاك من متابعة الرسوم والسداد إلكترونيًا وتقديم الاعتراضات، وتوفّر للمجمعات
                تقارير مالية دقيقة، كما تدعم الجهة الإشرافية بمؤشرات وطنية للشفافية وتقليل النزاعات.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">تقارير مالية دقيقة</span>
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">اعتراضات رسمية</span>
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">مؤشر وطني للرضا</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="relative h-52 sm:h-64 lg:h-[18rem]"
            >
              {/* مساحة لمرئيات لاحقًا */}
            </motion.div>
          </div>
        </div>

        {/* موجة خفيفة أسفل الهيرو */}
        <svg className="block w-full text-white" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
          <path fill="currentColor" d="M0,32L48,26.7C96,21,192,11,288,21.3C384,32,480,64,576,69.3C672,75,768,53,864,48C960,43,1056,53,1152,48C1248,43,1344,21,1392,10.7L1440,0L1440,60L1392,60C1344,60,1248,60,1152,60C1056,60,960,60,864,60C768,60,672,60,576,60C480,60,384,60,288,60C192,60,96,60,48,60L0,60Z"/>
        </svg>
      </section>

      {/* Stats */}
      <section className="bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="رضا الملاك" suffix="%" value={s1.value} countRef={s1.ref} icon={<CheckCircle2 className="size-4" />} />
            <StatCard label="تحصيل الرسوم" suffix="%" value={s2.value} countRef={s2.ref} icon={<CreditCard className="size-4" />} />
            <StatCard label="نطاق تغطية" value={s3.value} suffix="" countRef={s3.ref} icon={<ShieldCheck className="size-4" />} />
            <StatCard label="اعتراض مُدار" value={s4.value} suffix="" countRef={s4.ref} icon={<Settings2 className="size-4" />} />
          </div>
        </div>
      </section>

      {/* Features (مميّزات سريعة) */}
      <section className="py-10 sm:py-14 bg-gradient-to-b from-white via-emerald-50/40 to-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-emerald-900 mb-6">ماذا تقدّم بينة؟</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={<CreditCard className="size-5" />} title="سداد إلكتروني آمن" desc="تكامل مع بوابات دفع معتمدة، وإشعارات استحقاق تلقائية." />
            <FeatureCard icon={<Settings2 className="size-5" />} title="إدارة الاعتراضات" desc="تقديم الطلبات، رفع المرفقات، متابعة الحالة بخط زمني واضح." />
            <FeatureCard icon={<BarChart3 className="size-5" />} title="تقارير ومؤشرات" desc="لوحات قياس تحصيل، رضا، والتزامات وفق معايير الهيئة." />
          </div>
        </div>
      </section>

      {/* How it works (Timeline) */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-emerald-900 mb-8">آلية العمل</h2>
          <ol className="relative border-s-2 border-emerald-100 ps-5 space-y-6">
            <TimelineItem
              title="تسجيل الدخول"
              desc="عبر النفاذ الوطني أو إنشاء حساب، وتحديد صفة المستخدم."
              icon={<ShieldCheck className="size-4" />}
            />
            <TimelineItem
              title="ربط الوحدة/المجمّع"
              desc="يربط المالك وحدته، أو يربط اتحاد الملاك بيانات المجمّع مع لوحة الإدارة."
              icon={<FileText className="size-4" />}
            />
            <TimelineItem
              title="إدارة الرسوم والاعتراضات"
              desc="الاطلاع على الرسوم، السداد الإلكتروني، وتقديم الاعتراضات بواجهات بسيطة."
              icon={<Settings2 className="size-4" />}
            />
            <TimelineItem
              title="التقارير والمؤشرات"
              desc="لوحات تحليلية ونِسب التزام، وتقارير دعم للجهات الإشرافية."
              icon={<BarChart3 className="size-4" />}
            />
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-2xl font-semibold text-emerald-900">الأسئلة الشائعة</h2>
          <div className="space-y-3">
            <FAQItem
              q="من يمكنه استخدام المنصة؟"
              a="الملاك، اتحادات الملاك، والجهات الرقابية. لكل فئة لوحة وصلاحيات مناسبة."
              defaultOpen
            />
            <FAQItem
              q="كيف أعرف الرسوم المستحقة عليّ؟"
              a="من صفحة الرسوم تجد كشفًا بالمبالغ، تواريخ الاستحقاق، وسجل المدفوعات مع السداد الإلكتروني."
            />
            <FAQItem
              q="هل يمكنني متابعة حالة الاعتراض؟"
              a="نعم، تجد حالة الطلب (قيد المراجعة/مقبول/مرفوض) مع خط زمني للتحديثات والتنبيهات."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 border-t border-emerald-900/15 bg-emerald-950 text-emerald-50">
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
                <li><a className="hover:opacity-100" href="#">الهيئة العامة للعقار</a></li>
                <li><a className="hover:opacity-100" href="#">بوابة الإحصاءات</a></li>
                <li><a className="hover:opacity-100" href="#">دعم فني</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-semibold">الدعم والتواصل</h3>
              <ul className="space-y-2 text-sm/6 opacity-90">
                <li>مركز الملاحظات</li>
                <li>تواصل معنا</li>
                <li>الأسئلة الشائعة</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-semibold">تابعنا</h3>
              <div className="flex items-center gap-3 opacity-90">
                <a href="#" aria-label="X" className="hover:opacity-100">X</a>
                <a href="#" aria-label="LinkedIn" className="hover:opacity-100">in</a>
                <a href="#" aria-label="YouTube" className="hover:opacity-100">YT</a>
                <a href="#" aria-label="Instagram" className="hover:opacity-100">IG</a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-xs opacity-70">
            © {new Date().getFullYear()} منصة بينة. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ================= Small UI Parts ================= */
function StatCard({
  label,
  value,
  suffix = "",
  icon,
  countRef, // 👈 مهم لبدء العداد عند الظهور
}: {
  label: string;
  value: number;
  suffix?: string;
  icon?: React.ReactNode;
  countRef?: React.RefObject<HTMLSpanElement>;
}) {
  return (
    <div className="rounded-2xl border border-emerald-900/10 bg-white/80 shadow-sm p-4 flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon ?? <CheckCircle2 className="size-4" />}
      </div>
      <div>
        <div className="text-xs text-slate-600">{label}</div>
        <div className="text-xl font-semibold text-emerald-900" dir="ltr">
          <span ref={countRef}>{value.toLocaleString()}</span> {suffix}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="relative rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm overflow-hidden">
      <div className="pointer-events-none absolute -inset-1 bg-gradient-to-br from-emerald-500 to-emerald-300 opacity-10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</span>
          <h3 className="font-semibold text-emerald-900">{title}</h3>
        </div>
        <p className="mt-2 text-sm text-slate-600">{desc}</p>
      </div>
    </div>
  );
}

function TimelineItem({ title, desc, icon }: { title: string; desc: string; icon?: React.ReactNode }) {
  return (
    <li className="relative">
      <span className="absolute -right-[34px] top-1 grid size-7 place-items-center rounded-full bg-emerald-600 text-white shadow">
        {icon ?? <CheckCircle2 className="size-4" />}
      </span>
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm">
        <div className="font-medium text-emerald-900">{title}</div>
        <div className="mt-1 text-sm text-slate-600">{desc}</div>
      </div>
    </li>
  );
}


