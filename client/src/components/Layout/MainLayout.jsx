import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Store,
  Trash2,
  Calculator,
  PlusCircle,
  Package,
  Truck,
  ShieldCheck,
  History,
  MessageSquare,
  Gift,
  X,
  LogOut
} from 'lucide-react';

const MobileDropdown = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  const handleWasteClick = () => {
    alert('♻️ Waste Exchange coming soon! Farmers will be able to list and trade agro-waste for biogas, briquettes, and silage.');
    onClose();
  };

  const farmerLinks = [
    { to: '/farmer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/farmer/products', icon: Package, label: 'My Products' },
    { to: '/market', icon: Store, label: 'Produce Market' },
    { to: '/farmer/add-product', icon: PlusCircle, label: 'Add Product' },
    { to: '/rewards', icon: Gift, label: 'Rewards Store' },
    { to: '/pricing-tool', icon: Calculator, label: 'Pricing Tool' },
    { to: '#', icon: Trash2, label: 'Waste Exchange', onClick: handleWasteClick },
  ];

  const buyerLinks = [
    { to: '/market', icon: Store, label: 'Produce Market' },
    { to: '/orders', icon: History, label: 'My Orders' },
    { to: '/messages', icon: MessageSquare, label: 'Courier Chat' },
    { to: '/rewards', icon: Gift, label: 'Rewards Store' },
    { to: '/pricing-tool', icon: Calculator, label: 'Pricing Tool' },
    { to: '#', icon: Trash2, label: 'Waste Exchange', onClick: handleWasteClick },
  ];

  const courierLinks = [
    { to: '/courier/dashboard', icon: Truck, label: 'Jobs Dashboard' },
    { to: '/messages', icon: MessageSquare, label: 'Client Chat' },
    { to: '/pricing-tool', icon: Calculator, label: 'Pricing Tool' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: ShieldCheck, label: 'Admin Panel' },
    { to: '/market', icon: Store, label: 'View Market' },
  ];

  const getLinks = () => {
    if (!user) {
      return [
        { to: '/market', icon: Store, label: 'Produce Market' },
        { to: '/farmer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/farmer/add-product', icon: PlusCircle, label: 'Add Product' },
        { to: '/rewards', icon: Gift, label: 'Rewards Store' },
        { to: '/pricing-tool', icon: Calculator, label: 'Pricing Tool' },
      ];
    }
    switch (user?.role) {
      case 'farmer': return farmerLinks;
      case 'buyer': return buyerLinks;
      case 'courier': return courierLinks;
      case 'admin': return adminLinks;
      default: return [{ to: '/market', icon: Store, label: 'Marketplace' }];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 md:hidden" onClick={onClose}>
      <div
        ref={dropdownRef}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-0 left-0 right-0 glass shadow-2xl border-b border-white/20 animate-slideDown origin-top"
        style={{ animation: 'slideDown 0.25s ease-out' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <span className="text-lg font-bold text-primary dark:text-accent">Navigation</span>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="py-2 max-h-[70vh] overflow-y-auto">
          {getLinks().map((link) =>
            link.onClick ? (
              <button
                key={link.to}
                onClick={link.onClick}
                className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-white/5 transition-colors text-left"
              >
                <link.icon className="w-5 h-5 shrink-0 text-primary dark:text-accent" />
                <span className="font-semibold">{link.label}</span>
              </button>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-primary dark:text-accent border-l-4 border-accent font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-white/5'
                  }`
                }
              >
                <link.icon className="w-5 h-5 shrink-0" />
                <span className="font-semibold">{link.label}</span>
              </NavLink>
            )
          )}
        </nav>
        {user && (
          <div className="border-t border-white/20 p-4 flex items-center justify-between">
            <div className="text-sm">
              <p className="font-bold text-primary dark:text-accent">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
            <button
              onClick={() => { logout(); onClose(); }}
              className="flex items-center gap-1 text-sm text-red-400 hover:text-red-600 font-semibold"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const MainLayout = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <style>{`
        @keyframes slideDown {
          from { transform: scaleY(0); opacity: 0; }
          to { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
      <Navbar onMenuClick={() => setIsDropdownOpen(!isDropdownOpen)} />
      <MobileDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} />
      <div className="flex flex-1 relative">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className={`flex-1 p-4 md:p-8 overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'md:ml-0' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
