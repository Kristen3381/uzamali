import React, { useState, useEffect, useCallback } from 'react';
import { Truck, MapPin, CheckCircle, Clock, Navigation, Phone, Info, MessageCircle } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CourierDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Available');
  const [notifyMsg, setNotifyMsg] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const showNotify = useCallback((msg) => {
    setNotifyMsg(msg);
    setTimeout(() => setNotifyMsg(null), 3000);
  }, []);

  const fetchDeliveries = useCallback(async () => {
    try {
      const { data } = await api.get('/deliveries');
      setDeliveries(data.deliveries || []);
    } catch {
      showNotify('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }, [showNotify]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const availableJobs = deliveries.filter(
    (d) => !d.courier && d.status === 'pending'
  );

  const activeJobs = deliveries.filter(
    (d) => d.courier && d.courier._id === user?._id
  );

  const handleAccept = async (id) => {
    try {
      await api.post(`/deliveries/${id}/accept`);
      showNotify('Delivery accepted! Head to pickup location.');
      fetchDeliveries();
    } catch (err) {
      showNotify(err.response?.data?.message || 'Failed to accept delivery');
    }
  };

  const handlePickup = async (id) => {
    const lat = prompt('Enter pickup latitude:');
    const lng = prompt('Enter pickup longitude:');
    if (!lat || !lng) return;
    try {
      await api.post(`/deliveries/${id}/pickup`, {
        pickupGps: { lat: parseFloat(lat), lng: parseFloat(lng) },
      });
      showNotify('Pickup confirmed! In transit.');
      fetchDeliveries();
    } catch (err) {
      showNotify(err.response?.data?.message || 'Failed to mark pickup');
    }
  };

  const handleDelivered = async (id) => {
    const otp = prompt('Enter delivery OTP from buyer:');
    if (!otp) return;
    const lat = prompt('Enter delivery latitude:');
    const lng = prompt('Enter delivery longitude:');
    if (!lat || !lng) return;
    try {
      await api.post(`/deliveries/${id}/confirm`, {
        otp,
        deliveryGps: { lat: parseFloat(lat), lng: parseFloat(lng) },
      });
      showNotify('Delivery confirmed! Payment released.');
      fetchDeliveries();
    } catch (err) {
      showNotify(err.response?.data?.message || 'Failed to confirm delivery');
    }
  };

  const JobCard = ({ job, isAvailable }) => {
    const order = job.order || {};
    const listing = order.listing || {};
    const farmer = order.farmer || {};
    const buyer = order.buyer || {};

    return (
      <div className="card mb-4 overflow-hidden dark:border-primary/30">
        <div className="p-4 bg-white/30 dark:bg-white/5 border-b border-white/10 flex justify-between items-center backdrop-blur-sm">
          <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">
            Order: {order._id?.slice(-8) || '---'}
          </span>
          {isAvailable ? (
            <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">pending</span>
          ) : (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              job.status === 'in-transit' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}>
              {job.status}
            </span>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <MapPin className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <div className="w-0.5 h-8 bg-white/30 my-1"></div>
              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <MapPin className="w-3 h-3 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Pickup From:</p>
                <p className="text-sm font-semibold text-primary dark:text-accent">{farmer.name || 'Farmer'}</p>
                <p className="text-xs text-gray-400">{farmer.phone}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Deliver To:</p>
                <p className="text-sm font-semibold text-primary dark:text-accent">{buyer.name || 'Buyer'}</p>
                <p className="text-xs text-gray-400">{buyer.phone}</p>
              </div>
            </div>
          </div>

          <div className="p-3 glass rounded-lg flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Product: <span className="font-bold dark:text-white">{listing.title || 'Unknown'} x {order.quantity || 0}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Fee: <span className="font-bold dark:text-white">KES {job.deliveryFee || order.courierFee || 0}</span>
              </p>
            </div>
            <div className="text-right">
              {isAvailable ? (
                <p className="text-lg font-black text-primary dark:text-accent">KES {job.deliveryFee || order.courierFee || 0}</p>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={() => navigate(`/chat/${order._id}`)}
                    className="p-2 glass rounded-full text-accent shadow-sm hover:bg-accent/20"
                    title="Chat with buyer"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => showNotify(`Phone: ${buyer.phone || 'N/A'}`)}
                    className="p-2 glass rounded-full text-accent shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {isAvailable ? (
            <button
              onClick={() => handleAccept(job._id)}
              className="w-full btn-highlight flex items-center justify-center gap-2 py-3"
            >
              <Truck className="w-5 h-5" />
              Accept Delivery
            </button>
          ) : job.status === 'pending' ? (
            <button
              onClick={() => handlePickup(job._id)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-primary text-primary dark:text-accent font-bold rounded-md text-sm hover:bg-primary/10 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Mark Picked Up
            </button>
          ) : job.status === 'in-transit' ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate(`/chat/${order._id}`)}
                className="flex items-center justify-center gap-2 py-3 border-2 border-primary text-primary dark:text-accent font-bold rounded-md text-sm hover:bg-primary/10 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
              <button
                onClick={() => handleDelivered(job._id)}
                className="btn-accent flex items-center justify-center gap-2 py-3 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Delivered
              </button>
            </div>
          ) : (
            <p className="text-center text-sm text-green-600 font-bold">Delivered ✓</p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400 text-lg">Loading deliveries...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary dark:text-accent">Courier Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Find and manage your delivery jobs.</p>
      </div>

      <div className="flex glass rounded-lg p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('Available')}
          className={`flex-1 py-3 font-bold rounded-md transition-all ${
            activeTab === 'Available' ? 'bg-primary text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
        >
          Available Jobs ({availableJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('Active')}
          className={`flex-1 py-3 font-bold rounded-md transition-all ${
            activeTab === 'Active' ? 'bg-primary text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
        >
          My Active Jobs ({activeJobs.length})
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'Available' ? (
          availableJobs.length > 0 ? (
            availableJobs.map(job => <JobCard key={job._id} job={job} isAvailable={true} />)
          ) : (
            <div className="text-center py-20 card border-dashed">
              <Info className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-semibold">No available jobs in your area.</p>
            </div>
          )
        ) : (
          activeJobs.length > 0 ? (
            activeJobs.map(job => <JobCard key={job._id} job={job} isAvailable={false} />)
          ) : (
            <div className="text-center py-20 card border-dashed">
              <Truck className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-semibold">You don't have any active deliveries.</p>
            </div>
          )
        )}
      </div>

      <div className="h-20 md:hidden"></div>

      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/20 flex justify-around items-center p-4 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button
          onClick={() => setActiveTab('Active')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'Active' ? 'text-primary dark:text-accent' : 'text-gray-400 dark:text-zinc-500'}`}
        >
          <Truck className="w-6 h-6" />
          <span className="text-[10px] font-bold">Jobs</span>
        </button>
        <button
          onClick={() => showNotify('Delivery history coming soon.')}
          className="text-gray-400 dark:text-zinc-500 flex flex-col items-center gap-1"
        >
          <Clock className="w-6 h-6" />
          <span className="text-[10px] font-bold">History</span>
        </button>
        <button
          onClick={() => showNotify('Maps and navigation will be available when you accept a delivery job.')}
          className="text-gray-400 dark:text-zinc-500 flex flex-col items-center gap-1"
        >
          <Navigation className="w-6 h-6" />
          <span className="text-[10px] font-bold">Maps</span>
        </button>
        <button
          onClick={() => showNotify('Profile page coming soon.')}
          className="text-gray-400 dark:text-zinc-500 flex flex-col items-center gap-1"
        >
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-800"></div>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>

      {notifyMsg && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-primary/90 backdrop-blur-md text-white px-6 py-3 rounded-xl shadow-xl border border-white/20 whitespace-nowrap">
          <p className="text-sm font-semibold">{notifyMsg}</p>
        </div>
      )}
    </div>
  );
};

export default CourierDashboard;