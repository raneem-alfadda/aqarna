"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users2,
  Landmark,
  Building2,
  ShieldCheck,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";

/* ================= Helpers ================= */
const input =
  "w-full rounded-xl border border-emerald-900/20 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-600/30";

const toAsciiDigits = (s: string) =>
  s
    .replace(/[٠-٩]/g, (d) => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)])
    .replace(/[۰-۹]/g, (d) => "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(d)]);

/* زر نفاذ */
function NafathButton({
  onClick,
  loading = false,
  longText = true,
}: {
  onClick: () => void;
  loading?: boolean;
  longText?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="التسجيل عبر النفاذ الوطني الموحد"
      className={[
        "relative w-full inline-flex items-center justify-center gap-3",
        "rounded-xl border px-5 py-3",
        "bg-white text-emerald-800 border-emerald-700/60",
        "shadow-sm hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/30",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "transition",
      ].join(" ")}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <linearGradient id="nafathGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#06603B" />
            <stop offset="100%" stopColor="#0C8A55" />
          </linearGradient>
        </defs>
        <rect x="2" y="3" width="20" height="18" rx="4" fill="url(#nafathGrad)" />
        <path
          d="M8 11.5a4 4 0 118 0v1.5h1.2a1.3 1.3 0 011.3 1.3v2.4a1.3 1.3 0 01-1.3 1.3H6.8a1.3 1.3 0 01-1.3-1.3v-2.4A1.3 1.3 0 016.8 13H8v-1.5zm2 0V13h4v-1.5a2 2 0 10-4 0z"
          fill="#fff"
        />
      </svg>
      <span className="font-medium">
        {longText ? "تسجيل الدخول عبر النفاذ الوطني الموحد" : "التسجيل عبر نفاذ"}
      </span>
      {loading && (
        <span className="absolute left-4 inline-block size-4 animate-spin rounded-full border-2 border-emerald-700/50 border-t-transparent" />
      )}
    </button>
  );
}

/* ================= Types ================= */
type Segment = "individuals" | "authority" | null;
type Role = "owner" | "union" | "authority" | null;
type OwnerNationality = "saudi" | "resident";

/* ================= Page ================= */
export default function RegisterPage() {
  const router = useRouter();

  // الخطوات (صارت خطوتين فقط)
  const [step, setStep] = React.useState<1 | 2>(1);
  const [segment, setSegment] = React.useState<Segment>(null);
  const [role, setRole] = React.useState<Role>(null);

  // مشتركة
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  // مالك
  const [nationality, setNationality] =
    React.useState<OwnerNationality>("saudi");
  const [nationalId, setNationalId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  // اتحاد مُلاك
  const [unionName, setUnionName] = React.useState("");
  const [unionType, setUnionType] = React.useState<
    "tower" | "compound" | "villas" | "mixed"
  >("tower");
  const [managerName, setManagerName] = React.useState("");
  const [crNumber, setCrNumber] = React.useState("");

  // هيئة
  const [authorityName, setAuthorityName] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [employeeId, setEmployeeId] = React.useState("");

  // أخطاء + نفاذ
  const [error, setError] = React.useState<string | null>(null);
  const [nafathLoading, setNafathLoading] = React.useState(false);

  /* ============ Handlers ============ */
  function resetAll() {
    setStep(1);
    setSegment(null);
    setRole(null);
    setError(null);
  }

  // نفاذ (الانتقال مباشرة للمالك)
  async function startNafath() {
    try {
      setError(null);
      setNafathLoading(true);
      localStorage.setItem("isRegistered", "true");
      localStorage.setItem("userType", "owner");
      localStorage.setItem("userName", fullName || "مستخدم نفاذ");
      router.push("/owner");
    } catch {
      setError("تعذر بدء تسجيل النفاذ. حاول لاحقًا.");
    } finally {
      setNafathLoading(false);
    }
  }

  // إرسال نماذج
  function submitOwner(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (nationalId.length !== 10)
      return setError("رقم الهوية/الإقامة يجب أن يكون 10 أرقام.");
    if (password.length < 6)
      return setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
    if (password !== confirm) return setError("تأكيد كلمة المرور غير مطابق.");
    try {
      localStorage.setItem("isRegistered", "true");
      localStorage.setItem("userType", "owner");
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userPhone", phone);
      localStorage.setItem("userNationalId", nationalId);
      localStorage.setItem("userNationality", nationality);
    } catch {}
    // مباشرة إلى لوحة المالك
    router.push("/owner");
  }

  function submitUnion(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (unionName.trim().length < 3) return setError("اسم الاتحاد مطلوب.");
    if (managerName.trim().length < 3)
      return setError("اسم المدير المسؤول مطلوب.");
    try {
      localStorage.setItem("isRegistered", "true");
      localStorage.setItem("userType", "union");
      localStorage.setItem("unionName", unionName);
      localStorage.setItem("unionType", unionType);
      localStorage.setItem("userName", managerName);
      if (crNumber) localStorage.setItem("unionCR", crNumber);
    } catch {}
    router.push("/union");
  }

  function submitAuthority(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (authorityName.trim().length < 2) return setError("اسم الجهة مطلوب.");
    if (department.trim().length < 2) return setError("الإدارة/القطاع مطلوب.");
    if (jobTitle.trim().length < 2)
      return setError("المسمى الوظيفي مطلوب.");
    try {
      localStorage.setItem("isRegistered", "true");
      localStorage.setItem("userType", "authority");
      localStorage.setItem("authorityName", authorityName);
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("employeeId", employeeId);
    } catch {}
    router.push("/authority");
  }

  /* ============ UI ============ */
  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-40 w-full border-b border-emerald-900/20 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="منصة بينة"
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="font-semibold text-lg text-emerald-900">
               عـقـارنـا
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/" className="hover:text-emerald-700 transition">
                الرئيسية
              </Link>
              <Link href="/about" className="hover:text-emerald-700 transition">
                عن المنصة
              </Link>
              <span className="inline-flex items-center gap-1 text-emerald-800">
                التسجيل <ChevronDown className="size-4" />
              </span>
            </nav>
          </div>
        </div>
      </header>

      {/* ========== MAIN ========== */}
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          {/* مؤشر خطوة بسيط (خطوتان فقط) */}
          <div className="mb-6 flex items-center gap-2 text-xs">
            <StepDot active={step >= 1}>1</StepDot>
            <span>اختيار الفئة</span>
            <span className="opacity-50">/</span>
            <StepDot active={step >= 2}>2</StepDot>
            <span>بيانات التسجيل</span>
            {(segment || role) && (
              <button
                onClick={resetAll}
                className="ms-auto inline-flex items-center gap-1 text-emerald-800 hover:underline"
              >
                <ChevronLeft className="size-4" /> إعادة البداية
              </button>
            )}
          </div>

          {/* الخطوة 1: اختيار الفئة */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <SelectCard
                title="الأفراد"
                subtitle="تسجيل مالك أو اتحاد مُلاك"
                icon={<Users2 className="size-6" />}
                onClick={() => {
                  setSegment("individuals");
                  setStep(2);
                }}
              />
              <SelectCard
                title="الهيئة/الجهات"
                subtitle="لمنسوبي الهيئة أو الجهات الشريكة"
                icon={<Landmark className="size-6" />}
                onClick={() => {
                  setSegment("authority");
                  setRole("authority");
                  setStep(2);
                }}
              />
            </motion.div>
          )}

          {/* الخطوة 2: نماذج التسجيل بحسب الاختيار */}
          {step === 2 && segment === "individuals" && !role && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <SelectCard
                title="مالك"
                subtitle="تسجيل حساب مالك وحدة"
                icon={<ShieldCheck className="size-6" />}
                onClick={() => setRole("owner")}
              />
              <SelectCard
                title="اتحاد المُلاك"
                subtitle="تسجيل كيان اتحاد مُلاك"
                icon={<Building2 className="size-6" />}
                onClick={() => setRole("union")}
              />
            </motion.div>
          )}

          {step === 2 && role === "owner" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border bg-white p-6 shadow-sm space-y-5"
            >
              <StepHeader
                title="تسجيل كمالك"
                desc="أدخل بياناتك الأساسية."
              />
              <form onSubmit={submitOwner} className="space-y-4" noValidate>
                <Grid2>
                  <Field label="الاسم الكامل">
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={input}
                      placeholder="اسم المالك"
                      required
                    />
                  </Field>
                  <Field label="البريد الإلكتروني">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={input}
                      placeholder="name@example.com"
                      required
                    />
                  </Field>
                </Grid2>

                <Grid3>
                  <Field label="الجنسية">
                    <select
                      value={nationality}
                      onChange={(e) =>
                        setNationality(e.target.value as OwnerNationality)
                      }
                      className={input}
                    >
                      <option value="saudi">سعودي</option>
                      <option value="resident">اخرى</option>
                    </select>
                  </Field>
                  <Field
                    label={
                      nationality === "saudi"
                        ? "رقم الهوية او الاقامة"
                        : "رقم الإقامة"
                    }
                  >
                    <input
                      value={nationalId}
                      onChange={(e) =>
                        setNationalId(
                          toAsciiDigits(e.target.value)
                            .replace(/\D/g, "")
                            .slice(0, 10)
                        )
                      }
                      className={input}
                      placeholder="1234567890"
                      inputMode="numeric"
                      maxLength={10}
                      required
                    />
                  </Field>
                  <Field label="رقم الجوال">
                    <input
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          toAsciiDigits(e.target.value)
                            .replace(/\D/g, "")
                            .slice(0, 10)
                        )
                      }
                      className={input}
                      placeholder="05xxxxxxxx"
                      inputMode="tel"
                      maxLength={10}
                      required
                    />
                  </Field>
                </Grid3>

                <Grid2>
                  <Field label="كلمة المرور">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={input}
                      placeholder="******"
                      required
                    />
                  </Field>
                  <Field label="تأكيد كلمة المرور">
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={input}
                      placeholder="******"
                      required
                    />
                  </Field>
                </Grid2>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-700 px-5 py-3 text-white shadow hover:bg-emerald-800"
                  >
                    تسجيل كمالك
                  </button>
                  <NafathButton
                    onClick={startNafath}
                    loading={nafathLoading}
                  />
                </div>
              </form>
            </motion.div>
          )}

          {step === 2 && role === "union" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border bg-white p-6 shadow-sm space-y-5"
            >
              <StepHeader
                title="تسجيل اتحاد المُلاك"
                desc="أدخل بيانات الكيان والمسؤول."
              />
              <form onSubmit={submitUnion} className="space-y-4" noValidate>
                <Grid2>
                  <Field label="اسم الاتحاد">
                    <input
                      value={unionName}
                      onChange={(e) => setUnionName(e.target.value)}
                      className={input}
                      placeholder="اتحاد ملاك مجمع الربيع"
                      required
                    />
                  </Field>
                  <Field label="نوع اتحاد المُلاك">
                    <select
                      value={unionType}
                      onChange={(e) => setUnionType(e.target.value as any)}
                      className={input}
                    >
                      <option value="tower">برج/عمارة</option>
                      <option value="compound">مجمع سكني</option>
                      <option value="villas">مجمع فيلات</option>
                      <option value="mixed">برج مختلط/تجاري-سكني</option>
                    </select>
                  </Field>
                </Grid2>
                <Grid2>
                  <Field label="اسم المدير المسؤول">
                    <input
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      className={input}
                      placeholder="اسم المدير"
                      required
                    />
                  </Field>
                  <Field label="رقم السجل التجاري (اختياري)">
                    <input
                      value={crNumber}
                      onChange={(e) => setCrNumber(toAsciiDigits(e.target.value))}
                      className={input}
                      placeholder="1010xxxxxx"
                    />
                  </Field>
                </Grid2>
                <Grid2>
                  <Field label="بريد التواصل (اختياري)">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={input}
                      placeholder="contact@union.sa"
                    />
                  </Field>
                  <Field label="جوال المسؤول (اختياري)">
                    <input
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          toAsciiDigits(e.target.value)
                            .replace(/\D/g, "")
                            .slice(0, 10)
                        )
                      }
                      className={input}
                      placeholder="05xxxxxxxx"
                      inputMode="tel"
                    />
                  </Field>
                </Grid2>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-700 px-5 py-3 text-white shadow hover:bg-emerald-800"
                  >
                    تسجيل اتحاد المُلاك
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole(null)}
                    className="rounded-xl border px-5 py-3 hover:bg-slate-50"
                  >
                    رجوع لاختيار الدور
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 2 && role === "authority" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border bg-white p-6 shadow-sm space-y-5"
            >
              <StepHeader
                title="تسجيل الهيئة/الجهة"
                desc="للوصول إلى لوحة المؤشرات الوطنية."
              />
              <form onSubmit={submitAuthority} className="space-y-4" noValidate>
                <Grid2>
                  <Field label="اسم الجهة">
                    <input
                      value={authorityName}
                      onChange={(e) => setAuthorityName(e.target.value)}
                      className={input}
                      placeholder="الهيئة العامة للعقار"
                      required
                    />
                  </Field>
                  <Field label="الإدارة/القطاع">
                    <input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className={input}
                      placeholder="قطاع المؤشرات"
                      required
                    />
                  </Field>
                </Grid2>
                <Grid2>
                  <Field label="الاسم الكامل">
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={input}
                      placeholder="اسم الموظف"
                      required
                    />
                  </Field>
                  <Field label="البريد الإلكتروني الحكومي">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={input}
                      placeholder="name@agency.gov.sa"
                      required
                    />
                  </Field>
                </Grid2>
                <Grid2>
                  <Field label="المسمى الوظيفي">
                    <input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className={input}
                      placeholder="محلل بيانات"
                      required
                    />
                  </Field>
                  <Field label="رقم الموظف">
                    <input
                      value={employeeId}
                      onChange={(e) => setEmployeeId(toAsciiDigits(e.target.value))}
                      className={input}
                      placeholder="EMP-1235"
                      required
                    />
                  </Field>
                </Grid2>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-700 px-5 py-3 text-white shadow hover:bg-emerald-800"
                  >
                    تسجيل الهيئة
                  </button>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="rounded-xl border px-5 py-3 hover:bg-slate-50"
                  >
                    رجوع
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="mt-8 border-t border-emerald-900/20 bg-emerald-950 text-emerald-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="mb-3 font-semibold">نبذة عامة</h3>
              <ul className="space-y-2 text-sm/6 opacity-90">
                <li>
                  <Link className="hover:opacity-100" href="/faq">
                    الأسئلة
                  </Link>
                </li>
                <li>
                  <Link className="hover:opacity-100" href="/privacy">
                    الخصوصية والاستخدام
                  </Link>
                </li>
                <li>
                  <Link className="hover:opacity-100" href="/terms">
                    الأحكام والشروط
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-semibold">روابط مهمة</h3>
              <ul className="space-y-2 text-sm/6 opacity-90">
                <li>
                  <a className="hover:opacity-100" href="#">
                    خريطة الموقع
                  </a>
                </li>
                <li>
                  <a className="hover:opacity-100" href="#">
                    الهيئة العامة للعقار
                  </a>
                </li>
                <li>
                  <a className="hover:opacity-100" href="#">
                    الربط مع الجهات الحكومية
                  </a>
                </li>
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
                <a aria-label="X" href="#" className="hover:opacity-100">
                  X
                </a>
                <a aria-label="LinkedIn" href="#" className="hover:opacity-100">
                  in
                </a>
                <a aria-label="YouTube" href="#" className="hover:opacity-100">
                  YT
                </a>
                <a aria-label="Instagram" href="#" className="hover:opacity-100">
                  IG
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-xs opacity-70">
            © {new Date().getFullYear()} منصة عـقـارنـا. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ================= UI Bits ================= */
function StepDot({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`grid place-items-center size-5 rounded-full text-[10px] ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-slate-200 text-slate-600"
      }`}
    >
      {children}
    </span>
  );
}

function SelectCard({
  title,
  subtitle,
  icon,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-right rounded-2xl border bg-white p-5 shadow-sm hover:shadow transition group"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition">
          {icon}
        </div>
        <div>
          <div className="font-semibold text-emerald-900">{title}</div>
          <div className="text-sm text-slate-600 mt-0.5">{subtitle}</div>
        </div>
      </div>
    </button>
  );
}

function StepHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-emerald-900">{title}</h2>
      {desc && <p className="text-sm text-slate-600 mt-1">{desc}</p>}
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
function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}
function Grid3({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{children}</div>;
}
