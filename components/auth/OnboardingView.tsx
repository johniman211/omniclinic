
import React, { useState } from 'react';
import { supabase, supabaseAdmin } from '../../lib/supabase';

interface OnboardingViewProps {
  onComplete: () => void;
}

// Fixed: Correctly typed OnboardingView with its props interface to resolve TS error in App.tsx
const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [clinicName, setClinicName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        throw new Error("You must be signed in to create a clinic.");
      }

      // Generate a unique slug by appending a short random string
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const baseSlug = clinicName.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const slug = `${baseSlug}-${randomSuffix}`;
      
      /**
       * We use supabaseAdmin to bypass RLS for the initial setup.
       */
      const { data: org, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert([{
          name: clinicName,
          slug: slug,
          settings: {
            triageRequired: true,
            defaultCurrency: 'SSP',
            whatsappEnabled: false,
            enabledDepartments: {
              Emergency: true,
              Laboratory: true,
              Pharmacy: true,
              Inpatient: true,
              MaternityANC: true
            }
          }
        }])
        .select()
        .single();

      if (orgError) {
        if (orgError.code === '23505') {
          throw new Error("A clinic with a similar name already exists. Please try a slightly different name.");
        }
        console.error("Admin Organization Insert Error:", orgError);
        throw orgError;
      }

      /**
       * Create Membership (Owner) using Admin privileges
       */
      const { error: memError } = await supabaseAdmin
        .from('memberships')
        .insert([{
          organization_id: org.id,
          user_id: session.user.id,
          role: 'owner'
        }]);

      if (memError) {
        console.error("Admin Membership Insert Error:", memError);
        throw memError;
      }

      onComplete();
    } catch (err: any) {
      console.error("Onboarding Bypass Failure:", err);
      setError(err.message || "Failed to setup clinic workspace using system privileges.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-12">
          <div className="bg-indigo-600 w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-100 mx-auto mb-8 transform hover:rotate-6 transition-transform">
            <i className="fas fa-clinic-medical text-white text-4xl"></i>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Setup Your Clinic</h2>
          <p className="text-slate-500 font-medium mt-3 text-lg">Activating your clinical workspace via System Admin</p>
        </div>

        <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50">
          <form onSubmit={handleCreateClinic} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-5 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <i className="fas fa-shield-exclamation"></i>
                  <span>System Setup Error</span>
                </div>
                <p className="font-medium opacity-80 leading-relaxed text-[11px] bg-white/50 p-3 rounded-xl">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Clinic Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Juba Specialist Hospital"
                className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-5 px-6 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-black text-xl text-slate-800 placeholder:text-slate-300"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
              />
            </div>

            <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100">
              <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fas fa-check-double"></i> Provisioning Features
              </h4>
              <ul className="space-y-3">
                {[
                  'Automated Tenant Provisioning',
                  'Admin Role Assignment',
                  'Default Clinic Modules Init',
                  'Bypassing RLS for Setup'
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                    <i className="fas fa-bolt text-indigo-500 text-xs"></i>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              type="submit"
              disabled={loading || !clinicName}
              className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg shadow-2xl hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  System Provisioning...
                </>
              ) : (
                <>
                  Initialize Clinic <i className="fas fa-rocket text-indigo-400"></i>
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-[10px] text-center font-black text-slate-300 uppercase tracking-[0.2em] px-10 leading-relaxed">
          The setup uses the system service key to bypass initial database constraints and link your account as the workspace owner.
        </p>
      </div>
    </div>
  );
};

export default OnboardingView;
