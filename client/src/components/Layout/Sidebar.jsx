import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Store, 
  Trash2, 
  Calculator, 
  PlusCircle, 
  Truck, 
  ShieldCheck,
  History,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const farmerLinks = [
    { to: '/farmer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/market', icon: Store, label: 'Produce Market' },
    { to: '/farmer/add-product', icon: PlusCircle, label: 'Add Product' },
    { to: '/pricing-tool', icon: Calculator, label: 'Pricing Tool' },
    { to: '#', icon: Trash2, label: 'Waste Exchange' },
  ];

  const buyerLinks = [
    { to: '/market', icon: Store, label: 'Produce Market' },
    { to: '/orders', icon: History, label: 'My Orders' },
    { to: '/pricing-tool', icon: Calculator, label: 'Pricing Tool' },
    { to: '#', icon: Trash2, label: 'Waste Exchange' },
  ];

  const courierLinks = [
    { to: '/courier/dashboard', icon: Truck, label: 'Jobs Dashboard' },
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

  const activeStyle = "flex items-center gap-3 px-4 py-3 bg-accent/20 text-primary border-r-4 border-primary font-bold transition-all";
  const inactiveStyle = "flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-primary-light hover:text-primary transition-all";

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0 md:shadow-none
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 md:hidden border-b border-gray-100">
          <span className="text-xl font-bold text-primary">Menu</span>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-primary">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="py-6 overflow-y-auto">
          <nav className="flex flex-col">
            {getLinks().map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
                onClick={() => {
                  if (window.innerWidth < 768) onClose();
                }}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
