import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Clock, 
  Receipt, 
  MessageSquare,
  Phone,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../../services/orderService';
import { imageUrl } from '../../services/productService';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getMyOrders();
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status, escrowStatus) => {
    if (escrowStatus === 'released') {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-black bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Completed (Escrow Released)
        </span>
      );
    }
    if (status === 'confirmed' || escrowStatus === 'held') {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-950/80 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Confirmed (Escrow Held)
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-lg text-xs font-black bg-yellow-950/80 text-yellow-400 border border-yellow-500/30 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" /> Order Pending
      </span>
    );
  };

  const filteredOrders = orders.filter((o) => {
    const titleMatch = o.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       o.listing?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       o._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'confirmed') return titleMatch && (o.status === 'confirmed' || o.escrowStatus === 'held');
    if (activeFilter === 'completed') return titleMatch && o.escrowStatus === 'released';
    return titleMatch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1F5243] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A93B]/20 border border-[#E5A93B]/40 text-[#E5A93B] text-xs font-black uppercase tracking-wider mb-2">
            <Package className="w-4 h-4" />
            Buyer Order Ledger
          </div>
          <h1 className="text-3xl font-black text-white">My Purchase History</h1>
          <p className="text-sm text-[#A3B8B0]">Track your farm produce and agro-waste orders, delivery status, and communicate directly with assigned couriers.</p>
        </div>

        <Link
          to="/market"
          className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Browse Produce Market
        </Link>
      </div>

      {/* Controls: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: `All Orders (${orders.length})` },
            { id: 'confirmed', label: 'Escrow Protected' },
            { id: 'completed', label: 'Completed Deliveries' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-[#E5A93B] text-[#0B251D] shadow-md'
                  : 'bg-[#13382E] text-[#A3B8B0] border border-[#1F5243] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3B8B0] w-4 h-4" />
          <input
            type="text"
            placeholder="Search order ID or crop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#13382E] border border-[#1F5243] rounded-xl text-xs text-white placeholder-[#A3B8B0] focus:outline-none focus:border-[#E5A93B]"
          />
        </div>
      </div>

      {/* Order List Display */}
      {loading ? (
        <div className="text-center py-16 text-[#A3B8B0] flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#E5A93B]" />
          Loading your order history...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-[#13382E] border border-[#1F5243] rounded-2xl p-8">
          <Package className="w-12 h-12 text-[#226351] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Orders Found</h3>
          <p className="text-xs text-[#A3B8B0] max-w-sm mx-auto mb-5">
            You haven't placed any orders matching this criteria yet.
          </p>
          <Link to="/market" className="btn-primary py-2.5 px-5 text-xs inline-flex items-center gap-2">
            Explore Produce Market
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div 
              key={order._id}
              className="bg-[#13382E] border border-[#1F5243] rounded-2xl overflow-hidden shadow-xl hover:border-[#226351] transition-all"
            >
              {/* Order Card Header */}
              <div className="bg-[#0B251D] p-4 border-b border-[#1F5243] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-[#A3B8B0]">
                  <div>
                    <span>Order Ref: </span>
                    <strong className="text-white font-mono">#{String(order._id).slice(-8)}</strong>
                  </div>
                  <div>
                    <span>Placed Date: </span>
                    <strong className="text-white">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                    </strong>
                  </div>
                  {order.paymentRef && (
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Receipt className="w-3.5 h-3.5" />
                      {order.paymentRef}
                    </div>
                  )}
                </div>

                <div>
                  {getStatusBadge(order.status, order.escrowStatus)}
                </div>
              </div>

              {/* Order Details Body */}
              <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <img 
                    src={imageUrl(order.listing?.images?.[0]) || 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=200'} 
                    alt={order.listing?.title || 'Ordered Commodity'}
                    className="w-20 h-20 object-cover rounded-xl border border-[#1F5243] bg-[#0B251D] shrink-0"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=200'; }}
                  />

                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base">
                      {order.listing?.title || order.listing?.name || 'Farm Commodity Order'}
                    </h3>
                    <p className="text-xs text-[#A3B8B0] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#E5A93B]" />
                      Farmer: <strong className="text-white">{order.farmer?.name || 'Verified Farmer'}</strong> ({order.farmer?.location || order.listing?.location || 'Kenya'})
                    </p>
                    <p className="text-xs text-[#A3B8B0]">
                      Quantity Ordered: <strong className="text-white">{order.quantity} {order.listing?.unit || 'units'}</strong>
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto p-4 bg-[#0B251D] rounded-xl border border-[#1F5243] flex flex-row md:flex-col justify-between items-end gap-2 shrink-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-[#A3B8B0] uppercase font-bold">Total Payment</p>
                    <p className="text-xl font-black text-[#E5A93B]">KES {order.totalPrice?.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#A3B8B0] flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#E5A93B]" />
                      {order.deliveryMethod === 'pickup' ? 'Self Pickup' : 'Courier Logistics'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Courier Interaction Bar */}
              {order.deliveryMethod === 'courier' && (
                <div className="px-5 py-3.5 bg-[#0B251D]/80 border-t border-[#1F5243] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#226351] rounded-lg border border-[#1F5243] text-[#E5A93B]">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[#A3B8B0]">Assigned Courier: </span>
                      <strong className="text-white font-bold">{order.courier?.name || 'Kevin Courier (Uzamali Fleet)'}</strong>
                      {(order.courier?.phone || order.farmer?.phone) && (
                        <span className="text-[11px] text-[#A3B8B0] ml-1">({order.courier?.phone || order.farmer?.phone})</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Calling Courier Driver: ${order.courier?.phone || '+254733333333'}...`)}
                      className="px-3.5 py-2 rounded-xl bg-[#226351]/40 border border-[#1F5243] text-white hover:bg-[#226351] font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#E5A93B]" /> Call Driver
                    </button>

                    <Link
                      to={`/chat/${order._id}`}
                      className="px-4 py-2 rounded-xl bg-[#E5A93B] hover:bg-[#d4982a] text-[#0B251D] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#E5A93B]/20 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#0B251D]" /> Chat with Courier
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
