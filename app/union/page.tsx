"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Building2, ChevronDown, LogOut, Search, Users2, Home, Plus, Pencil, Trash2,
  CheckCircle2, AlertTriangle, CalendarCheck2, Megaphone, Receipt, FileText,
  FolderKanban, CircleCheck, X, Download, Filter, Pin, PinOff, ArrowRight,
} from "lucide-react";

/* ================= Mock (اربط لاحقًا بـ API) ================= */
type Tab = "overview" | "members" | "buildings" | "fees" | "announcements" | "objections" | "tasks";

type Member = { id:string; name:string; unit:string; phone:string; email:string; status:"نشط"|"متأخر" };
type Building = { id:string; name:string; units:number; occupied:number; city:string };
type FeeTemplate = { id:string; title:string; periodicity:"شهري"|"ربع سنوي"|"سنوي"; amount:number; active:boolean };
type Announcement = { id:string; title:string; body:string; date:string; pinned?:boolean };

type ObjectionSource = "union" | "member";
type Objection = {
  id: string;
  title: string;
  owner: string; // اسم مقدم الاعتراض
  unit: string;  // رقم الوحدة أو "—"
  status: "قيد المراجعة" | "مقبول" | "مرفوض";
  created: string; // YYYY-MM-DD
  source: ObjectionSource; // مصدر الاعتراض: اتحاد/عضو
};

type Task = { id:string; title:string; assignee?:string; status:"مفتوح"|"قيد التنفيذ"|"منجز" };

const mockMembers: Member[] = [
  { id:"M-1001", name:"رانيم أحمد", unit:"A-12", phone:"0553816630", email:"raneem@example.com", status:"نشط" },
  { id:"M-1002", name:"فهد السلمي", unit:"B-08", phone:"0555555555", email:"fahad@example.com", status:"متأخر" },
  { id:"M-1003", name:"أمل الدوسري", unit:"C-03", phone:"0552222222", email:"amal@example.com", status:"نشط" },
];

const mockBuildings: Building[] = [
  { id:"B-1", name:"برج الندى", units:48, occupied:44, city:"الرياض" },
  { id:"B-2", name:"برج اليسر", units:32, occupied:30, city:"الرياض" },
  { id:"B-3", name:"مجمع الروابي", units:48, occupied:41, city:"الرياض" },
];

const mockFees: FeeTemplate[] = [
  { id:"F-01", title:"رسوم الخدمات المشتركة", periodicity:"شهري", amount:450, active:true },
  { id:"F-02", title:"صيانة المصاعد", periodicity:"ربع سنوي", amount:300, active:true },
  { id:"F-03", title:"مواقف السيارات", periodicity:"سنوي", amount:900, active:false },
];

const mockAnnouncements: Announcement[] = [
  { id:"AN-120", title:"تنبيه صيانة مصاعد", body:"ستجري صيانة للمصاعد يوم السبت 15 ذو القعدة من 9ص–1م.", date:"2025-09-10", pinned:true },
  { id:"AN-121", title:"رش مبيدات", body:"سيتم رش مبيدات في الحدائق الساعة 5م يوم الثلاثاء.", date:"2025-09-08" },
];

const mockObjections: Objection[] = [
  { id:"OBJ-2207", title:"مراجعة احتساب رسوم 7%", owner:"اتحاد الملاك", unit:"—", status:"قيد المراجعة", created:"2025-09-10", source:"union" },
  { id:"OBJ-2203", title:"رسوم مكررة أغسطس", owner:"فهد السلمي", unit:"B-08", status:"مقبول", created:"2025-09-02", source:"member" },
  { id:"OBJ-2210", title:"تأخير في تحديث الرصيد", owner:"رانيم أحمد", unit:"A-12", status:"قيد المراجعة", created:"2025-09-12", source:"member" },
];

const mockTasks: Task[] = [
  { id:"T-01", title:"استبدال إنارة الممرات - برج الندى", assignee:"الفني: مازن", status:"قيد التنفيذ" },
  { id:"T-02", title:"تسريب خزان المياه - مجمع الروابي", assignee:"شركة الصيانة", status:"مفتوح" },
  { id:"T-03", title:"تركيب حساسات دخان إضافية", assignee:"الفني: علي", status:"منجز" },
];

/* ================= Utils ================= */
const money = (n:number)=>`${n.toLocaleString()} ر.س`;
const memberTag = (s:Member["status"]) => s==="نشط" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800";
const objTag = (s:Objection["status"]) => s==="قيد المراجعة" ? "bg-blue-50 text-blue-700" : s==="مقبول" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";
const navCls = (active:boolean)=> `px-3 py-1.5 rounded-full border text-sm ${active? "bg-emerald-600 text-white border-emerald-600":"hover:bg-emerald-50"}`;
const inputCls = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-600/20";

/* ================= Page ================= */
export default function UnionPage(){
  const router = useRouter();
  const [unionName, setUnionName] = React.useState("اتحاد الملاك");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [tab, setTab] = React.useState<Tab>("overview");

  const [q, setQ] = React.useState("");
  const [memberFilter, setMemberFilter] = React.useState<"all"|"active"|"late">("all");

  // data (mock, قابلة للتعديل محليًا)
  const [members, setMembers] = React.useState<Member[]>(mockMembers);
  const [buildings] = React.useState<Building[]>(mockBuildings);
  const [fees, setFees] = React.useState<FeeTemplate[]>(mockFees);
  const [anns, setAnns] = React.useState<Announcement[]>(mockAnnouncements);
  const [tasks, setTasks] = React.useState<Task[]>(mockTasks);

  // اعتراضات: حالة + فلاتر + مودال
  const [objs, setObjs] = React.useState<Objection[]>(mockObjections);
  const [objectionsView, setObjectionsView] = React.useState<ObjectionSource | "all">("all");
  const [objectionStatus, setObjectionStatus] = React.useState<"all"|"قيد المراجعة"|"مقبول"|"مرفوض">("all");
  const [openObjModal, setOpenObjModal] = React.useState(false);

  // modals أخرى
  const [openMember, setOpenMember] = React.useState(false);
  const [openAnn, setOpenAnn] = React.useState(false);
  const [editFee, setEditFee] = React.useState<FeeTemplate|null>(null);

  React.useEffect(()=>{
    try{
      const saved = localStorage.getItem("union");
      if (saved && saved.trim()) setUnionName(saved);
    }catch{}
  },[]);

  function logout(){
    try{ localStorage.removeItem("union"); }catch{}
    router.push("/");
  }

  /* --------- Actions (mock) --------- */
  function addMember(e: React.FormEvent){
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const nm = String(form.get("name")||"").trim();
    const un = String(form.get("unit")||"").trim();
    const ph = String(form.get("phone")||"").trim();
    const em = String(form.get("email")||"").trim();
    if (!nm || !un) return alert("الاسم والوحدة مطلوبان.");
    const id = "M-" + Math.floor(Math.random()*9000+1000);
    setMembers(m=>[{id, name:nm, unit:un, phone:ph, email:em, status:"نشط"}, ...m]);
    setOpenMember(false);
  }

  function saveFee(e: React.FormEvent){
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const title = String(form.get("title")||"").trim();
    const periodicity = String(form.get("periodicity")||"شهري") as FeeTemplate["periodicity"];
    const amount = Number(form.get("amount")||0);
    const active = Boolean(form.get("active"));
    if (!title || amount<=0) return alert("أدخل عنوانًا صحيحًا ومبلغًا أكبر من صفر.");
    if (editFee && editFee.id){
      setFees(list=>list.map(f=> f.id===editFee.id ? {...editFee, title, periodicity, amount, active} : f));
    }else{
      const id = "F-" + Math.floor(Math.random()*90+10);
      setFees(list=>[{id, title, periodicity, amount, active}, ...list]);
    }
    setEditFee(null);
  }

  function addAnnouncement(e: React.FormEvent){
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const title = String(form.get("title")||"").trim();
    const body  = String(form.get("body")||"").trim();
    if (!title) return alert("العنوان مطلوب.");
    const id = "AN-" + Math.floor(Math.random()*900+100);
    const date = new Date().toISOString().slice(0,10);
    setAnns(a=>[{id, title, body, date, pinned:false}, ...a]);
    setOpenAnn(false);
  }

  function togglePin(id:string){
    setAnns(a=>a.map(x=>x.id===id? {...x, pinned:!x.pinned}:x));
  }

  function deleteAnnouncement(id:string){
    if (!confirm("حذف هذا الإعلان؟")) return;
    setAnns(a=>a.filter(x=>x.id!==id));
  }

  function toggleTask(id:string){
    setTasks(ts=> ts.map(t=> t.id===id ? {...t, status: t.status==="منجز" ? "مفتوح" : "منجز"} : t));
  }

  function exportMembersCSV(){
    const headers = ["ID","Name","Unit","Phone","Email","Status"];
    const rows = filteredMembers.map(m=>[m.id,m.name,m.unit,m.phone,m.email,m.status]);
    const csv = [headers, ...rows].map(r=> r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "members.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  /* --------- Filters --------- */
  const textMatch = (s:string)=> s.toLowerCase().includes(q.toLowerCase());
  const filteredMembers = members
    .filter(m => [m.name,m.unit,m.phone,m.email].some(textMatch))
    .filter(m => memberFilter==="all" ? true : memberFilter==="active" ? m.status==="نشط" : m.status==="متأخر");

  const filteredBuildings = buildings.filter(b => [b.name,b.city].some(textMatch));
  const filteredFees      = fees.filter(f => textMatch(f.title));
  const filteredAnns      = anns.filter(a => [a.title,a.body].some(textMatch));

  const filteredObjs      = objs
    .filter(o => [o.id,o.title,o.owner,o.unit].some(textMatch))
    .filter(o => objectionsView === "all" ? true : o.source === objectionsView)
    .filter(o => objectionStatus === "all" ? true : o.status === objectionStatus);

  const openTasks = tasks.filter(t=>t.status==="مفتوح");
  const doingTasks = tasks.filter(t=>t.status==="قيد التنفيذ");
  const doneTasks = tasks.filter(t=>t.status==="منجز");

  /* ================= UI ================= */
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="الصفحة الرئيسية">
            <Image src="/logo.png" alt="منصة بينة" width={28} height={28} className="rounded-full" />
            <span className="font-semibold text-emerald-900"> عـقـارنـا</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2 text-sm rounded-full border bg-white p-1">
            <TabBtn active={tab==="overview"} onClick={()=>setTab("overview")}>نظرة عامة</TabBtn>
            <TabBtn active={tab==="members"} onClick={()=>setTab("members")}>الأعضاء</TabBtn>
            <TabBtn active={tab==="buildings"} onClick={()=>setTab("buildings")}>المباني</TabBtn>
            <TabBtn active={tab==="fees"} onClick={()=>setTab("fees")}>الرسوم</TabBtn>
            <TabBtn active={tab==="announcements"} onClick={()=>setTab("announcements")}>الإعلانات</TabBtn>
            <TabBtn active={tab==="objections"} onClick={()=>setTab("objections")}>الاعتراضات</TabBtn>
            <TabBtn active={tab==="tasks"} onClick={()=>setTab("tasks")}>المهام</TabBtn>
          </nav>

          <div className="relative">
            <button
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={()=>setMenuOpen(s=>!s)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-emerald-50"
            >
              <Building2 className="size-4 text-emerald-700"/>
              <span className="hidden sm:inline">اتحاد: {unionName}</span>
              <ChevronDown className="size-4"/>
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl border bg-white shadow-lg text-sm overflow-hidden"
                   onMouseLeave={()=>setMenuOpen(false)} role="menu">
                <Link href="/union/settings" className="block px-4 py-2 hover:bg-emerald-50 text-emerald-900" role="menuitem">
                  بيانات الاتحاد
                </Link>
                <button onClick={logout}
                        className="w-full text-right px-4 py-2 hover:bg-emerald-50 text-rose-700 inline-flex items-center gap-2" role="menuitem">
                  <LogOut className="size-4"/> تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-3">
          <div className="hidden sm:block text-sm text-slate-600">إدارة اتحاد الملاك — لوحة تشغيل يومية.</div>
          <div className="flex items-center gap-2 ms-auto">
            {tab==="members" && (
              <div className="hidden md:flex items-center gap-1 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 cursor-pointer hover:bg-emerald-50"
                      onClick={()=>setMemberFilter("all")}><Filter className="size-3"/> الكل</span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 cursor-pointer hover:bg-emerald-50 ${memberFilter==="active"?"bg-emerald-50 border-emerald-200":""}`}
                      onClick={()=>setMemberFilter("active")}>نشط</span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 cursor-pointer hover:bg-emerald-50 ${memberFilter==="late"?"bg-emerald-50 border-emerald-200":""}`}
                      onClick={()=>setMemberFilter("late")}>متأخر</span>
              </div>
            )}
            <div className="relative">
              <input value={q} onChange={e=>setQ(e.target.value)}
                     placeholder="بحث سريع…"
                     className="w-64 rounded-full border border-slate-300 bg-white px-4 py-1.5 pe-9 text-sm outline-none focus:ring-2 focus:ring-emerald-600/20"/>
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500"/>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        {tab==="overview" && <OverviewSection/>}

        {tab==="members" && (
          <Section
            title="الأعضاء (الملاك/المستفيدين)"
            caption={`${filteredMembers.length} عضو — ${members.filter(m=>m.status==="متأخر").length} متأخر`}
            actions={
              <div className="flex items-center gap-2">
                <button onClick={()=>setOpenMember(true)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"><Plus className="size-4"/> إضافة</button>
                <button onClick={exportMembersCSV} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 hover:bg-white"><Download className="size-4"/> CSV</button>
              </div>
            }
            icon={<Users2 className="size-4"/>}
          >
            <DataTable
              headers={["المعرف","الاسم","الوحدة","الجوال","البريد","الحالة",""]}
              empty="لا يوجد أعضاء يطابقون البحث."
              rows={filteredMembers.map(m=>[
                <span key="id" className="font-mono" dir="ltr">{m.id}</span>,
                m.name,
                m.unit,
                <span key="ph" dir="ltr">{m.phone}</span>,
                m.email,
                <span key="st" className={`rounded-full px-2 py-0.5 text-xs ${memberTag(m.status)}`}>{m.status}</span>,
                <div key="act" className="flex items-center gap-2">
                  <button className="rounded border px-2 py-1 hover:bg-white" aria-label="تعديل"><Pencil className="size-4"/></button>
                  <button className="rounded border px-2 py-1 hover:bg-white" aria-label="حذف"><Trash2 className="size-4"/></button>
                </div>
              ])}
            />
          </Section>
        )}

        {tab==="buildings" && (
          <Section title="المباني / الوحدات" icon={<Home className="size-4"/>} caption={`${filteredBuildings.length} مبنى`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredBuildings.map(b=>(
                <div key={b.id} className="rounded-xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-xs text-slate-500">{b.city}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-700">إجمالي: <b>{b.units}</b> — مشغول: <b>{b.occupied}</b></div>
                  <div className="mt-2 h-2 w-full rounded bg-slate-100 overflow-hidden" aria-label="نسبة الإشغال">
                    <div className="h-2 bg-emerald-500" style={{width: `${Math.round((b.occupied/b.units)*100)}%`}}/>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50">تفاصيل</button>
                    <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50">إدارة الوحدات</button>
                  </div>
                </div>
              ))}
              {filteredBuildings.length===0 && <EmptyState text="لا يوجد مبانٍ مطابقة للبحث."/>}
            </div>
          </Section>
        )}

        {tab==="fees" && (
          <Section
            title="قوالب الرسوم"
            icon={<Receipt className="size-4"/>}
            caption={`${filteredFees.length} قالب`}
            actions={<button onClick={()=>setEditFee({id:"", title:"", periodicity:"شهري", amount:0, active:true})}
                             className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"><Plus className="size-4"/> إنشاء قالب</button>}
          >
            <DataTable
              headers={["العنوان","الدورية","المبلغ","الحالة",""]}
              empty="لا توجد قوالب."
              rows={filteredFees.map(f=>[
                f.title,
                f.periodicity,
                <span key="amt" dir="ltr">{money(f.amount)}</span>,
                <span key="ac" className={`rounded-full px-2 py-0.5 text-xs ${f.active?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-700"}`}>{f.active?"مفعل":"غير مفعل"}</span>,
                <div key="act" className="flex items-center gap-2">
                  <button onClick={()=>setEditFee(f)} className="rounded border px-2 py-1 hover:bg-white" aria-label="تعديل"><Pencil className="size-4"/></button>
                  <button className="rounded border px-2 py-1 hover:bg-white" aria-label="حذف"><Trash2 className="size-4"/></button>
                </div>
              ])}
            />
            <div className="mt-4 text-xs text-slate-500">* يمكن لاحقًا إصدار فواتير جماعية انطلاقًا من هذه القوالب.</div>
          </Section>
        )}

        {tab==="announcements" && (
          <Section
            title="الإعلانات والتنبيهات"
            icon={<Megaphone className="size-4"/>}
            caption={`${filteredAnns.length} إعلان`}
            actions={<button onClick={()=>setOpenAnn(true)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"><Plus className="size-4"/> إعلان جديد</button>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAnns.map(a=>(
                <article key={a.id} className="rounded-xl border bg-white p-4">
                  <header className="flex items-center justify-between">
                    <h3 className="font-semibold">{a.title}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={()=>togglePin(a.id)} className="rounded border p-1 hover:bg-slate-50" aria-label={a.pinned?"إلغاء التثبيت":"تثبيت"}>
                        {a.pinned ? <PinOff className="size-4"/> : <Pin className="size-4"/>}
                      </button>
                      <button onClick={()=>deleteAnnouncement(a.id)} className="rounded border p-1 hover:bg-rose-50 text-rose-700" aria-label="حذف">
                        <Trash2 className="size-4"/>
                      </button>
                    </div>
                  </header>
                  <div className="mt-1 text-xs text-slate-500" dir="ltr">{a.date}</div>
                  <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{a.body}</p>
                </article>
              ))}
              {filteredAnns.length===0 && <EmptyState text="لا توجد إعلانات."/>}
            </div>
          </Section>
        )}

        {tab==="objections" && (
          <Section
            title="الاعتراضات"
            icon={<FileText className="size-4"/>}
            caption={`${filteredObjs.length} اعتراض`}
            actions={
              <div className="flex items-center gap-2">
                {/* اعتراض جديد باسم الاتحاد */}
                <button
                  onClick={()=>setOpenObjModal(true)}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
                >
                  <Plus className="size-4"/> اعتراض جديد (الاتحاد)
                </button>
                {/* نموذج متقدم (اختياري) */}
                <Link
                  href="/objections/new"
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 hover:bg-white"
                >
                  نموذج متقدم
                </Link>
              </div>
            }
          >
            {/* فلاتر المصدر والحالة */}
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-600">المصدر:</span>
              <button
                className={`rounded-full border px-2 py-1 ${objectionsView==="all"?"bg-emerald-50 border-emerald-200":""}`}
                onClick={()=>setObjectionsView("all")}
              >الكل</button>
              <button
                className={`rounded-full border px-2 py-1 ${objectionsView==="union"?"bg-emerald-50 border-emerald-200":""}`}
                onClick={()=>setObjectionsView("union")}
              >اعتراضات الاتحاد</button>
              <button
                className={`rounded-full border px-2 py-1 ${objectionsView==="member"?"bg-emerald-50 border-emerald-200":""}`}
                onClick={()=>setObjectionsView("member")}
              >اعتراضات الأعضاء</button>

              <span className="ms-3 text-slate-600">الحالة:</span>
              {(["all","قيد المراجعة","مقبول","مرفوض"] as const).map((s)=>(
                <button
                  key={s}
                  className={`rounded-full border px-2 py-1 ${objectionStatus===s?"bg-emerald-50 border-emerald-200":""}`}
                  onClick={()=>setObjectionStatus(s)}
                >
                  {s==="all" ? "الكل" : s}
                </button>
              ))}
            </div>

            <DataTable
              headers={["المعرف","العنوان","المصدر","المالك / الوحدة","الحالة","الإنشاء","إجراءات"]}
              empty="لا توجد اعتراضات."
              rows={filteredObjs.map(o=>[
                <span key="id" className="font-mono" dir="ltr">{o.id}</span>,
                o.title,
                o.source==="union" ? "الاتحاد" : "عضو",
                <span key="who">{o.owner}{o.unit && o.unit!=="—" ? ` — ${o.unit}` : ""}</span>,
                <span key="st" className={`rounded-full px-2 py-0.5 text-xs ${objTag(o.status)}`}>{o.status}</span>,
                <span key="dt" dir="ltr">{o.created}</span>,
                <div key="act" className="flex items-center gap-2">
                  {o.status!=="مقبول" && (
                    <button
                      onClick={()=>setObjs(list=>list.map(x=>x.id===o.id? {...x, status:"مقبول"} : x))}
                      className="rounded border px-2 py-1 hover:bg-white text-emerald-700"
                      aria-label="قبول"
                    >
                      قبول
                    </button>
                  )}
                  {o.status!=="مرفوض" && (
                    <button
                      onClick={()=>setObjs(list=>list.map(x=>x.id===o.id? {...x, status:"مرفوض"} : x))}
                      className="rounded border px-2 py-1 hover:bg-white text-rose-700"
                      aria-label="رفض"
                    >
                      رفض
                    </button>
                  )}
                  <Link
                    href={`/objections/${o.id}`}
                    className="rounded-lg border px-3 py-1.5 hover:bg-white inline-flex items-center gap-1"
                  >
                    تفاصيل <ArrowRight className="size-4"/>
                  </Link>
                </div>
              ])}
            />
          </Section>
        )}

        {tab==="tasks" && (
          <Section title="لوحة المهام" icon={<FolderKanban className="size-4"/>} caption="لإدارة أعمال الصيانة والتشغيل">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TaskColumn title="مفتوح" items={openTasks} onToggle={toggleTask}/>
              <TaskColumn title="قيد التنفيذ" items={doingTasks} onToggle={toggleTask}/>
              <TaskColumn title="منجز" items={doneTasks} onToggle={toggleTask}/>
            </div>
            <div className="mt-3 text-xs text-slate-500">* يمكن إضافة سحب/إفلات وتكليف تلقائي لاحقًا.</div>
          </Section>
        )}
      </main>

      {/* Footer */}
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
          <div className="mt-8 pt-6 text-xs">© {new Date().getFullYear()} منصة عـقـارنـا. جميع الحقوق محفوظة.</div>
        </div>
      </footer>

      {/* ============== Modals ============== */}
      {openMember && (
        <Modal title="إضافة عضو" onClose={()=>setOpenMember(false)}>
          <form onSubmit={addMember} className="space-y-3 text-sm">
            <Field label="الاسم الكامل"><input name="name" className={inputCls} required/></Field>
            <Field label="الوحدة"><input name="unit" className={inputCls} placeholder="A-12" required/></Field>
            <Field label="الجوال"><input name="phone" className={inputCls}/></Field>
            <Field label="البريد"><input type="email" name="email" className={inputCls}/></Field>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={()=>setOpenMember(false)} className="rounded-lg border px-4 py-2">إلغاء</button>
              <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">حفظ</button>
            </div>
          </form>
        </Modal>
      )}

      {editFee!==null && (
        <Modal title={editFee.id? "تعديل قالب":"إنشاء قالب"} onClose={()=>setEditFee(null)}>
          <form onSubmit={saveFee} className="space-y-3 text-sm">
            <Field label="العنوان"><input name="title" defaultValue={editFee.title} className={inputCls} required/></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="الدورية">
                <select name="periodicity" defaultValue={editFee.periodicity} className={inputCls}>
                  <option value="شهري">شهري</option>
                  <option value="ربع سنوي">ربع سنوي</option>
                  <option value="سنوي">سنوي</option>
                </select>
              </Field>
              <Field label="المبلغ">
                <input name="amount" type="number" min={1} step={1} defaultValue={editFee.amount} className={inputCls} required/>
              </Field>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={editFee.active}/>
              <span>تفعيل القالب</span>
            </label>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={()=>setEditFee(null)} className="rounded-lg border px-4 py-2">إلغاء</button>
              <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">حفظ</button>
            </div>
          </form>
        </Modal>
      )}

      {openAnn && (
        <Modal title="إعلان جديد" onClose={()=>setOpenAnn(false)}>
          <form onSubmit={addAnnouncement} className="space-y-3 text-sm">
            <Field label="العنوان"><input name="title" className={inputCls} required/></Field>
            <Field label="المحتوى"><textarea name="body" className={inputCls+" h-28"} placeholder="نص الإعلان"/></Field>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={()=>setOpenAnn(false)} className="rounded-lg border px-4 py-2">إلغاء</button>
              <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">نشر</button>
            </div>
          </form>
        </Modal>
      )}

      {openObjModal && (
        <Modal title="تسجيل اعتراض (الاتحاد)" onClose={()=>setOpenObjModal(false)}>
          <form
            onSubmit={(e)=>{
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const title = String(fd.get("title")||"").trim();
              const details = String(fd.get("details")||"").trim();
              if (!title) { alert("العنوان مطلوب."); return; }
              const id = "OBJ-" + Math.floor(Math.random()*9000+1000);
              const created = new Date().toISOString().slice(0,10);
              setObjs(list=>[
                { id, title, owner:"اتحاد الملاك", unit:"—", status:"قيد المراجعة", created, source:"union" },
                ...list
              ]);
              // details حاليًا لا نخزنها في الجدول، اربطها لاحقًا بالـ API أو صفحة التفاصيل
              setOpenObjModal(false);
            }}
            className="space-y-3 text-sm"
          >
            <Field label="عنوان الاعتراض">
              <input name="title" className={inputCls} placeholder="مثال: مراجعة احتساب رسوم التشغيل" required />
            </Field>
            <Field label="تفاصيل مختصرة">
              <textarea name="details" className={inputCls + " h-28"} placeholder="وصف موجز لسبب الاعتراض (اختياري)" />
            </Field>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={()=>setOpenObjModal(false)} className="rounded-lg border px-4 py-2">إلغاء</button>
              <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">تسجيل</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ================= Reusable ================= */
function TabBtn({active, children, onClick}:{active:boolean; children:React.ReactNode; onClick:()=>void}){
  return <button onClick={onClick} className={navCls(active)}>{children}</button>;
}

function Section({title, caption, icon, actions, children}:{title:string; caption?:string; icon?:React.ReactNode; actions?:React.ReactNode; children:React.ReactNode}){
  return (
    <section className="rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          {icon && <span className="text-emerald-700">{icon}</span>}
          <div>
            <h2 className="font-semibold text-emerald-900">{title}</h2>
            {caption && <div className="text-xs text-slate-500 mt-0.5">{caption}</div>}
          </div>
        </div>
        {actions}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function OverviewSection(){
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard title="عدد الأعضاء" value="210" hint="إجمالي المسجلين" icon={<Users2 className="size-5"/>}/>
      <StatCard title="وحدات مدارة" value="128" hint="ضمن 3 مبانٍ" icon={<Home className="size-5"/>}/>
      <StatCard title="نسبة التحصيل" value="82%" hint="آخر 30 يوم" icon={<CheckCircle2 className="size-5"/>}/>
      <StatCard title="اعتراضات مفتوحة" value="7" hint="بحاجة للمعالجة" icon={<AlertTriangle className="size-5"/>}/>
      <div className="md:col-span-2 rounded-xl border bg-white p-4">
        <div className="font-semibold mb-2">أحدث الإعلانات</div>
        <ul className="text-sm divide-y">
          <li className="py-2 flex items-center justify-between"><span>تنبيه صيانة مصاعد — السبت</span><span className="text-xs text-slate-500" dir="ltr">2025-09-10</span></li>
          <li className="py-2 flex items-center justify-between"><span>رش مبيدات — الثلاثاء</span><span className="text-xs text-slate-500" dir="ltr">2025-09-08</span></li>
        </ul>
      </div>
      <div className="rounded-xl border bg-white p-4">
        <div className="font-semibold mb-2">إجراءات سريعة</div>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <Link href="/objections/new" className="rounded-lg border px-3 py-2 hover:bg-emerald-50 inline-flex items-center gap-2"><FileText className="size-4"/> تسجيل اعتراض</Link>
          <Link href="/owner/satisfaction" className="rounded-lg border px-3 py-2 hover:bg-emerald-50 inline-flex items-center gap-2"><CalendarCheck2 className="size-4"/> مؤشر الرضا</Link>
          <Link href="/payments" className="rounded-lg border px-3 py-2 hover:bg-emerald-50 inline-flex items-center gap-2"><Receipt className="size-4"/> المدفوعات</Link>
        </div>
      </div>
    </section>
  );
}

function DataTable({headers, rows, empty}:{headers:string[]; rows:React.ReactNode[][]; empty:string}){
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>{headers.map((h,i)=>(<th key={i} className="p-3 text-right">{h}</th>))}</tr>
        </thead>
        <tbody className="divide-y">
          {rows.length===0 ? (
            <tr><td colSpan={headers.length} className="p-6"><EmptyState text={empty}/></td></tr>
          ) : rows.map((r,i)=>(
            <tr key={i} className="hover:bg-slate-50">{r.map((c,j)=>(<td key={j} className="p-3">{c}</td>))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({text}:{text:string}){
  return <div className="text-center text-slate-500">{text}</div>;
}

function StatCard({title,value,icon,hint}:{title:string;value:string;icon:React.ReactNode;hint?:string}){
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500">{title}</div>
          <div className="text-xl font-semibold mt-1">{value}</div>
          {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
        </div>
        <div className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">{icon}</div>
      </div>
    </div>
  );
}

function TaskColumn({title, items, onToggle}:{title:string; items:Task[]; onToggle:(id:string)=>void}){
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="font-medium mb-2">{title}</div>
      <div className="space-y-2">
        {items.length===0 && <div className="text-sm text-slate-500">لا توجد مهام.</div>}
        {items.map(t=>(
          <div key={t.id} className="rounded-lg border p-3 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{t.title}</div>
                {t.assignee && <div className="text-xs text-slate-500 mt-0.5">مكلف: {t.assignee}</div>}
              </div>
              <button onClick={()=>onToggle(t.id)} className="rounded border px-2 py-1 hover:bg-emerald-50 inline-flex items-center gap-1 text-xs">
                <CircleCheck className="size-4"/> تم
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Modal({title, onClose, children}:{title:string; onClose:()=>void; children:React.ReactNode}){
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100" aria-label="إغلاق"><X className="size-5"/></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function Field({label, children}:{label:string; children:React.ReactNode}){
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}
