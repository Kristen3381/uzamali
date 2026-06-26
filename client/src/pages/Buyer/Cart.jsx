import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Smartphone, ShieldCheck, ArrowRight, Leaf, Gift, Truck, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCart, updateQuantity, removeFromCart, clearCart, getCouriers } from '../../services/cartService';
import api from '../../utils/api';

const Cart = () => {
  const { user, maliPoints } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [redeemApplied, setRedeemApplied] = useState(false);
  const [error, setError] = useState('');
  const [estimatedFees, setEstimatedFees] = useState({});
  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    setCartItems(getCart());
    getCouriers()
      .then(setCouriers)
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
          const { data } = await api.post('/deliveries/estimate', { listingId: item._id });
          fees[item._id] = data;
        } catch {
          fees[item._id] = { distance: 0, fee: 0 };
        }
      }
      setEstimatedFees(fees);
      setEstimating(false);
    };
    fetchEstimates();
  }, [deliveryMethod, cartItems.length]);

  const totalEstimatedFee = deliveryMethod === 'courier'
    ? Object.values(estimatedFees).reduce((sum, e) => sum + (e.fee || 0), 0)
    : 0;

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
    return <div className="text-center py-20 text-gray-400 text-lg">Loading cart...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary dark:text-accent flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" />
          Your Shopping Cart
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Review your items before placing an order.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm p-4 rounded-lg">
          {error}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">Your cart is empty</p>
          <Link to="/market" className="btn-primary inline-flex items-center gap-2 py-3 px-6">
            Browse Products
          </Link>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4">
              <img
                src={item.images?.[0] || 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=200'}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-bold text-primary dark:text-accent">{item.name}</h3>
                  <button onClick={() => handleRemove(item._id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Sold by: <span className="font-bold">{item.farmer?.name || 'Farmer'}</span>
                </p>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleQty(item._id, -1)} className="w-8 h-8 glass rounded-md flex items-center justify-center font-bold dark:text-white">-</button>
                    <span className="font-bold dark:text-white">{item.quantity}</span>
                    <button onClick={() => handleQty(item._id, 1)} className="w-8 h-8 glass rounded-md flex items-center justify-center font-bold dark:text-white">+</button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">KES {item.price} / {item.unit}</p>
                    <p className="text-lg font-black text-primary dark:text-accent">KES {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Delivery Method */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-primary dark:text-accent mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Delivery Method
            </h3>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => { setDeliveryMethod('pickup'); setSelectedCourier(null); }}
                className={`flex-1 p-4 rounded-xl border-2 font-bold text-sm transition-all ${
                  deliveryMethod === 'pickup'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-white/20 text-gray-500 hover:border-primary/30'
                }`}
              >
                <MapPin className="w-5 h-5 mx-auto mb-1" />
                Pickup
              </button>
              <button
                onClick={() => setDeliveryMethod('courier')}
                className={`flex-1 p-4 rounded-xl border-2 font-bold text-sm transition-all ${
                  deliveryMethod === 'courier'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-white/20 text-gray-500 hover:border-primary/30'
                }`}
              >
                <Truck className="w-5 h-5 mx-auto mb-1" />
                Courier Delivery
              </button>
            </div>

            {deliveryMethod === 'courier' && (
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Available Couriers</p>
                {estimating && <p className="text-xs text-gray-400 mb-2">Calculating delivery fees...</p>}
                {!estimating && totalEstimatedFee > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-1">
                    {cartItems.map((item) => {
                      const est = estimatedFees[item._id];
                      return est ? (
                        <p key={item._id}>
                          {item.name}: {est.distance > 0 ? `${est.distance} km → ` : ''}KES {est.fee}
                        </p>
                      ) : null;
                    })}
                    <p className="font-bold text-primary dark:text-accent">Total Delivery: KES {totalEstimatedFee.toLocaleString()}</p>
                  </div>
                )}
                {couriers.length === 0 ? (
                  <p className="text-sm text-gray-400">No couriers available at this time.</p>
                ) : (
                  <div className="space-y-2">
                    {couriers.map((c) => (
                      <label
                        key={c._id}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedCourier?._id === c._id
                            ? 'border-accent bg-accent/5'
                            : 'border-white/20 hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="courier"
                            checked={selectedCourier?._id === c._id}
                            onChange={() => setSelectedCourier(c)}
                            className="accent-accent"
                          />
                          <div>
                            <p className="font-bold text-primary dark:text-accent">{c.name}</p>
                            <p className="text-xs text-gray-400">{c.phone}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mali Points Redemption */}
          <div className="bg-gradient-to-br from-primary/80 to-accent/80 backdrop-blur-md p-6 rounded-2xl text-white shadow-lg overflow-hidden relative border border-white/20">
            <Gift className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                  <Leaf className="w-6 h-6 fill-current text-highlight" />
                  Redeem Your Mali Points
                </h3>
                <p className="text-sm opacity-90 max-w-md">
                  You have <span className="font-bold text-highlight">{maliPoints} points</span>.
                  Redeem up to <span className="font-bold">KES {Math.min(100, maliPoints)}</span> discount!
                </p>
              </div>
              <button
                onClick={() => setRedeemApplied(!redeemApplied)}
                disabled={maliPoints < 1}
                className={`px-6 py-3 rounded-xl font-black transition-all ${
                  redeemApplied
                    ? 'bg-highlight text-black shadow-inner scale-95'
                    : 'bg-white text-primary hover:bg-highlight hover:text-black shadow-md'
                } ${maliPoints < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {redeemApplied ? 'REDEEMED ✓' : 'REDEEM NOW'}
              </button>
            </div>
          </div>

          <Link to="/market" className="inline-flex items-center gap-2 text-accent font-bold hover:underline">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Continue Shopping
          </Link>
        </div>

        <div className="space-y-6">
          <div className="card p-6 shadow-md">
            <h3 className="text-xl font-bold text-primary dark:text-accent mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                <span className="font-bold">KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery</span>
                <span className="font-bold">{deliveryMethod === 'pickup' ? 'Free (Pickup)' : estimating ? 'Calculating...' : selectedCourier ? `KES ${deliveryFee.toLocaleString()}` : 'Select courier'}</span>
              </div>
              {redeemApplied && discount > 0 && (
                <div className="flex justify-between text-accent font-bold">
                  <span className="flex items-center gap-1">
                    <Leaf className="w-4 h-4" /> Mali Points Discount
                  </span>
                  <span>- KES {discount}</span>
                </div>
              )}
              <div className="border-t border-white/20 pt-4 flex justify-between text-xl">
                <span className="font-bold text-primary dark:text-accent">Total</span>
                <span className="font-black text-primary dark:text-accent">KES {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 glass rounded-lg border border-white/20 flex gap-3">
                <Smartphone className="w-6 h-6 text-primary dark:text-accent shrink-0" />
                <div>
                  <p className="text-xs font-bold text-primary dark:text-accent uppercase">Payment Method</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">M-Pesa STK Push</p>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={submitting || cartItems.length === 0 || (deliveryMethod === 'courier' && !selectedCourier)}
                className="w-full btn-highlight py-4 text-xl flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Smartphone className="w-6 h-6" />
                {submitting ? 'Processing...' : 'Place Order via M-Pesa'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase">
            <ShieldCheck className="w-4 h-4" />
            Secure Transaction via Daraja API
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Cart;
