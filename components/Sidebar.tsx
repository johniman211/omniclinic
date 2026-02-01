
import React from 'react';
import { useAuth } from '../App';
import { i18n } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, setActiveTab, role }) => {
  const { lang, clinic } = useAuth();
  const t = i18n[lang as keyof typeof i18n];

  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: t.dashboard, roles: ['*'] },
    { id: 'patients', icon: 'fa-user-injured', label: t.patients, roles: ['Receptionist', 'Doctor', 'Nurse', 'Admin', 'owner', 'viewer'] },
    { id: 'ai-assistant', icon: 'fa-sparkles', label: 'AI Assistant', roles: ['Doctor', 'Admin', 'owner', 'viewer'] },
    { id: 'appointments', icon: 'fa-calendar-alt', label: t.appointments, roles: ['Receptionist', 'Doctor', 'Nurse', 'Admin', 'owner', 'viewer'] },
    { id: 'triage', icon: 'fa-heartbeat', label: t.triage, roles: ['Nurse', 'Doctor', 'Admin', 'owner', 'viewer'], dept: 'Emergency' },
    { id: 'consultation', icon: 'fa-user-md', label: t.consultation, roles: ['Doctor', 'Admin', 'owner', 'viewer'] },
    { id: 'lab', icon: 'fa-microscope', label: t.lab, roles: ['Lab', 'Doctor', 'Admin', 'owner', 'viewer'], dept: 'Laboratory' },
    { id: 'pharmacy', icon: 'fa-pills', label: t.pharmacy, roles: ['Pharmacy', 'Doctor', 'Admin', 'owner', 'viewer'], dept: 'Pharmacy' },
    { id: 'admissions', icon: 'fa-bed', label: t.admissions, roles: ['Doctor', 'Nurse', 'Admin', 'owner', 'viewer'], dept: 'Inpatient' },
    { id: 'maternity', icon: 'fa-baby-carriage', label: t.maternity, roles: ['Doctor', 'Nurse', 'Admin', 'owner', 'viewer'], dept: 'MaternityANC' },
    { id: 'billing', icon: 'fa-file-invoice-dollar', label: t.billing, roles: ['Cashier', 'Accountant', 'Admin', 'owner', 'viewer'] },
    { id: 'settings', icon: 'fa-cog', label: t.settings, roles: ['Admin', 'owner', 'viewer'] },
  ];

  const filteredItems = menuItems.filter(item => {
    // 1. Role Check
    const hasRole = item.roles.includes('*') || item.roles.includes(role.toLowerCase()) || item.roles.includes(role);
    if (!hasRole) return false;

    // 2. Department Check
    if (item.dept && clinic?.settings?.enabledDepartments) {
      const isEnabled = clinic.settings.enabledDepartments[item.dept];
      if (!isEnabled) return false;
    }
    return true;
  });

  return (
    <aside className={`bg-white border-r border-slate-200 h-screen transition-all duration-300 flex flex-col z-50 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center gap-3 border-b border-slate-100 flex-shrink-0">
        <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-100">
          <i className="fas fa-clinic-medical text-white text-xl"></i>
        </div>
        {isOpen && <span className="font-black text-xl tracking-tighter text-slate-800">OmniClinic</span>}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <ul className="space-y-1 px-3">
          {filteredItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all ${
                  activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                <div className={`w-8 text-center text-lg ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                {isOpen && <span className="text-sm">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button 
          className="flex items-center gap-4 px-3 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all w-full font-bold text-sm"
          onClick={() => window.location.reload()}
        >
          <div className="w-8 text-center text-lg"><i className="fas fa-sign-out-alt"></i></div>
          {isOpen && <span>{t.logout}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
