import React, { useState } from 'react';
import { CheckIcon, ExploreIcon } from '../ui/Icons';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ContactForm() {
  const [formState, setFormState] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState('sending');
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };

    try {
      await contactAPI.submit(data);
      setFormState('success');
      e.target.reset();
      setTimeout(() => setFormState('idle'), 5000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
      setFormState('idle');
    }
  };

  return (
    <div className="lg:col-span-7">
      <div className="bg-white p-8 md:p-12 rounded-[var(--radius-xl)] border border-border shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold text-dark mb-2">Send us a message</h2>
          <p className="text-muted mb-10 font-medium text-sm">Our team typically responds within a few business hours. Please provide your details below.</p>

          {formState === 'success' ? (
            <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckIcon className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-2">Message Received</h3>
              <p className="text-muted">Thank you for reaching out. We have received your inquiry and will be in touch shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label htmlFor="name" className="text-[13px] font-bold text-dark uppercase tracking-widest">Your Full Name</label>
                  <input 
                    id="name" name="name" required type="text" placeholder="Enter your full name"
                    className="w-full bg-off border border-border px-5 py-4 rounded-md outline-none focus:border-dark focus:bg-white transition-all font-medium text-dark"
                  />
                </div>
                <div className="space-y-2.5">
                  <label htmlFor="email" className="text-[13px] font-bold text-dark uppercase tracking-widest">Email Address</label>
                  <input 
                    id="email" name="email" required type="email" placeholder="Enter your email address"
                    className="w-full bg-off border border-border px-5 py-4 rounded-md outline-none focus:border-dark focus:bg-white transition-all font-medium text-dark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label htmlFor="phone" className="text-[13px] font-bold text-dark uppercase tracking-widest">Phone Number</label>
                  <input 
                    id="phone" name="phone" required type="tel" placeholder="+91 XXX XXX XXXX"
                    className="w-full bg-off border border-border px-5 py-4 rounded-md outline-none focus:border-dark focus:bg-white transition-all font-medium text-dark"
                  />
                </div>
                <div className="space-y-2.5">
                  <label htmlFor="subject" className="text-[13px] font-bold text-dark uppercase tracking-widest">Subject</label>
                  <div className="relative">
                    <select 
                      id="subject" name="subject"
                      className="w-full bg-off border border-border px-5 py-4 rounded-md outline-none focus:border-dark focus:bg-white transition-all font-medium text-dark appearance-none cursor-pointer"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Vehicle Availability & Pricing">Vehicle Availability & Pricing</option>
                      <option value="Corporate & Bulk Bookings">Corporate & Bulk Bookings</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Feedback & Suggestions">Feedback & Suggestions</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                      <ExploreIcon className="w-4 h-4 opacity-30" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label htmlFor="message" className="text-[13px] font-bold text-dark uppercase tracking-widest">Message Details</label>
                <textarea 
                  id="message" name="message" required rows="5" placeholder="Please describe your requirement or question..."
                  className="w-full bg-off border border-border px-5 py-4 rounded-md outline-none focus:border-dark focus:bg-white transition-all font-medium text-dark resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={formState === 'sending'}
                className="w-full bg-dark text-white font-bold py-5 rounded-md hover:opacity-90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formState === 'sending' ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          )}
        </div>
        
        <div className="absolute -bottom-20 -right-20 opacity-[0.03] pointer-events-none">
          <ExploreIcon className="w-96 h-96" />
        </div>
      </div>
    </div>
  );
}
