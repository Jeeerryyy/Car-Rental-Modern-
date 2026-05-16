import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axiosInstance';

export default function Support() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/contact', form);
      toast.success('Support request sent successfully!');
      setForm({ subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    { q: "Adding new vehicles", a: "Navigate to 'Add Car' to register new fleet assets and upload documentation." },
    { q: "Offline booking management", a: "Use 'New Booking' to register walk-ins and capture real-time KYC documents." },
    { q: "System configurations", a: "Update business identity and global preferences in the 'Settings' panel." },
  ];

  return (
    <div className="p-6 lg:p-12 max-w-5xl mx-auto w-full animate-in fade-in duration-700 pb-24">
      <div className="mb-16">
        <h2 className="text-3xl font-black text-dark tracking-tighter">Support Center</h2>
        <p className="text-muted font-medium mt-1">Direct technical assistance and platform documentation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Help Column */}
        <div className="space-y-16">
           <section className="space-y-10">
              <div className="pb-3 border-b border-border">
                <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Platform FAQ</h3>
              </div>
              <div className="space-y-10">
                 {faqs.map((faq, i) => (
                   <div key={i}>
                      <p className="text-xs font-black text-dark uppercase tracking-tight mb-3">{faq.q}</p>
                      <p className="text-xs font-medium text-muted leading-relaxed max-w-sm">{faq.a}</p>
                   </div>
                 ))}
              </div>
           </section>

           <section className="space-y-6">
              <div className="pb-3 border-b border-border">
                <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Direct Contact</h3>
              </div>
              <div className="flex gap-10">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest">Email</p>
                    <a href="mailto:support@modernselfdrive.in" className="text-xs font-black text-dark hover:text-blue-600 transition-colors">support@modernselfdrive.in</a>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest">Phone</p>
                    <a href="tel:+911234567890" className="text-xs font-black text-dark hover:text-blue-600 transition-colors">+91 12345 67890</a>
                 </div>
              </div>
           </section>
        </div>

        {/* Ticket Column */}
        <section className="space-y-10">
           <div className="pb-3 border-b border-border">
             <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Submit Support Request</h3>
           </div>
           <div className="space-y-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-dark ml-1">Inquiry Subject</label>
<input
                    type="text"
                    placeholder="Describe your inquiry..."
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    className="w-full bg-off/30 border border-border rounded-xl px-4 py-4 text-xs font-bold text-dark focus:border-dark outline-none transition-all"
                  />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-dark ml-1">Message Details</label>
<textarea
                    placeholder="Provide specific information about your request..."
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full bg-off/30 border border-border rounded-xl px-4 py-4 text-xs font-bold text-dark focus:border-dark outline-none transition-all min-h-[160px] resize-none"
                  />
              </div>
<button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 text-white rounded-xl px-10 py-4 font-black text-[11px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Request'}
               </button>
           </div>
        </section>
      </div>
    </div>
  );
}
