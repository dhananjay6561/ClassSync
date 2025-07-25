import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiUsers, FiCalendar, FiBookOpen, FiClock } from 'react-icons/fi';
import Toast from '../../components/ui/Toast';

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

const Substitutions = () => {
  const [substitutions, setSubstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });

  const weekdayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchSubstitutions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/substitutions/mine');
        setSubstitutions(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch substitutions.');
        console.error(err);
        setToast({ message: 'Failed to fetch substitutions.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSubstitutions();
  }, []);

  const getTodaysSubstitutions = () => {
    const today = new Date().getDay();
    return substitutions.filter(sub => {
      const subDate = new Date(sub.createdAt);
      return subDate.getDay() === today && subDate.toDateString() === new Date().toDateString();
    }).length;
  };

  const getThisWeekSubstitutions = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    
    return substitutions.filter(sub => {
      const subDate = new Date(sub.createdAt);
      return subDate >= startOfWeek && subDate <= endOfWeek;
    }).length;
  };

  const getUniqueOriginalTeachers = () => {
    const uniqueTeachers = new Set(substitutions.map(sub => sub.originalTeacherId?._id));
    return uniqueTeachers.size;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading substitutions...</p>
      </div>
    );
  }

  return (
    <>
      <Toast 
        message={toast.message} 
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })} 
      />
      
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Top summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={<FiCalendar size={24} />}
            title="Today's Substitutions"
            value={getTodaysSubstitutions()}
            subtitle="Substitutions assigned for today"
          />
          <StatCard 
            icon={<FiClock size={24} />}
            title="This Week"
            value={getThisWeekSubstitutions()}
            subtitle="Total substitutions this week"
          />
          <StatCard 
            icon={<FiUsers size={24} />}
            title="Teachers Covered"
            value={getUniqueOriginalTeachers()}
            subtitle="Different teachers you've substituted"
          />
        </div>

        {/* Substitutions List */}
        <div className="bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 p-6 border-b">Your Substitute Assignments</h2>
          
          {error && (
            <div className="p-6 text-center text-red-500">
              {error}
            </div>
          )}

          {!error && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Time</th>
                    <th className="p-4 font-semibold">Original Teacher</th>
                    <th className="p-4 font-semibold">Subject</th>
                    <th className="p-4 font-semibold">Class</th>
                    <th className="p-4 font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {substitutions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center p-8 text-gray-500">
                        <div className="flex flex-col items-center">
                          <FiBookOpen size={48} className="text-gray-300 mb-4" />
                          <p>No substitutions assigned yet.</p>
                          <p className="text-sm mt-1">When you're assigned as a substitute, they'll appear here.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    substitutions.map(substitution => (
                      <tr key={substitution._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">
                            {new Date(substitution.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {weekdayMap[substitution.scheduleSlotId?.weekday]}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded inline-block">
                            Period {(substitution.scheduleSlotId?.periodIndex || 0) + 1}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{substitution.originalTeacherId?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{substitution.originalTeacherId?.email || 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-indigo-600">
                            {substitution.scheduleSlotId?.subject || 'N/A'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">
                            {substitution.scheduleSlotId?.classSection || 'N/A'}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {substitution.reason || 'Teacher leave substitution'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity Summary - if there are substitutions */}
        {substitutions.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {substitutions.slice(0, 3).map(substitution => (
                <div key={substitution._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full mr-3">
                    <FiUsers size={16} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium">
                      Substituted for <span className="text-indigo-600">{substitution.originalTeacherId?.name}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {substitution.scheduleSlotId?.subject} - Class {substitution.scheduleSlotId?.classSection} • {new Date(substitution.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(substitution.assignedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Substitutions;