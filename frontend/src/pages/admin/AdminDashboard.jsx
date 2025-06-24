import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiUsers, FiClipboard, FiAlertTriangle } from 'react-icons/fi';
import TeacherList from './components/TeacherList';

const StatCard = ({ icon, title, value, subtitle }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full">
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalSchedules: 0,
    pendingSubstitutions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/dashboard/stats'); 
        setStats(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch admin statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }


  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<FiUsers size={24} />}
          title="Total Teachers"
          value={stats.totalTeachers}
          subtitle="Active teachers in the school"
        />
         <StatCard 
          icon={<FiClipboard size={24} />}
          title="Total Schedules"
          value={stats.totalSchedules}
          subtitle="Schedules created this week"
        />
         <StatCard 
          icon={<FiAlertTriangle size={24} />}
          title="Pending Requests"
          value={stats.pendingSubstitutions}
          subtitle="Substitutions needing approval"
        />
      </div>

      {/* Teacher List Component */}
      <TeacherList />
    </div>
  );
};

export default AdminDashboard; 