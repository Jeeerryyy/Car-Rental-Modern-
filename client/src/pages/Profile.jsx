import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Navigate } from 'react-router-dom';

export default function Profile() {
  const { customer, isAuthenticated, isLoading } = useCustomerAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin?returnTo=/profile" />;
  }

  return (
    <div className="min-h-screen bg-off py-20 px-6">
      <div className="max-w-[800px] mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="font-display text-3xl font-bold text-dark mb-8">My Profile</h1>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
            <div className="text-lg text-dark">{customer?.name || 'Customer'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            <div className="text-lg text-dark">{customer?.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
            <div className="text-lg text-dark">{customer?.phone || 'Not provided'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
