
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { supabase } from '../../lib/supabase';

const TriageView: React.FC = () => {
  const { clinic } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVisit, setActiveVisit] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [vitals, setVitals] = useState<Record<string, string>>({
    Temp: '', Systolic: '', Diastolic: '', Pulse: '', SpO2: ''
  });

  useEffect(() => {
    fetchQueue();
  }, [clinic?.id]);

  const fetchQueue = async () => {
    if (!clinic?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('visits')
      .select(`
        *,
        patient:patients (full_name, mrn, gender)
      `)
      .eq('organization_id', clinic.id)
      .eq('status', 'triage')
      .order('created_at', { ascending: true });

    if (error) console.error("Queue fetch error:", error);
    if (data) {
      setQueue(data);
      if (!activeVisit && data.length > 0) setActiveVisit(data[0]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisit) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('visits')
        .update({
          status: 'consultation',
          vitals: {
            temp: parseFloat(vitals.Temp),
            bp: `${vitals.Systolic}/${vitals.Diastolic}`,
            pulse: parseInt(vitals.Pulse),
            spo2: parseInt(vitals.SpO2)
          }
        })
        .eq('id', activeVisit.id);

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setActiveVisit(null);
        fetchQueue();
      }, 1500);
    } catch (err) {
      console.error("Failed to save triage:", err);
      alert("Error saving vitals.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && queue.length === 0) return <div className="p-20 text-center"><i className="fas fa-circle-notch fa-spin text-4xl text-indigo-600"></i></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <div className="lg:col-span-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col h-[600px]">
        <div className="p-6 bg-slate-50 border-b border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400">Triage Queue</div>
        <div className="divide-y divide-slate-50 overflow-y-auto">
          {queue.map(item => (
            <div key={item.id} onClick={() => setActiveVisit(item)} className={`p-6 cursor-pointer transition-all ${activeVisit?.id === item.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}>
              <span className="font-black text-slate-800 text-sm block">{item.patient?.full_name}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{item.patient?.mrn}</span>
            </div>
          ))}
          {queue.length === 0 && <p className="p-10 text-center text-slate-300 italic text-xs">Queue empty</p>}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
        {activeVisit ? (
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="flex justify-between items-center border-b pb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{activeVisit.patient?.full_name}</h2>
              <button 
                type="submit"
                disabled={isSubmitting || success}
                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${success ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white shadow-xl'}`}
              >
                {isSubmitting ? 'Saving...' : success ? 'Done' : 'Complete Triage'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['Temp', 'Systolic', 'Diastolic', 'Pulse', 'SpO2'].map(v => (
                <div key={v} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{v}</label>
                  <input 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 font-black outline-none"
                    value={vitals[v]}
                    onChange={(e) => setVitals({...vitals, [v]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          </form>
        ) : (
          <div className="p-20 text-center text-slate-300 font-bold italic">Select a patient to record vitals</div>
        )}
      </div>
    </div>
  );
};

export default TriageView;
