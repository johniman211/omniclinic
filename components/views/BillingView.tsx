
import React, { useState, useRef } from 'react';
import { useAuth } from '../../App';
import { i18n } from '../../constants';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../../lib/supabase';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  category: 'Consultation' | 'Lab' | 'Pharmacy' | 'Procedure' | 'Other';
}

interface Invoice {
  id: string;
  patientName: string;
  date: string;
  items: InvoiceItem[];
  total: number;
  currency: 'USD' | 'SSP';
  status: 'Paid' | 'Unpaid' | 'Partial' | 'Void';
  paymentMethod?: 'Cash' | 'MoMo' | 'Bank' | 'Insurance';
  pdfUrl?: string;
}

const BillingView: React.FC = () => {
  const { lang, clinic } = useAuth();
  const t = i18n[lang as keyof typeof i18n];
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfGeneratingId, setPdfGeneratingId] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState(1200);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-2024-001', patientName: 'James Atem', date: '2024-03-20', items: [{ id: '1', description: 'Consultation', quantity: 1, unitPrice: 45, category: 'Consultation' }], total: 45.00, currency: 'USD', status: 'Paid', paymentMethod: 'Cash' },
    { id: 'INV-2024-002', patientName: 'Mary Nyandeng', date: '2024-03-20', items: [{ id: '1', description: 'Lab Tests', quantity: 1, unitPrice: 18500, category: 'Lab' }], total: 18500, currency: 'SSP', status: 'Unpaid' },
  ]);

  const [activeInvoice, setActiveInvoice] = useState<{
    patientName: string;
    currency: 'USD' | 'SSP';
    items: InvoiceItem[];
    paymentMethod: string;
  }>({
    patientName: '',
    currency: 'SSP',
    items: [
      { id: '1', description: 'General Consultation', quantity: 1, unitPrice: 5000, category: 'Consultation' }
    ],
    paymentMethod: 'Cash'
  });

  const generatePDF = async (inv: Invoice) => {
    setPdfGeneratingId(inv.id);
    try {
      // Small delay to ensure any dynamic content is rendered
      await new Promise(r => setTimeout(r, 100));

      const element = document.getElementById(`printable-invoice-${inv.id}`);
      if (!element) throw new Error("Invoice template not found");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // 1. Download for User
      pdf.save(`${inv.id}_${inv.patientName.replace(/\s+/g, '_')}.pdf`);

      // 2. Upload to Supabase Storage (Cloud Storage)
      const pdfBlob = pdf.output('blob');
      const fileName = `${clinic?.id || 'system'}/${inv.id}.pdf`;
      
      const { data, error } = await supabase.storage
        .from('invoices')
        .upload(fileName, pdfBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error("Storage upload failed:", error);
      } else {
        console.log("PDF stored successfully in cloud bucket:", data.path);
      }

    } catch (err) {
      console.error("PDF Generation Error:", err);
      alert("Failed to generate PDF invoice.");
    } finally {
      setPdfGeneratingId(null);
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      category: 'Other'
    };
    setActiveInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setActiveInvoice(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setActiveInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const calculateTotal = () => {
    return activeInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newInvoice: Invoice = {
        id: `INV-2024-00${invoices.length + 1}`,
        patientName: activeInvoice.patientName,
        date: new Date().toISOString().split('T')[0],
        items: activeInvoice.items,
        total: calculateTotal(),
        currency: activeInvoice.currency,
        status: 'Paid',
        paymentMethod: activeInvoice.paymentMethod as any
      };
      setInvoices([newInvoice, ...invoices]);
      setIsSubmitting(false);
      setShowNewInvoice(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hidden Templates for PDF Capture */}
      {invoices.map(inv => (
        <div key={`template-${inv.id}`} id={`printable-invoice-${inv.id}`} className="bg-white p-16 w-[800px] border border-slate-100 opacity-0 pointer-events-none absolute -left-[9999px]">
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl">
                  <i className="fas fa-clinic-medical"></i>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">OmniClinic</h1>
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{clinic?.name || 'Medical Center'}</p>
              <p className="text-xs text-slate-400 mt-1">Juba, South Sudan</p>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-black text-slate-200 uppercase tracking-tighter mb-2">Invoice</h2>
              <p className="text-sm font-bold text-indigo-600">{inv.id}</p>
              <p className="text-xs text-slate-400 mt-1">{inv.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12 p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Billed To</p>
              <p className="text-xl font-black text-slate-900">{inv.patientName}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Details</p>
              <p className="text-sm font-bold text-slate-700">{inv.paymentMethod} • {inv.status}</p>
            </div>
          </div>

          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-slate-100 text-left">
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Price</th>
                <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inv.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-6 font-bold text-slate-800">{item.description}</td>
                  <td className="py-6 text-center font-bold text-slate-500">{item.quantity}</td>
                  <td className="py-6 text-right font-bold text-slate-500">{inv.currency} {item.unitPrice.toLocaleString()}</td>
                  <td className="py-6 text-right font-black text-slate-900">{inv.currency} {(item.quantity * item.unitPrice).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-8 border-t-2 border-slate-100">
            <div className="w-64 space-y-4">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-sm font-bold">Subtotal</span>
                <span className="font-bold">{inv.currency} {inv.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">Grand Total</span>
                <span className="text-2xl font-black text-indigo-600 tracking-tighter">{inv.currency} {inv.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-32 pt-12 border-t border-slate-50 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Generated by OmniClinic SaaS</p>
            <p className="text-[9px] text-slate-400 mt-2 font-medium italic">Thank you for choosing quality healthcare. Keep this receipt for your records.</p>
          </div>
        </div>
      ))}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{t.billing}</h2>
          <p className="text-slate-500 mt-1 font-medium">Revenue tracking and Cloud-synced PDF generation</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center gap-3">
            <i className="fas fa-cloud-upload-alt"></i>
            Bulk Sync
          </button>
          <button 
            onClick={() => setShowNewInvoice(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-3"
          >
            <i className="fas fa-file-invoice-dollar"></i>
            {t.newVisit} Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Cash (USD)', value: '$1,240', color: 'text-green-600', icon: 'fa-dollar-sign' },
          { label: 'Cash (SSP)', value: '420,000', color: 'text-indigo-600', icon: 'fa-money-bill-wave' },
          { label: 'MoMo (SSP)', value: '185,200', color: 'text-orange-600', icon: 'fa-mobile-alt' },
          { label: 'Insurance (Pend)', value: '$4,150', color: 'text-blue-600', icon: 'fa-shield-halved' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
              <i className={`fas ${stat.icon} ${stat.color} opacity-20`}></i>
            </div>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative group max-w-md w-full">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input 
              type="text" 
              placeholder="Search by Invoice ID or Patient..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">
                <th className="px-8 py-5">Date / ID</th>
                <th className="px-8 py-5">Patient</th>
                <th className="px-8 py-5">Total Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-indigo-500 mb-1">{inv.id}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase">{inv.date}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-800">{inv.patientName}</td>
                  <td className="px-8 py-5 font-black text-slate-900">
                    <span className="text-[10px] text-slate-400 mr-1.5">{inv.currency}</span>
                    {inv.total.toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      inv.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-100' :
                      inv.status === 'Partial' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => generatePDF(inv)}
                      disabled={pdfGeneratingId === inv.id}
                      className="text-indigo-600 hover:text-indigo-800 font-black text-xs uppercase tracking-widest flex items-center gap-2 justify-end ml-auto disabled:opacity-50"
                    >
                      {pdfGeneratingId === inv.id ? (
                        <>
                          <i className="fas fa-circle-notch fa-spin"></i> Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-file-pdf"></i> PDF Receipt
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <i className="fas fa-file-invoice-dollar text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Create New Invoice</h3>
                </div>
              </div>
              <button onClick={() => setShowNewInvoice(false)} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient Search *</label>
                  <input 
                    type="text" 
                    placeholder="Search by name or MRN..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500 transition-all"
                    value={activeInvoice.patientName}
                    onChange={(e) => setActiveInvoice({...activeInvoice, patientName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Currency</label>
                  <div className="flex gap-2">
                    {['SSP', 'USD'].map(curr => (
                      <button 
                        key={curr}
                        onClick={() => setActiveInvoice({...activeInvoice, currency: curr as any})}
                        className={`flex-1 py-4 rounded-2xl border font-black text-xs uppercase transition-all ${activeInvoice.currency === curr ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Service Line Items</h4>
                  <button onClick={addItem} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all">
                    <i className="fas fa-plus-circle"></i> Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {activeInvoice.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100 group">
                      <div className="col-span-5">
                        <input 
                          placeholder="Description..." 
                          className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <select 
                          className="w-full bg-white border border-slate-100 rounded-xl px-3 py-3 text-xs font-bold outline-none"
                          value={item.category}
                          onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                        >
                          <option>Consultation</option>
                          <option>Lab</option>
                          <option>Pharmacy</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          placeholder="Qty" 
                          className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-center outline-none"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          placeholder="Price" 
                          className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-right outline-none"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row justify-between gap-10">
                <div className="space-y-6 flex-1">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Payment Method</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {['Cash', 'MoMo', 'Bank', 'Insurance'].map(m => (
                      <button 
                        key={m}
                        onClick={() => setActiveInvoice({...activeInvoice, paymentMethod: m})}
                        className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${activeInvoice.paymentMethod === m ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-right flex flex-col justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Invoice Total</p>
                    <p className="text-6xl font-black tracking-tighter">
                      <span className="text-2xl text-indigo-500 mr-2">{activeInvoice.currency}</span>
                      {calculateTotal().toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex items-center justify-end gap-6 bg-slate-50/30">
              <button onClick={() => setShowNewInvoice(false)} className="px-10 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600">Discard</button>
              <button 
                onClick={handleCreateInvoice}
                disabled={isSubmitting || !activeInvoice.patientName}
                className="bg-indigo-600 text-white px-14 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-4 disabled:opacity-50"
              >
                {isSubmitting ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-check-double"></i>}
                {isSubmitting ? 'Finalizing...' : 'Finalize & Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingView;
