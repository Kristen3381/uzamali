import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, MapPin, Search } from 'lucide-react';
import api from '../../utils/api';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const map = {
      'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'confirmed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const filtered = orders.filter((o) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      o.listing?.title?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <div className="text-center py-20 text-gray-400 text-lg">Loading orders...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary dark:text-accent">My Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your purchases and delivery status.</p>
        </div>
        {orders.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border-2 border-primary-light dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-md focus:border-primary outline-none transition-colors"
          />
        </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No orders yet</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-lg">No orders match your search</div>
      ) : (
      <div className="space-y-6">
        {filtered.map((order) => (
          <div key={order._id} className="card overflow-hidden">
            <div className="bg-white/30 dark:bg-white/5 px-6 py-4 border-b border-white/20 flex flex-col md:flex-row justify-between md:items-center gap-4 backdrop-blur-sm">
              <div className="flex flex-wrap gap-6 text-sm font-semibold">
                <div>
                  <p className="text-gray-400 dark:text-gray-500 uppercase text-[10px]">Order Date</p>
                  <p className="text-primary dark:text-accent">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-500 uppercase text-[10px]">Order ID</p>
                  <p className="text-primary dark:text-accent font-mono">#{order._id.slice(-6)}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-500 uppercase text-[10px]">Total Amount</p>
                  <p className="text-primary dark:text-accent">KES {order.totalPrice?.toLocaleString()}</p>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase ${statusBadge(order.status)}`}>
                {order.status}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Items Ordered</h4>
                  <div className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 glass rounded-md">
                        <Package className="w-5 h-5 text-primary dark:text-accent" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{order.listing?.title || 'Product'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.quantity} {order.listing?.unit || 'units'} x KES {order.listing?.price?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-primary dark:text-accent">KES {(order.listing?.price || 0) * order.quantity}</span>
                  </div>
                </div>

                <div className="glass p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Delivery Info</h4>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${order.status === 'confirmed' ? 'bg-green-500 text-white' : 'bg-accent text-white'}`}>
                        {order.status === 'confirmed' ? <CheckCircle className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-primary dark:text-accent">
                        {order.deliveryMethod === 'pickup' ? 'Pickup' : 'Courier Delivery'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <MapPin className="w-3 h-3" />
                        {order.farmer?.name || 'Farmer'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default Orders;
