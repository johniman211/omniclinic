
import React from 'react';
import { i18n, LANGUAGES } from '../../constants';

interface LandingPageProps {
  onEnterLogin: () => void;
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterLogin, onEnterApp }) => {
  const [lang, setLang] = React.useState(LANGUAGES.EN);
  const t = i18n[lang as keyof typeof i18n];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <i className="fas fa-clinic-medical text-white text-xl"></i>
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">OmniClinic</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <button onClick={() => scrollToSection('features')} className="hover:text-indigo-600 transition-colors">{t.features}</button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-indigo-600 transition-colors">{t.pricing}</button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-indigo-600 transition-colors">Resources</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === LANGUAGES.EN ? LANGUAGES.AR : LANGUAGES.EN)}
              className="text-xs font-bold px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
            >
              {lang.toUpperCase()}
            </button>
            <button onClick={onEnterLogin} className="hidden sm:block text-sm font-bold text-slate-700 hover:text-indigo-600">Log In</button>
            <button onClick={onEnterApp} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all">
              {t.getStarted}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500 rounded-full blur-[100px]"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold mb-8 animate-bounce">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
            Now supporting multi-currency (SSP/USD)
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            {t.heroSub}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onEnterApp} className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all">
              {t.getStarted}
            </button>
            <button className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
              {t.bookDemo}
            </button>
          </div>
        </div>
      </header>

      {/* Key Modules Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Complete Clinic Operating Modules</h2>
            <p className="text-slate-500 font-medium">Everything you need to run a high-traffic clinic or hospital.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Laboratory', icon: 'fa-microscope', color: 'bg-blue-500', desc: 'Real-time test tracking, result verification, and automated reporting.' },
              { title: 'Pharmacy', icon: 'fa-pills', color: 'bg-green-500', desc: 'Integrated inventory, stock alerts, and dispensing workflows.' },
              { title: 'Electronic Triage', icon: 'fa-heartbeat', color: 'bg-red-500', desc: 'Digitized vitals, nursing notes, and doctor queue management.' },
              { title: 'Billing & Insurance', icon: 'fa-file-invoice-dollar', color: 'bg-indigo-500', desc: 'Multi-currency invoicing, insurance claims, and revenue reporting.' },
              { title: 'Maternity & ANC', icon: 'fa-baby-carriage', color: 'bg-pink-500', desc: 'Specialized module for antenatal care and delivery tracking.' },
              { title: 'Offline-First', icon: 'fa-wifi-slash', color: 'bg-orange-500', desc: 'Keep working during internet outages. Automatic cloud sync once back online.' },
            ].map((module, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className={`${module.color} w-16 h-16 rounded-3xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${module.icon}`}></i>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{module.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{module.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section Placeholder Implementation */}
      <section id="pricing" className="py-24 bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-12">Flexible Pricing Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {['Basic', 'Pro', 'Enterprise'].map((plan, i) => (
              <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center">
                <h3 className="text-xl font-bold mb-4">{plan}</h3>
                <p className="text-4xl font-black mb-8">${[49, 149, 499][i]}<span className="text-sm text-slate-400 font-bold">/mo</span></p>
                <button onClick={onEnterApp} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mb-8 hover:bg-indigo-600 transition-all">Choose Plan</button>
                <ul className="text-sm text-slate-500 space-y-3 text-left w-full">
                  <li className="flex items-center gap-2"><i className="fas fa-check text-green-500"></i> Full Core CMS</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check text-green-500"></i> Up to {[5, 20, 'Unlimited'][i]} Users</li>
                  <li className="flex items-center gap-2"><i className="fas fa-check text-green-500"></i> 24/7 Support</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
              <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center">
                <i className="fas fa-clinic-medical text-white text-xl"></i>
              </div>
              <span className="text-2xl font-black tracking-tighter">OmniClinic</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm mb-8 mx-auto md:mx-0">
              Revolutionizing healthcare delivery through robust, localized, and cloud-native technology.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-colors"><i className="fab fa-twitter"></i></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-colors"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-slate-500">Product</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-slate-500">Legal</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
          © {new Date().getFullYear()} OmniClinic SaaS. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
