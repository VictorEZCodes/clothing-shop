import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainPage from './MainPage';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchUserProfile();
    fetchOrders();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const data = await response.json();
      setUser(data);
      setNewEmail(data.email);
    } catch (error) {
      // console.error('Error fetching user profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/user/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      // console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    if (newEmail === user.email) {
      toast.info("The new email is the same as your current email.");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/user/update-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update email');
      }
      const data = await response.json();
      toast.success(data.message);
      setUser({ ...user, email: newEmail });
    } catch (error) {
      // console.error('Error updating email:', error);
      toast.error(error.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/user/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }
      const data = await response.json();
      toast.success(data.message);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      // console.error('Error updating password:', error);
      toast.error(error.message);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'new') {
      setShowNewPassword(!showNewPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  if (loading) return <MainPage><div></div></MainPage>;
  if (error) return <MainPage><div>Error: {error}</div></MainPage>;
  if (!user) return <MainPage><div>User not found</div></MainPage>;

  return (
    <MainPage>
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and account settings.</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
              </div>
            </dl>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <h4 className="text-lg leading-6 font-medium text-gray-900">Update Email</h4>
            <form onSubmit={handleEmailChange} className="mt-5 space-y-5">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="New Email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
              <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Update Email
              </button>
            </form>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <h4 className="text-lg leading-6 font-medium text-gray-900">Update Password</h4>
            <form onSubmit={handlePasswordChange} className="mt-5 space-y-5">
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Add Orders Section */}
        <div className="mt-10 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Orders</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Track your recent orders.</p>
          </div>
          <div className="border-t border-gray-200">
            {orders.length > 0 ? (
              orders.map(order => (
                <div key={order._id} className="px-4 py-5 sm:p-6 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Order #{order._id}</p>
                  <p className="mt-1 text-sm text-gray-900">Status: {order.status}</p>
                  <p className="mt-1 text-sm text-gray-900">Total: ₦{order.totalAmount.toFixed(2)}</p>
                  <Link to={`/order-tracking/${order._id}`} className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Track Order
                  </Link>
                </div>
              ))
            ) : (
              <p className="px-4 py-5 sm:p-6 text-sm text-gray-500">You haven't placed any orders yet.</p>
            )}
          </div>
        </div>
      </div>
    </MainPage>
  );
};

export default UserProfile;