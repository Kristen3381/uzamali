import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, LogOut, Menu, MessageSquare, Leaf } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, maliPoints } = useAuth();

  return (
    <nav className="bg-[#13382E] border-b border-[#1F5243] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden text-[#A3B8B0] hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <Link to="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
          <span className="bg-[#226351] text-[#E5A93B] p-1.5 rounded-lg border border-[#1F5243]">
            <Leaf className="w-5 h-5 fill-[#E5A93B]" />
          </span>
          <span>Uza<span className="text-[#E5A93B]">Mali</span></span>
        </Link>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {user && (
          <Link to="/rewards" className="hidden sm:flex items-center gap-2 bg-[#226351]/50 hover:bg-[#226351] px-3.5 py-1.5 rounded-full transition-all border border-[#1F5243] group">
            <Leaf className="w-4 h-4 text-[#E5A93B] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-black text-white">{maliPoints} <span className="font-normal text-[#A3B8B0] text-xs">pts</span></span>
          </Link>
        )}

        {user?.role === 'buyer' && (
          <>
            <Link to="/messages" className="text-[#A3B8B0] hover:text-white transition-colors relative p-1.5 hover:bg-[#226351]/40 rounded-lg" title="Courier Chat">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1 right-1 bg-[#E5A93B] w-2 h-2 rounded-full"></span>
            </Link>
            <Link to="/cart" className="relative text-[#A3B8B0] hover:text-white transition-colors p-1.5 hover:bg-[#226351]/40 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-[#E5A93B] text-[#0B251D] text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                0
              </span>
            </Link>
          </>
        )}
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-xs text-[#A3B8B0] capitalize">{user.role}</p>
            </div>
            <button 
              onClick={logout}
              className="text-[#A3B8B0] hover:text-[#E5A93B] p-2 hover:bg-[#226351]/40 rounded-lg transition-colors flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-[#A3B8B0] hover:text-white font-semibold text-sm px-3 py-1.5">Login</Link>
            <Link to="/register" className="bg-[#E5A93B] text-[#0B251D] font-extrabold py-1.5 px-4 rounded-xl text-sm hover:bg-[#f5b84c] transition-all shadow-md">Join Us</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

