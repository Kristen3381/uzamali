import React from 'react';
import { 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FarmerDashboard = () => {
  const stats = [
    { label: 'Total Listings', value: '12', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Listings', value: '8', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Sales', value: 'KES 45,200', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary-light' },
    { label: 'Orders Pending', value: '3', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  ];

  const recentOrders = [
    { id: 'ORD001', product: 'Red Tomatoes', buyer: 'Alice Wangari', status: 'Pending', price: 'KES 2,500', date: '2026-05-01' },
    { id: 'ORD002', product: 'Maize Grains', buyer: 'Bob Kamau', status: 'Delivered', price: 'KES 15,000', date: '2026-04-28' },
    { id: 'ORD003', product: 'Avocados', buyer: 'Grace Njeri', status: 'In Transit', price: 'KES 1,200', date: '2026-05-02' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Farmer Dashboard</h1>
          <p className="text-gray-600">Overview of your produce listings and sales performance.</p>
        </div>
        <Link to="/farmer/add-product" className="btn-primary flex items-center justify-center gap-2 py-3 px-6 shadow-md hover:scale-105 transition-transform">
          <Plus className="w-5 h-5" />
          Add New Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border-2 border-primary-light shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border-2 border-primary-light shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">Recent Orders</h2>
            <button className="text-accent hover:underline text-sm font-bold flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Buyer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">{order.id}</td>
                    <td className="px-6 py-4 font-semibold text-primary">{order.product}</td>
                    <td className="px-6 py-4 text-gray-600">{order.buyer}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">{order.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white rounded-xl border-2 border-primary-light shadow-sm p-6">
          <h2 className="text-xl font-bold text-primary mb-6">Inventory Status</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-gray-600">Tomatoes (kg)</span>
                <span className="text-primary font-bold">85 / 100</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-accent h-full w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-gray-600">Maize (90kg Bags)</span>
                <span className="text-primary font-bold">12 / 50</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[24%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-gray-600">Avocados (Pieces)</span>
                <span className="text-primary font-bold">420 / 500</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-accent h-full w-[84%]"></div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-primary-light rounded-lg border border-primary border-opacity-20">
            <h4 className="font-bold text-primary text-sm mb-2">Insights</h4>
            <p className="text-xs text-gray-700">
              Tomatoes are selling fast! Consider updating your prices or increasing supply based on current demand in your area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
