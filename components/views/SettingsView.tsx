
import React, { useState, useRef } from 'react';
import { useAuth } from '../../App';
import { i18n } from '../../constants';
import { supabase } from '../../lib/supabase';

const SettingsView: React.FC = () => {
  const { lang, clinic, setClinic, role } = useAuth();
  const t = i18n[lang as keyof typeof i18n];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [newService, setNewService] = useState<Record<string, string>>({});
  const [clinicName, setClinicName] = useState(clinic?.name || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const settings = clinic?.settings || {
    triageRequired: true,
    defaultCurrency: 'SSP',
    whatsappEnabled: false,
    departmentServices: {
      'Laboratory': ['FBC', 'Widal Test', 'Blood Sugar', 'Malaria BS'],
      'Pharmacy': ['Analgesics', 'Antibiotics', 'Antimalarials', 'IV Fluids'],
      'Consultation': ['General Consultation', 'Pediatric Specialist', 'ANC Follow-up']
    }
  };

  const handleUpdateClinicInfo = async () => {
    if (!clinic?.id || !clinicName.trim()) return;
    setIsSaving('profile');
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({ name: clinicName.trim() })
        .eq('id', clinic.id)
        .select()
        .single();

      if (error) throw error;
      setClinic(data, role);
    } catch (error) {
      console.error("Failed to update clinic info", error);
    } finally {
      setIsSaving(null);
    }
  };

  const handleUpdateSettings = async (updatedSettings: any, key: string) => {
    if (!clinic?.id) return;
    setIsSaving(key);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({ settings: updatedSettings })
        .eq('id', clinic.id)
        .select()
        .single();

      if (error) throw error;
      setClinic(data, role);
    } catch (error) {
      console.error("Failed to update clinic setting", error);
    } finally {
      setIsSaving(null);
    }
  };

  const toggleSetting = (key: 'triageRequired' | 'whatsappEnabled') => {
    const updated = { ...settings, [key]: !settings[key as keyof typeof settings] };
    handleUpdateSettings(updated, key);
  };

  const addService = (dept: string) => {
    const serviceName = newService[dept]?.trim();
    if (!serviceName) return;

    const currentServices = settings.departmentServices || {};
    const deptServices = currentServices[dept] || [];
    
    if (deptServices.includes(serviceName)) return;

    const updated = {
      ...settings,
      departmentServices: {
        ...currentServices,
        [dept]: [...deptServices, serviceName]
      }
    };

    handleUpdateSettings(updated, dept);
    setNewService({ ...newService, [dept]: '' });
  };

  const removeService = (dept: string, service: string) => {
    const currentServices = settings.departmentServices || {};
    const updated = {
      ...settings,
      departmentServices: {
        ...currentServices,
        [dept]: (currentServices[dept] || []).filter(s => s !== service)
      }
    };
    handleUpdateSettings(updated, dept);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Clinic Settings</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Configure identity, workflows, and automated communications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          {/* Clinic Branding Section */}
          <section className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm text-xl">
                <i className="fas fa-image"></i>
              </div>
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Clinic Branding</h3>
            </div>
            <div className="p-10 flex flex-col items-center gap-6">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 text-4xl border-2 border-dashed border-slate-200 group-hover:border-indigo-400 group-hover:bg-indigo-50 transition-all overflow-hidden">
                  <i className="fas fa-clinic-medical"></i>
                </div>
                <div className="absolute inset-0 bg-indigo-600/60 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <i className="fas fa-camera text-white text-xl"></i>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-800">Clinic Logo</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PNG or JPG, Max 2MB</p>
              </div>
            </div>
          </section>

          {/* Clinic Profile Card */}
          <section className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm text-xl">
                <i className="fas fa-id-card"></i>
              </div>
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">General Info</h3>
            </div>
            <div className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Clinic Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workspace Slug</label>
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 font-mono text-xs font-bold text-slate-400 cursor-not-allowed">
                  {clinic?.slug}
                </div>
              </div>
              <button 
                onClick={handleUpdateClinicInfo}
                disabled={isSaving === 'profile' || clinicName === clinic?.name}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving === 'profile' ? <i className="fas fa-circle-notch fa-spin mr-2"></i> : null}
                Save Identity
              </button>
            </div>
          </section>

          {/* WhatsApp & Workflow Card */}
          <section className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm text-xl">
                <i className="fas fa-robot"></i>
              </div>
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Automations</h3>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${settings.whatsappEnabled ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-slate-200 text-slate-400'}`}>
                    <i className="fab fa-whatsapp text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">WhatsApp Reminders</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Automated SMS/WA</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleSetting('whatsappEnabled')}
                  disabled={isSaving === 'whatsappEnabled'}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${settings.whatsappEnabled ? 'bg-green-600' : 'bg-slate-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${settings.whatsappEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${settings.triageRequired ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-200 text-slate-400'}`}>
                    <i className="fas fa-heartbeat text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">Triage First</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Force nursing queue</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleSetting('triageRequired')}
                  disabled={isSaving === 'triageRequired'}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${settings.triageRequired ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${settings.triageRequired ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Department Services Grid */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm text-xl">
                <i className="fas fa-microscope"></i>
              </div>
              <div>
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Departmental Protocols</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Manage tests, drug categories, and consultations</p>
              </div>
            </div>

            <div className="p-10 space-y-12">
              {['Laboratory', 'Pharmacy', 'Consultation'].map((dept) => (
                <div key={dept} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-3">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      {dept === 'Laboratory' ? 'Available Lab Tests' : dept === 'Pharmacy' ? 'Medication Categories' : 'Types of Consultation'}
                    </h4>
                    {isSaving === dept && <i className="fas fa-circle-notch fa-spin text-indigo-600 text-xs"></i>}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {(settings.departmentServices?.[dept] || []).map((service) => (
                      <div 
                        key={service} 
                        className="group flex items-center gap-3 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl hover:border-red-200 hover:bg-red-50 transition-all cursor-default"
                      >
                        <span className="text-xs font-bold text-slate-600 group-hover:text-red-700">{service}</span>
                        <button 
                          onClick={() => removeService(dept, service)}
                          className="text-slate-300 hover:text-red-600 transition-colors"
                        >
                          <i className="fas fa-times-circle text-[10px]"></i>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 max-w-md">
                    <input 
                      type="text" 
                      placeholder={`Add to ${dept}...`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      value={newService[dept] || ''}
                      onChange={(e) => setNewService({ ...newService, [dept]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && addService(dept)}
                    />
                    <button 
                      onClick={() => addService(dept)}
                      className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:scale-110 active:scale-95 transition-all"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-red-50 rounded-[3rem] border border-red-100 overflow-hidden">
            <div className="p-8 border-b border-red-100 bg-red-100/20 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm text-xl">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3 className="font-black text-red-900 uppercase text-xs tracking-widest">Danger Zone</h3>
            </div>
            <div className="p-10 flex items-center justify-between gap-6">
              <div>
                <p className="text-sm font-black text-red-900">Archive Organization</p>
                <p className="text-xs text-red-600 font-medium mt-1">Permanently disable access to this clinic workspace.</p>
              </div>
              <button className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 transition-all">
                Archive Clinic
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
