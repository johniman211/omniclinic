
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { i18n } from '../../constants';
import { supabase } from '../../lib/supabase';
import { Patient } from '../../types';
import { processAppointmentReminders, ReminderResult } from '../../lib/services/reminders';

interface Appointment {
  id: string;
  patient: { full_name: string; mrn: string; phone?: string };
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: 'Scheduled' | 'Confirmed' | 'Cancelled' | 'Completed';
  priority: 'Normal' | 'Urgent';
}

const AppointmentsView: React.FC = () => {
  const { lang, clinic } = useAuth();
  const t = i18n[lang as keyof typeof i18n];
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reminder State
  const [isProcessingReminders, setIsProcessingReminders] = useState(false);
  const [reminderSummary, setReminderSummary] = useState<ReminderResult | null>(null);

  const [form, setForm] = useState({
    patientId: '',
    doctorName: '',
    date: '',
    time: '',
    reason: '',
    priority: 'Normal' as 'Normal' | 'Urgent'
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, [clinic?.id]);

  const fetchPatients = async () => {
    if (!clinic?.id) return;
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('organization_id', clinic.id)
      .order('full_name', { ascending: true });
    if (data) setPatients(data);
  };

  const fetchAppointments = async () => {
    if (!clinic?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients (full_name, mrn, phone)
      `)
      .eq('organization_id', clinic.id)
      .order('date', { ascending: true });

    if (error) console.error("Appointments fetch error:", error);
    if (data) setAppointments(data as any);
    setLoading(false);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !clinic?.id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          organization_id: clinic.id,
          patient_id: form.patientId,
          doctorName: form.doctorName,
          date: form.date,
          time: form.time,
          reason: form.reason,
          priority: form.priority,
          status: 'Scheduled',
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setShowBookModal(false);
      setForm({ patientId: '', doctorName: '', date: '', time: '', reason: '', priority: 'Normal' });
      fetchAppointments();
    } catch (err) {
      console.error("Booking Error:", err);
      alert("Failed to schedule appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const runReminders = async () => {
    if (!clinic?.id) return;
    setIsProcessingReminders(true);
    setReminderSummary(null);
    
    const result = await processAppointmentReminders(clinic.id);
    setReminderSummary(result);
    setIsProcessingReminders(false);
    
    // Auto-clear summary after 10 seconds
    setTimeout(() => setReminderSummary(null), 10000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Appointments Dashboard</h2>
          <p className="text-slate-500 font-medium">Schedule management and automated patient reminders</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <button 
             onClick={runReminders}
             disabled={isProcessingReminders || !clinic?.settings?.whatsappEnabled}
             className={`flex-1 md:flex-none px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
               clinic?.settings?.whatsappEnabled 
               ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
               : 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-60'
             }`}
           >
             {isProcessingReminders ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fab fa-whatsapp"></i>}
             {isProcessingReminders ? 'Sending...' : 'Sync Reminders'}
           </button>
           <button 
             onClick={() => setShowBookModal(true)} 
             className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all active:scale-95"
           >
             Book Slot
           </button>
        </div>
      </div>

      {/* Reminder Notification Area */}
      {reminderSummary && (
        <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl animate-in slide-in-from-top-4 duration-500 border border-indigo-500/30">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
               <div className="bg-green-500 w-8 h-8 rounded-full flex items-center justify-center">
                 <i className="fas fa-check text-xs"></i>
               </div>
               <h4 className="font-black text-sm uppercase tracking-widest">Reminders Batch Complete</h4>
             </div>
             <button onClick={() => setReminderSummary(null)} className="text-slate-500 hover:text-white"><i className="fas fa-times"></i></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Messages Sent</p>
              <p className="text-2xl font-black text-green-400">{reminderSummary.sentCount}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Failures</p>
              <p className="text-2xl font-black text-red-400">{reminderSummary.failedCount}</p>
            </div>
          </div>
          <div className="mt-4 max-h-32 overflow-y-auto pr-2 space-y-1">
             {reminderSummary.logs.map((log, i) => (
               <p key={i} className="text-[10px] font-medium text-slate-400 border-l border-slate-700 pl-3">{log}</p>
             ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center"><i className="fas fa-circle-notch fa-spin text-indigo-600 text-4xl"></i></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <tr>
                  <th className="px-8 py-5">Time / Date</th>
                  <th className="px-8 py-5">Patient & Contact</th>
                  <th className="px-8 py-5">Doctor / Reason</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map(appt => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-800 text-sm leading-none">{appt.time}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">{appt.date}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                          {appt.patient?.full_name[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{appt.patient?.full_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400">{appt.patient?.phone || 'No Phone'}</span>
                            {appt.patient?.phone && (
                              <div className="w-4 h-4 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[8px]" title="WhatsApp Configured">
                                <i className="fab fa-whatsapp"></i>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-700 text-sm">Dr. {appt.doctorName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic truncate max-w-[150px]">{appt.reason}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        appt.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="text-slate-300 hover:text-indigo-600 transition-colors p-2">
                         <i className="fas fa-ellipsis-h"></i>
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <div className="p-20 text-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-2xl mx-auto mb-4">
                   <i className="fas fa-calendar-times"></i>
                 </div>
                 <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No appointments booked</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showBookModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95 shadow-2xl">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Schedule Appointment</h3>
                <button onClick={() => setShowBookModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-300 hover:text-red-500 transition-colors">
                  <i className="fas fa-times text-xl"></i>
                </button>
             </div>
             <form onSubmit={handleBookAppointment} className="space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient Search *</label>
                   <select className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all" value={form.patientId} onChange={(e) => setForm({...form, patientId: e.target.value})}>
                      <option value="">Select Registered Patient...</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.mrn})</option>)}
                   </select>
                </div>
                
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Doctor</label>
                   <input type="text" placeholder="e.g. Dr. Atem" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold" value={form.doctorName} onChange={(e) => setForm({...form, doctorName: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                      <input type="date" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                      <input type="time" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold" value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Visit</label>
                   <textarea placeholder="Briefly describe the clinical reason..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold h-24" value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} />
                </div>

                <div className="flex gap-4">
                  {['Normal', 'Urgent'].map(p => (
                    <button 
                      key={p}
                      type="button"
                      onClick={() => setForm({...form, priority: p as any})}
                      className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                        form.priority === p ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'
                      }`}
                    >
                      {p} Priority
                    </button>
                  ))}
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50">
                   {isSubmitting ? 'Recording Slot...' : 'Confirm Appointment'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsView;
