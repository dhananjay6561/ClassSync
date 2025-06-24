import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiUser, FiSettings, FiLogOut, FiHelpCircle, FiBell } from 'react-icons/fi';

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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white shadow-md flex flex-col">
        <div className="h-20 flex items-center justify-center border-b">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            ClassSync
          </Link>
        </div>
        <div className="flex-grow p-4">
          <div className="mb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-500 text-white flex items-center justify-center mx-auto mb-2 text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h3 className="text-lg font-semibold">{user?.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
          </div>
          <nav className="space-y-2">
            <Link to="/teacher/dashboard" className="flex items-center p-3 text-gray-700 bg-indigo-50 rounded-lg">
              <FiHome className="mr-3" /> Dashboard
            </Link>
            <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <FiUser className="mr-3" /> Profile
            </Link>
            <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <FiSettings className="mr-3" /> Settings
            </Link>
             <Link to="#" className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
              <FiHelpCircle className="mr-3" /> Help & Support
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex items-center p-3 text-red-500 hover:bg-red-50 w-full rounded-lg">
            <FiLogOut className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-20 bg-white border-b flex items-center justify-end px-8">
            <div className='flex items-center gap-6'>
                <button className="relative text-gray-600 hover:text-gray-800">
                    <FiBell size={24} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full"></span>
                </button>

                {/* Avatar Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(prev => !prev)} className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                            <div className="px-4 py-2 border-b">
                                <p className="font-semibold">{user?.name}</p>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                            <Link to="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <FiUser className="mr-2" /> Profile
                            </Link>
                            <Link to="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <FiSettings className="mr-2" /> Settings
                            </Link>
                            <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-100">
                                <FiLogOut className="mr-2" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 