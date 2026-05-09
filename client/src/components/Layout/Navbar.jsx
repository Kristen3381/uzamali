import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, LogOut, Menu, MessageSquare, Leaf } from 'lucide-react';
import ThemeToggle from '../UI/ThemeToggle';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, maliPoints } = useAuth();

  return (
    <nav className="bg-primary text-white shadow-lg px-4 py-3 flex items-center justify-between sticky top-0 z-50 transition-colors">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden hover:text-highlight transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <Link to="/" className="text-2xl font-bold tracking-tight">
          Uza<span className="text-highlight">Mali</span>
        </Link>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <ThemeToggle />
        
        {user && (
          <Link to="/rewards" className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all border border-white/10 group">
            <Leaf className="w-4 h-4 text-highlight group-hover:scale-110 transition-transform" />
            <span className="text-sm font-black tracking-tight">{maliPoints} <span className="font-medium opacity-80 ml-0.5">pts</span></span>
          </Link>
        )}

        {user?.role === 'buyer' && (
          <>
            <Link to="/messages" className="hover:text-highlight transition-colors relative" title="Courier Chat">
              <MessageSquare className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-primary"></span>
            </Link>
            <Link to="/cart" className="relative hover:text-highlight transition-colors">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-highlight text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                0
              </span>
            </Link>
          </>
        )}
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-gray-300 capitalize">{user.role}</p>
            </div>
            <button 
              onClick={logout}
              className="hover:text-highlight transition-colors flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-highlight font-semibold">Login</Link>
            <Link to="/register" className="btn-highlight py-1 px-4 text-sm md:text-base">Join Us</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
