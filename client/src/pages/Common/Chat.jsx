import React, { useState } from 'react';
import { Send, Phone, User, Search, MapPin } from 'lucide-react';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState(0);

  const chats = [
    { id: 0, name: 'Kevin Kip (Courier)', lastMsg: 'I am 2 minutes away from the farm.', time: '2:15 PM', status: 'Online', avatar: 'KK' },
    { id: 1, name: 'Alice Omolo (Courier)', lastMsg: 'Order #7719 has been delivered.', time: 'Yesterday', status: 'Offline', avatar: 'AO' },
  ];

  const messages = [
    { id: 1, text: 'Hello, Kevin! Are you near the pickup point?', sender: 'me', time: '2:10 PM' },
    { id: 2, text: 'Yes, I am 2 minutes away from the farm. Please ensure the crates are ready.', sender: 'them', time: '2:15 PM' },
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex glass rounded-xl shadow-sm overflow-hidden">
      {/* Chat List */}
      <div className="w-full md:w-80 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full pl-9 pr-4 py-2 input-field border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                activeChat === chat.id ? 'bg-accent/10 backdrop-blur-sm' : 'hover:bg-white/20 dark:hover:bg-white/5'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold shadow-sm">
                {chat.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-primary dark:text-accent truncate">{chat.name}</h4>
                  <span className="text-[10px] text-gray-400 font-semibold">{chat.time}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{chat.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="hidden md:flex flex-1 flex-col">
        <div className="p-4 glass border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold">
              {chats[activeChat].avatar}
            </div>
            <div>
              <h3 className="font-bold text-primary dark:text-accent">{chats[activeChat].name}</h3>
              <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                {chats[activeChat].status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`📞 Initiating call with ${chats[activeChat].name}...`)}
              className="p-2 text-primary dark:text-accent hover:bg-white/20 rounded-full transition-colors"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={() => alert(`📍 Live location sharing with ${chats[activeChat].name} coming soon.`)}
              className="p-2 text-primary dark:text-accent hover:bg-white/20 rounded-full transition-colors"
            >
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                msg.sender === 'me' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'glass rounded-tl-none'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-primary-light/70' : 'text-gray-400'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 glass border-t border-white/10">
          <form 
            onSubmit={(e) => { e.preventDefault(); setMessage(''); }}
            className="flex items-center gap-3"
          >
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-1 input-field border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="p-3 bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-md">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
