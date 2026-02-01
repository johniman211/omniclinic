
import React from 'react';

export const LANGUAGES = {
  EN: 'en',
  AR: 'ar'
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  Receptionist: ['patients', 'appointments'],
  Nurse: ['triage', 'patients'],
  Doctor: ['consultation', 'patients', 'lab', 'pharmacy', 'imaging', 'admissions', 'maternity'],
  Lab: ['lab'],
  Pharmacy: ['pharmacy'],
  Cashier: ['billing'],
  Accountant: ['reports', 'billing'],
  Admin: ['users', 'settings', 'reports', 'billing', 'patients', 'triage', 'consultation', 'lab', 'pharmacy', 'admissions', 'maternity', 'insurance'],
  SuperAdmin: ['*']
};

export const i18n = {
  en: {
    heroTitle: "The Modern Operating System for Healthcare in South Sudan",
    heroSub: "Scale your clinic with the only multi-tenant CMS built for resilience, offline operations, and local compliance.",
    getStarted: "Start Free Trial",
    bookDemo: "Book a Demo",
    dashboard: "Dashboard",
    patients: "Patients",
    appointments: "Appointments",
    triage: "Triage Queue",
    consultation: "Doctor Consultation",
    lab: "Lab Module",
    pharmacy: "Pharmacy",
    billing: "Billing & Cashier",
    admissions: "Inpatient / Admissions",
    maternity: "Maternity / ANC",
    insurance: "Insurance Claims",
    reports: "Reports",
    settings: "Clinic Settings",
    newVisit: "New Visit",
    registerPatient: "Register Patient",
    vitals: "Vitals",
    activeVisits: "Active Visits",
    totalRevenue: "Total Revenue",
    logout: "Logout",
    searchPlaceholder: "Search by MRN, Name or Phone...",
    save: "Save",
    cancel: "Cancel",
    pricing: "Pricing",
    features: "Features",
    contact: "Contact Sales",
    featuresTitle: "Enterprise-Grade Clinical Modules",
    industries: "Industries We Serve",
    securityTitle: "Bank-Level Data Protection"
  },
  ar: {
    heroTitle: "نظام التشغيل الحديث للرعاية الصحية في جنوب السودان",
    heroSub: "قم بتوسيع عيادتك باستخدام نظام إدارة العيادات الوحيد متعدد المستأجرين المصمم للمرونة والعمليات غير المتصلة بالإنترنت والامتثال المحلي.",
    getStarted: "ابدأ التجربة المجانية",
    bookDemo: "احجز عرضاً تجريبياً",
    dashboard: "لوحة القيادة",
    patients: "المرضى",
    appointments: "المواعيد",
    triage: "قائمة الفرز",
    consultation: "استشارة الطبيب",
    lab: "المختبر",
    pharmacy: "الصيدلية",
    billing: "الفواتير والخزينة",
    admissions: "المرضى المقيمون",
    maternity: "الأمومة / رعاية الحوامل",
    insurance: "مطالبات التأمين",
    reports: "التقارير",
    settings: "إعدادات العيادة",
    newVisit: "زيارة جديدة",
    registerPatient: "تسجيل مريض",
    vitals: "العلامات الحيوية",
    activeVisits: "الزيارات النشطة",
    totalRevenue: "إجمالي الإيرادات",
    logout: "تسجيل الخروج",
    searchPlaceholder: "بحث عن طريق MRN أو الاسم أو الهاتف...",
    save: "حفظ",
    cancel: "إلغاء",
    pricing: "الأسعار",
    features: "المميزات",
    contact: "اتصل بالمبيعات",
    featuresTitle: "وحدات طبية بمستوى المؤسسات",
    industries: "الصناعات التي نخدمها",
    securityTitle: "حماية بيانات بمستوى البنوك"
  }
};
