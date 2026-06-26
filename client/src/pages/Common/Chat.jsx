import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, User, Search, MessageCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const SOCKET_URL = 'http://localhost:5000';

const Chat = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [activeOrderId, setActiveOrderId] = useState(orderId || null);
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
          setActiveOrderId(courierOrders[0]._id);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

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
      if (msg.order === activeOrderId || msg.order?._id === activeOrderId) {
        setMessages((prev) => [...prev, msg]);
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
      setMessages((prev) => [...prev, data.message]);
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
  const otherPerson = user?.role === 'courier' ? buyer : farmer;
  const otherName = otherPerson?.name || 'Unknown';
  const otherRole = otherPerson?.role || '';

  return (
    <div className="h-[calc(100vh-120px)] flex glass rounded-xl shadow-sm overflow-hidden">
      <div className="w-full md:w-80 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-bold text-primary dark:text-accent">Active Orders</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-8">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No courier orders yet.</p>
          ) : (
            orders.map((o) => (
              <div
                key={o._id}
                onClick={() => setActiveOrderId(o._id)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                  activeOrderId === o._id ? 'bg-accent/10 backdrop-blur-sm' : 'hover:bg-white/20 dark:hover:bg-white/5'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                  {o.farmer?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-primary dark:text-accent truncate text-sm">
                      {o.listing?.title || `Order #${o._id?.slice(-6)}`}
                    </h4>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {o.farmer?.name} → {o.buyer?.name}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="hidden md:flex flex-1 flex-col">
        {!activeOrderId ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select an order to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 glass border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                  {otherName[0] || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-primary dark:text-accent text-sm">{otherName}</h3>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                    {otherRole || 'Participant'} · {listing.title || ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Calling ${otherName} at ${otherPerson?.phone || 'N/A'}...`)}
                  className="p-2 text-primary dark:text-accent hover:bg-white/20 rounded-full transition-colors"
                  title={`Call ${otherName}`}
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No messages yet. Start a conversation!</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                      msg.sender?._id === user?._id
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'glass rounded-tl-none'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 text-right ${
                        msg.sender?._id === user?._id ? 'text-primary-light/70' : 'text-gray-400'
                      }`}>
                        {msg.sender?.name} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 glass border-t border-white/10">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 input-field border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="p-3 bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
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
