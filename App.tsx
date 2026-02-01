import React, { useState, useEffect, createContext, useContext } from 'react';
import { i18n, LANGUAGES } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/views/DashboardView';
import PatientListView from './components/views/PatientListView';
import AppointmentsView from './components/views/AppointmentsView';
import TriageView from './components/views/TriageView';
import DoctorView from './components/views/DoctorView';
import LabView from './components/views/LabView';
import PharmacyView from './components/views/PharmacyView';
import AdmissionsView from './components/views/AdmissionsView';
import MaternityView from './components/views/MaternityView';
import InsuranceView from './components/views/InsuranceView';
import BillingView from './components/views/BillingView';
import SettingsView from './components/views/SettingsView';
import LandingPage from './components/public/LandingPage';
import LoginView from './components/auth/LoginView';
import OnboardingView from './components/auth/OnboardingView';
import AIAssistantPage from './app/dashboard/ai/page';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Organization, Profile } from './types';

const AuthContext = createContext<{
  user: Profile | null;
  clinic: Organization | null;
  role: string;
  lang: string;
  setLang: (l: string) => void;
  setActiveTab: (t: string) => void;
  setClinic: (o: Organization, r: string) => void;
  logout: () => void;
} | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const App: React.FC = () => {
  const [lang, setLang] = useState(LANGUAGES.EN);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [view, setView] = useState<'LANDING' | 'AUTH' | 'ONBOARDING' | 'APP'>('LANDING');

  const [sessionProfile, setSessionProfile] = useState<Profile | null>(null);
  const [currentClinic, setCurrentClinic] = useState<Organization | null>(null);
  const [currentRole, setCurrentRole] = useState<string>('viewer');

  const dir = lang === LANGUAGES.AR ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await handleSession(session);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (session) await handleSession(session);
      else {
        setSessionProfile(null);
        setCurrentClinic(null);
        setView('LANDING');
      }
    });

    initSession();
    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session: any) => {
    if (!session?.user) return;

    try {
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: session.user.id, full_name: session.user.email?.split('@')[0] || 'New User' }])
          .select()
          .single();
        if (createError) throw createError;
        profile = newProfile;
      }
      setSessionProfile(profile);

      const { data: memberships } = await supabase
        .from('memberships')
        .select(`
          role,
          organization:organizations (*)
        `)
        .eq('user_id', session.user.id);

      if (memberships && memberships.length > 0) {
        if (!currentClinic) {
          const firstMem = memberships[0];
          setCurrentClinic(firstMem.organization as any);
          setCurrentRole(firstMem.role);
        }
        setView('APP');
      } else {
        setView('ONBOARDING');
      }
    } catch (err) {
      console.error("Session handle error:", err);
    }
  };

  const setClinic = (o: Organization, r: string) => {
    setCurrentClinic(o);
    setCurrentRole(r);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'patients': return <PatientListView />;
      case 'appointments': return <AppointmentsView />;
      case 'triage': return <TriageView />;
      case 'consultation': return <DoctorView />;
      case 'lab': return <LabView />;
      case 'pharmacy': return <PharmacyView />;
      case 'admissions': return <AdmissionsView />;
      case 'maternity': return <MaternityView />;
      case 'insurance': return <InsuranceView />;
      case 'billing': return <BillingView />;
      case 'settings': return <SettingsView />;
      case 'ai-assistant': return <AIAssistantPage />;
      default: return <DashboardView />;
    }
  };

  // If Supabase is not configured, show a beautiful error state instead of crashing
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="w-24 h-24 bg-red-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto border border-red-500/30">
            <i className="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter">Configuration Required</h1>
            <p className="text-slate-400 font-medium leading-relaxed">
              To launch <span className="text-white font-bold">OmniClinic SaaS</span>, you must provide your Supabase credentials via environment variables.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700 text-left space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Required Variables</p>
            <ul className="space-y-3 font-mono text-[11px] text-slate-300">
              <li className="flex items-center gap-2"><i className="fas fa-circle text-[6px] text-red-500"></i> VITE_SUPABASE_URL</li>
              <li className="flex items-center gap-2"><i className="fas fa-circle text-[6px] text-red-500"></i> VITE_SUPABASE_ANON</li>
              <li className="flex items-center gap-2 text-slate-500"><i className="fas fa-circle text-[6px]"></i> VITE_API_KEY (Optional for AI)</li>
            </ul>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Please update your .env.local or Vercel dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (view === 'LANDING') return <LandingPage onEnterLogin={() => setView('AUTH')} onEnterApp={() => setView('AUTH')} />;
  if (view === 'AUTH') return <LoginView onBack={() => setView('LANDING')} />;
  if (view === 'ONBOARDING') return <OnboardingView onComplete={() => setView('APP')} />;

  return (
    <AuthContext.Provider value={{
      user: sessionProfile,
      clinic: currentClinic,
      role: currentRole,
      lang,
      setLang,
      setActiveTab,
      setClinic,
      logout: handleLogout
    }}>
      <div className={`min-h-screen flex bg-slate-50 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
        <Sidebar
          isOpen={true}
          setIsOpen={() => { }}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          role={currentRole}
        />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <Header
            lang={lang}
            setLang={setLang}
            userName={sessionProfile?.full_name || 'User'}
            role={currentRole}
            clinicName={currentClinic?.name || 'Clinic'}
            onLogout={handleLogout}
          />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto pb-12">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  );
};

export default App;
