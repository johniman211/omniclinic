import React, { useState, useEffect } from 'react';
import { LANGUAGES } from '../constants';
import OrgSwitcher from './OrgSwitcher';

interface HeaderProps {
  lang: string;
  setLang: (l: string) => void;
  userName: string;
  role: string;
  clinicName: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ lang, setLang, userName, role, clinicName, onLogout }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 flex-shrink-0 shadow-sm z-40">
      <div className="flex items-center gap-6">
        <OrgSwitcher />
        <div className="h-8 w-[1px] bg-slate-100 hidden lg:block"></div>
        <div className="relative group">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Global Patient Search..."
            className="bg-slate-50 border border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 text-sm w-64 md:w-80 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isOnline ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
          <span className="text-[10px] font-black uppercase tracking-widest">{isOnline ? 'Sync Active' : 'Offline'}</span>
        </div>

        <button 
          onClick={() => setLang(lang === LANGUAGES.EN ? LANGUAGES.AR : LANGUAGES.EN)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-white hover:shadow-sm border border-slate-100 rounded-xl transition-all"
        >
          <i className="fas fa-globe text-slate-400 text-xs"></i>
          <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600">{lang === LANGUAGES.EN ? 'العربية' : 'English'}</span>
        </button>

        <div className="h-10 w-[1px] bg-slate-100"></div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none">{userName}</p>
            <p className="text-[10px] text-indigo-500 font-black mt-1 uppercase tracking-widest">{role}</p>
          </div>
          
          <div className="relative group cursor-pointer">
            <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-indigo-100 transform transition-transform group-hover:scale-105">
              {userName[0]}
            </div>
            <div className="absolute top-full right-0 mt-4 w-48 bg-white rounded-3xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-50 mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">My Account</p>
              </div>
              <button className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                <i className="fas fa-user-circle text-slate-400"></i> Profile
              </button>
              <button 
                onClick={onLogout}
                className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 mt-2 border-t border-slate-50"
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;