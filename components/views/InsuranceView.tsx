
import React, { useState } from 'react';

const InsuranceView: React.FC = () => {
  const [claims, setClaims] = useState([
    { id: 'CLM-0012', provider: 'Liberty Health', patient: 'Atong Deng', amount: 1250, status: 'Submitted', date: '2024-03-14' },
    { id: 'CLM-0015', provider: 'UAP Insurance', patient: 'Samuel Jok', amount: 840, status: 'Approved', date: '2024-03-12' },
    { id: 'CLM-0018', provider: 'Liberty Health', patient: 'Mary Atem', amount: 3200, status: 'Rejected', date: '2024-03-10' },
    { id: 'CLM-0021', provider: 'Britam', patient: 'Ladu John', amount: 150, status: 'Paid', date: '2024-03-05' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBulkSubmit = () => {
    setIsSubmitting(true);
    // Simulate real submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Insurance & Claims</h2>
          <p className="text-slate-500 mt-1 font-medium">Corporate healthcare partnerships and reimbursement tracking</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-100 text-slate-700 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-slate-200 hover:bg-white hover:shadow-sm transition-all">
            <i className="fas fa-building text-slate-400"></i> Providers
          </button>
          <button 
            onClick={handleBulkSubmit}
            disabled={isSubmitting || success}
            className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-3 ${
              success ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? <i className="fas fa-circle-notch fa-spin"></i> : success ? <i className="fas fa-check-circle"></i> : <i className="fas fa-file-export"></i>}
            {isSubmitting ? 'Processing Claims...' : success ? 'Claims Submitted' : 'Bulk Claim Submission'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm col-span-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Receivable Portfolio</h3>
          <div className="space-y-8">
            <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 shadow-inner">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Global Outstanding</p>
              <p className="text-4xl font-black text-indigo-900 mt-2">USD 142.5K</p>
            </div>
            <div className="space-y-6">
               {[
                 { provider: 'Liberty Health', val: 'USD 82k', p: 60, color: 'bg-indigo-600' },
                 { provider: 'UAP South Sudan', val: 'USD 45k', p: 30, color: 'bg-blue-500' },
                 { provider: 'Other Providers', val: 'USD 15.5k', p: 10, color: 'bg-slate-400' },
               ].map((p, i) => (
                 <div key={i} className="space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-xs font-black text-slate-700">{p.provider}</span>
                     <span className="text-xs font-black text-slate-500">{p.val}</span>
                   </div>
                   <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-100">
                     <div className={`${p.color} h-full rounded-full transition-all duration-1000`} style={{width: `${p.p}%`}}></div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm col-span-2 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Active Claims Pipeline</h3>
            <div className="flex items-center gap-2">
               <button className="text-[10px] font-black uppercase text-indigo-600 px-4 py-2 bg-indigo-50 rounded-xl shadow-sm">All Batches</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="px-8 py-6">Claim Reference</th>
                  <th className="px-8 py-6">Provider</th>
                  <th className="px-8 py-6">Patient Identity</th>
                  <th className="px-8 py-6">Value (USD)</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {claims.map(cl => (
                  <tr key={cl.id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                    <td className="px-8 py-6 text-xs font-mono font-black text-slate-400 tracking-tighter">{cl.id}</td>
                    <td className="px-8 py-6 font-black text-slate-900 text-sm">{cl.provider}</td>
                    <td className="px-8 py-6 font-bold text-slate-600">{cl.patient}</td>
                    <td className="px-8 py-6">
                      <span className="font-black text-slate-900">{cl.amount.toLocaleString()}</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">{cl.date}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        cl.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        cl.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        cl.status === 'Approved' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {cl.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all group-hover:opacity-100 opacity-0">
                         <i className="fas fa-ellipsis-v"></i>
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

export default InsuranceView;
