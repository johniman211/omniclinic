
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { supabase } from "../lib/supabase";
import { Organization } from "../types";

export default function OrgSwitcher() {
  const { clinic, setClinic, user } = useAuth();
  const [clinics, setClinics] = useState<{role: string, organization: Organization}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('memberships')
        .select(`
          role,
          organization:organizations (*)
        `)
        .eq('user_id', user.id);

      if (data) {
        setClinics(data as any);
      }
      setLoading(false);
    };

    fetchClinics();
  }, [user?.id]);

  if (loading) return (
    <div className="px-4 py-2 bg-slate-50 rounded-2xl animate-pulse w-40 h-10"></div>
  );

  return (
    <div className="relative group">
      <button className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-sm transition-all">
        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-black">
          {clinic?.name?.[0] || "O"}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Clinic</p>
          <p className="text-sm font-black text-slate-900 mt-1">{clinic?.name || "Select Clinic"}</p>
        </div>
        <i className="fas fa-chevron-down text-[10px] text-slate-400 ml-2"></i>
      </button>

      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-3 z-[100] overflow-hidden">
        <div className="px-6 py-2 border-b border-slate-50 mb-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Switch Workspace</p>
        </div>
        {clinics.map((entry) => (
          <button
            key={entry.organization.id}
            onClick={() => setClinic(entry.organization, entry.role)}
            className={`w-full text-left px-6 py-3 text-sm font-bold flex items-center gap-4 transition-all ${
              clinic?.id === entry.organization.id ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
               clinic?.id === entry.organization.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
            }`}>
              {entry.organization.name[0]}
            </div>
            <div className="flex-1">
              <p className="leading-none">{entry.organization.name}</p>
              <p className="text-[8px] uppercase tracking-tighter text-slate-400 mt-1">{entry.role}</p>
            </div>
          </button>
        ))}
        <div className="mt-2 pt-2 border-t border-slate-50 px-3">
          <button className="w-full text-left px-3 py-2 text-xs font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 rounded-xl transition-all">
            + Request Access
          </button>
        </div>
      </div>
    </div>
  );
}
