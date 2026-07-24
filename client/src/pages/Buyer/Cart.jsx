import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  Leaf, 
  Gift, 
  Truck, 
  MapPin, 
  Info, 
  CheckCircle, 
  Navigation,
  X,
  CheckCircle2,
  Lock,
  RefreshCw,
  Zap,
  Receipt
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCart, updateQuantity, removeFromCart, clearCart, getCouriers } from '../../services/cartService';
import { saveLocalOrder } from '../../services/orderService';
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

  // Mock M-Pesa STK Push Modal state
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mpesaPin, setMpesaPin] = useState('1234');
  const [stkState, setStkState] = useState('idle'); // 'idle' | 'prompt_sent' | 'processing' | 'success'
  const [mockReceipt, setMockReceipt] = useState('');

  useEffect(() => {
    setCartItems(getCart());
    if (user?.phone) {
      setMpesaPhone(user.phone);
    } else {
      setMpesaPhone('254712345678');
    }

    getCouriers()
      .then((data) => {
        setCouriers(data);
        if (data && data.length > 0) setSelectedCourier(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

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

  const openMpesaCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) return;
    setError('');
    setStkState('idle');
    setIsMpesaModalOpen(true);
  };

  const handleMpesaStkSubmit = async (e) => {
    e.preventDefault();
    setStkState('prompt_sent');

    // Simulate Daraja STK Push network prompt delay
    setTimeout(async () => {
      setStkState('processing');

      try {
        const orderResults = [];
        for (const item of cartItems) {
          let placedOrder = null;
          try {
            const res = await api.post('/orders', {
              listingId: item._id,
              quantity: item.quantity,
              deliveryMethod,
              vehicleType,
              phone: mpesaPhone,
              ...(deliveryMethod === 'courier' && {
                pickupAddress: user.location ? `${user.location.lat},${user.location.lng}` : 'Farm location',
                deliveryAddress: 'Buyer location',
              }),
            });
            if (res?.data?.order) placedOrder = res.data.order;
          } catch (apiErr) {
            console.warn('Backend API order post failed, generating mock settlement record', apiErr);
          }

          if (!placedOrder) {
            placedOrder = {
              _id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              createdAt: new Date().toISOString(),
              totalPrice: item.price * item.quantity,
              quantity: item.quantity,
              deliveryMethod,
              vehicleType,
              status: 'confirmed',
              escrowStatus: 'held',
              paymentRef: `MPESA-NL${Math.floor(10000000 + Math.random() * 90000000)}X`,
              courier: selectedCourier || {
                _id: 'courier-001',
                name: 'Kevin Courier',
                phone: '+254733333333'
              },
              listing: {
                _id: item._id,
                title: item.name || item.title,
                name: item.name || item.title,
                price: item.price,
                unit: item.unit,
                images: item.images || [],
                location: item.location || 'Local Farm'
              },
              farmer: {
                name: item.sellerName || item.farmer?.name || 'Local Farmer',
                phone: item.farmer?.phone || '+254711223344',
                location: item.location || 'Nakuru'
              }
            };
          }

          saveLocalOrder(placedOrder);
          orderResults.push(placedOrder);
        }

        const generatedReceipt = `NL${Math.floor(10000000 + Math.random() * 90000000)}X`;
        setMockReceipt(generatedReceipt);
        setStkState('success');

        setTimeout(() => {
          clearCart();
          setIsMpesaModalOpen(false);
          navigate('/orders');
        }, 2200);

      } catch (err) {
        setError(err.response?.data?.message || 'M-Pesa STK Push authorization failed');
        setStkState('idle');
      }
    }, 1500);
  };

  if (loading) {
    return <div className="text-center py-20 text-[#A3B8B0] text-lg font-medium">Loading cart items...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-[#E5A93B]" />
          Your Marketplace Shopping Cart
        </h1>
        <p className="text-[#A3B8B0] mt-1">Review your items, calculate distance-based transport, and checkout securely with M-Pesa.</p>
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
                      Farmer / Seller: <span className="font-semibold text-white">{item.farmer?.name || item.sellerName || 'Farm Origin'}</span>
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
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Assigned Courier */}
                <div>
                  <p className="text-sm font-extrabold text-white mb-2">Assigned Courier Service</p>
                  <div className="p-4 bg-[#0B251D] rounded-xl border border-[#1F5243] flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#E5A93B]" /> UzaMali Verified Logistics
                      </p>
                      <p className="text-xs text-[#A3B8B0] mt-0.5">
                        Transport fee: <span className="font-bold text-white">KES {totalEstimatedFee.toLocaleString()}</span>
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-[#E5A93B] text-[#0B251D] px-2.5 py-1 rounded-lg">
                      Escrow Protected
                    </span>
                  </div>
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

        {/* Order Summary Column */}
        <div className="space-y-6">
          <div className="bg-[#13382E] border border-[#1F5243] p-6 rounded-2xl shadow-xl space-y-5">
            <h3 className="text-xl font-bold text-white border-b border-[#1F5243] pb-4">Order Summary</h3>
            
            <div className="space-y-3.5">
              <div className="flex justify-between text-sm text-[#A3B8B0]">
                <span>Items Subtotal ({cartItems.length})</span>
                <span className="font-bold text-white">KES {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm text-[#A3B8B0]">
                <span>Transport Courier Fee</span>
                <span className="font-bold text-white">
                  {deliveryMethod === 'pickup' ? 'Free (Pickup)' : `KES ${deliveryFee.toLocaleString()}`}
                </span>
              </div>

              {redeemApplied && discount > 0 && (
                <div className="flex justify-between text-sm text-[#E5A93B] font-bold">
                  <span className="flex items-center gap-1">
                    <Leaf className="w-4 h-4" /> Mali Points Discount
                  </span>
                  <span>- KES {discount}</span>
                </div>
              )}

              <div className="border-t border-[#1F5243] pt-4 flex justify-between items-baseline">
                <span className="font-extrabold text-white text-base">Total Payable</span>
                <span className="font-black text-2xl text-[#E5A93B]">KES {total.toLocaleString()}</span>
              </div>
            </div>

            {/* M-Pesa Interactive Call to Action */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-[#0B251D] rounded-xl border border-[#1F5243] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xs">
                    M-PESA
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white">Safaricom M-Pesa STK Push</p>
                    <p className="text-[10px] text-[#A3B8B0]">Direct Escrow Settlement</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  MOCK READY
                </span>
              </div>

              <button
                onClick={openMpesaCheckout}
                disabled={submitting || cartItems.length === 0}
                className="w-full btn-primary py-4 text-base font-extrabold shadow-xl shadow-[#E5A93B]/20 flex items-center justify-center gap-2"
              >
                <Smartphone className="w-5 h-5 text-[#0B251D]" />
                Place Order via M-Pesa
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

      {/* M-Pesa STK Push Interactive Mock Modal */}
      {isMpesaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#13382E] border border-[#1F5243] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-[#1F5243] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
                  M
                </div>
                <span className="font-extrabold text-white text-base">M-Pesa Express Payment</span>
              </div>
              <button 
                onClick={() => setIsMpesaModalOpen(false)}
                className="text-[#A3B8B0] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {stkState === 'idle' && (
              <form onSubmit={handleMpesaStkSubmit} className="space-y-4">
                <div className="p-3.5 bg-[#0B251D] rounded-xl border border-[#1F5243] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#A3B8B0]">Merchant / Paybill:</span>
                    <span className="font-bold text-white">174379 (Uzamali Escrow)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A3B8B0]">Account Reference:</span>
                    <span className="font-bold text-[#E5A93B]">UZAMALI-ORDER</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#1F5243]">
                    <span className="text-[#A3B8B0] font-bold">Total KES Amount:</span>
                    <span className="font-black text-base text-[#E5A93B]">KES {total.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Safaricom M-Pesa Phone Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3B8B0] w-4 h-4" />
                    <input 
                      type="text" 
                      required 
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="input-field w-full pl-9"
                      placeholder="254712345678"
                    />
                  </div>
                  <p className="text-[11px] text-[#A3B8B0] mt-1">An STK Push notification prompt will be sent to this phone.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Mock 4-Digit PIN Simulation</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3B8B0] w-4 h-4" />
                    <input 
                      type="password" 
                      maxLength="4" 
                      required 
                      value={mpesaPin}
                      onChange={(e) => setMpesaPin(e.target.value)}
                      className="input-field w-full pl-9 tracking-widest"
                      placeholder="1234"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-3.5 font-bold text-sm flex items-center justify-center gap-2 mt-2"
                >
                  <Zap className="w-4 h-4 text-[#0B251D]" />
                  Initiate M-Pesa STK Push (Mock)
                </button>
              </form>
            )}

            {(stkState === 'prompt_sent' || stkState === 'processing') && (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-950/60 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Simulating STK Push to Phone...</h4>
                  <p className="text-xs text-[#A3B8B0] mt-1">Check phone <strong className="text-white">{mpesaPhone}</strong> and enter M-Pesa PIN</p>
                </div>
                <div className="p-3 bg-[#0B251D] border border-[#1F5243] rounded-xl text-left text-xs font-mono space-y-1 text-emerald-400">
                  <p>[Daraja STK Prompt]: Pay KES {total.toLocaleString()} to Uzamali Escrow?</p>
                  <p>[Status]: Authorizing with PIN ({mpesaPin.replace(/./g, '•')})...</p>
                </div>
              </div>
            )}

            {stkState === 'success' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">M-Pesa Payment Successful!</h4>
                  <p className="text-xs text-[#A3B8B0] mt-1">Funds held securely in Uzamali Escrow until delivery is confirmed.</p>
                </div>

                <div className="p-4 bg-[#0B251D] rounded-xl border border-emerald-500/40 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-[#1F5243] pb-2">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="w-4 h-4" /> M-Pesa Receipt
                    </span>
                    <span>{mockReceipt}</span>
                  </div>
                  <div className="flex justify-between text-[#A3B8B0]">
                    <span>Amount Paid:</span>
                    <span className="font-bold text-white">KES {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#A3B8B0]">
                    <span>Escrow Status:</span>
                    <span className="font-bold text-emerald-400">Held (Protected)</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#A3B8B0] italic animate-pulse">
                  Redirecting to your Order History...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
