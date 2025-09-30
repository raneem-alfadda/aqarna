"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import {
  Search,
  ChevronDown,
  User2,
  BarChart3,
  CreditCard,
  FileText,
  Settings2,
  ShieldCheck,
  Sparkles,
  LineChart,
  ArrowRight,
} from "lucide-react";

/* ========== Typewriter Hook ========== */
function useTypewriter(text: string = "", speed = 22, start = false) {
  const [out, setOut] = React.useState("");
  React.useEffect(() => {
    if (!start || !text) {
      setOut("");
      return;
    }
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      setOut((prev) => prev + text[i]);
      i++;
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, start]);
  return out;
}

export default function HomePage() {
  const router = useRouter();
  const [typeOpen, setTypeOpen] = React.useState(false);
  const [userType, setUserType] = React.useState<string | null>(null);
  const [propertyType, setPropertyType] = React.useState<string | null>(null);
  const [heroReady, setHeroReady] = React.useState(false);

  const DESCRIPTION =
    "حل رقمي لإدارة رسوم اتحادات الملاك، يسهّل السداد والاعتراض، ويدعم الشفافية وتقليل النزاعات.";
  const cleanDescription = React.useMemo(
    () => DESCRIPTION.replace(/يونيفاد/gi, "").trim(),
    []
  );

  const typed = useTypewriter(cleanDescription, 20, heroReady);
  const typedSafe = typed ?? "";

  const titleControls = useAnimation();
  React.useEffect(() => {
    (async () => {
      await titleControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6 },
      });
      setTimeout(() => setHeroReady(true), 200);
    })();
  }, [titleControls]);

  // ====== التوجيه ======
  function routeByType(type: string) {
    try {
      localStorage.setItem("userType", type);
      if (type === "owner" && propertyType) {
        localStorage.setItem("propertyType", propertyType);
        router.push(`/owner/${propertyType}`);
      } else if (type === "union") {
        router.push("/union");
      } else if (type === "authority") {
        router.push("/authority");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Routing error:", err);
    }
  }

  function handleStart() {
    const isRegistered =
      typeof window !== "undefined" &&
      (localStorage.getItem("isRegistered") === "true" ||
        !!localStorage.getItem("authToken") ||
        !!localStorage.getItem("userId"));

    if (!isRegistered) {
      router.push("/register");
      return;
    }
    const savedType = localStorage.getItem("userType");
    if (savedType) routeByType(savedType);
    else setTypeOpen(true);
  }

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-emerald-900/20 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="منصة بينة"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <span className="font-semibold text-lg">عـقـارنـا </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-emerald-700 transition">
                الرئيسية
              </a>
              <div className="group relative">
                <button className="inline-flex items-center gap-1 hover:text-emerald-700 transition">
                  الخدمات <ChevronDown className="size-4" />
                </button>
                <div className="pointer-events-none absolute right-0 mt-2 w-44 rounded-xl border bg-white shadow-lg opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition">
                  <ul className="py-2 text-sm">
                    <li>
                      <a className="block px-4 py-2 hover:bg-emerald-50" href="#solutions">
                        حلول المنصة
                      </a>
                    </li>
                    <li>
                      <a className="block px-4 py-2 hover:bg-emerald-50" href="#cta">
                        ابدأ الآن
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>

            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <input
                  type="search"
                  placeholder="بحث"
                  className="w-44 rounded-full border border-emerald-900/20 bg-white px-4 py-2 pe-9 text-sm outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              </div>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-900/20 px-4 py-2 text-sm hover:bg-emerald-50"
              >
                <User2 className="size-4" /> التسجيل
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="flex-1">
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/backG.png" alt="خلفية" fill priority className="object-cover" />
            <div className="absolute inset-0 bg-emerald-950/65" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-10">
              {/* العمود الأيسر: النص والأزرار */}
              <div className="text-white">
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={titleControls}
                  className="text-4xl sm:text-5xl font-extrabold tracking-tight"
                >
                  <span className="inline-block">منصة</span>{" "}
                  <span className="text-emerald-200 drop-shadow-sm">عـقـارنـا</span>
                </motion.h1>

                <p className="mt-4 max-w-xl leading-8 text-emerald-50/90 min-h-[3.5rem]">
                  {typedSafe}
                  {!heroReady && <span>&nbsp;</span>}
                  {heroReady && typedSafe.length < cleanDescription.length && (
                    <span className="inline-block w-2 h-5 align-[-2px] bg-emerald-200/90 animate-pulse ms-1" />
                  )}
                </p>

                <div id="cta" className="mt-8 flex items-center gap-3">
                  <button
                    onClick={handleStart}
                    className="group relative inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-medium text-emerald-900 shadow hover:shadow-md overflow-hidden"
                  >
                    <span className="relative z-10">ابدأ معنا</span>
                  </button>
                  <a
                    href="#solutions"
                    className="rounded-xl border border-emerald-200/60 bg-white/10 px-6 py-3 text-white hover:bg-white/15"
                  >
                    استكشف الحلول
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4 opacity-80 text-emerald-50/90 text-xs">
                  <ShieldCheck className="size-4" />
                  تكاملات حكومية • حماية بيانات • معايير موثوقة
                </div>
              </div>

              {/* العمود الأيمن: مربعات الميزات */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                <div className="grid grid-cols-2 gap-4">
                  <HeroTile icon={<Settings2 className="size-6" />} label="إدارة الاعتراضات" />
                  <HeroTile icon={<CreditCard className="size-6" />} label="سداد إلكتروني" delay={0.05} />
                  <HeroTile icon={<BarChart3 className="size-6" />} label="تقارير ومؤشرات" delay={0.1} />
                  <HeroTile icon={<FileText className="size-6" />} label="مستندات وفواتير" delay={0.15} />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== Solutions ===== */}
        <section id="solutions" className="py-14 sm:py-18 bg-gradient-to-b from-white via-emerald-50/40 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
                <Sparkles className="size-4" /> حلول عملية لمختلف الجهات
              </div>
              <h2 className="mt-3 text-2xl font-bold text-emerald-900">حلول المنصة الأساسية</h2>
              <p className="mt-2 text-sm text-slate-600">
                صُممت لتخدم المالك، اتحاد الملاك، والجهات الإشرافية بكفاءة عالية.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <SolutionCard
                gradient="from-emerald-800 to-emerald-600"
                icon={<CreditCard className="size-5" />}
                title="السداد والتحصيل الإلكتروني"
                desc="تحصيل آمن وسريع، مع تذكيرات آلية وخيارات دفع مرنة."
              />
              <SolutionCard
                gradient="from-emerald-700 to-emerald-500"
                icon={<Settings2 className="size-5" />}
                title="الاعتراضات والمتابعة"
                desc="إنشاء اعتراض، رفع مرفقات، وتتبع الحالة بخط زمني واضح."
              />
              <SolutionCard
                gradient="from-emerald-900 to-emerald-500"
                icon={<LineChart className="size-5" />}
                title="التقارير والمؤشرات"
                desc="لوحات تحليلية ونِسب التزام وتغطية جغرافية للمجمعات."
              />
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-8 border-t border-emerald-900/20 bg-emerald-950 text-emerald-50">
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

      {/* MODAL: اختيار نوع المستخدم */}
      {typeOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">اختر نوع المستخدم</h3>
            <div className="space-y-3 text-sm">
              <label className="flex items-center gap-3 rounded-xl border p-3">
                <input
                  type="radio"
                  name="ut"
                  value="owner"
                  onChange={(e) => setUserType(e.target.value)}
                />
                <div>
                  <div className="font-medium">مالك / صاحب الشقة</div>
                  <div className="text-slate-600">لإدارة الالتزامات والاعتراضات والدفع.</div>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-xl border p-3">
                <input
                  type="radio"
                  name="ut"
                  value="union"
                  onChange={(e) => setUserType(e.target.value)}
                />
                <div>
                  <div className="font-medium">اتحاد المُلاك</div>
                  <div className="text-slate-600">إدارة الرسوم والتقارير للمجمعات.</div>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-xl border p-3">
                <input
                  type="radio"
                  name="ut"
                  value="authority"
                  onChange={(e) => setUserType(e.target.value)}
                />
                <div>
                  <div className="font-medium">الهيئة</div>
                  <div className="text-slate-600">صلاحيات إشرافية وتقارير مؤشرات.</div>
                </div>
              </label>

              {userType === "owner" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">اختر نوع العقار</label>
                  <select
                    value={propertyType || ""}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full rounded-xl border px-4 py-2 text-sm"
                  >
                    <option value="">— اختر نوع العقار —</option>
                    <option value="apartment">شقة</option>
                    <option value="villa">فيلا</option>
                    <option value="building">عمارة</option>
                    <option value="compound">كمباوند</option>
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setTypeOpen(false)} className="rounded-xl border px-4 py-2 text-sm">
                رجوع
              </button>
              <button
                disabled={!userType}
                onClick={() => {
                  if (userType) {
                    setTypeOpen(false);
                    routeByType(userType);
                  }
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                متابعة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Hero Tile ===== */
function HeroTile({
  icon,
  label,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay }}
      className="rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-sm hover:bg-white/15 hover:translate-y-[-2px] transition"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-emerald-400/20 text-white">
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </div>
    </motion.div>
  );
}

/* ===== Solution Card ===== */
function SolutionCard({
  gradient,
  icon,
  title,
  desc,
  ctas,
}: {
  gradient: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  ctas?: { label: string; onClick: () => void }[];
}) {
  return (
    <div className="relative rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm overflow-hidden">
      <div className={`pointer-events-none absolute -inset-1 bg-gradient-to-br ${gradient} opacity-15 blur-2xl`} />
      <div className="relative">
        <div className="flex items-center gap-3">
          <span
            className="grid size-10 place-items-center rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,.2), rgba(255,255,255,.08))" }}
          >
            {icon}
          </span>
          <h3 className="font-semibold text-emerald-900">{title}</h3>
        </div>
        <p className="mt-2 text-sm text-slate-600">{desc}</p>

        {ctas && ctas.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {ctas.map((c, i) => (
              <button
                key={i}
                onClick={c.onClick}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50"
              >
                <ArrowRight className="size-4" />
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
