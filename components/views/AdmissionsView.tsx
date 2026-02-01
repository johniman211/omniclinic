
import React, { useState } from 'react';

const AdmissionsView: React.FC = () => {
  const [selectedWard, setSelectedWard] = useState('All Wards');
  
  const wards = ['General Ward', 'ICU', 'Pediatric Ward', 'Private Rooms'];
  const beds = [
    { id: 'BED-01', ward: 'General Ward', patient: 'Ladu John', status: 'Occupied', admittedSince: '2024-03-01' },
    { id: 'BED-02', ward: 'General Ward', patient: null, status: 'Available', admittedSince: null },
    { id: 'BED-03', ward: 'ICU', patient: 'Mary Atem', status: 'Occupied', admittedSince: '2024-03-12' },
    { id: 'BED-04', ward: 'Private Rooms', patient: null, status: 'Cleaning', admittedSince: null },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Inpatient & Admissions</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage ward occupancy and clinical inpatient logs</p>
        </div>
        <button className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3">
          <i className="fas fa-bed-pulse"></i>
          New Admission
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Total Beds', 'Occupied', 'Available', 'Critical'].map((label, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{[120, 84, 36, 12][idx]}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex gap-2">
            {['All Wards', ...wards].map(w => (
              <button 
                key={w}
                onClick={() => setSelectedWard(w)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedWard === w ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
              >
                {w}
              </button>
            ))}
          </div>
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input type="text" placeholder="Search bed or patient..." className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs w-64 focus:ring-4 focus:ring-indigo-500/10" />
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {beds.map(bed => (
            <div key={bed.id} className={`p-6 rounded-3xl border transition-all hover:shadow-xl ${bed.status === 'Occupied' ? 'bg-indigo-50 border-indigo-100' : bed.status === 'Cleaning' ? 'bg-orange-50 border-orange-100 opacity-70' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg ${bed.status === 'Occupied' ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                  <i className="fas fa-bed"></i>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${bed.status === 'Occupied' ? 'bg-indigo-200 text-indigo-700' : bed.status === 'Cleaning' ? 'bg-orange-200 text-orange-700' : 'bg-green-200 text-green-700'}`}>
                  {bed.status}
                </span>
              </div>
              <h4 className="font-black text-slate-900 tracking-tight text-lg">{bed.id}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{bed.ward}</p>
              
              {bed.patient ? (
                <div className="mt-6 pt-6 border-t border-indigo-100/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-xs">
                      {bed.patient[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{bed.patient}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Since {bed.admittedSince}</p>
                    </div>
                  </div>
                  <button className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                    Patient Dashboard
                  </button>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center justify-center h-24">
                  <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
                    Assign Patient
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdmissionsView;
