import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Smartphone, ShieldCheck, ArrowRight, Leaf, Gift, Truck, MapPin, Info, CheckCircle, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCart, updateQuantity, removeFromCart, clearCart, getCouriers } from '../../services/cartService';
import api from '../../utils/api';

const VEHICLES = [
  { id: 'motorcycle', label: 'Motorcycle / Boda-Boda', capacity: '< 50 kg', rate: 'KES 40/km', icon: '🏍️' },
  { id: 'tuk_tuk', label: 'Tuk-Tuk / Small Van', capacity: '50 – 300 kg', rate: 'KES 70/km', icon: '🛺' },
  { id: 'pickup', label: 'Pickup Truck (1-Ton)', capacity: '300 – 1,000 kg', rate: 'KES 120/km', icon: '🚚' },
  { id: 'truck', label: 'Large Lorry (5-Ton+)', capacity: 'Over 1,000 kg', rate: 'KES 200/km', icon: '🚛' },
];

const Cart = () => {
  const { user, maliPoints } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [vehicleType, setVehicleType] = useState('motorcycle');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [redeemApplied, setRedeemApplied] = useState(false);
  const [error, setError] = useState('');
  const [estimatedFees, setEstimatedFees] = useState({});
  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    setCartItems(getCart());
    getCouriers()
      .then((data) => {
        setCouriers(data);
        if (data && data.length > 0) setSelectedCourier(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (deliveryMethod !== 'courier' || cartItems.length === 0) {
      setEstimatedFees({});
      return;
    }
    const fetchEstimates = async () => {
      setEstimating(true);
      const fees = {};
      for (const item of cartItems) {
        try {
          const { data } = await api.post('/deliveries/estimate', { listingId: item._id, vehicleType });
          fees[item._id] = data;
        } catch {
          fees[item._id] = { distance: 15, fee: 300, vehicles: {} };
        }
      }
      setEstimatedFees(fees);
      setEstimating(false);
    };
    fetchEstimates();
  }, [deliveryMethod, vehicleType, cartItems.length]);

  const totalEstimatedFee = deliveryMethod === 'courier'
    ? Object.values(estimatedFees).reduce((sum, e) => sum + (e.fee || 0), 0)
    : 0;

  const sampleDistance = Object.values(estimatedFees)[0]?.distance || 15;

  const handleQty = (id, delta) => {
    setCartItems(updateQuantity(id, delta));
  };

  const handleRemove = (id) => {
    setCartItems(removeFromCart(id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = deliveryMethod === 'courier' ? totalEstimatedFee : 0;
  const discount = redeemApplied ? Math.min(100, maliPoints) : 0;
  const total = subtotal + deliveryFee - discount;

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) return;
    setError('');
    setSubmitting(true);

    try {
      for (const item of cartItems) {
        await api.post('/orders', {
          listingId: item._id,
          quantity: item.quantity,
          deliveryMethod,
          vehicleType,
          ...(deliveryMethod === 'courier' && {
            pickupAddress: user.location ? `${user.location.lat},${user.location.lng}` : 'Farm location',
            deliveryAddress: 'Buyer location',
          }),
        });
      }

      clearCart();
      alert('Order placed successfully! Check your phone for M-Pesa STK Push.');
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-[#A3B8B0] text-lg font-medium">Loading cart items...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-[#E5A93B]" />
          Your Marketplace Shopping Cart
        </h1>
        <p className="text-[#A3B8B0] mt-1">Review your items, calculate distance-based transport, and checkout securely.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-xl">
          {error}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-[#13382E] border border-[#1F5243] rounded-2xl p-8 shadow-xl">
          <ShoppingCart className="w-16 h-16 text-[#226351] mx-auto mb-4" />
          <p className="text-white text-xl font-bold mb-2">Your cart is currently empty</p>
          <p className="text-[#A3B8B0] text-sm mb-6">Explore farm-fresh produce and agro-waste listings in the market.</p>
          <Link to="/market" className="btn-primary inline-flex items-center gap-2 py-3 px-6">
            Browse Produce Market
          </Link>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items List */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="bg-[#13382E] border border-[#1F5243] rounded-2xl p-4 flex gap-4 shadow-lg">
                <img
                  src={item.images?.[0] || 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=200'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-xl border border-[#1F5243] bg-[#0B251D]"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-white text-base">{item.name}</h3>
                      <button onClick={() => handleRemove(item._id)} className="text-[#A3B8B0] hover:text-red-400 p-1">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-[#A3B8B0]">
                      Farmer: <span className="font-semibold text-white">{item.farmer?.name || 'Farm Origin'}</span>
                    </p>
                  </div>

                  <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center gap-2.5 bg-[#0B251D] p-1 rounded-xl border border-[#1F5243]">
                      <button onClick={() => handleQty(item._id, -1)} className="w-7 h-7 bg-[#226351]/50 hover:bg-[#226351] text-white rounded-lg flex items-center justify-center font-bold text-sm">-</button>
                      <span className="font-extrabold text-white text-sm px-1">{item.quantity}</span>
                      <button onClick={() => handleQty(item._id, 1)} className="w-7 h-7 bg-[#226351]/50 hover:bg-[#226351] text-white rounded-lg flex items-center justify-center font-bold text-sm">+</button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#A3B8B0]">KES {item.price} / {item.unit}</p>
                      <p className="text-lg font-black text-[#E5A93B]">KES {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Method & Vehicle Size Selection */}
          <div className="bg-[#13382E] border border-[#1F5243] rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#E5A93B]" />
              Delivery & Logistics Options
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setDeliveryMethod('pickup'); setSelectedCourier(null); }}
                className={`p-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex items-center gap-3 ${
                  deliveryMethod === 'pickup'
                    ? 'border-[#E5A93B] bg-[#226351]/50 text-white'
                    : 'border-[#1F5243] bg-[#0B251D] text-[#A3B8B0] hover:text-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl border ${deliveryMethod === 'pickup' ? 'bg-[#E5A93B] text-[#0B251D]' : 'bg-[#226351] text-white'}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-base">Self Pickup</p>
                  <p className="text-xs text-[#A3B8B0]">Pick up directly from farm</p>
                </div>
              </button>

              <button
                onClick={() => setDeliveryMethod('courier')}
                className={`p-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex items-center gap-3 ${
                  deliveryMethod === 'courier'
                    ? 'border-[#E5A93B] bg-[#226351]/50 text-white'
                    : 'border-[#1F5243] bg-[#0B251D] text-[#A3B8B0] hover:text-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl border ${deliveryMethod === 'courier' ? 'bg-[#E5A93B] text-[#0B251D]' : 'bg-[#226351] text-white'}`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-base">Courier Delivery</p>
                  <p className="text-xs text-[#A3B8B0]">Distance-based transport</p>
                </div>
              </button>
            </div>

            {deliveryMethod === 'courier' && (
              <div className="space-y-4 pt-2 border-t border-[#1F5243]">
                {/* Distance & Evaluation Banner */}
                <div className="bg-[#0B251D] p-4 rounded-xl border border-[#1F5243] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Navigation className="w-5 h-5 text-[#E5A93B]" />
                    <div>
                      <p className="text-xs text-[#A3B8B0]">Evaluated Delivery Distance</p>
                      <p className="text-base font-extrabold text-white">~ {sampleDistance} km <span className="text-xs text-[#A3B8B0] font-normal">(Farm to Buyer Location)</span></p>
                    </div>
                  </div>
                  <span className="text-xs bg-[#226351] text-white font-bold px-2.5 py-1 rounded-lg border border-[#1F5243]">
                    GPS Evaluated
                  </span>
                </div>

                {/* Vehicle Selection Section */}
                <div>
                  <label className="block text-sm font-extrabold text-white mb-2">
                    Select Vehicle Size for Transport
                    <span className="text-xs font-normal text-[#A3B8B0] block mt-0.5">
                      Choose according to the payload volume/weight of your order:
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {VEHICLES.map((v) => {
                      const estVehicleFee = sampleDistance ? Math.max(
                        v.id === 'motorcycle' ? 150 : v.id === 'tuk_tuk' ? 300 : v.id === 'pickup' ? 600 : 1500,
                        Math.round(sampleDistance * (v.id === 'motorcycle' ? 40 : v.id === 'tuk_tuk' ? 70 : v.id === 'pickup' ? 120 : 200))
                      ) : 0;

                      return (
                        <div
                          key={v.id}
                          onClick={() => setVehicleType(v.id)}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                            vehicleType === v.id
                              ? 'border-[#E5A93B] bg-[#226351]/50 text-white shadow-md'
                              : 'border-[#1F5243] bg-[#0B251D] text-[#A3B8B0] hover:text-white hover:border-[#226351]'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{v.icon}</span>
                              <div>
                                <p className="font-bold text-white text-sm">{v.label}</p>
                                <p className="text-[11px] text-[#A3B8B0]">{v.capacity}</p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-[#E5A93B]">
                              KES {estVehicleFee.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#A3B8B0] mt-2 pt-2 border-t border-[#1F5243]/50 flex justify-between">
                            <span>Rate: {v.rate}</span>
                            <span>{sampleDistance} km eval</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Courier List */}
                <div>
                  <p className="text-sm font-extrabold text-white mb-2">Assigned Courier Service</p>
                  {estimating && <p className="text-xs text-[#A3B8B0]">Recalculating distance-based fee...</p>}
                  {!estimating && (
                    <div className="p-4 bg-[#0B251D] rounded-xl border border-[#1F5243] flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#E5A93B]" /> UzaMali Verified Logistics
                        </p>
                        <p className="text-xs text-[#A3B8B0] mt-0.5">
                          Fee shown to farmer & courier: <span className="font-bold text-white">KES {totalEstimatedFee.toLocaleString()}</span>
                        </p>
                      </div>
                      <span className="text-xs font-bold bg-[#E5A93B] text-[#0B251D] px-2.5 py-1 rounded-lg">
                        Escrow Protected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mali Points */}
          <div className="bg-[#13382E] border border-[#1F5243] p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
            <Gift className="absolute -right-4 -bottom-4 w-32 h-32 text-[#226351]/30 rotate-12" />
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                  <Leaf className="w-5 h-5 text-[#E5A93B]" />
                  Redeem Mali Points Discount
                </h3>
                <p className="text-xs text-[#A3B8B0]">
                  Available: <span className="font-extrabold text-[#E5A93B]">{maliPoints} points</span> (Save up to KES {Math.min(100, maliPoints)})
                </p>
              </div>
              <button
                onClick={() => setRedeemApplied(!redeemApplied)}
                disabled={maliPoints < 1}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                  redeemApplied
                    ? 'bg-[#E5A93B] text-[#0B251D] shadow-md'
                    : 'bg-[#226351] text-white hover:bg-[#2b7963] border border-[#1F5243]'
                } ${maliPoints < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {redeemApplied ? 'REDEEMED ✓' : 'REDEEM NOW'}
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-[#13382E] border border-[#1F5243] p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold text-white mb-5">Order Summary</h3>
            
            <div className="space-y-3.5 mb-6">
              <div className="flex justify-between text-sm text-[#A3B8B0]">
                <span>Produce Subtotal ({cartItems.length} items)</span>
                <span className="font-bold text-white">KES {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm text-[#A3B8B0]">
                <span>Transport Courier Fee</span>
                <span className="font-bold text-white">
                  {deliveryMethod === 'pickup' ? 'Free (Pickup)' : `KES ${deliveryFee.toLocaleString()}`}
                </span>
              </div>

              {deliveryMethod === 'courier' && (
                <div className="text-xs bg-[#0B251D] p-3 rounded-xl border border-[#1F5243] space-y-1">
                  <div className="flex justify-between text-[#A3B8B0]">
                    <span>Distance:</span>
                    <span className="font-bold text-white">{sampleDistance} km</span>
                  </div>
                  <div className="flex justify-between text-[#A3B8B0]">
                    <span>Vehicle Selected:</span>
                    <span className="font-bold text-[#E5A93B] capitalize">{vehicleType.replace('_', ' ')}</span>
                  </div>
                </div>
              )}

              {redeemApplied && discount > 0 && (
                <div className="flex justify-between text-sm text-[#E5A93B] font-bold">
                  <span className="flex items-center gap-1">
                    <Leaf className="w-4 h-4" /> Mali Points Discount
                  </span>
                  <span>- KES {discount}</span>
                </div>
              )}

              <div className="border-t border-[#1F5243] pt-4 flex justify-between items-baseline">
                <span className="font-extrabold text-white text-base">Total Payment</span>
                <span className="font-black text-2xl text-[#E5A93B]">KES {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-[#0B251D] rounded-xl border border-[#1F5243] flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-[#E5A93B] shrink-0" />
                <div>
                  <p className="text-[10px] font-extrabold text-[#A3B8B0] uppercase tracking-wider">Payment Method</p>
                  <p className="text-sm font-bold text-white">M-Pesa STK Push Prompt</p>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={submitting || cartItems.length === 0}
                className="w-full btn-primary py-4 text-lg shadow-xl shadow-[#E5A93B]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Smartphone className="w-5 h-5 text-[#0B251D]" />
                {submitting ? 'Processing Order...' : 'Place Order via M-Pesa'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[#A3B8B0] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#E5A93B]" />
            M-Pesa Daraja & Escrow Protected
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Cart;
