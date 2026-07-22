import React, { useState, useEffect, useCallback } from 'react';
import { Truck, MapPin, CheckCircle, Clock, Navigation, Phone, Info, MessageCircle, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';
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
    setTimeout(() => setNotifyMsg(null), 3500);
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

  const totalEarnings = activeJobs
    .filter(j => j.status === 'delivered')
    .reduce((acc, curr) => acc + (curr.deliveryFee || curr.order?.courierFee || 0), 0);

  const handleAccept = async (id) => {
    try {
      await api.post(`/deliveries/${id}/accept`);
      showNotify('Delivery accepted! Head to pickup location.');
      fetchDeliveries();
      setActiveTab('Active');
    } catch (err) {
      showNotify(err.response?.data?.message || 'Failed to accept delivery');
    }
  };

  const getDeviceGps = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: -1.286389, lng: 36.817223 });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('GPS location fallback used:', error.message);
          resolve({ lat: -1.286389, lng: 36.817223 });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  };

  const handlePickup = async (id) => {
    try {
      showNotify('📡 Verifying device GPS location at pickup area...');
      const pickupGps = await getDeviceGps();
      
      await api.post(`/deliveries/${id}/pickup`, { pickupGps });
      showNotify('Pickup area verified! Cargo is in transit.');
      fetchDeliveries();
    } catch (err) {
      showNotify(err.response?.data?.message || 'Failed to verify pickup location');
    }
  };

  const handleDelivered = async (id) => {
    const otp = prompt('Enter 6-digit delivery OTP provided by buyer:');
    if (!otp) return;

    try {
      showNotify('📡 Verifying device GPS location at delivery area...');
      const deliveryGps = await getDeviceGps();

      await api.post(`/deliveries/${id}/confirm`, { otp, deliveryGps });
      showNotify('Delivery area verified & OTP confirmed! Escrow funds released.');
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
    const fee = job.deliveryFee || order.courierFee || 0;

    return (
      <div className="bg-[#13382E] border border-[#1F5243] rounded-2xl mb-4 overflow-hidden shadow-xl shadow-black/20 hover:border-[#226351] transition-all">
        {/* Card Header */}
        <div className="px-5 py-3.5 bg-[#0B251D] border-b border-[#1F5243] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#E5A93B] bg-[#226351]/40 border border-[#1F5243] px-2.5 py-1 rounded-lg">
              #{order._id?.slice(-8).toUpperCase() || 'TRK-JOB'}
            </span>
            <span className="text-xs text-[#A3B8B0] hidden sm:inline">• Escrow Secured</span>
          </div>
          {isAvailable ? (
            <span className="bg-[#E5A93B]/20 text-[#E5A93B] border border-[#E5A93B]/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Available
            </span>
          ) : (
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${
              job.status === 'in-transit' 
                ? 'bg-[#E5A93B]/20 text-[#E5A93B] border-[#E5A93B]/40 animate-pulse' 
                : job.status === 'delivered'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-[#226351] text-white border-[#1F5243]'
            }`}>
              {job.status}
            </span>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4">
          {/* Pickup to Delivery Timeline */}
          <div className="flex gap-4 items-start bg-[#0B251D]/60 p-4 rounded-xl border border-[#1F5243]">
            <div className="flex flex-col items-center pt-1">
              <div className="w-7 h-7 rounded-full bg-[#226351] border border-[#1F5243] flex items-center justify-center text-[#E5A93B]">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="w-0.5 h-10 bg-gradient-to-b from-[#226351] to-[#E5A93B] my-1"></div>
              <div className="w-7 h-7 rounded-full bg-[#E5A93B] flex items-center justify-center text-[#0B251D]">
                <Navigation className="w-4 h-4 fill-current" />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold text-[#A3B8B0] uppercase tracking-wider">Pickup Location (Farmer)</p>
                  {farmer.phone && (
                    <button 
                      onClick={() => showNotify(`Farmer Contact: ${farmer.phone}`)}
                      className="text-xs text-[#E5A93B] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </button>
                  )}
                </div>
                <p className="text-base font-bold text-white mt-0.5">{farmer.name || 'Farmer Vendor'}</p>
                <p className="text-xs text-[#A3B8B0] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#226351]" /> {listing.location || farmer.location || 'Farm Origin'}
                </p>
              </div>

              <div className="border-t border-[#1F5243] pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold text-[#A3B8B0] uppercase tracking-wider">Delivery Destination (Buyer)</p>
                  {buyer.phone && (
                    <button 
                      onClick={() => showNotify(`Buyer Contact: ${buyer.phone}`)}
                      className="text-xs text-[#E5A93B] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </button>
                  )}
                </div>
                <p className="text-base font-bold text-white mt-0.5">{buyer.name || 'Buyer Client'}</p>
                <p className="text-xs text-[#A3B8B0] flex items-center gap-1 mt-0.5">
                  <Navigation className="w-3.5 h-3.5 text-[#E5A93B]" /> {order.deliveryAddress || buyer.location || 'Destination Address'}
                </p>
              </div>
            </div>
          </div>

          {/* Details & Fee Box */}
          <div className="p-4 bg-[#0B251D] rounded-xl border border-[#1F5243] flex flex-wrap justify-between items-center gap-3">
            <div>
              <p className="text-xs text-[#A3B8B0]">Cargo Package:</p>
              <p className="text-sm font-bold text-white">
                {listing.name || listing.title || 'Fresh Agricultural Cargo'} <span className="text-[#E5A93B]">x {order.quantity || 1} {listing.unit || 'units'}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#A3B8B0]">Courier Earnings</p>
              <p className="text-2xl font-black text-[#E5A93B]">KES {fee.toLocaleString()}</p>
            </div>
          </div>

          {/* Action Controls */}
          {isAvailable ? (
            <button
              onClick={() => handleAccept(job._id)}
              className="w-full btn-primary py-3.5 text-base shadow-lg shadow-[#E5A93B]/20 hover:scale-[1.01]"
            >
              <Truck className="w-5 h-5 text-[#0B251D]" />
              Accept Delivery Job (KES {fee.toLocaleString()})
            </button>
          ) : job.status === 'pending' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate(`/chat/${order._id}`)}
                className="btn-accent py-3 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with Buyer
              </button>
              <button
                onClick={() => handlePickup(job._id)}
                className="bg-[#226351] hover:bg-[#2b7963] text-white font-bold py-3 px-4 rounded-xl border border-[#1F5243] text-sm flex items-center justify-center gap-2 transition-all"
              >
                <MapPin className="w-4 h-4 text-[#E5A93B]" />
                Confirm Cargo Picked Up
              </button>
            </div>
          ) : job.status === 'in-transit' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate(`/chat/${order._id}`)}
                className="btn-accent py-3 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Live Chat
              </button>
              <button
                onClick={() => handleDelivered(job._id)}
                className="btn-primary py-3 text-sm shadow-md"
              >
                <CheckCircle className="w-4 h-4 text-[#0B251D]" />
                Confirm Delivered & Release Escrow
              </button>
            </div>
          ) : (
            <div className="p-3 bg-[#226351]/30 border border-[#1F5243] rounded-xl text-center">
              <p className="text-sm text-emerald-400 font-extrabold flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Delivery Complete & Escrow Released
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-20 text-[#A3B8B0] text-lg font-medium">Loading courier deliveries...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#13382E] border border-[#1F5243] p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#226351] rounded-xl text-[#E5A93B] border border-[#1F5243]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Courier Logistics Portal</h1>
              <p className="text-sm text-[#A3B8B0]">Dispatch, pick up, and complete local farm deliveries.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-[#0B251D] px-4 py-2.5 rounded-xl border border-[#1F5243] flex-1 sm:flex-none text-center">
            <p className="text-[10px] text-[#A3B8B0] uppercase font-bold tracking-wider">Active Jobs</p>
            <p className="text-lg font-black text-[#E5A93B]">{activeJobs.length}</p>
          </div>
          <div className="bg-[#0B251D] px-4 py-2.5 rounded-xl border border-[#1F5243] flex-1 sm:flex-none text-center">
            <p className="text-[10px] text-[#A3B8B0] uppercase font-bold tracking-wider">Total Earned</p>
            <p className="text-lg font-black text-white">KES {totalEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#13382E] rounded-xl p-1.5 border border-[#1F5243]">
        <button
          onClick={() => setActiveTab('Available')}
          className={`flex-1 py-3 font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'Available' 
              ? 'bg-[#E5A93B] text-[#0B251D] shadow-md shadow-[#E5A93B]/20' 
              : 'text-[#A3B8B0] hover:text-white hover:bg-[#226351]/30'
          }`}
        >
          <Info className="w-4 h-4" />
          Available Jobs ({availableJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('Active')}
          className={`flex-1 py-3 font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'Active' 
              ? 'bg-[#E5A93B] text-[#0B251D] shadow-md shadow-[#E5A93B]/20' 
              : 'text-[#A3B8B0] hover:text-white hover:bg-[#226351]/30'
          }`}
        >
          <Truck className="w-4 h-4" />
          My Active Jobs ({activeJobs.length})
        </button>
      </div>

      {/* Delivery Cards Stream */}
      <div className="space-y-4">
        {activeTab === 'Available' ? (
          availableJobs.length > 0 ? (
            availableJobs.map(job => <JobCard key={job._id} job={job} isAvailable={true} />)
          ) : (
            <div className="text-center py-16 bg-[#13382E] border border-dashed border-[#1F5243] rounded-2xl p-8">
              <Info className="w-12 h-12 text-[#226351] mx-auto mb-3" />
              <p className="text-white font-bold text-lg">No Available Jobs right now</p>
              <p className="text-[#A3B8B0] text-sm mt-1 max-w-sm mx-auto">New order dispatches will appear here automatically as buyers complete checkouts.</p>
            </div>
          )
        ) : (
          activeJobs.length > 0 ? (
            activeJobs.map(job => <JobCard key={job._id} job={job} isAvailable={false} />)
          ) : (
            <div className="text-center py-16 bg-[#13382E] border border-dashed border-[#1F5243] rounded-2xl p-8">
              <Truck className="w-12 h-12 text-[#226351] mx-auto mb-3" />
              <p className="text-white font-bold text-lg">No Active Deliveries</p>
              <p className="text-[#A3B8B0] text-sm mt-1 max-w-sm mx-auto">Select a job from the "Available Jobs" tab to start earning delivery fees.</p>
            </div>
          )
        )}
      </div>

      <div className="h-20 md:hidden"></div>

      {/* Mobile Fixed Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#13382E] border-t border-[#1F5243] flex justify-around items-center p-3 md:hidden z-40 shadow-2xl">
        <button
          onClick={() => setActiveTab('Available')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'Available' ? 'text-[#E5A93B]' : 'text-[#A3B8B0]'}`}
        >
          <Info className="w-5 h-5" />
          <span className="text-[10px] font-bold">Available</span>
        </button>
        <button
          onClick={() => setActiveTab('Active')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'Active' ? 'text-[#E5A93B]' : 'text-[#A3B8B0]'}`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] font-bold">My Jobs</span>
        </button>
        <button
          onClick={() => showNotify('Delivery history log coming soon.')}
          className="text-[#A3B8B0] hover:text-white flex flex-col items-center gap-1"
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-bold">History</span>
        </button>
        <button
          onClick={() => showNotify('GPS navigation maps activate upon job acceptance.')}
          className="text-[#A3B8B0] hover:text-white flex flex-col items-center gap-1"
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[10px] font-bold">Maps</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notifyMsg && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#13382E] text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-[#1F5243] whitespace-nowrap flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#E5A93B]" />
          <p className="text-sm font-bold">{notifyMsg}</p>
        </div>
      )}
    </div>
  );
};

export default CourierDashboard;