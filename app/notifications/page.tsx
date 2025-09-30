"use client";
import React from "react";

export default function NotificationsPage(){
  // Mock notifications
  const list = [
    { id:1, t:"فاتورة جديدة Q3 2025", d:"تم إصدار فاتورة جديدة بمبلغ 1380 ر.س", date:"2025-09-20", read:false },
    { id:2, t:"تحديث اعتراض OBJ-2207", d:"تم انتقال الحالة إلى: جارٍ المراجعة", date:"2025-09-12", read:true },
  ];
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-bold text-emerald-900 mb-2">الإشعارات</h1>
        <ul className="space-y-3">
          {list.map(n => (
            <li key={n.id} className={`rounded-xl border p-3 ${n.read? '' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex items-center justify-between">
                <div className="font-medium">{n.t}</div>
                <div className="text-xs text-slate-500">{n.date}</div>
              </div>
              <div className="text-sm text-slate-700 mt-1">{n.d}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}