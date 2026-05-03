import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMenuClick={toggleSidebar} />
      <div className="flex flex-1 relative">
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}
        
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
