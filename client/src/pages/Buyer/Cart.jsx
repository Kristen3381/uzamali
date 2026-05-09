import React, { useState } from 'react';
import { ShoppingCart, Trash2, Smartphone, ShieldCheck, ArrowRight, Leaf, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
  const { maliPoints } = useAuth();
  const [redeemApplied, setRedeemApplied] = useState(false);

  const cartItems = [
    {
      id: 1,
      name: 'Fresh Red Tomatoes',
      price: 50,
      unit: 'kg',
      quantity: 5,
      farmer: 'John Farmer',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 3,
      name: 'Hass Avocados',
      price: 25,
      unit: 'piece',
      quantity: 10,
      farmer: 'Murang\'a Cooperative',
      image: 'https://images.unsplash.com/photo-1523038823543-30f00b3f61e8?auto=format&fit=crop&q=80&w=200'
    }
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = 250;
  const discount = redeemApplied ? 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary dark:text-accent flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" />
          Your Shopping Cart
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Review your items before proceeding to M-Pesa checkout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border-2 border-primary-light dark:border-zinc-800 shadow-sm flex gap-4 transition-colors">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-bold text-primary dark:text-accent">{item.name}</h3>
                  <button className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Sold by: <span className="font-bold">{item.farmer}</span></p>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 border border-gray-200 dark:border-zinc-700 rounded-md flex items-center justify-center font-bold dark:text-white">-</button>
                    <span className="font-bold dark:text-white">{item.quantity}</span>
                    <button className="w-8 h-8 border border-gray-200 dark:border-zinc-700 rounded-md flex items-center justify-center font-bold dark:text-white">+</button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">KES {item.price} / {item.unit}</p>
                    <p className="text-lg font-black text-primary dark:text-accent">KES {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Mali Points Redemption */}
          <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-2xl text-white shadow-lg overflow-hidden relative">
            <Gift className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                  <Leaf className="w-6 h-6 fill-current text-highlight" />
                  Redeem Your Mali Points
                </h3>
                <p className="text-sm opacity-90 max-w-md">
                  You have <span className="font-bold text-highlight">{maliPoints} points</span>. 
                  Redeem 100 points for a <span className="font-bold">KES 100 discount</span> on your order!
                </p>
              </div>
              <button 
                onClick={() => {
                  if (maliPoints >= 100) {
                    setRedeemApplied(!redeemApplied);
                  } else {
                    alert("You need at least 100 Mali Points to redeem a discount.");
                  }
                }}
                disabled={maliPoints < 100}
                className={`px-6 py-3 rounded-xl font-black transition-all ${
                  redeemApplied 
                  ? 'bg-highlight text-black shadow-inner scale-95' 
                  : 'bg-white text-primary hover:bg-highlight hover:text-black shadow-md'
                } ${maliPoints < 100 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border-2 border-primary shadow-md transition-colors">
            <h3 className="text-xl font-bold text-primary dark:text-accent mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-bold">KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery Fee</span>
                <span className="font-bold">KES {deliveryFee}</span>
              </div>
              {redeemApplied && (
                <div className="flex justify-between text-accent font-bold">
                  <span className="flex items-center gap-1">
                    <Leaf className="w-4 h-4" /> Mali Points Discount
                  </span>
                  <span>- KES {discount}</span>
                </div>
              )}
              <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 flex justify-between text-xl">
                <span className="font-bold text-primary dark:text-accent">Total</span>
                <span className="font-black text-primary dark:text-accent">KES {(subtotal + deliveryFee - discount).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-primary-light dark:bg-primary/10 rounded-lg border border-primary/20 flex gap-3">
                <Smartphone className="w-6 h-6 text-primary dark:text-accent shrink-0" />
                <div>
                  <p className="text-xs font-bold text-primary dark:text-accent uppercase">Payment Method</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">M-Pesa STK Push</p>
                </div>
              </div>

              <button className="w-full btn-highlight py-4 text-xl flex items-center justify-center gap-3 shadow-lg">
                <Smartphone className="w-6 h-6" />
                Pay via M-Pesa
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase">
            <ShieldCheck className="w-4 h-4" />
            Secure Transaction via Daraja API
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
