import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, User, Search, MessageCircle, MapPin, Truck } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const SOCKET_URL = 'http://localhost:5000';

const Chat = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [activeOrderId, setActiveOrderId] = useState(() => orderId || localStorage.getItem('uzamali_active_chat_order') || null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        const courierOrders = data.orders?.filter(
          (o) => o.deliveryMethod === 'courier'
        ) || [];
        setOrders(courierOrders);
        if (!activeOrderId && courierOrders.length > 0) {
          const initialId = orderId || courierOrders[0]._id;
          setActiveOrderId(initialId);
          localStorage.setItem('uzamali_active_chat_order', initialId);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleSelectOrder = (id) => {
    setActiveOrderId(id);
    localStorage.setItem('uzamali_active_chat_order', id);
    navigate(`/chat/${id}`, { replace: true });
  };

  useEffect(() => {
    if (!activeOrderId) return;
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/messages/${activeOrderId}`);
        setMessages(data.messages || []);
      } catch {}
    };
    fetchMessages();
  }, [activeOrderId]);

  useEffect(() => {
    if (!activeOrderId) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('joinRoom', `order_${activeOrderId}`);
    socket.on('newMessage', (msg) => {
      const msgOrderId = msg.order?._id || msg.order;
      if (msgOrderId === activeOrderId) {
        setMessages((prev) => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });
    return () => {
      socket.emit('leaveRoom', `order_${activeOrderId}`);
      socket.disconnect();
    };
  }, [activeOrderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeOrderId || sending) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/${activeOrderId}`, { text: text.trim() });
      setMessages((prev) => {
        if (prev.some(m => m._id === data.message._id)) return prev;
        return [...prev, data.message];
      });
      setText('');
    } catch {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const activeOrder = orders.find((o) => o._id === activeOrderId);
  const listing = activeOrder?.listing || {};
  const farmer = activeOrder?.farmer || {};
  const buyer = activeOrder?.buyer || {};
  const farmerName = farmer.name || 'Farmer Vendor';
  const buyerName = buyer.name || 'Buyer Client';

  // Display names based on active user role
  const chatTitle = user?.role === 'courier' 
    ? `Farmer: ${farmerName}`
    : user?.role === 'farmer' 
    ? `Buyer: ${buyerName}` 
    : `Farmer: ${farmerName}`;

  const chatSubtitle = user?.role === 'courier'
    ? `Deliver to: ${buyerName} · ${listing.name || listing.title || 'Cargo Item'}`
    : `Item: ${listing.name || listing.title || 'Cargo Item'}`;

  const otherPhone = user?.role === 'courier' ? farmer.phone || buyer.phone : user?.role === 'farmer' ? buyer.phone : farmer.phone;

  return (
    <div className="h-[calc(100vh-120px)] flex bg-[#13382E] border border-[#1F5243] rounded-2xl shadow-xl overflow-hidden">
      {/* Sidebar Active Deliveries */}
      <div className="w-full md:w-80 border-r border-[#1F5243] flex flex-col bg-[#0B251D]/60">
        <div className="p-4 border-b border-[#1F5243] bg-[#0B251D]">
          <h3 className="font-bold text-white flex items-center gap-2 text-base">
            <MessageCircle className="w-5 h-5 text-[#E5A93B]" /> Active Deliveries Chat
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-[#A3B8B0] text-sm py-8">Loading chats...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-[#A3B8B0] text-sm py-8">No courier orders yet.</p>
          ) : (
            orders.map((o) => (
              <div
                key={o._id}
                onClick={() => handleSelectOrder(o._id)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-[#1F5243]/50 ${
                  activeOrderId === o._id ? 'bg-[#226351]/50 border-l-4 border-l-[#E5A93B]' : 'hover:bg-[#226351]/20'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#226351] border border-[#1F5243] flex items-center justify-center text-[#E5A93B] font-extrabold shrink-0">
                  {o.farmer?.name?.[0] || 'F'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-white truncate text-sm">
                      {o.listing?.name || o.listing?.title || `Order #${o._id?.slice(-6)}`}
                    </h4>
                  </div>
                  <p className="text-xs text-[#A3B8B0] truncate mt-0.5">
                    Farmer: <span className="text-white font-semibold">{o.farmer?.name || 'Farmer'}</span>
                  </p>
                  <p className="text-[10px] text-[#A3B8B0]/80 truncate">
                    Buyer: {o.buyer?.name || 'Buyer'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Conversation */}
      <div className="hidden md:flex flex-1 flex-col bg-[#13382E]">
        {!activeOrderId ? (
          <div className="flex-1 flex items-center justify-center text-[#A3B8B0]">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-[#226351]" />
              <p className="font-semibold text-white">Select a delivery order to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 bg-[#0B251D] border-b border-[#1F5243] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#226351] border border-[#1F5243] flex items-center justify-center text-[#E5A93B] font-extrabold text-lg">
                  {farmerName[0] || 'F'}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    {chatTitle}
                  </h3>
                  <span className="text-xs text-[#A3B8B0] font-medium">
                    {chatSubtitle}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {otherPhone && (
                  <button
                    onClick={() => alert(`Calling ${otherPhone}...`)}
                    className="p-2.5 text-[#E5A93B] bg-[#226351]/40 border border-[#1F5243] hover:bg-[#226351] rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title={`Call ${otherPhone}`}
                  >
                    <Phone className="w-4 h-4" /> Call
                  </button>
                )}
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0B251D]/40">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-10 h-10 text-[#226351] mx-auto mb-2" />
                  <p className="text-[#A3B8B0] text-sm">No messages saved yet for this delivery. Start communicating!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-3.5 rounded-2xl shadow-md ${
                      msg.sender?._id === user?._id
                        ? 'bg-[#E5A93B] text-[#0B251D] rounded-tr-none font-medium'
                        : 'bg-[#226351]/60 text-white border border-[#1F5243] rounded-tl-none'
                    }`}>
                      <p className="text-xs text-[#0B251D]/70 font-bold mb-1">
                        {msg.sender?.name || (msg.sender?._id === user?._id ? 'You' : 'Participant')}
                      </p>
                      <p className="text-sm font-semibold">{msg.text}</p>
                      <p className={`text-[10px] mt-1 text-right font-medium ${
                        msg.sender?._id === user?._id ? 'text-[#0B251D]/70' : 'text-[#A3B8B0]'
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-[#0B251D] border-t border-[#1F5243]">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 input-field"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="btn-primary p-3 rounded-xl disabled:opacity-50"
                >
                  <Send className="w-5 h-5 text-[#0B251D]" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;

