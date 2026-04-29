import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const TermsModal = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only show if logged in and terms are not accepted
    if (isAuthenticated && user && !user.termsAccepted) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [user, isAuthenticated]);

  const handleAccept = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await api.post('/api/auth/accept-terms');
      updateUser({ ...user, termsAccepted: true });
      setShow(false);
    } catch (err) {
      alert('Failed to accept terms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = (e) => {
    e.preventDefault();
    e.stopPropagation();
    logout();
    navigate('/');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold font-display text-dark">Terms & Conditions</h2>
          <p className="text-gray-500 text-sm mt-1">You must accept our terms to use Modern Selfdrive services.</p>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 text-sm text-gray-700 space-y-4">
          <p><strong>1. Eligibility:</strong> You must possess a valid, unexpired driver's license to rent a vehicle. You must meet the minimum age requirements.</p>
          <p><strong>2. KYC and Verification:</strong> You agree to provide accurate identification and allow us to verify your documents. False documents will lead to immediate ban.</p>
          <p><strong>3. Vehicle Usage:</strong> The vehicle must only be used within the permitted geographical limits. Track racing, towing, and illegal activities are strictly prohibited.</p>
          <p><strong>4. Damages & Liability:</strong> You are responsible for any damages incurred during your rental period, up to the maximum liability amount stated in your booking.</p>
          <p><strong>5. Penalties:</strong> Late returns, excessive speeding, or returning the car dirty may incur additional penalty charges as defined in our fee schedule.</p>
          <p className="italic mt-4">By clicking "I Accept", you acknowledge that you have read and agree to all terms and conditions of Modern Selfdrive Car.</p>
        </div>

        <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3 bg-gray-50 rounded-b-lg">
          <button 
            onClick={handleDecline}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Decline & Logout
          </button>
          <button 
            onClick={handleAccept}
            disabled={loading}
            className="px-6 py-2.5 bg-dark text-white font-bold rounded hover:bg-black disabled:opacity-50 flex items-center justify-center min-w-[120px]"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'I Accept'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
