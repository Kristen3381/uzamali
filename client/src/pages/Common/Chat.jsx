import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, User, Search, MessageCircle, MapPin, Truck, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { getMyOrders } from '../../services/orderService';
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
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getMyOrders();
        const courierOrders = data?.filter(
          (o) => o.deliveryMethod === 'courier' || !o.deliveryMethod
        ) || [];
        setOrders(courierOrders);
        if (courierOrders.length > 0) {
          const targetId = orderId || activeOrderId || courierOrders[0]._id;
          setActiveOrderId(targetId);
          localStorage.setItem('uzamali_active_chat_order', targetId);
        }
      } catch (err) {
        console.error('Failed to load orders for chat', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [orderId]);

  const handleSelectOrder = (id) => {
    setActiveOrderId(id);
    localStorage.setItem('uzamali_active_chat_order', id);
    navigate(`/chat/${id}`, { replace: true });
  };

  useEffect(() => {
    if (!activeOrderId) return;

    const fetchMessages = async () => {
      const savedLocal = localStorage.getItem(`chat_msg_${activeOrderId}`);
      let localMsgs = savedLocal ? JSON.parse(savedLocal) : [];

      if (localMsgs.length === 0) {
        localMsgs = [
          {
            _id: `msg-${Date.now()}-1`,
            text: `Hello! I am assigned as courier for order #${String(activeOrderId).slice(-6)}. Cargo transport is scheduled.`,
            sender: { _id: 'courier-001', name: 'Kevin Courier (Uzamali Fleet)' },
            createdAt: new Date(Date.now() - 1800000).toISOString()
          }
        ];
      }

      try {
        const { data } = await api.get(`/messages/${activeOrderId}`);
        if (data.messages && data.messages.length > 0) {
          // Merge server messages with local messages without duplicates
          const serverIds = new Set(data.messages.map(m => m._id));
          const unsynced = localMsgs.filter(m => !serverIds.has(m._id));
          const combined = [...data.messages, ...unsynced];
          setMessages(combined);
          localStorage.setItem(`chat_msg_${activeOrderId}`, JSON.stringify(combined));
          return;
        }
      } catch (err) {
        console.warn('Backend messages API offline, serving local messages', err);
      }
      setMessages(localMsgs);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
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
          const updated = [...prev, msg];
          localStorage.setItem(`chat_msg_${activeOrderId}`, JSON.stringify(updated));
          return updated;
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

    const messageText = text.trim();
    let newMsg;

    try {
      const { data } = await api.post(`/messages/${activeOrderId}`, { text: messageText });
      newMsg = data.message;
    } catch {
      newMsg = {
        _id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        text: messageText,
        sender: { _id: user?._id || 'buyer-001', name: user?.name || 'Buyer Client' },
        createdAt: new Date().toISOString()
      };
    }

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      localStorage.setItem(`chat_msg_${activeOrderId}`, JSON.stringify(updated));
      return updated;
    });

    setText('');
    setSending(false);
  };

  const activeOrder = orders.find((o) => o._id === activeOrderId) || orders[0] || {};
  const listing = activeOrder.listing || {};
  const farmer = activeOrder.farmer || {};
  const buyer = activeOrder.buyer || {};
  const courier = activeOrder.courier || { name: 'Kevin Courier (Uzamali Fleet)', phone: '+254733333333' };

  const farmerName = farmer.name || 'Farmer Vendor';
  const buyerName = buyer.name || 'Buyer Client';
  const courierName = courier.name || 'Kevin Courier (Uzamali Fleet)';
  const courierPhone = courier.phone || '+254733333333';

  // Role-aware title formatting
  const chatHeaderTitle = user?.role === 'courier'
    ? `Client: ${buyerName}`
    : `Courier Driver: ${courierName}`;

  const chatHeaderSubtitle = user?.role === 'courier'
    ? `Pickup: ${farmerName} · Cargo: ${listing.title || listing.name || 'Agricultural Produce'}`
    : `Driver Contact: ${courierPhone} · ${listing.title || listing.name || 'Agricultural Produce'}`;

  return (
    <div className="h-[calc(100vh-120px)] flex bg-[#13382E] border border-[#1F5243] rounded-2xl shadow-xl overflow-hidden">
      {/* Sidebar Active Deliveries */}
      <div className="w-full md:w-80 border-r border-[#1F5243] flex flex-col bg-[#0B251D]/60">
        <div className="p-4 border-b border-[#1F5243] bg-[#0B251D]">
          <h3 className="font-bold text-white flex items-center gap-2 text-base">
            <Truck className="w-5 h-5 text-[#E5A93B]" /> Courier Deliveries Chat
          </h3>
          <p className="text-[11px] text-[#A3B8B0] mt-0.5">Real-time driver & buyer messaging</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-[#A3B8B0] text-sm py-8">Loading chats...</p>
          ) : orders.length === 0 ? (
            <div className="text-center text-[#A3B8B0] text-xs py-8 px-4">
              <MessageCircle className="w-8 h-8 text-[#226351] mx-auto mb-2" />
              <p className="font-bold text-white mb-1">No Courier Orders Yet</p>
              <p>Place an order with courier delivery to start chatting with driver.</p>
            </div>
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
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate text-sm">
                    {o.listing?.title || o.listing?.name || `Order #${String(o._id).slice(-6)}`}
                  </h4>
                  <p className="text-xs text-[#E5A93B] truncate mt-0.5 font-semibold">
                    Courier: {o.courier?.name || 'Kevin Courier'}
                  </p>
                  <p className="text-[10px] text-[#A3B8B0] truncate">
                    Farmer: {o.farmer?.name || 'Farmer Vendor'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#13382E]">
        {!activeOrderId ? (
          <div className="flex-1 flex items-center justify-center text-[#A3B8B0]">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-[#226351]" />
              <p className="font-semibold text-white">Select a delivery order to open chat</p>
            </div>
          </div>
        ) : (
          <>
            {/* Trip Fee & Escrow Banner */}
            <div className="bg-[#226351]/40 border-b border-[#1F5243] px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#E5A93B] bg-[#0B251D] px-2.5 py-1 rounded-lg border border-[#1F5243] flex items-center gap-1">
                  💰 Courier Trip Earnings: KES {(activeOrder.courierFee || activeOrder.totalPrice * 0.15 || 650).toLocaleString()}
                </span>
                <span className="text-[#A3B8B0] font-semibold hidden sm:inline">• Vehicle: <strong className="text-white capitalize">{activeOrder.vehicleType?.replace('_', ' ') || 'Motorcycle'}</strong></span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 uppercase">
                Escrow Protected ({activeOrder.escrowStatus || 'held'})
              </span>
            </div>

            {/* Chat Room Header */}
            <div className="p-4 bg-[#0B251D] border-b border-[#1F5243] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#226351] border border-[#1F5243] flex items-center justify-center text-[#E5A93B] font-extrabold text-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    {chatHeaderTitle}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                      VERIFIED LOGISTICS
                    </span>
                  </h3>
                  <span className="text-xs text-[#A3B8B0] font-medium">
                    {chatHeaderSubtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Calling ${courierPhone}...`)}
                  className="p-2.5 text-[#E5A93B] bg-[#226351]/40 border border-[#1F5243] hover:bg-[#226351] rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
                  title={`Call ${courierPhone}`}
                >
                  <Phone className="w-4 h-4" /> Call Driver ({courierPhone})
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0B251D]/40">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-10 h-10 text-[#226351] mx-auto mb-2" />
                  <p className="text-[#A3B8B0] text-sm">No messages yet. Send a message to coordinate pickup or delivery!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender?._id === user?._id || msg.sender?.name === user?.name;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] p-3.5 rounded-2xl shadow-md ${
                        isMine
                          ? 'bg-[#E5A93B] text-[#0B251D] rounded-tr-none font-medium'
                          : 'bg-[#226351]/80 text-white border border-[#1F5243] rounded-tl-none'
                      }`}>
                        <p className={`text-[10px] font-black mb-1 uppercase tracking-wider ${
                          isMine ? 'text-[#0B251D]/80' : 'text-[#E5A93B]'
                        }`}>
                          {msg.sender?.name || (isMine ? 'You' : 'Participant')}
                        </p>
                        <p className="text-sm font-semibold leading-relaxed">{msg.text}</p>
                        <p className={`text-[10px] mt-1.5 text-right font-medium ${
                          isMine ? 'text-[#0B251D]/70' : 'text-[#A3B8B0]'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-[#0B251D] border-t border-[#1F5243]">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type message to courier driver..."
                  className="flex-1 input-field"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="btn-primary p-3 rounded-xl disabled:opacity-50 flex items-center justify-center"
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
