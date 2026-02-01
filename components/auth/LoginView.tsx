
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface LoginViewProps {
  onBack: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      if (mode === 'SIGNUP') {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });

        if (authError) throw authError;

        // Ensure profile is created for the new user
        if (data.user) {
          // Fixed: Changed fullName to full_name to match types.ts
          await supabase
            .from('profiles')
            .upsert([{ id: data.user.id, full_name: fullName }]);
        }

        setSuccessMsg("Account created! If email confirmation is enabled, check your inbox. Otherwise, you can try signing in now.");
        setMode('LOGIN');
      } else {
        const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;

        // Ensure profile exists on sign-in (fallback for legacy accounts)
        if (signInData.user) {
          // Fixed: Changed fullName to full_name to match types.ts
          await supabase
            .from('profiles')
            .upsert([{ 
              id: signInData.user.id, 
              full_name: signInData.user.user_metadata?.full_name || email.split('@')[0] 
            }], { onConflict: 'id' });
        }
      }
    } catch (err: any) {
      console.error("Auth error details:", err);
      if (err.message === 'Failed to fetch') {
        setError("Network error: Could not reach Supabase. Check your connection or verify your Supabase keys.");
      } else {
        setError(err.message || "An error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div 
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-all mb-8 shadow-sm"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Website
          </div>
          <div className="bg-indigo-600 w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-100 mx-auto mb-6">
            <i className="fas fa-shield-alt text-white text-3xl"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {mode === 'LOGIN' ? 'Access OmniClinic' : 'Start Your Clinic'}
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            {mode === 'LOGIN' ? 'Log in to your clinical workspace' : 'Create your practitioner account today'}
          </p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 border border-green-100 text-green-600 text-xs font-bold p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <i className="fas fa-check-circle mr-2"></i>
                {successMsg}
              </div>
            )}

            {mode === 'SIGNUP' && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                    <i className="fas fa-user"></i>
                  </div>
                  <input 
                    required
                    type="text" 
                    placeholder="Dr. John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                  <i className="fas fa-envelope"></i>
                </div>
                <input 
                  required
                  type="email" 
                  placeholder="practitioner@clinic.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                  <i className="fas fa-lock"></i>
                </div>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  {mode === 'LOGIN' ? 'Authenticating...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  <i className={mode === 'LOGIN' ? 'fas fa-sign-in-alt' : 'fas fa-user-plus'}></i>
                  {mode === 'LOGIN' ? 'Sign In to Clinic' : 'Start My Free Trial'}
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-sm font-medium">
              {mode === 'LOGIN' ? "Don't have a workspace?" : "Already have an account?"}
              <button 
                onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                className="text-indigo-600 font-bold ml-2 hover:underline"
              >
                {mode === 'LOGIN' ? 'Create Account' : 'Log In Instead'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Secured by OmniClinic & Supabase
        </p>
      </div>
    </div>
  );
};

export default LoginView;
