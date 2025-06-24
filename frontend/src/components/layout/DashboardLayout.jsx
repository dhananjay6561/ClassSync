import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiUser, FiSettings, FiLogOut, FiHelpCircle, FiBell, FiUsers, FiCalendar, FiRepeat, FiBookOpen, FiClipboard, FiInfo } from 'react-icons/fi';

// Dummy components for missing pages
const Dummy = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400">
    <FiInfo className="text-6xl mb-4" />
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p className="text-lg">Coming soon...</p>
  </div>
);

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center justify-center border-b border-gray-100">
            <NavLink to="/" className="text-2xl font-bold text-indigo-600 tracking-tight">
              <span>ClassSync</span>
            </NavLink>
          </div>
          <nav className="mt-6 flex flex-col gap-1 px-4">
            {/* Admin Sidebar */}
            {user?.role === 'admin' && (
              <>
                <NavLink to="/admin/dashboard" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}` }>
                  <FiHome /> Dashboard
                </NavLink>
                <NavLink to="/admin/manage-teachers" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}` }>
                  <FiUsers /> Teachers
                </NavLink>
                <NavLink to="/admin/manage-leaves" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}` }>
                  <FiClipboard /> Leave Requests
                </NavLink>
                <NavLink to="/admin/substitutions" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}` }>
                  <FiRepeat /> Substitutions
                </NavLink>
              </>
            )}
            {/* Teacher Sidebar */}
            {user?.role === 'teacher' && (
              <>
                <NavLink to="/teacher/my-schedule" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}` }>
                  <FiBookOpen /> My Schedule
                </NavLink>
                <NavLink to="/teacher/apply-leave" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}` }>
                  <FiClipboard /> Apply Leave
                </NavLink>
                <NavLink to="/teacher/substitutions" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}` }>
                  <FiRepeat /> Substitutions
                </NavLink>
              </>
            )}
          </nav>
        </div>
        {/* User Profile Bottom Left */}
        <div className="p-4 border-t border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xl font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{user?.name}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
          <button onClick={handleLogout} title="Logout" className="ml-2 text-red-500 hover:text-red-700">
            <FiLogOut size={20} />
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b flex items-center justify-end px-8">
          <div className='flex items-center gap-6'>
            <button className="relative text-gray-600 hover:text-gray-800">
              <FiBell size={24} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>
          </div>
        </header>
        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 