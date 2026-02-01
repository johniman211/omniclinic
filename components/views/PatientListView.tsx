
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../App';
import { i18n } from '../../constants';
import { supabase } from '../../lib/supabase';
import { Patient, PatientDocument } from '../../types';

interface PatientFormState {
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  address: string;
}

const PatientListView: React.FC = () => {
  const { lang, clinic, setActiveTab } = useAuth();
  const t = i18n[lang as keyof typeof i18n];
  const [search, setSearch] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientDocs, setPatientDocs] = useState<PatientDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<PatientFormState>({
    full_name: '',
    gender: 'Male',
    dob: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchPatients();
  }, [clinic?.id]);

  const fetchPatients = async () => {
    if (!clinic?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('organization_id', clinic.id)
      .order('created_at', { ascending: false });

    if (error) console.error("Patient fetch error:", error);
    if (data) setPatients(data);
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!clinic?.id || !form.full_name || !form.dob) {
      setFormError("Please fill in all required fields (Name and DOB).");
      return;
    }
    
    setIsSubmitting(true);
    const mrn = `MRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([{
          organization_id: clinic.id,
          full_name: form.full_name,
          gender: form.gender,
          dob: form.dob,
          phone: form.phone,
          address: form.address,
          mrn: mrn
        }])
        .select()
        .single();

      if (error) throw error;
      
      setPatients([data, ...patients]);
      setShowRegisterModal(false);
      setForm({ full_name: '', gender: 'Male', dob: '', phone: '', address: '' });
    } catch (err: any) {
      console.error("Supabase Patient Insert Error:", err);
      setFormError(err.message || "Failed to save patient record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDocs = async (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDocsModal(true);
    fetchDocs(patient.id);
  };

  const fetchDocs = async (patientId: string) => {
    const { data, error } = await supabase
      .from('patient_documents')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (data) setPatientDocs(data);
    if (error) console.error("Docs fetch error:", error);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPatient || !clinic?.id) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${clinic.id}/${selectedPatient.id}/${fileName}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('patient-docs')
        .upload(filePath, file);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('patient_documents')
        .insert([{
          patient_id: selectedPatient.id,
          organization_id: clinic.id,
          name: file.name,
          file_type: file.type,
          file_size: file.size,
          url: filePath
        }]);

      if (dbError) throw dbError;

      fetchDocs(selectedPatient.id);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadDoc = async (doc: PatientDocument) => {
    const { data, error } = await supabase.storage
      .from('patient-docs')
      .download(doc.url);
    
    if (error) {
      alert("Download failed");
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();
  };

  const startNewVisit = async (patientId: string) => {
    if (!clinic?.id) return;
    
    const { data, error } = await supabase
      .from('visits')
      .insert([{
        organization_id: clinic.id,
        patient_id: patientId,
        status: 'triage'
      }]);

    if (!error) {
      setActiveTab('triage');
    } else {
      console.error("Failed to start visit:", error);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(search.toLowerCase()) || 
    p.mrn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{t.patients}</h2>
          <p className="text-slate-500 mt-1 font-medium">Registry Synced with Supabase</p>
        </div>
        <button 
          onClick={() => setShowRegisterModal(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center gap-3 active:scale-95"
        >
          <i className="fas fa-user-plus"></i>
          {t.registerPatient}
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
          <div className="relative group">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center"><i className="fas fa-circle-notch fa-spin text-indigo-600 text-4xl"></i></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="px-8 py-5">MRN / ID</th>
                  <th className="px-8 py-5">Patient Name</th>
                  <th className="px-8 py-5">Contact</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPatients.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-5 font-mono text-xs font-black text-indigo-500">{p.mrn}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800">{p.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{p.gender} • {p.dob}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-600 text-sm">{p.phone}</td>
                    <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openDocs(p)}
                        className="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                        title="View Documents"
                      >
                        <i className="fas fa-file-medical"></i>
                      </button>
                      <button 
                        onClick={() => startNewVisit(p.id)}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all"
                      >
                        + Start Visit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredPatients.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-3xl mx-auto">
                <i className="fas fa-user-friends"></i>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No patients found in the registry</p>
            </div>
          )}
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setShowRegisterModal(false)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95 duration-300 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            >
              <i className="fas fa-times text-xl"></i>
            </button>

            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-100">
                <i className="fas fa-user-plus"></i>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Register New Patient</h3>
                <p className="text-slate-400 font-medium text-sm">Create a permanent medical record (MRN)</p>
              </div>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                <i className="fas fa-exclamation-circle"></i>
                {formError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient Full Name *</label>
                <input 
                  required 
                  placeholder="e.g. John Doe" 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300" 
                  value={form.full_name} 
                  onChange={(e) => setForm({...form, full_name: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender *</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500 appearance-none" 
                    value={form.gender} 
                    onChange={(e) => setForm({...form, gender: e.target.value as any})}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth *</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500" 
                    value={form.dob} 
                    onChange={(e) => setForm({...form, dob: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    placeholder="+211 ..." 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500" 
                    value={form.phone} 
                    onChange={(e) => setForm({...form, phone: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address</label>
                  <input 
                    placeholder="Area / Street Name" 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500" 
                    value={form.address} 
                    onChange={(e) => setForm({...form, address: e.target.value})} 
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowRegisterModal(false)} 
                  className="flex-1 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 py-5 rounded-2xl transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-circle-notch fa-spin"></i>
                      Saving...
                    </span>
                  ) : (
                    'Create Medical Record'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {showDocsModal && selectedPatient && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setShowDocsModal(false)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95 shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Document Vault</h3>
                <p className="text-slate-400 text-xs font-bold uppercase mt-1">Patient: {selectedPatient.full_name}</p>
              </div>
              <button onClick={() => setShowDocsModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload} 
                accept="image/*,.pdf,.doc,.docx"
              />
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 shadow-sm group-hover:text-indigo-500 group-hover:scale-110 transition-all">
                {isUploading ? <i className="fas fa-circle-notch fa-spin text-2xl"></i> : <i className="fas fa-cloud-upload-alt text-2xl"></i>}
              </div>
              <p className="font-black text-slate-800 text-sm">{isUploading ? 'Uploading to Cloud...' : 'Click or Drag files to upload'}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID Cards, Referrals, Lab Results (Max 5MB)</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Uploaded Records ({patientDocs.length})</h4>
              {patientDocs.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-300 italic font-medium text-sm">No documents found for this patient.</p>
                </div>
              ) : (
                patientDocs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                        {doc.file_type.includes('pdf') ? <i className="fas fa-file-pdf text-red-500"></i> : 
                         doc.file_type.includes('image') ? <i className="fas fa-file-image text-blue-500"></i> :
                         <i className="fas fa-file-alt"></i>}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 truncate max-w-[200px]">{doc.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{(doc.file_size / 1024).toFixed(1)} KB • {new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => downloadDoc(doc)}
                      className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientListView;
