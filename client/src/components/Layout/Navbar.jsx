import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-primary text-white shadow-lg px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button className="md:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <Link to="/" className="text-2xl font-bold tracking-tight">
          Uza<span className="text-highlight">Mali</span>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        {user?.role === 'buyer' && (
          <Link to="/cart" className="relative hover:text-highlight transition-colors">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-highlight text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              0
            </span>
          </Link>
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
            <Link to="/register" className="btn-highlight py-1 px-4">Join Us</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
