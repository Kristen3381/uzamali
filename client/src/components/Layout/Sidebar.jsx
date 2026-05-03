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
  Package,
  History
} from 'lucide-react';

const Sidebar = () => {
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
    switch (user?.role) {
      case 'farmer': return farmerLinks;
      case 'buyer': return buyerLinks;
      case 'courier': return courierLinks;
      case 'admin': return adminLinks;
      default: return [{ to: '/market', icon: Store, label: 'Marketplace' }];
    }
  };

  const activeStyle = "flex items-center gap-3 px-4 py-3 bg-accent bg-opacity-20 text-primary border-r-4 border-primary font-bold transition-all";
  const inactiveStyle = "flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-primary-light hover:text-primary transition-all";

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm min-h-full">
      <div className="py-6">
        <nav className="flex flex-col">
          {getLinks().map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
