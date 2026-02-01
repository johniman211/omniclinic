
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { supabase } from '../../lib/supabase';

const LabView: React.FC = () => {
  const { clinic } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVisit, setActiveVisit] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  const availableTests = clinic?.settings?.departmentServices?.['Laboratory'] || ['FBC', 'Widal Test', 'Blood Sugar', 'Malaria BS'];

  useEffect(() => {
    fetchLabQueue();
  }, [clinic?.id]);

  const fetchLabQueue = async () => {
    if (!clinic?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('visits')
      .select('*, patient:patients(*)')
      .eq('organization_id', clinic.id)
      .eq('status', 'lab')
      .order('created_at', { ascending: true });
    
    if (data) {
      setQueue(data);
      if (data.length > 0 && !activeVisit) setActiveVisit(data[0]);
    }
    setLoading(false);
  };

  const handleCompleteLab = async () => {
    if (!activeVisit) return;
    setIsSubmitting(true);
    try {
      // Logic to save results in JSON or a results table would go here
      const { error } = await supabase
        .from('visits')
        .update({ 
          status: 'pharmacy',
          notes: JSON.stringify({
            labResults: testResults,
            completedAt: new Date().toISOString()
          })
        })
        .eq('id', activeVisit.id);
      
      if (error) throw error;
      setActiveVisit(null);
      setTestResults({});
      fetchLabQueue();
    } catch (err) {
      console.error(err);
      alert("Error saving results.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Laboratory Management</h2>
          <p className="text-slate-500 font-medium italic">Diagnostic processing driven by clinic test configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="bg-slate-50 p-6 border-b border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400">Laboratory Queue</div>
          <div className="divide-y divide-slate-50 overflow-y-auto">
            {loading ? <div className="p-10 text-center"><i className="fas fa-circle-notch fa-spin text-indigo-600"></i></div> : null}
            {queue.map(order => (
              <div 
                key={order.id} 
                onClick={() => setActiveVisit(order)}
                className={`p-6 cursor-pointer transition-all border-l-4 ${activeVisit?.id === order.id ? 'bg-indigo-50 border-indigo-600' : 'hover:bg-slate-50 border-transparent'}`}
              >
                <p className="font-black text-slate-900 text-sm">{order.patient?.full_name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 group-hover:text-indigo-500">{order.patient?.mrn}</p>
              </div>
            ))}
            {queue.length === 0 && !loading && <p className="p-10 text-center text-slate-300 italic text-xs font-bold">No pending diagnostic orders</p>}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 min-h-[600px] flex flex-col">
          {activeVisit ? (
            <div className="space-y-10 flex-1">
              <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{activeVisit.patient?.full_name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Visit ID: {activeVisit.id.split('-')[0]}</p>
                </div>
                <button 
                  onClick={handleCompleteLab}
                  disabled={isSubmitting}
                  className="bg-indigo-600 text-white px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-check-double"></i>}
                  Verify & Forward Visit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                 {availableTests.map((test) => (
                   <div key={test} className="space-y-2 animate-in zoom-in-95 duration-300">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{test}</label>
                     <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Enter result..." 
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                          value={testResults[test] || ''}
                          onChange={(e) => setTestResults({ ...testResults, [test]: e.target.value })}
                        />
                     </div>
                   </div>
                 ))}
                 {availableTests.length === 0 && (
                   <div className="col-span-full p-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                      <p className="text-slate-400 font-bold uppercase text-xs">No tests configured in Clinic Settings</p>
                   </div>
                 )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-20">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 text-4xl shadow-inner">
                <i className="fas fa-microscope"></i>
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Select a queue item to record results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabView;
