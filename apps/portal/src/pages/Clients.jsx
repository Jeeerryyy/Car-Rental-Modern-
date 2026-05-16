import { useState, useEffect } from 'react';
import { getClients, updateContactStatus } from '../api/clients.js';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export default function Clients() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const socket = useSocket();

  const fetchContacts = async () => {
    try {
      const res = await getClients();
      setContacts(res.data.data || res.data || []);
    } catch {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('client:new', (newContact) => {
        toast.success(`New inquiry from ${newContact.name}!`, { icon: '📧' });
        setContacts(prev => [newContact, ...prev]);
      });
      return () => socket.off('client:new');
    }
  }, [socket]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateContactStatus(id, { status });
      setContacts(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      if (selectedInquiry?._id === id) setSelectedInquiry(prev => ({ ...prev, status }));
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error('Update failed');
    }
  };

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    read: 'bg-yellow-100 text-yellow-800',
    replied: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto w-full flex flex-col gap-8 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary mb-2">Clients</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage customer inquiries and support requests</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-lowest border border-outline-variant rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-16 text-center">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 text-on-surface-variant/30">
            <span className="material-symbols-outlined text-4xl">inbox</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">No inquiries yet</h3>
          <p className="text-on-surface-variant max-w-sm mx-auto">When customers contact you from the main website, their messages will appear here in real-time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contacts.map(c => (
            <div 
              key={c._id} 
              onClick={() => setSelectedInquiry(c)}
              className={`p-5 bg-surface-container-lowest border border-outline-variant rounded-2xl cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group relative overflow-hidden ${c.status === 'new' ? 'ring-2 ring-primary/5' : ''}`}
            >
              {c.status === 'new' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className={`font-bold text-lg truncate ${c.status === 'new' ? 'text-primary' : 'text-on-surface'}`}>{c.name}</p>
                    <span className={`text-[10px] uppercase tracking-wider font-black px-3 py-1 rounded-full ${statusColors[c.status] || 'bg-gray-100'}`}>{c.status}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
                      {c.email}
                    </span>
                    {c.phone && (
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-primary">call</span>
                        {c.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded text-[11px] uppercase">
                      {c.subject || 'General Inquiry'}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-3 line-clamp-1 italic font-medium opacity-70">"{c.message}"</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pt-4 sm:pt-0 border-t sm:border-0 border-outline-variant">
                  <p className="text-[10px] font-black text-secondary/60 uppercase tracking-widest text-right">
                    {new Date(c.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}<br/>
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Sidebar */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedInquiry(null)} />
          <div className="relative w-full md:max-w-xl bg-surface-container-lowest h-full shadow-2xl flex flex-col border-l border-outline-variant animate-in slide-in-from-right duration-300">
            <div className="px-6 py-4 md:px-8 md:py-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low sticky top-0 z-20">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl md:text-2xl font-bold text-primary">Inquiry Detail</h3>
                  <span className={`text-[10px] uppercase tracking-wider font-black px-2.5 py-1 rounded-full ${statusColors[selectedInquiry.status]}`}>
                    {selectedInquiry.status}
                  </span>
                </div>
                <p className="text-secondary text-[10px] md:text-xs mt-1 uppercase font-bold tracking-widest">Received {new Date(selectedInquiry.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              <section>
                <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface p-6 rounded-2xl border border-outline-variant">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase mb-1">Full Name</p>
                    <p className="font-bold text-on-surface">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase mb-1">Email Address</p>
                    <p className="font-bold text-on-surface break-all">{selectedInquiry.email}</p>
                  </div>
                  {selectedInquiry.phone && (
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase mb-1">Phone Number</p>
                      <p className="font-bold text-on-surface">{selectedInquiry.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase mb-1">Subject</p>
                    <p className="font-bold text-primary">{selectedInquiry.subject}</p>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Message Content</h4>
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 relative">
                  <span className="material-symbols-outlined absolute -top-3 -left-3 text-4xl text-primary/20 rotate-180">format_quote</span>
                  <p className="text-on-surface leading-relaxed whitespace-pre-wrap relative z-10">{selectedInquiry.message}</p>
                  <span className="material-symbols-outlined absolute -bottom-3 -right-3 text-4xl text-primary/20">format_quote</span>
                </div>
              </section>

              <section className="pt-6 border-t border-outline-variant">
                <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">Management Actions</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedInquiry.status === 'new' && (
                    <button 
                      onClick={() => handleStatusUpdate(selectedInquiry._id, 'read')}
                      className="px-6 py-3 bg-dark text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      Mark as Read
                    </button>
                  )}
                  {selectedInquiry.status !== 'replied' && (
                    <button 
                      onClick={() => handleStatusUpdate(selectedInquiry._id, 'replied')}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">reply</span>
                      Mark as Replied
                    </button>
                  )}
                  {selectedInquiry.status !== 'archived' && (
                    <button 
                      onClick={() => handleStatusUpdate(selectedInquiry._id, 'archived')}
                      className="px-6 py-3 bg-surface border border-outline-variant text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">archive</span>
                      Archive
                    </button>
                  )}
                  <a 
                    href={`mailto:${selectedInquiry.email}?subject=RE: ${selectedInquiry.subject}`}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    Send Email
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
