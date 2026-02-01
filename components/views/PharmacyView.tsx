
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { supabase } from '../../lib/supabase';

const PharmacyView: React.FC = () => {
  const { clinic } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDispensing, setIsDispensing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ drugId: '', qty: 1, patientName: '' });

  useEffect(() => {
    fetchPharmacyData();
  }, [clinic?.id]);

  const fetchPharmacyData = async () => {
    if (!clinic?.id) return;
    setLoading(true);
    const [inv, vis] = await Promise.all([
      supabase.from('inventory').select('*').eq('organization_id', clinic.id).order('name'),
      supabase.from('visits').select('*, patient:patients(*)').eq('organization_id', clinic.id).eq('status', 'pharmacy').order('created_at')
    ]);
    
    if (inv.data) setInventory(inv.data);
    if (vis.data) setQueue(vis.data);
    setLoading(false);
  };

  const handleDispense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Update Inventory Stock (Logic simplified for SaaS demo)
      const drug = inventory.find(d => d.id === form.drugId);
      if (drug) {
        await supabase.from('inventory').update({ stock: drug.stock - form.qty }).eq('id', form.drugId);
      }
      
      // 2. Complete the visit if it's in the queue
      const visit = queue.find(v => v.patient?.full_name === form.patientName);
      if (visit) {
        await supabase.from('visits').update({ status: 'completed' }).eq('id', visit.id);
      }

      setIsDispensing(false);
      fetchPharmacyData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Pharmacy Management</h2>
          <p className="text-slate-500 font-medium">Inventory & Dispensing (Supabase Synced)</p>
        </div>
        <button 
          onClick={() => setIsDispensing(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3"
        >
          <i className="fas fa-pills"></i>
          Direct Dispense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Dispensing Queue</h3>
            <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full">{queue.length} Wait</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {queue.map(v => (
              <div key={v.id} className="p-6 hover:bg-slate-50 cursor-pointer group" onClick={() => { setIsDispensing(true); setForm({...form, patientName: v.patient?.full_name}); }}>
                <p className="font-black text-slate-900 text-sm">{v.patient?.full_name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{v.patient?.mrn}</p>
              </div>
            ))}
            {queue.length === 0 && <p className="p-10 text-center text-slate-300 italic text-xs">Queue is clear</p>}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Current Inventory</h3>
            <button onClick={() => setInventory([...inventory, { id: 'new', name: 'New Drug', stock: 100, price: 500, category: 'Analgesic' }])} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">+ Add Medicine</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="px-8 py-5">Medication</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Stock</th>
                  <th className="px-8 py-5">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inventory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-all">
                    <td className="px-8 py-5 font-black text-slate-900 text-sm">{item.name}</td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">{item.category}</td>
                    <td className="px-8 py-5">
                      <span className={`font-black text-sm ${item.stock < 20 ? 'text-red-500' : 'text-slate-700'}`}>{item.stock}</span>
                    </td>
                    <td className="px-8 py-5 font-bold text-indigo-600 text-xs">{item.price} SSP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isDispensing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Dispense Medicine</h3>
              <button onClick={() => setIsDispensing(false)}><i className="fas fa-times text-xl text-slate-300"></i></button>
            </div>
            <form onSubmit={handleDispense} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</label>
                <input required type="text" className="w-full bg-slate-50 border p-4 rounded-2xl font-bold" value={form.patientName} onChange={(e) => setForm({...form, patientName: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medication</label>
                <select required className="w-full bg-slate-50 border p-4 rounded-2xl font-bold" value={form.drugId} onChange={(e) => setForm({...form, drugId: e.target.value})}>
                  <option value="">Select Medication...</option>
                  {inventory.map(d => <option key={d.id} value={d.id}>{d.name} ({d.stock} left)</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</label>
                <input required type="number" className="w-full bg-slate-50 border p-4 rounded-2xl font-bold" value={form.qty} onChange={(e) => setForm({...form, qty: parseInt(e.target.value)})} />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl">
                {isSubmitting ? 'Recording...' : 'Confirm Dispensing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyView;
