
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { supabase } from '../../lib/supabase';
import ReactQuill from 'react-quill';

const DoctorView: React.FC = () => {
  const { clinic, setActiveTab } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeVisit, setActiveVisit] = useState<any>(null);
  const [activeClinicTab, setActiveClinicTab] = useState('notes');
  const [isFinishing, setIsFinishing] = useState(false);
  const [finished, setFinished] = useState(false);
  
  const [consultationNotes, setConsultationNotes] = useState({ subjective: '', objective: '' });
  const [labOrders, setLabOrders] = useState<string[]>([]);
  const [prescriptions, setPrescriptions] = useState<{ category: string, drug: string, dosage: string }[]>([]);

  const labTests = clinic?.settings?.departmentServices?.['Laboratory'] || ['FBC', 'Widal Test', 'Malaria BS'];
  const drugCategories = clinic?.settings?.departmentServices?.['Pharmacy'] || ['Antibiotics', 'Analgesics'];

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  useEffect(() => {
    fetchActiveVisit();
  }, [clinic?.id]);

  const fetchActiveVisit = async () => {
    if (!clinic?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          patient:patients (*)
        `)
        .eq('organization_id', clinic.id)
        .eq('status', 'consultation')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) console.error("Active visit fetch error:", error);
      if (data) setActiveVisit(data);
      else setActiveVisit(null);
    } catch (err) {
      console.error("Doctor view fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishVisit = async () => {
    if (!activeVisit) return;
    setIsFinishing(true);
    try {
      const nextStatus = labOrders.length > 0 ? 'lab' : (prescriptions.length > 0 ? 'pharmacy' : 'completed');
      
      const { error } = await supabase
        .from('visits')
        .update({
          status: nextStatus,
          notes: JSON.stringify({
            subjective: consultationNotes.subjective,
            objective: consultationNotes.objective,
            orders: { labOrders, prescriptions }
          })
        })
        .eq('id', activeVisit.id);

      if (error) throw error;

      setFinished(true);
      setTimeout(() => {
        setFinished(false);
        setActiveTab('dashboard');
      }, 1500);
    } catch (err) {
      console.error("Failed to finish visit:", err);
      alert("Error saving encounter notes.");
    } finally {
      setIsFinishing(false);
    }
  };

  const toggleLabOrder = (test: string) => {
    setLabOrders(prev => prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]);
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { category: '', drug: '', dosage: '' }]);
  };

  if (loading) return <div className="p-20 text-center"><i className="fas fa-circle-notch fa-spin text-indigo-600 text-4xl"></i></div>;

  if (!activeVisit) return (
    <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-200 text-5xl shadow-sm border border-slate-100">
        <i className="fas fa-user-md"></i>
      </div>
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Consultation Queue Empty</h2>
      <p className="text-slate-500 max-w-md font-medium italic">New patients processed through triage will automatically appear here for medical encounter.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10 text-center sticky top-24">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl shadow-xl mx-auto mb-6 transform hover:rotate-6 transition-transform">
            {activeVisit.patient?.full_name?.[0]}
          </div>
          <h3 className="font-black text-slate-900 text-2xl tracking-tight">{activeVisit.patient?.full_name}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">MRN: {activeVisit.patient?.mrn}</p>
          
          <div className="mt-10 space-y-4">
             <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Vital Signs</p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div><span className="text-[9px] font-bold text-slate-400 block uppercase">Temp</span><span className="text-sm font-black text-slate-800">{activeVisit.vitals?.temp}°C</span></div>
                  <div><span className="text-[9px] font-bold text-slate-400 block uppercase">BP</span><span className="text-sm font-black text-slate-800">{activeVisit.vitals?.bp}</span></div>
                  <div><span className="text-[9px] font-bold text-slate-400 block uppercase">Pulse</span><span className="text-sm font-black text-slate-800">{activeVisit.vitals?.pulse} bpm</span></div>
                  <div><span className="text-[9px] font-bold text-slate-400 block uppercase">SpO2</span><span className="text-sm font-black text-slate-800">{activeVisit.vitals?.spo2}%</span></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 bg-white rounded-[3rem] shadow-sm border border-slate-100 flex flex-col min-h-[750px] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 h-24 bg-slate-50/30">
          <div className="flex gap-6">
            {['notes', 'lab', 'pharmacy'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveClinicTab(tab)} 
                className={`px-4 font-black uppercase text-[10px] tracking-[0.2em] transition-all relative ${
                  activeClinicTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
                {activeClinicTab === tab && <span className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full"></span>}
              </button>
            ))}
          </div>
          <button 
            onClick={handleFinishVisit} 
            disabled={isFinishing || finished} 
            className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
          >
             {isFinishing ? 'Processing...' : finished ? 'Visit Recorded' : 'Finalize Encounter'}
          </button>
        </div>

        <div className="p-10 flex-1 overflow-y-auto">
          {activeClinicTab === 'notes' && (
             <div className="space-y-12 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subjective (Symptoms / History)</label>
                      <div className="quill-wrapper">
                        <ReactQuill theme="snow" modules={quillModules} value={consultationNotes.subjective} onChange={(val) => setConsultationNotes({...consultationNotes, subjective: val})} />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objective (Examination / Findings)</label>
                      <div className="quill-wrapper">
                        <ReactQuill theme="snow" modules={quillModules} value={consultationNotes.objective} onChange={(val) => setConsultationNotes({...consultationNotes, objective: val})} />
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeClinicTab === 'lab' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Select Diagnostics to Order</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {labTests.map(test => (
                  <button 
                    key={test} 
                    onClick={() => toggleLabOrder(test)}
                    className={`p-5 rounded-[1.5rem] border text-xs font-bold uppercase transition-all flex flex-col items-center gap-3 ${
                      labOrders.includes(test) ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    <i className={`fas ${labOrders.includes(test) ? 'fa-check-circle' : 'fa-vial opacity-40'}`}></i>
                    {test}
                  </button>
                ))}
              </div>
              {labTests.length === 0 && (
                <div className="p-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-xs uppercase">Please configure Laboratory tests in Clinic Settings</p>
                </div>
              )}
            </div>
          )}

          {activeClinicTab === 'pharmacy' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Electronic Prescription</h4>
                <button 
                  onClick={addPrescription}
                  className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                >
                  + Add Medication
                </button>
              </div>
              
              <div className="space-y-4">
                {prescriptions.map((p, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 items-center">
                    <div className="col-span-4">
                      <select 
                        className="w-full bg-white border border-slate-100 p-3.5 rounded-xl font-bold text-xs outline-none focus:ring-4 focus:ring-indigo-500/10"
                        value={p.category}
                        onChange={(e) => {
                          const updated = [...prescriptions];
                          updated[i].category = e.target.value;
                          setPrescriptions(updated);
                        }}
                      >
                        <option value="">Select Category...</option>
                        {drugCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <input 
                        placeholder="Drug Name..." 
                        className="w-full bg-white border border-slate-100 p-3.5 rounded-xl font-bold text-xs outline-none"
                        value={p.drug}
                        onChange={(e) => {
                          const updated = [...prescriptions];
                          updated[i].drug = e.target.value;
                          setPrescriptions(updated);
                        }}
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        placeholder="Dosage..." 
                        className="w-full bg-white border border-slate-100 p-3.5 rounded-xl font-bold text-xs outline-none"
                        value={p.dosage}
                        onChange={(e) => {
                          const updated = [...prescriptions];
                          updated[i].dosage = e.target.value;
                          setPrescriptions(updated);
                        }}
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <button 
                        onClick={() => setPrescriptions(prescriptions.filter((_, idx) => idx !== i))}
                        className="text-slate-300 hover:text-red-600 transition-colors"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorView;
