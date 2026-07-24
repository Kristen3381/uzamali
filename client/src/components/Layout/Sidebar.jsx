import React from 'react';
import { NavLink } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ collapsed, onToggleCollapse }) => {
  const { user } = useAuth();

  const farmerLinks = [
    { to: '/farmer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/farmer/products', icon: Package, label: 'My Products' },
    { to: '/market', icon: Store, label: 'Produce Market' },
    { to: '/waste-exchange', icon: Trash2, label: 'Waste Exchange' },
    { to: '/farmer/add-product', icon: PlusCircle, label: 'Add Product' },
    { to: '/rewards', icon: Gift, label: 'Rewards Store' },
    { to: '/pricing-tool', icon: Calculator, label: 'Pricing Tool' },
  ];

  const buyerLinks = [
    { to: '/market', icon: Store, label: 'Produce Market' },
    { to: '/waste-exchange', icon: Trash2, label: 'Waste Exchange' },
    { to: '/orders', icon: History, label: 'My Orders' },
    { to: '/messages', icon: MessageSquare, label: 'Courier Chat' },
    { to: '/rewards', icon: Gift, label: 'Rewards Store' },
    { to: '/pricing-tool', icon: Calculator, label: 'Pricing Tool' },
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
        { to: '/waste-exchange', icon: Trash2, label: 'Waste Exchange' },
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

  return (
    <aside className={`
      hidden md:flex flex-col bg-[#13382E] border-r border-[#1F5243]
      transition-all duration-300 ease-in-out
      ${collapsed ? 'w-20' : 'w-64'}
    `}>
      <div className="flex flex-col h-full">
        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="flex flex-col items-stretch space-y-1">
            {getLinks().map((link) =>
              link.onClick ? (
                <button
                  key={link.to}
                  title={collapsed ? link.label : undefined}
                  onClick={link.onClick}
                  className={`sidebar-link-inactive w-full text-left flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-start'}`}
                >
                  <link.icon className="w-5 h-5 shrink-0 text-[#A3B8B0]" />
                  <span className={`${collapsed ? 'hidden' : ''}`}>{link.label}</span>
                </button>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  title={collapsed ? link.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-start'} ${
                      isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                    }`
                  }
                >
                  <link.icon className="w-5 h-5 shrink-0" />
                  <span className={`${collapsed ? 'hidden' : ''}`}>{link.label}</span>
                </NavLink>
              )
            )}
          </nav>
        </div>

        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center p-4 border-t border-[#1F5243] text-[#A3B8B0] hover:text-[#E5A93B] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

