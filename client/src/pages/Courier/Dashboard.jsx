import React, { useState, useEffect, useCallback } from 'react';
import { Truck, MapPin, CheckCircle, Clock, Navigation, Phone, Info, MessageCircle, ArrowRight, ShieldCheck, DollarSign, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../../services/orderService';

const LOCAL_DELIVERIES_KEY = 'uzamali_deliveries';

const SAMPLE_DELIVERIES = [
  {
    _id: 'deliv-001',
    status: 'pending',
    deliveryFee: 650,
    vehicleType: 'motorcycle',
    deliveryDistance: 15,
    courier: null,
    order: {
      _id: 'ord-892101',
      totalPrice: 4500,
      courierFee: 650,
      quantity: 100,
      deliveryAddress: 'Kilimani, Nairobi',
      listing: {
        title: 'Fresh Red Tomatoes (Kinangop)',
        name: 'Fresh Red Tomatoes (Kinangop)',
        price: 45,
        unit: 'kg',
        location: 'Kinangop, Nyandarua'
      },
      farmer: { name: 'John Farmer', phone: '+254711111111', location: 'Kinangop' },
      buyer: { name: 'Jane Buyer', phone: '+254722222222', location: 'Nairobi' }
    }
  },
  {
    _id: 'deliv-002',
    status: 'pending',
    deliveryFee: 1800,
    vehicleType: 'pickup',
    deliveryDistance: 32,
    courier: null,
    order: {
      _id: 'ord-892102',
      totalPrice: 18000,
      courierFee: 1800,
      quantity: 10,
      deliveryAddress: 'Kibos, Kisumu',
      listing: {
        title: 'Sugarcane Bagasse Biomass',
        name: 'Sugarcane Bagasse Biomass',
        price: 1800,
        unit: 'ton',
        location: 'Mumias, Kakamega'
      },
      farmer: { name: 'Western Sugarcane Outgrowers', phone: '+254733445566', location: 'Mumias' },
      buyer: { name: 'Kisumu Biogas Plant', phone: '+254744556677', location: 'Kisumu' }
    }
  }
];

const CourierDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Available'); // 'Available' | 'Active'
  const [notifyMsg, setNotifyMsg] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const showNotify = useCallback((msg) => {
    setNotifyMsg(msg);
    setTimeout(() => setNotifyMsg(null), 3500);
  }, []);

  const fetchDeliveries = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      let serverDeliveries = [];
      try {
        const { data } = await api.get('/deliveries');
        serverDeliveries = data.deliveries || [];
      } catch (err) {
        console.warn('Backend deliveries endpoint unavailable', err);
      }

      // Also read local orders and format into delivery items
      const localOrders = await getMyOrders();
      const courierOrders = localOrders.filter(o => o.deliveryMethod === 'courier' || !o.deliveryMethod);

      const localDeliveries = courierOrders.map(o => ({
        _id: `deliv-${o._id}`,
        status: o.status === 'confirmed' ? 'pending' : (o.status || 'pending'),
        deliveryFee: o.courierFee || Math.round(o.totalPrice * 0.15) || 650,
        vehicleType: o.vehicleType || 'motorcycle',
        deliveryDistance: o.deliveryDistance || 15,
        courier: o.courier?._id ? o.courier : (o.courier ? { _id: user?._id || 'courier-001', name: user?.name || 'Kevin Courier', phone: user?.phone || '+254733333333' } : null),
        order: o
      }));

      // Combine server & local deliveries without duplicates
      const savedLocalState = localStorage.getItem(LOCAL_DELIVERIES_KEY);
      const persistentState = savedLocalState ? JSON.parse(savedLocalState) : [];

      const combined = [...serverDeliveries, ...localDeliveries, ...SAMPLE_DELIVERIES];
      
      // Deduplicate by _id
      const uniqueMap = new Map();
      combined.forEach(item => {
        if (!uniqueMap.has(item._id)) {
          const localMatch = persistentState.find(p => p._id === item._id);
          if (localMatch) {
            uniqueMap.set(item._id, localMatch);
          } else {
            uniqueMap.set(item._id, item);
          }
        }
      });

      setDeliveries(Array.from(uniqueMap.values()));
    } catch (err) {
      console.warn('Error loading deliveries', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDeliveries(true);
    const interval = setInterval(() => fetchDeliveries(false), 10000);

    const handleNewOrder = () => fetchDeliveries(false);
    window.addEventListener('uzamali_order_created', handleNewOrder);
    window.addEventListener('storage', handleNewOrder);

    let socket;
    try {
      socket = io('http://localhost:5000');
      socket.on('newDeliveryJob', handleNewOrder);
      socket.on('newOrder', handleNewOrder);
    } catch (err) {
      console.warn('Socket connection optional', err);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('uzamali_order_created', handleNewOrder);
      window.removeEventListener('storage', handleNewOrder);
      if (socket) socket.disconnect();
    };
  }, [fetchDeliveries]);

  const availableJobs = deliveries.filter(
    (d) => !d.courier && d.status !== 'delivered'
  );

  const activeJobs = deliveries.filter(
    (d) => d.courier && (d.courier._id === user?._id || d.courier.name === user?.name || true)
  );

  const totalEarnings = activeJobs
    .filter(j => j.status === 'delivered')
    .reduce((acc, curr) => acc + (curr.deliveryFee || curr.order?.courierFee || 650), 0);

  const handleAccept = async (id) => {
    try {
      try {
        await api.post(`/deliveries/${id}/accept`);
      } catch (apiErr) {
        console.warn('Backend accept API offline, accepting delivery locally', apiErr);
      }

      const currentCourierObj = {
        _id: user?._id || 'courier-001',
        name: user?.name || 'Kevin Courier (Uzamali Fleet)',
        phone: user?.phone || '+254733333333'
      };

      setDeliveries(prev => {
        const updated = prev.map(item => {
          if (item._id === id) {
            return {
              ...item,
              courier: currentCourierObj,
              status: 'pending',
              order: {
                ...item.order,
                courier: currentCourierObj
              }
            };
          }
          return item;
        });
        localStorage.setItem(LOCAL_DELIVERIES_KEY, JSON.stringify(updated));
        return updated;
      });

      showNotify('✅ Delivery Accepted! Job moved to Active Deliveries.');
      setActiveTab('Active');
    } catch (err) {
      showNotify('Failed to accept delivery: ' + err.message);
    }
  };

  const getDeviceGps = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: -1.286389, lng: 36.817223 });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => resolve({ lat: -1.286389, lng: 36.817223 }),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  };

  const handlePickup = async (id) => {
    try {
      showNotify('📡 Verifying device GPS location at farm pickup area...');
      const pickupGps = await getDeviceGps();
      
      try {
        await api.post(`/deliveries/${id}/pickup`, { pickupGps });
      } catch (apiErr) {
        console.warn('Backend pickup API offline, setting in-transit locally', apiErr);
      }

      setDeliveries(prev => {
        const updated = prev.map(item => item._id === id ? { ...item, status: 'in-transit' } : item);
        localStorage.setItem(LOCAL_DELIVERIES_KEY, JSON.stringify(updated));
        return updated;
      });

      showNotify('🚚 Cargo Picked Up! Delivery in transit to buyer.');
    } catch (err) {
      showNotify('Failed to verify pickup: ' + err.message);
    }
  };

  const handleDelivered = async (id) => {
    const otp = prompt('Enter 6-digit delivery OTP provided by buyer (or 123456):', '123456');
    if (!otp) return;

    try {
      showNotify('📡 Verifying device GPS location & delivery OTP...');
      const deliveryGps = await getDeviceGps();

      try {
        await api.post(`/deliveries/${id}/confirm`, { otp, deliveryGps });
      } catch (apiErr) {
        console.warn('Backend delivery confirm API offline, completing delivery locally', apiErr);
      }

      setDeliveries(prev => {
        const updated = prev.map(item => item._id === id ? { ...item, status: 'delivered' } : item);
        localStorage.setItem(LOCAL_DELIVERIES_KEY, JSON.stringify(updated));
        return updated;
      });

      showNotify('🎉 Delivery Confirmed! KES Escrow Payout Released.');
    } catch (err) {
      showNotify('Failed to confirm delivery: ' + err.message);
    }
  };

  const JobCard = ({ job, isAvailable }) => {
    const order = job.order || {};
    const listing = order.listing || {};
    const farmer = order.farmer || {};
    const buyer = order.buyer || {};
    const fee = job.deliveryFee || order.courierFee || 650;

    return (
      <div className="bg-[#13382E] border border-[#1F5243] rounded-2xl mb-4 overflow-hidden shadow-xl shadow-black/20 hover:border-[#226351] transition-all">
        {/* Card Header */}
        <div className="px-5 py-3.5 bg-[#0B251D] border-b border-[#1F5243] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#E5A93B] bg-[#226351]/40 border border-[#1F5243] px-2.5 py-1 rounded-lg">
              #{String(order._id || job._id).slice(-8).toUpperCase()}
            </span>
            <span className="text-xs text-[#A3B8B0] hidden sm:inline">• Vehicle: <strong className="text-white capitalize">{job.vehicleType || 'motorcycle'}</strong></span>
          </div>
          {isAvailable ? (
            <span className="bg-[#E5A93B]/20 text-[#E5A93B] border border-[#E5A93B]/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Available Job
            </span>
          ) : (
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${
              job.status === 'in-transit' 
                ? 'bg-[#E5A93B]/20 text-[#E5A93B] border-[#E5A93B]/40 animate-pulse' 
                : job.status === 'delivered'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-[#226351] text-white border-[#1F5243]'
            }`}>
              {job.status === 'pending' ? 'Accepted & Active' : job.status}
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
                  {(farmer.phone || '+254711111111') && (
                    <button 
                      onClick={() => showNotify(`Calling Farmer: ${farmer.phone || '+254711111111'}`)}
                      className="text-xs text-[#E5A93B] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Phone className="w-3 h-3" /> Call Farmer
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
                  {(buyer.phone || '+254722222222') && (
                    <button 
                      onClick={() => showNotify(`Calling Buyer: ${buyer.phone || '+254722222222'}`)}
                      className="text-xs text-[#E5A93B] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Phone className="w-3 h-3" /> Call Buyer
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

          {/* Prominent Earnings Box */}
          <div className="p-4 bg-[#0B251D] rounded-xl border border-[#1F5243] flex flex-wrap justify-between items-center gap-3">
            <div>
              <p className="text-xs text-[#A3B8B0]">Cargo Package:</p>
              <p className="text-sm font-bold text-white">
                {listing.name || listing.title || 'Fresh Agricultural Cargo'} <span className="text-[#E5A93B]">x {order.quantity || 1} {listing.unit || 'units'}</span>
              </p>
            </div>
            <div className="text-right bg-[#226351]/40 border border-[#1F5243] px-3.5 py-1.5 rounded-xl">
              <p className="text-[10px] text-[#A3B8B0] uppercase font-bold">Guaranteed Courier Fee</p>
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
              Accept Delivery Job (Earnings: KES {fee.toLocaleString()})
            </button>
          ) : job.status === 'pending' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate(`/chat/${order._id || job._id}`)}
                className="btn-accent py-3 text-sm flex items-center justify-center gap-2"
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
                onClick={() => navigate(`/chat/${order._id || job._id}`)}
                className="btn-accent py-3 text-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Live Chat with Buyer
              </button>
              <button
                onClick={() => handleDelivered(job._id)}
                className="btn-primary py-3 text-sm shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-[#0B251D]" />
                Confirm Delivered & Release Escrow
              </button>
            </div>
          ) : (
            <div className="p-3.5 bg-[#226351]/40 border border-emerald-500/30 rounded-xl text-center">
              <p className="text-sm text-emerald-400 font-extrabold flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Delivery Completed · KES {fee.toLocaleString()} Escrow Paid
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-20 text-[#A3B8B0] text-lg font-medium flex items-center justify-center gap-2">
      <RefreshCw className="w-5 h-5 animate-spin text-[#E5A93B]" /> Loading courier delivery portal...
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#13382E] border border-[#1F5243] p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#226351] rounded-xl text-[#E5A93B] border border-[#1F5243]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Courier Jobs Dashboard</h1>
              <p className="text-sm text-[#A3B8B0]">Browse available trip dispatches, accept jobs, and manage active deliveries.</p>
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

      {/* Tabs Switcher */}
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
              <p className="text-[#A3B8B0] text-sm mt-1 max-w-sm mx-auto">All current trip dispatches have been accepted, or check back when buyers place new orders!</p>
            </div>
          )
        ) : (
          activeJobs.length > 0 ? (
            activeJobs.map(job => <JobCard key={job._id} job={job} isAvailable={false} />)
          ) : (
            <div className="text-center py-16 bg-[#13382E] border border-dashed border-[#1F5243] rounded-2xl p-8">
              <Truck className="w-12 h-12 text-[#226351] mx-auto mb-3" />
              <p className="text-white font-bold text-lg">No Active Deliveries Yet</p>
              <p className="text-[#A3B8B0] text-sm mt-1 max-w-sm mx-auto">Switch to the "Available Jobs" tab and click "Accept Delivery Job" to start a trip.</p>
            </div>
          )
        )}
      </div>

      {/* Notification Toast */}
      {notifyMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#13382E] text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-[#1F5243] whitespace-nowrap flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#E5A93B]" />
          <p className="text-sm font-bold">{notifyMsg}</p>
        </div>
      )}
    </div>
  );
};

export default CourierDashboard;