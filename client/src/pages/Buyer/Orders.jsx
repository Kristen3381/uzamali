import React, { useState } from 'react';
import { Package, Truck, CheckCircle, MapPin, Search } from 'lucide-react';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const orders = [
    {
      id: 'ORD-7721-XA',
      date: 'May 1, 2026',
      total: 'KES 2,750',
      status: 'In Transit',
      items: [
        { name: 'Red Tomatoes', qty: '5kg', price: 'KES 250' },
        { name: 'Hass Avocados', qty: '10 pcs', price: 'KES 250' }
      ],
      deliveryStatus: 'Courier is 2km away',
      location: 'Kilimani, Nairobi'
    },
    {
      id: 'ORD-7719-ZB',
      date: 'April 25, 2026',
      total: 'KES 15,400',
      status: 'Delivered',
      items: [
        { name: 'Maize Grains', qty: '5 bags', price: 'KES 15,000' }
      ],
      deliveryStatus: 'Delivered at 2:30 PM',
      location: 'Kilimani, Nairobi'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary dark:text-accent">My Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your purchases and delivery status.</p>
        </div>
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
      </div>

      <div className="space-y-6">
        {orders
          .filter(o =>
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map((order) => (
          <div key={order.id} className="card overflow-hidden">
            <div className="bg-white/30 dark:bg-white/5 px-6 py-4 border-b border-white/20 flex flex-col md:flex-row justify-between md:items-center gap-4 backdrop-blur-sm">
              <div className="flex flex-wrap gap-6 text-sm font-semibold">
                <div>
                  <p className="text-gray-400 dark:text-gray-500 uppercase text-[10px]">Order Date</p>
                  <p className="text-primary dark:text-accent">{order.date}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-500 uppercase text-[10px]">Order ID</p>
                  <p className="text-primary dark:text-accent">{order.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-500 uppercase text-[10px]">Total Amount</p>
                  <p className="text-primary dark:text-accent">{order.total}</p>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase ${
                order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {order.status}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Items Ordered</h4>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 glass rounded-md">
                          <Package className="w-5 h-5 text-primary dark:text-accent" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.qty}</p>
                        </div>
                      </div>
                      <span className="font-bold text-primary dark:text-accent">{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="glass p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tracking Info</h4>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${order.status === 'Delivered' ? 'bg-green-500 text-white' : 'bg-accent text-white'}`}>
                        {order.status === 'Delivered' ? <CheckCircle className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-primary dark:text-accent">{order.deliveryStatus}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <MapPin className="w-3 h-3" />
                        {order.location}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`📍 Tracking Map\n\nOrder: ${order.id}\nStatus: ${order.deliveryStatus}\nLocation: ${order.location}\n\nLive tracking will be available once the courier starts the delivery.`)}
                    className="w-full py-2 glass text-primary dark:text-accent font-bold rounded-md text-xs hover:bg-primary hover:text-white transition-all"
                  >
                    View Tracking Map
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
