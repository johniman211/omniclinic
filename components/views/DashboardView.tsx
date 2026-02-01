
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { i18n } from '../../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';

const DashboardView: React.FC = () => {
  const { lang, setActiveTab, clinic } = useAuth();
  const t = i18n[lang as keyof typeof i18n];
  const [stats, setStats] = useState({
    activeVisits: 0,
    dailyRevenue: 0,
    pendingLab: 0,
    inventoryAlerts: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!clinic?.id) return;

      try {
        const [active, lab] = await Promise.all([
          supabase.from('visits').select('id', { count: 'exact' }).eq('organization_id', clinic.id).neq('status', 'completed'),
          supabase.from('visits').select('id', { count: 'exact' }).eq('organization_id', clinic.id).eq('status', 'lab')
        ]);

        if (active.error) console.error("Active visits fetch error:", active.error);
        if (lab.error) console.error("Lab visits fetch error:", lab.error);

        setStats({
          activeVisits: active.count || 0,
          dailyRevenue: 420000, 
          pendingLab: lab.count || 0,
          inventoryAlerts: 4
        });
      } catch (err) {
        console.error("Dashboard stats error:", err);
      }
    };

    fetchStats();
  }, [clinic?.id]);

  const chartData = [
    { name: '08:00', patients: 12 },
    { name: '10:00', patients: 25 },
    { name: '12:00', patients: 18 },
    { name: '14:00', patients: 35 },
    { name: '16:00', patients: 22 },
    { name: '18:00', patients: stats.activeVisits + 5 },
  ];

  const quickActions = [
    { id: 'patients', label: t.registerPatient, icon: 'fa-user-plus', color: 'bg-indigo-600', textColor: 'text-white' },
    { id: 'triage', label: 'Send to Triage', icon: 'fa-heartbeat', color: 'bg-red-50', textColor: 'text-red-600', border: 'border-red-100' },
    { id: 'consultation', label: 'Doctor Consultation', icon: 'fa-user-md', color: 'bg-blue-50', textColor: 'text-blue-600', border: 'border-blue-100' },
    { id: 'lab', label: 'Order Lab Test', icon: 'fa-vial', color: 'bg-orange-50', textColor: 'text-orange-600', border: 'border-orange-100' },
    { id: 'pharmacy', label: 'Dispense Meds', icon: 'fa-pills', color: 'bg-green-50', textColor: 'text-green-600', border: 'border-green-100' },
    { id: 'admissions', label: 'Admit Patient', icon: 'fa-bed', color: 'bg-slate-50', textColor: 'text-slate-700', border: 'border-slate-200' },
    { id: 'maternity', label: 'ANC/Maternity', icon: 'fa-baby-carriage', color: 'bg-pink-50', textColor: 'text-pink-600', border: 'border-pink-100' },
    { id: 'billing', label: 'Create Invoice', icon: 'fa-file-invoice-dollar', color: 'bg-slate-900', textColor: 'text-white' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Visits', value: stats.activeVisits.toString(), icon: 'fa-users', color: 'text-blue-600', bg: 'bg-blue-50', tab: 'triage' },
          { label: 'Daily Revenue', value: `SSP ${stats.dailyRevenue.toLocaleString()}`, icon: 'fa-money-bill-wave', color: 'text-green-600', bg: 'bg-green-50', tab: 'billing' },
          { label: 'Pending Lab', value: stats.pendingLab.toString(), icon: 'fa-vial', color: 'text-orange-600', bg: 'bg-orange-50', tab: 'lab' },
          { label: 'Inventory Alerts', value: stats.inventoryAlerts.toString(), icon: 'fa-exclamation-triangle', color: 'text-red-600', bg: 'bg-red-50', tab: 'pharmacy' },
        ].map((kpi, idx) => (
          <div 
            key={idx} 
            onClick={() => setActiveTab(kpi.tab)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group"
          >
            <div>
              <p className="text-slate-500 text-sm font-medium">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{kpi.value}</p>
            </div>
            <div className={`${kpi.bg} ${kpi.color} w-12 h-12 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
              <i className={`fas ${kpi.icon}`}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Traffic Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Patient Traffic (Live)</h3>
            <div className="flex gap-2">
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">Syncing via Supabase</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} 
                  cursor={{stroke: '#6366f1', strokeWidth: 2}}
                />
                <Area type="monotone" dataKey="patients" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorPatients)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions List */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full">
          <h3 className="font-black text-slate-800 mb-6 uppercase text-xs tracking-widest">Clinic Operations</h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {quickActions.map((action) => (
              <button 
                key={action.id}
                onClick={() => setActiveTab(action.id)} 
                className={`w-full flex items-center gap-4 p-4 ${action.color} ${action.textColor} rounded-[1.25rem] border ${action.border || 'border-transparent'} hover:shadow-lg hover:scale-[1.02] transition-all transform active:scale-95 text-left`}
              >
                <div className={`w-10 h-10 rounded-xl ${action.textColor === 'text-white' ? 'bg-white/20' : 'bg-white shadow-sm'} flex items-center justify-center text-lg`}>
                  <i className={`fas ${action.icon}`}></i>
                </div>
                <div>
                  <span className="font-black text-sm uppercase tracking-tight leading-none block">{action.label}</span>
                  <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-1 block">Quick Access</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
