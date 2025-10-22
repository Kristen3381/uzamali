import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="dashboard-container">
        <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <div className="logo">
              🚜 {!isSidebarCollapsed && <h2>Uza Mali</h2>}
            </div>
            <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
              {isSidebarCollapsed ? '▶' : '◀'}
            </button>
          </div>
          <nav className="sidebar-nav">
            <Link href="/dashboard" className={router.pathname === '/dashboard' ? 'active' : ''}>
              <div>
                <span>📊</span> {!isSidebarCollapsed && 'Dashboard'}
              </div>
            </Link>
            <Link href="/produce-market" className={router.pathname === '/produce-market' ? 'active' : ''}>
              <div>
                <span>🥬</span> {!isSidebarCollapsed && 'Produce Market'}
              </div>
            </Link>
            <Link href="/waste-exchange" className={router.pathname === '/waste-exchange' ? 'active' : ''}>
              <div>
                <span>♻️</span> {!isSidebarCollapsed && 'Waste Exchange'}
              </div>
            </Link>
            <Link href="/messages" className={router.pathname === '/messages' ? 'active' : ''}>
              <div>
                <span>💬</span> {!isSidebarCollapsed && 'Messages'}
              </div>
            </Link>
            <Link href="/waste-id" className={router.pathname === '/waste-id' ? 'active' : ''}>
              <div>
                <span>🆔</span> {!isSidebarCollapsed && 'Waste ID'}
              </div>
            </Link>
            <Link href="/pricing-tool" className={router.pathname === '/pricing-tool' ? 'active' : ''}>
              <div>
                <span>💰</span> {!isSidebarCollapsed && 'Pricing Tool'}
              </div>
            </Link>
            <Link href="/yield-forecaster" className={router.pathname === '/yield-forecaster' ? 'active' : ''}>
              <div>
                <span>📈</span> {!isSidebarCollapsed && 'Yield Forecaster'}
              </div>
            </Link>
            <button className="add-product-btn">
              <div>
                <span>➕</span> {!isSidebarCollapsed && 'Add Product'}
              </div>
            </button>
          </nav>
        </div>
        <div className="main-content">
          <div className="header">
            <div className="user-info" onClick={toggleDropdown} ref={dropdownRef}>
              <span>👤 User</span>
              {isDropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-email">{user?.email}</div>
                  <Link href="/profile">Profile</Link>
                  <Link href="/orders">My Orders</Link>
                  <div>Mali Points: 150</div>
                  <Link href="/billing">Billing</Link>
                  <Link href="/settings">Settings</Link>
                  <div className="dark-mode-toggle">
                    <label>
                      <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
                      Dark Mode
                    </label>
                  </div>
                  <button onClick={handleLogout}>Log out</button>
                </div>
              )}
            </div>
          </div>
          <div className="content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
