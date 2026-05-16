import { useState, useEffect } from 'react';
import { getReviews, updateReviewStatus } from '../api/reviews.js';
import toast from 'react-hot-toast';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReviews()
      .then(res => setReviews(res.data.data || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleModerate = async (id, status) => {
    try {
      await updateReviewStatus(id, { status });
      setReviews(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      toast.success(`Review ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-headline-lg font-headline-lg font-bold text-primary">Reviews</h1>
        <p className="text-body-sm text-secondary mt-1">Customer feedback and review moderation</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-surface-container rounded-xl" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">reviews</span>
          <h3 className="text-xl font-bold text-primary mb-2">No Reviews Yet</h3>
          <p className="text-secondary">Reviews will appear here once customers leave feedback</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review._id} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-primary">{review.customer?.name || 'Customer'}</p>
                  <p className="text-[12px] text-outline">
                    {review.car?.make} {review.car?.model} · {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN') : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[review.status] || 'bg-gray-100 text-gray-800'}`}>
                    {review.status}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} className={`text-lg ${i <= (review.rating || 0) ? 'text-amber-400' : 'text-outline-variant'}`}
                        style={i <= (review.rating || 0) ? { fontVariationSettings: "'FILL' 1" } : undefined}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-body-sm text-secondary mb-4">{review.comment}</p>
              {review.ownerReply && (
                <div className="bg-surface rounded-lg p-3 mb-3 border-l-4 border-primary">
                  <p className="text-xs font-bold text-primary mb-1">Your Reply:</p>
                  <p className="text-sm text-secondary">{review.ownerReply}</p>
                </div>
              )}
              {review.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleModerate(review._id, 'approved')}
                    className="px-4 py-2 text-xs font-bold bg-green-100 text-green-800 rounded-lg hover:bg-green-200">Approve</button>
                  <button onClick={() => handleModerate(review._id, 'rejected')}
                    className="px-4 py-2 text-xs font-bold bg-red-100 text-red-800 rounded-lg hover:bg-red-200">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
