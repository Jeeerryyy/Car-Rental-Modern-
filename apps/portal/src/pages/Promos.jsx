import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { getPromos, createPromo, togglePromo as togglePromoApi, toggleFeatured as toggleFeaturedApi } from '../api/promos';

export default function Promos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPromos = async () => {
      try {
        const { data } = await getPromos();
        const promoList = data.data || data.promos || [];
        setPromos(Array.isArray(promoList) ? promoList : []);
      } catch {} finally { setLoading(false); }
    };
    loadPromos();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    code: '', 
    discountType: 'percentage', 
    discountValue: '', 
    minOrderValue: '0', 
    maxUses: '', 
    expiresAt: '',
    title: 'Limited Offer',
    description: 'Your First Booking'
  });
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await createPromo(formData);
      const newPromo = data.data?.promo || data.promo || data.data;
      setPromos(prev => [newPromo, ...prev]);
      toast.success('Promo created');
      setIsModalOpen(false);
      setFormData({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: '0', maxUses: '', expiresAt: '', title: 'Limited Offer', description: 'Your First Booking' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create promo');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = useCallback(async (id) => {
    try {
      await togglePromoApi(id);
      setPromos(prev => prev.map(p => p._id === id ? { ...p, isActive: !p.isActive } : p));
      toast.success('Promo updated');
    } catch {}
  }, []);

  const handleToggleFeatured = useCallback(async (id) => {
    try {
      await toggleFeaturedApi(id);
      // Since toggleFeatured unfeatures all others on the backend, we should refresh list or update locally
      setPromos(prev => prev.map(p => ({
        ...p,
        isFeatured: p._id === id ? !p.isFeatured : false
      })));
      toast.success('Featured status updated');
    } catch (err) {
      toast.error('Failed to update featured status');
    }
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-surface-container rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-headline-lg font-headline-lg font-bold text-primary">Promotions</h1>
          <p className="text-body-sm text-secondary mt-1">Manage discount codes and customer offers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white rounded-full px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create Promo
        </button>
      </div>

      {promos.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-lowest rounded-[32px] border border-dashed border-outline-variant">
          <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">local_offer</span>
          </div>
          <h3 className="text-2xl font-bold text-primary mb-2">No Promotions Found</h3>
          <p className="text-secondary max-w-xs mx-auto">Create your first discount code to start attracting more customers.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-8 text-primary font-bold hover:underline"
          >
            Add new promo code
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {promos.map(promo => (
            <div key={promo._id} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-container/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">sell</span>
                </div>
                <div>
                  <h3 className="font-bold text-primary text-lg">{promo.code}</h3>
                  <p className="text-body-sm text-secondary">
                    {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `₹${promo.discountValue}`} discount 
                    {promo.minOrderValue > 0 && ` • Min order ₹${promo.minOrderValue}`}
                  </p>
                  <p className="text-[10px] text-outline mt-1 font-medium uppercase tracking-wider">
                    Expires: {new Date(promo.expiresAt).toLocaleDateString()} • Used: {promo.usedCount}/{promo.maxUses}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleFeatured(promo._id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    promo.isFeatured 
                      ? 'bg-accent/10 text-accent border border-accent/20' 
                      : 'text-outline hover:bg-surface-container'
                  }`}
                  title={promo.isFeatured ? 'Featured' : 'Mark as Featured'}
                >
                  <span className={`material-symbols-outlined ${promo.isFeatured ? 'fill-1' : ''}`}>
                    star
                  </span>
                </button>
                <button
                  onClick={() => handleToggle(promo._id)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    promo.isActive 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-surface-container text-outline border border-outline-variant'
                  }`}
                >
                  {promo.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-[32px] p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-outline">close</span>
            </button>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary">New Promo Code</h2>
              <p className="text-secondary text-sm">Create a discount offer for your customers</p>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-outline-variant uppercase tracking-widest mb-2">Promo Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-surface-container/50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl px-5 py-4 font-bold text-primary outline-none transition-all placeholder:text-outline/30" placeholder="e.g. Limited Offer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-outline-variant uppercase tracking-widest mb-2">Subtitle</label>
                  <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface-container/50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl px-5 py-4 font-bold text-primary outline-none transition-all placeholder:text-outline/30" placeholder="e.g. Your First Booking" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-outline-variant uppercase tracking-widest mb-2">Promo Code</label>
                <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-surface-container/50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl px-5 py-4 font-bold text-primary outline-none transition-all placeholder:text-outline/30" placeholder="e.g. WELCOME10" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-outline-variant uppercase tracking-widest mb-2">Discount Type</label>
                  <select required value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="w-full bg-surface-container/50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl px-5 py-4 font-bold text-primary outline-none transition-all appearance-none">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-outline-variant uppercase tracking-widest mb-2">Value</label>
                  <input required type="number" min="1" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} className="w-full bg-surface-container/50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl px-5 py-4 font-bold text-primary outline-none transition-all" placeholder="e.g. 10" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-outline-variant uppercase tracking-widest mb-2">Min Order (₹)</label>
                  <input required type="number" min="0" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: e.target.value})} className="w-full bg-surface-container/50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl px-5 py-4 font-bold text-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-outline-variant uppercase tracking-widest mb-2">Max Uses</label>
                  <input required type="number" min="1" value={formData.maxUses} onChange={e => setFormData({...formData, maxUses: e.target.value})} className="w-full bg-surface-container/50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl px-5 py-4 font-bold text-primary outline-none transition-all" placeholder="100" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-outline-variant uppercase tracking-widest mb-2">Expiry Date</label>
                <input required type="date" value={formData.expiresAt} onChange={e => setFormData({...formData, expiresAt: e.target.value})} className="w-full bg-surface-container/50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl px-5 py-4 font-bold text-primary outline-none transition-all" />
              </div>

              <button disabled={creating} type="submit" className="w-full bg-primary text-white font-bold rounded-2xl py-5 mt-4 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 active:scale-[0.98]">
                {creating ? 'Creating Promotion...' : 'Create Promo Code'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
