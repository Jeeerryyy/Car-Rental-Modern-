import React, { useState } from 'react';
import { CheckIcon, ExploreIcon } from '../ui/Icons';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ContactForm() {
  const [formState, setFormState] = useState('idle');
  const handleSubmit = async (e) => {
    e.preventDefault(); setFormState('sending');
    const formData = new FormData(e.target);
    const data = { name: formData.get('name'), email: formData.get('email'), phone: formData.get('phone'), subject: formData.get('subject'), message: formData.get('message') };
    try { await contactAPI.submit(data); setFormState('success'); e.target.reset(); setTimeout(() => setFormState('idle'), 5000); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to send message'); setFormState('idle'); }
  };

  const inputStyle = { background: '#EBE6DE', color: '#19130E', border: '1px solid rgba(182,124,61,0.15)' };

  return (
    <div className="lg:col-span-7">
      <div className="p-8 md:p-12 rounded-[12px] relative overflow-hidden" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)', boxShadow: '0 1px 3px rgba(25,19,14,0.06)' }}>
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold mb-2" style={{ color: '#19130E' }}>Send us a message</h2>
          <p className="mb-10 font-medium text-sm" style={{ color: '#6b5e50' }}>Our team typically responds within a few business hours.</p>
          {formState === 'success' ? (
            <div className="py-12 text-center animate-in fade-in duration-500">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(182,124,61,0.15)' }}>
                <CheckIcon className="w-10 h-10" style={{ color: '#B67C3D' }} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#19130E' }}>Message Received</h3>
              <p style={{ color: '#6b5e50' }}>Thank you for reaching out. We will be in touch shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label htmlFor="name" className="text-[13px] font-bold uppercase tracking-widest" style={{ color: '#19130E' }}>Your Full Name</label>
                  <input id="name" name="name" required type="text" placeholder="Enter your full name" className="w-full px-5 py-4 rounded-[8px] outline-none font-medium" style={inputStyle} />
                </div>
                <div className="space-y-2.5">
                  <label htmlFor="email" className="text-[13px] font-bold uppercase tracking-widest" style={{ color: '#19130E' }}>Email Address</label>
                  <input id="email" name="email" required type="email" placeholder="Enter your email address" className="w-full px-5 py-4 rounded-[8px] outline-none font-medium" style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label htmlFor="phone" className="text-[13px] font-bold uppercase tracking-widest" style={{ color: '#19130E' }}>Phone Number</label>
                  <input id="phone" name="phone" required type="tel" placeholder="Enter your phone number" className="w-full px-5 py-4 rounded-[8px] outline-none font-medium" style={inputStyle} />
                </div>
                <div className="space-y-2.5">
                  <label htmlFor="subject" className="text-[13px] font-bold uppercase tracking-widest" style={{ color: '#19130E' }}>Subject</label>
                  <div className="relative">
                    <select id="subject" name="subject" className="w-full px-5 py-4 rounded-[8px] outline-none font-medium appearance-none cursor-pointer" style={inputStyle}>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Vehicle Availability & Pricing">Vehicle Availability & Pricing</option>
                      <option value="Corporate & Bulk Bookings">Corporate & Bulk Bookings</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Feedback & Suggestions">Feedback & Suggestions</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#6b5e50' }}><ExploreIcon className="w-4 h-4 opacity-30" /></div>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                <label htmlFor="message" className="text-[13px] font-bold uppercase tracking-widest" style={{ color: '#19130E' }}>Message Details</label>
                <textarea id="message" name="message" required rows="5" placeholder="Please describe your requirement or question..." className="w-full px-5 py-4 rounded-[8px] outline-none font-medium resize-none" style={inputStyle} />
              </div>
              <button type="submit" disabled={formState === 'sending'} className="w-full font-bold py-5 rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: '#19130E', color: '#F9F8F3' }}>
                {formState === 'sending' ? (<div className="flex items-center justify-center gap-3"><div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(220,207,186,0.3)', borderTopColor: '#F9F8F3' }} /><span>Processing...</span></div>) : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
