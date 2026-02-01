
import React from 'react';

const MaternityView: React.FC = () => {
  const cases = [
    { id: 'ANC-881', patient: 'Elizabeth Nyandeng', weeks: 32, status: 'Follow-up', risk: 'Low', edd: '2024-05-10' },
    { id: 'ANC-902', patient: 'Mary Keji', weeks: 14, status: 'Initial Visit', risk: 'High', edd: '2024-09-22' },
    { id: 'ANC-915', patient: 'Achol Deng', weeks: 38, status: 'Near Term', risk: 'Medium', edd: '2024-03-30' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Maternity & ANC</h2>
          <p className="text-slate-500 mt-1 font-medium">Specialized obstetric care, antenatal logs and delivery records</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-pink-100 text-pink-700 px-6 py-3.5 rounded-2xl font-bold flex items-center gap-3 border border-pink-200 hover:bg-pink-200 transition-all">
            <i className="fas fa-baby"></i>
            New Delivery Record
          </button>
          <button className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-slate-200 flex items-center gap-3">
            <i className="fas fa-plus"></i>
            Register for ANC
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Case Statistics</h3>
            <div className="space-y-6">
              {[
                { label: 'Total Active ANC', val: 42, color: 'text-indigo-600' },
                { label: 'High Risk cases', val: 5, color: 'text-red-600' },
                { label: 'Deliveries (Month)', val: 12, color: 'text-pink-600' },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-end border-b border-slate-50 pb-4">
                  <span className="text-sm font-bold text-slate-500">{s.label}</span>
                  <span className={`text-2xl font-black ${s.color}`}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
             <h4 className="font-bold mb-2">ANC Follow-up</h4>
             <p className="text-xs text-indigo-100 leading-relaxed opacity-80 mb-6">There are 4 patients scheduled for ANC follow-ups today. Ensure vitals and fetal heart rates are recorded.</p>
             <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold text-xs">View Today's Schedule</button>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-800">Active Maternity Registry</h3>
            <div className="flex gap-2">
               <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><i className="fas fa-filter"></i></button>
               <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><i className="fas fa-download"></i></button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="px-8 py-5">Case ID</th>
                  <th className="px-8 py-5">Patient Name</th>
                  <th className="px-8 py-5">Gestational Age</th>
                  <th className="px-8 py-5">EDD (Estimated)</th>
                  <th className="px-8 py-5">Risk Profile</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cases.map(c => (
                  <tr key={c.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="px-8 py-5 text-xs font-mono font-bold text-indigo-500">{c.id}</td>
                    <td className="px-8 py-5 font-bold text-slate-800">{c.patient}</td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-slate-700">{c.weeks} Weeks</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{c.status}</p>
                    </td>
                    <td className="px-8 py-5 font-medium text-slate-600">{c.edd}</td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${c.risk === 'High' ? 'bg-red-100 text-red-700' : c.risk === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {c.risk} Risk
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                         <i className="fas fa-clipboard-check"></i>
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaternityView;
