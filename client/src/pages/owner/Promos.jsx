import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PlusIcon, EditIcon, TrashIcon, TagIcon, XIcon } from '../../components/ui/Icons';
import { toast } from 'react-hot-toast';

const OwnerPromos = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(null);
  const [formData, setFormData] = useState({ 
    code: '', 
    discountType: 'Percentage', 
    discountValue: 0, 
    validFrom: new Date().toISOString().split('T')[0], 
    validTo: '', 
    isActive: true 
  });

  useEffect(() => { fetchPromos(); }, []);

  const fetchPromos = async () => {
    try {
      const res = await api.get('/api/admin/promos');
      setPromos(res.data || []);
    } catch (err) { toast.error('Failed to load promos'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentPromo) {
        await api.patch(`/api/admin/promos/${currentPromo._id}`, formData);
        toast.success('Promo updated');
      } else {
        await api.post('/api/admin/promos', formData);
        toast.success('Promo created');
      }
      setIsModalOpen(false);
      fetchPromos();
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
  };

  const deletePromo = async (id) => {
    if (!window.confirm('Delete this promo code?')) return;
    try {
      await api.delete(`/api/admin/promos/${id}`);
      toast.success('Promo deleted');
      fetchPromos();
    } catch (err) { toast.error('Delete failed'); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading promos...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
          <p className="text-sm text-gray-500">Create and manage discount offers.</p>
        </div>
        <button onClick={() => { setCurrentPromo(null); setFormData({ code: '', discountType: 'Percentage', discountValue: 0, validFrom: new Date().toISOString().split('T')[0], validTo: '', isActive: true }); setIsModalOpen(true); }} className="px-4 py-2 bg-dark text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium">
          <PlusIcon className="w-4 h-4" /> Create Promo
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4 text-left">Code</th>
              <th className="px-6 py-4 text-left">Discount</th>
              <th className="px-6 py-4 text-left">Validity</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {promos.map(promo => (
              <tr key={promo._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-blue-600 uppercase">{promo.code}</td>
                <td className="px-6 py-4 font-bold text-gray-900">
                  {promo.discountValue}{promo.discountType === 'Percentage' ? '%' : ' OFF'}
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {new Date(promo.validFrom).toLocaleDateString()} - {promo.validTo ? new Date(promo.validTo).toLocaleDateString() : 'Forever'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {promo.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => { setCurrentPromo(promo); setFormData(promo); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={() => deletePromo(promo._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {promos.length === 0 && <div className="p-8 text-center text-gray-400">No active promo codes.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">{currentPromo ? 'Edit Promo' : 'New Promo Code'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XIcon className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">COUPON CODE</label>
                <input required className="w-full border rounded-md p-2.5 text-sm font-mono font-bold uppercase text-blue-600" placeholder="SAVE20" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">DISCOUNT</label>
                  <input type="number" required className="w-full border rounded-md p-2.5 text-sm" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">TYPE</label>
                  <select className="w-full border rounded-md p-2.5 text-sm bg-white" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed (₹)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">VALID FROM</label>
                  <input type="date" required className="w-full border rounded-md p-2.5 text-sm" value={formData.validFrom?.split('T')[0]} onChange={e => setFormData({...formData, validFrom: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">VALID TO</label>
                  <input type="date" required className="w-full border rounded-md p-2.5 text-sm" value={formData.validTo?.split('T')[0]} onChange={e => setFormData({...formData, validTo: e.target.value})} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Code is active</span>
              </label>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-500 font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-dark text-white rounded-md text-sm font-bold hover:bg-gray-800 transition-colors">Save Promo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerPromos;
