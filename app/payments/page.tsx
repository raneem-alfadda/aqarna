"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Lock,
  Info,
  BadgeCheck,
  Loader2,
  Percent,
  Receipt as ReceiptIcon,
} from "lucide-react";

/* ===================== Mock: invoices API ===================== */
// استبدلي هذا لاحقًا بنداء API حقيقي حسب invoiceId
const INVOICE_DB: Record<string, {
  amount: number;
  customer: string;
  period: string;
  due: string;
  status: "غير مدفوع" | "مدفوع";
}> = {
  "INV-1042": { amount: 1380, customer: "رنيم عبدالعزيز", period: "Q3 2025", due: "2025-10-15", status: "غير مدفوع" },
  "INV-240113": { amount: 1380, customer: "رنيم عبدالعزيز", period: "Q3 2025", due: "2025-10-15", status: "غير مدفوع" },
  "INV-240071": { amount: 1800, customer: "رنيم عبدالعزيز", period: "Q2 2025", due: "2025-07-15", status: "مدفوع" },
  "INV-239999": { amount: 2220, customer: "رنيم عبدالعزيز", period: "Q1 2025", due: "2025-04-15", status: "مدفوع" },
};

/* ===================== Types ===================== */
 type Method = "mada" | "card" | "apple";
 type LoadState = "idle" | "loading" | "ready" | "error";

/* ===================== Helpers ===================== */
const inputCls = "w-full rounded-xl border border-emerald-900/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-600/30";
const money = (n: number) => `${n.toLocaleString()} ر.س`;

function luhnOk(num: string) {
  let sum = 0, dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = parseInt(num[i] || "0", 10);
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    sum += d; dbl = !dbl;
  }
  return sum % 10 === 0;
}
function detectBrand(num: string): "MADA" | "VISA" | "MC" | "UNKNOWN" {
  const n = num.replace(/\s/g, "");
  if (/^(4)/.test(n)) return "VISA";
  if (/^(5[1-5]|22[2-9]|2[3-6]|27[01]|2720)/.test(n)) return "MC";
  // تبسيط مدى: كثير من BINs تبدأ بـ 4/5 أيضًا؛ نستخدم تبديل يدوي باختيار المستخدم
  return "UNKNOWN";
}
function maskCard(n: string) {
  const raw = n.replace(/\D/g, "");
  return raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

/* ===================== Page ===================== */
export default function PaymentsPage() {
  const router = useRouter();
  const search = useSearchParams();
  const invoiceId = search.get("invoice") || "INV-1042";

  const [load, setLoad] = React.useState<LoadState>("loading");
  const [amount, setAmount] = React.useState<number>(0);
  const [summary, setSummary] = React.useState<{customer: string; period: string; due: string; status: string} | null>(null);

  React.useEffect(() => {
    // محاكاة fetch
    setLoad("loading");
    const t = setTimeout(() => {
      const inv = INVOICE_DB[invoiceId];
      if (!inv) { setLoad("error"); return; }
      setAmount(inv.amount);
      setSummary({ customer: inv.customer, period: inv.period, due: inv.due, status: inv.status });
      setLoad("ready");
    }, 250);
    return () => clearTimeout(t);
  }, [invoiceId]);

  const [method, setMethod] = React.useState<Method>("mada");
  const [processing, setProcessing] = React.useState(false);
  const [agree, setAgree] = React.useState(true);

  // بطاقة
  const [card, setCard] = React.useState({ number: "", expiry: "", cvc: "", holder: "" });
  function set<K extends keyof typeof card>(k: K, v: string) { setCard((c) => ({ ...c, [k]: v })); }

  // رسوم/عمولة حسب الوسيلة
  const feeRate = method === "card" ? 0.018 : method === "apple" ? 0.015 : 0; // مدى 0%
  const fee = Math.round(amount * feeRate);
  const total = amount + fee;

  function validate(): string | null {
    if (!agree) return "يجب الموافقة على الشروط والأحكام قبل المتابعة.";
    if (method === "apple") return null;
    if (!card.holder.trim()) return "فضلاً أدخل اسم حامل البطاقة.";
    const num = card.number.replace(/\s/g, "");
    if (num.length < 13 || num.length > 19 || !luhnOk(num)) return "رقم البطاقة غير صحيح.";
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return "تاريخ الانتهاء غير صحيح (MM/YY).";
    if (!/^\d{3,4}$/.test(card.cvc)) return "رمز التحقق غير صحيح.";
    return null;
  }

  async function pay() {
    if (load !== "ready") return;
    const err = validate();
    if (err) { alert(err); return; }

    setProcessing(true);
    try {
      // 1) إنشاء PaymentIntent (محاكاة)
      await wait(600);
      // 2) 3DS (محاكاة)
      const needs3DS = method === "card"; // افتراضيًا بطاقات ائتمانية تتطلب 3DS
      if (needs3DS) {
        const ok = await fake3DSModal();
        if (!ok) throw new Error("فشل التحقق ثلاثي الأبعاد");
      }
      // 3) سداد ناجح
      saveLastCard(card.number);
      router.push(`/payments/success?invoice=${invoiceId}&amount=${total}`);
    } catch (e: any) {
      alert(e?.message || "تعذّر إتمام العملية. جرّبي لاحقًا.");
    } finally {
      setProcessing(false);
    }
  }

  // حفظ آخر بطاقة (مقنعة) للاستخدام السريع
  const saved = useSavedCard();

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-3xl h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm hover:text-emerald-700">
            <ArrowRight className="size-4" /> رجوع
          </button>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <Lock className="size-4" /> تشفير ومعايير PCI-DSS
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm mb-6">
          {load === "loading" && (
            <div className="flex items-center gap-2 text-sm text-slate-600"><Loader2 className="size-4 animate-spin"/> تحميل بيانات الفاتورة…</div>
          )}
          {load === "error" && (
            <div className="text-sm text-amber-700">تعذّر العثور على الفاتورة. تأكّدي من الرابط.</div>
          )}
          {load === "ready" && summary && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-emerald-900">سداد الفاتورة</h1>
                <div className="text-sm text-slate-600 flex flex-col">
                  <span>رقم الفاتورة: <span className="font-mono" dir="ltr">{invoiceId}</span></span>
                  <span>الفترة: {summary.period} — الاستحقاق: <span dir="ltr">{summary.due}</span></span>
                  <span>العميل: {summary.customer}</span>
                </div>
              </div>
              <div className="text-end">
                <div className="text-xs text-slate-500">المبلغ المطلوب</div>
                <div className="text-2xl font-bold text-emerald-700" dir="ltr">{money(amount)}</div>
              </div>
            </div>
          )}
        </section>

        {/* Payment box */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-5">
          <h2 className="font-semibold text-emerald-900">اختر وسيلة الدفع</h2>

          {/* Methods */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <PayMethod checked={method === "mada"} onChange={() => setMethod("mada")} title="مدى" subtitle="بطاقات مدى البنكية" icon={<ShieldCheck className="size-5" />} />
            <PayMethod checked={method === "card"} onChange={() => setMethod("card")} title="بطاقة ائتمانية" subtitle="Visa / MasterCard" icon={<CreditCard className="size-5" />} />
            <PayMethod checked={method === "apple"} onChange={() => setMethod("apple")} title="Apple Pay" subtitle="الدفع عبر الجوال" icon={<Smartphone className="size-5" />} />
          </div>

          {/* Saved card quick pick */}
          {saved && method !== "apple" && (
            <button onClick={() => {
              setMethod(saved.brand === "MADA" ? "mada" : "card");
              setCard({ number: saved.masked, expiry: "", cvc: "", holder: saved.holder || "" });
            }} className="w-full rounded-xl border px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between">
              <span className="flex items-center gap-2"><BadgeCheck className="size-4 text-emerald-600"/>استخدام البطاقة المحفوظة ({saved.brand} • {saved.last4})</span>
              <span className="text-xs text-slate-500">لن نحفظ CVV</span>
            </button>
          )}

          {/* Fees summary */}
          <div className="rounded-xl border p-3 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600"><Percent className="size-4"/>العمولة حسب الوسيلة</div>
            <div className="text-end">
              <div className="text-xs text-slate-500">الرسوم: {feeRate * 100}%</div>
              <div className="text-sm">الإجمالي: <b dir="ltr">{money(total)}</b></div>
            </div>
          </div>

          {/* Forms */}
          {(method === "card" || method === "mada") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="اسم حامل البطاقة">
                <input value={card.holder} onChange={(e) => set("holder", e.target.value)} placeholder="مثال: Raneem A." className={inputCls} />
              </Field>
              <Field label="رقم البطاقة">
                <input value={maskCard(card.number)} onChange={(e) => set("number", e.target.value)} inputMode="numeric" placeholder="•••• •••• •••• ••••" className={inputCls + " font-mono"} />
                <div className="mt-1 text-xs text-slate-500">النوع: {method === "mada" ? "MADA" : detectBrand(card.number)}</div>
              </Field>
              <Field label="تاريخ الانتهاء (MM/YY)">
                <input value={card.expiry} onChange={(e) => {
                  let v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                  set("expiry", v);
                }} inputMode="numeric" placeholder="MM/YY" className={inputCls + " font-mono"} />
              </Field>
              <Field label="رمز التحقق (CVV)">
                <input value={card.cvc} onChange={(e) => set("cvc", e.target.value.replace(/[^\d]/g, "").slice(0, 4))} inputMode="numeric" placeholder="•••" className={inputCls + " font-mono"} />
              </Field>
            </div>
          )}

          {method === "apple" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 flex items-start gap-2">
              <Info className="size-4 mt-0.5" />
              <div>سيتم فتح نافذة Apple Pay على جهازك لإتمام العملية. تأكّد من تفعيل البطاقات في Wallet.</div>
            </div>
          )}

          {/* Terms */}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            أوافق على الشروط والأحكام وسياسة الخصوصية.
          </label>

          {/* Pay button */}
          <button disabled={processing || load !== "ready"} onClick={pay} className="w-full rounded-xl bg-emerald-600 py-3 text-white hover:bg-emerald-700 disabled:opacity-60">
            {processing ? "جارٍ المعالجة…" : `ادفع الآن (${money(total)})`}
          </button>

          {/* Security note */}
          <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="size-4" /> يتم تأمين عملية الدفع عبر مزود خدمة معتمد وبياناتك لا تُحفظ في خوادم المنصة.
          </p>
        </section>
      </main>
    </div>
  );
}

/* ===================== UI ===================== */
function PayMethod({ checked, onChange, title, subtitle, icon, }: { checked: boolean; onChange: () => void; title: string; subtitle: string; icon: React.ReactNode; }) {
  return (
    <label className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${ checked ? "border-emerald-600 bg-emerald-50" : "hover:bg-slate-50" }`}>
      <input type="radio" className="hidden" checked={checked} onChange={onChange} />
      <span className="grid size-10 place-items-center rounded-lg bg-slate-100">{icon}</span>
      <span className="flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </span>
      {checked && (<span className="text-xs rounded-full px-2 py-0.5 bg-emerald-600 text-white">المختار</span>)}
    </label>
  );
}

function Field({ label, children, }: { label: string; children: React.ReactNode; }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}

/* ===================== Saved card helpers ===================== */
function saveLastCard(numMaskedOrRaw: string) {
  const raw = numMaskedOrRaw.replace(/\D/g, "");
  const last4 = raw.slice(-4);
  const brand = detectBrand(raw);
  const data = { last4, brand, masked: maskCard(raw), holder: "" };
  try { localStorage.setItem("last_card", JSON.stringify(data)); } catch {}
}
function useSavedCard() {
  const [saved, setSaved] = React.useState<{ last4: string; brand: string; masked: string; holder?: string } | null>(null);
  React.useEffect(() => {
    try {
      const s = localStorage.getItem("last_card");
      if (s) setSaved(JSON.parse(s));
    } catch {}
  }, []);
  return saved;
}

/* ===================== Fake 3DS ===================== */
function wait(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
async function fake3DSModal(): Promise<boolean> {
  // محاكاة نافذة 3DS بسيطة
  return new Promise((resolve) => {
    const ok = confirm("تحقق ثلاثي الأبعاد: هل توافق على العملية؟");
    resolve(ok);
  });
}
