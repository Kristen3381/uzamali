import React, { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Plus,
  ArrowRight,
  Leaf
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyProducts } from '../../services/productService';
import { getMyOrders } from '../../services/orderService';

const FarmerDashboard = () => {
  const { maliPoints } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, ords] = await Promise.all([getMyProducts(), getMyOrders()]);
        setProducts(prods);
        setOrders(ords);
      } catch {
        // silently fail, show empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalListings = products.length;
  const activeListings = products.filter((p) => p.status === 'available').length;
  const totalSales = orders
    .filter((o) => o.status === 'confirmed')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const stats = [
    { label: 'Total Listings', value: totalListings, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', link: '/farmer/products' },
    { label: 'Active Listings', value: activeListings, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', link: '/farmer/products' },
    { label: 'Total Sales', value: `KES ${totalSales.toLocaleString()}`, icon: TrendingUp, color: 'text-primary dark:text-accent', bg: 'bg-primary-light dark:bg-primary/20' },
    { label: 'Orders Pending', value: pendingOrders, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  ];

  const recentOrders = orders.slice(0, 5);

  const statusBadge = (status) => {
    const map = {
      'pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'confirmed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400 text-lg">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary dark:text-accent">Farmer Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of your produce listings and sales performance.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass p-2 px-4 rounded-xl flex items-center gap-2 shadow-sm">
            <Leaf className="w-5 h-5 text-primary dark:text-accent fill-current" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-1">Mali Points</p>
              <p className="text-lg font-black text-primary dark:text-accent leading-none">{maliPoints}</p>
            </div>
          </div>
          <Link to="/farmer/add-product" className="btn-primary flex items-center justify-center gap-2 py-3 px-6 shadow-md hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const content = (
            <div className={`card flex items-center gap-4 p-6 ${stat.link ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}>
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">{stat.value}</p>
              </div>
            </div>
          );
          return stat.link ? (
            <Link key={stat.label} to={stat.link}>{content}</Link>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="p-6 border-b border-white/20 flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary dark:text-accent">Recent Orders</h2>
            <button onClick={() => navigate('/orders')} className="text-accent hover:underline text-sm font-bold flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No orders yet</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/30 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Buyer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm dark:text-gray-300">#{order._id.slice(-6)}</td>
                    <td className="px-6 py-4 font-semibold text-primary dark:text-accent">{order.listing?.title || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{order.buyer?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">KES {order.totalPrice?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Inventory Summary */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-primary dark:text-accent mb-6">Inventory Status</h2>
          {products.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No products listed</p>
              <Link to="/farmer/add-product" className="text-accent font-bold text-sm hover:underline mt-2 inline-block">
                Add your first product
              </Link>
            </div>
          ) : (
          <div className="space-y-6">
            {products.slice(0, 5).map((product) => {
              const used = product.quantity - (product.quantityAvailable ?? product.quantity);
              const pct = product.quantity > 0 ? Math.round(((used) / product.quantity) * 100) : 0;
              return (
                <div key={product._id}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-600 dark:text-gray-400 truncate">{product.name} ({product.unit})</span>
                    <span className="text-primary dark:text-accent font-bold">{product.quantity}</span>
                  </div>
                  <div className="w-full bg-white/30 dark:bg-white/10 h-2 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="bg-accent h-full" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
          {products.length > 0 && (
          <div className="mt-8 p-4 glass rounded-lg border border-white/20">
            <h4 className="font-bold text-primary dark:text-accent text-sm mb-2">Quick Summary</h4>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              You have {activeListings} active {activeListings === 1 ? 'product' : 'products'} listed on the marketplace.
              {pendingOrders > 0 && ` ${pendingOrders} ${pendingOrders === 1 ? 'order' : 'orders'} pending action.`}
            </p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
