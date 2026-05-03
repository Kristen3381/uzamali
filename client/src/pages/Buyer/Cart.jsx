import React from 'react';
import { ShoppingCart, Trash2, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" />
          Your Shopping Cart
        </h1>
        <p className="text-gray-600 mt-1">Review your items before proceeding to M-Pesa checkout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border-2 border-primary-light shadow-sm flex gap-4">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-bold text-primary">{item.name}</h3>
                  <button className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2">Sold by: <span className="font-bold">{item.farmer}</span></p>
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 border border-gray-200 rounded-md flex items-center justify-center font-bold">-</button>
                    <span className="font-bold">{item.quantity}</span>
                    <button className="w-8 h-8 border border-gray-200 rounded-md flex items-center justify-center font-bold">+</button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">KES {item.price} / {item.unit}</p>
                    <p className="text-lg font-black text-primary">KES {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link to="/market" className="inline-flex items-center gap-2 text-accent font-bold hover:underline">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Continue Shopping
          </Link>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border-2 border-primary shadow-md">
            <h3 className="text-xl font-bold text-primary mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold">KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-bold">KES {deliveryFee}</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between text-xl">
                <span className="font-bold text-primary">Total</span>
                <span className="font-black text-primary">KES {(subtotal + deliveryFee).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-primary-light rounded-lg border border-primary/20 flex gap-3">
                <Smartphone className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-bold text-primary uppercase">Payment Method</p>
                  <p className="text-sm font-semibold text-gray-700">M-Pesa STK Push</p>
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
