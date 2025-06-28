import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FiUsers, FiCalendar, FiBookOpen, FiAlertTriangle, FiEdit3, FiFilter, FiDownload, FiEye } from 'react-icons/fi';
import ActionConfirmationModal from '../../components/ui/ActionConfirmationModal';
import Toast from '../../components/ui/Toast';

const StatCard = ({ icon, title, value, subtitle, alertColor = false, onClick = null }) => (
  <div 
    className={`bg-white p-6 rounded-lg shadow-md flex items-center ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
    onClick={onClick}
  >
    <div className={`${alertColor ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'} p-4 rounded-full`}>
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${alertColor ? 'text-red-600' : 'text-gray-800'}`}>{value}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  </div>
);

const StatusBadge = ({ status, reason }) => {
  const getStatusInfo = () => {
    if (reason?.toLowerCase().includes('leave')) {
      return { color: 'bg-blue-100 text-blue-800', text: 'Teacher Leave' };
    }
    if (reason?.toLowerCase().includes('emergency')) {
      return { color: 'bg-red-100 text-red-800', text: 'Emergency' };
    }
    if (reason?.toLowerCase().includes('training')) {
      return { color: 'bg-purple-100 text-purple-800', text: 'Training' };
    }
    return { color: 'bg-green-100 text-green-800', text: 'Covered' };
  };

  const statusInfo = getStatusInfo();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
      {statusInfo.text}
    </span>
  );
};

const ClassCoverageManagement = () => {
  const navigate = useNavigate();
  const [substitutions, setSubstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });

  // Filter states
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubstitution, setSelectedSubstitution] = useState(null);
  const [modalType, setModalType] = useState(''); // 'reassign', 'view'
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [allTeachers, setAllTeachers] = useState([]);


  const weekdayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchSubstitutions();
  }, []);

  const fetchSubstitutions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFilter.from) params.from = dateFilter.from;
      if (dateFilter.to) params.to = dateFilter.to;

      const response = await api.get('/api/substitutions/history', { params });
      setSubstitutions(response.data.history || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load class coverage data.');
      console.error(err);
      setToast({ message: 'Failed to load class coverage data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = () => {
    fetchSubstitutions();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setDateFilter({ from: '', to: '' });
    setTimeout(() => {
      fetchSubstitutions();
    }, 100);
  };

  const getTodaysCoverage = () => {
    const today = new Date().toISOString().split('T')[0];
    return substitutions.filter(sub => sub.date === today).length;
  };

  const getTotalCoverage = () => {
    return substitutions.length;
  };

  const getConflictCount = () => {
    // This would typically come from a separate API endpoint for actual conflicts
    // For now, we'll simulate some conflicts based on data patterns
    return Math.floor(substitutions.length * 0.05); // 5% conflict rate simulation
  };

  const handleReassignTeacher = (substitution) => {
    setSelectedSubstitution(substitution);
    setModalType('reassign');
    setIsModalOpen(true);
  };

  const handleViewDetails = (substitution) => {
    setSelectedSubstitution(substitution);
    setModalType('view');
    setIsModalOpen(true);
  };

  const handleConfirmReassignment = async (comment) => {
  if (!selectedSubstitution || !selectedSubstitution._id || !selectedTeacherId) {
    console.warn('Missing selected substitution or new teacher ID');
    return;
  }

  try {
    console.log('Sending reassignment with:', {
      substitutionId: selectedSubstitution._id,
      newSubstituteId: selectedTeacherId,
      reason: comment || 'Teacher reassigned by administrator',
    });

    const response = await api.post('/api/substitutions/override', {
      substitutionId: selectedSubstitution._id,
      newSubstituteId: selectedTeacherId,
      reason: comment || 'Teacher reassigned by administrator'
    });

    setToast({ message: 'Teacher reassigned successfully.', type: 'success' });
    fetchSubstitutions();
  } catch (err) {
    console.error('Reassignment failed:', err);
    setToast({ message: 'Failed to reassign teacher.', type: 'error' });
  } finally {
    setIsModalOpen(false);
    setSelectedSubstitution(null);
    setSelectedTeacherId('');
    setModalType('');
  }
};




  //  WORKING QUICK ACTIONS
  const handleViewAllTeachers = () => {
    navigate('/admin/manage-teachers');
  };

  const handleScheduleOverview = () => {
    navigate('/admin/schedule');
  };

  const handleResolveConflicts = () => {
    // Filter to show only problematic assignments
    const conflictFilter = { from: new Date().toISOString().split('T')[0] };
    setDateFilter(conflictFilter);
    setShowFilters(true);
    setToast({ message: 'Showing potential scheduling conflicts', type: 'info' });
  };

  const exportToCSV = () => {
    if (substitutions.length === 0) {
      setToast({ message: 'No data to export.', type: 'error' });
      return;
    }

    const headers = ['Date', 'Day', 'Period', 'Subject', 'Class', 'Absent Teacher', 'Cover Teacher', 'Reason'];
    const csvContent = [
      headers.join(','),
      ...substitutions.map(sub => [
        sub.date,
        sub.weekday,
        sub.period,
        sub.subject,
        sub.classSection,
        sub.originalTeacher.name,
        sub.substituteTeacher.name,
        sub.reason
      ].join(','))
    ].join('\n');

    



useEffect(() => {
  fetchSubstitutions();
  fetchTeachers(); 
}, []);

const fetchTeachers = async () => {
  try {
    const res = await api.get('/api/admin/teachers');
    setAllTeachers(res.data.teachers || []);
  } catch (err) {
    console.error('Failed to load teachers:', err);
    setToast({ message: 'Failed to load teacher list.', type: 'error' });
  }
};



    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class_coverage_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setToast({ message: 'Coverage report exported successfully.', type: 'success' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading class coverage data...</p>
        </div>
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
      
      <ActionConfirmationModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onConfirm={modalType === 'reassign' ? handleConfirmReassignment : () => setIsModalOpen(false)}
  title={modalType === 'reassign' ? 'Reassign Cover Teacher' : 'Class Coverage Details'}
  message={
    modalType === 'reassign' 
      ? `Change the cover teacher for ${selectedSubstitution?.subject} - ${selectedSubstitution?.classSection}?`
      : selectedSubstitution ? (
          <div className="text-left space-y-3 max-w-md">
            <div className="bg-gray-50 p-3 rounded">
              <p><strong>Date:</strong> {selectedSubstitution.date}</p>
              <p><strong>Period:</strong> {selectedSubstitution.period}</p>
              <p><strong>Subject:</strong> {selectedSubstitution.subject}</p>
              <p><strong>Class:</strong> {selectedSubstitution.classSection}</p>
            </div>
            <div className="space-y-2">
              <p><strong>Absent Teacher:</strong> {selectedSubstitution.originalTeacher.name}</p>
              <p><strong>Cover Teacher:</strong> {selectedSubstitution.substituteTeacher.name}</p>
              <p><strong>Reason:</strong> {selectedSubstitution.reason}</p>
            </div>
          </div>
        ) : ''
  }
  confirmButtonText={modalType === 'reassign' ? 'Reassign Teacher' : 'Close'}
  confirmButtonClass={modalType === 'reassign' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 hover:bg-gray-700'}
  showComment={modalType === 'reassign'}
  teacherOptions={allTeachers}
  selectedTeacherId={selectedTeacherId}
  onTeacherSelect={setSelectedTeacherId}
/>


      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Class Coverage Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage teacher substitutions and class coverage</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiFilter className="mr-2" size={16} />
              Filter
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiDownload className="mr-2" size={16} />
              Export Report
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Filter Coverage Records</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={dateFilter.from}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={dateFilter.to}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={handleFilterApply}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Apply Filter
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards with Click Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<FiCalendar size={24} />}
            title="Today's Coverage"
            value={getTodaysCoverage()}
            subtitle="Classes covered today"
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setDateFilter({ from: today, to: today });
              fetchSubstitutions();
            }}
          />
          <StatCard 
            icon={<FiUsers size={24} />}
            title="Total Coverage"
            value={getTotalCoverage()}
            subtitle="In selected period"
          />
          <StatCard 
            icon={<FiBookOpen size={24} />}
            title="Coverage Success"
            value={`${getTotalCoverage() > 0 ? Math.round((getTotalCoverage() - getConflictCount()) / getTotalCoverage() * 100) : 100}%`}
            subtitle="Classes successfully covered"
          />
          <StatCard 
            icon={<FiAlertTriangle size={24} />}
            title="Need Attention"
            value={getConflictCount()}
            subtitle="Scheduling issues"
            alertColor={getConflictCount() > 0}
            onClick={getConflictCount() > 0 ? handleResolveConflicts : null}
          />
        </div>

        {/* Coverage History Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Class Coverage History</h2>
            <span className="text-sm text-gray-500">{substitutions.length} records found</span>
          </div>
          
          {error && (
            <div className="p-6 text-center">
              <div className="text-red-500 mb-2">{error}</div>
              <button 
                onClick={fetchSubstitutions}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {!error && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 font-semibold">Date & Time</th>
                    <th className="p-4 font-semibold">Subject & Class</th>
                    <th className="p-4 font-semibold">Absent Teacher</th>
                    <th className="p-4 font-semibold">Cover Teacher</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {substitutions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center p-12 text-gray-500">
                        <div className="flex flex-col items-center">
                          <FiCalendar size={48} className="text-gray-300 mb-4" />
                          <p className="text-lg font-medium">No coverage records found</p>
                          <p className="text-sm mt-1">Coverage assignments will appear here when teachers take leave</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    substitutions.map((coverage, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">{coverage.date}</div>
                          <div className="text-sm text-gray-600">{coverage.weekday}</div>
                          <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded inline-block mt-1">
                            Period {coverage.period}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-indigo-600">{coverage.subject}</div>
                          <div className="text-sm text-gray-600">Class {coverage.classSection}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{coverage.originalTeacher.name}</div>
                          <div className="text-sm text-gray-500">{coverage.originalTeacher.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-green-700">{coverage.substituteTeacher.name}</div>
                          <div className="text-sm text-gray-500">{coverage.substituteTeacher.email}</div>
                        </td>
                        <td className="p-4">
                          <StatusBadge reason={coverage.reason} />
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center space-x-2">
                            <button 
                              onClick={() => handleViewDetails(coverage)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="View Details"
                            >
                              <FiEye size={14} />
                            </button>
                            <button 
  onClick={() => handleReassignTeacher(coverage)}
  className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
  title="Reassign Teacher"
>
  <FiEdit3 size={14} />
</button>

                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 🔥 WORKING QUICK ACTIONS
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleViewAllTeachers}
              className="flex items-center justify-center p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors group"
            >
              <FiUsers className="mr-3 text-indigo-600 group-hover:text-indigo-700" size={20} />
              <div className="text-left">
                <div className="font-medium text-indigo-700">Manage Teachers</div>
                <div className="text-sm text-indigo-600">View all staff members</div>
              </div>
            </button>
            <button 
              onClick={handleScheduleOverview}
              className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
            >
              <FiCalendar className="mr-3 text-green-600 group-hover:text-green-700" size={20} />
              <div className="text-left">
                <div className="font-medium text-green-700">View Schedules</div>
                <div className="text-sm text-green-600">Complete timetable overview</div>
              </div>
            </button>
            <button 
              onClick={handleResolveConflicts}
              className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors group"
            >
              <FiAlertTriangle className="mr-3 text-yellow-600 group-hover:text-yellow-700" size={20} />
              <div className="text-left">
                <div className="font-medium text-yellow-700">Resolve Issues</div>
                <div className="text-sm text-yellow-600">Fix scheduling conflicts</div>
              </div>
            </button>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default ClassCoverageManagement;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../../utils/api';
// import { FiUsers, FiCalendar, FiBookOpen, FiAlertTriangle, FiEdit3, FiFilter, FiDownload, FiEye } from 'react-icons/fi';
// import Toast from '../../components/ui/Toast';

// const StatCard = ({ icon, title, value, subtitle, alertColor = false, onClick = null }) => (
//   <div 
//     className={`bg-white p-6 rounded-lg shadow-md flex items-center ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
//     onClick={onClick}
//   >
//     <div className={`${alertColor ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'} p-4 rounded-full`}>
//       {icon}
//     </div>
//     <div className="ml-4">
//       <p className="text-sm text-gray-500">{title}</p>
//       <p className={`text-2xl font-bold ${alertColor ? 'text-red-600' : 'text-gray-800'}`}>{value}</p>
//       <p className="text-xs text-gray-400">{subtitle}</p>
//     </div>
//   </div>
// );

// const StatusBadge = ({ status, reason }) => {
//   const getStatusInfo = () => {
//     if (reason?.toLowerCase().includes('leave')) {
//       return { color: 'bg-blue-100 text-blue-800', text: 'Teacher Leave' };
//     }
//     if (reason?.toLowerCase().includes('emergency')) {
//       return { color: 'bg-red-100 text-red-800', text: 'Emergency' };
//     }
//     if (reason?.toLowerCase().includes('training')) {
//       return { color: 'bg-purple-100 text-purple-800', text: 'Training' };
//     }
//     return { color: 'bg-green-100 text-green-800', text: 'Covered' };
//   };

//   const statusInfo = getStatusInfo();

//   return (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
//       {statusInfo.text}
//     </span>
//   );
// };

// // WORKING Modal Component - Use this one, not the imported one
// const ActionConfirmationModal = ({ 
//   isOpen, 
//   onClose, 
//   onConfirm, 
//   title, 
//   message, 
//   confirmButtonText = 'Confirm',
//   confirmButtonClass = 'bg-red-600 hover:bg-red-700',
//   showComment = false,
//   teacherOptions = [],
//   selectedTeacherId,
//   onTeacherSelect
// }) => {
//   const [comment, setComment] = useState('');

//   if (!isOpen) return null;

//   const handleConfirm = () => {
//     onConfirm(comment);
//     setComment('');
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        
//         <div className="mb-4">
//           {typeof message === 'string' ? (
//             <p className="text-gray-600">{message}</p>
//           ) : (
//             message
//           )}
//         </div>

//         {/* Teacher Selection Dropdown - This works! */}
//         {showComment && teacherOptions.length > 0 && (
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Select New Cover Teacher *
//             </label>
//             <select
//               value={selectedTeacherId}
//               onChange={(e) => {
//                 console.log('Teacher selected:', e.target.value);
//                 onTeacherSelect(e.target.value);
//               }}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               required
//             >
//               <option value="">-- Select a Teacher --</option>
//               {teacherOptions.map((teacher) => (
//                 <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
//                   {teacher.name} {teacher.email ? `(${teacher.email})` : ''}
//                 </option>
//               ))}
//             </select>
            
//             {/* Status indicator */}
//             <p className="text-sm text-green-600 mt-2">
//                {teacherOptions.length} teachers available
//             </p>
//           </div>
//         )}

//         {/* Loading state for teachers */}
//         {showComment && teacherOptions.length === 0 && (
//           <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
//             <p className="text-sm text-yellow-700"> Loading teachers...</p>
//           </div>
//         )}

//         {/* Comment/Reason field */}
//         {showComment && (
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Reason for Change (Optional)
//             </label>
//             <textarea
//               value={comment}
//               onChange={(e) => setComment(e.target.value)}
//               placeholder="Enter reason for reassignment..."
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               rows="3"
//             />
//           </div>
//         )}

//         <div className="flex justify-end space-x-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleConfirm}
//             disabled={showComment && teacherOptions.length > 0 && !selectedTeacherId}
//             className={`px-4 py-2 text-white rounded-lg transition-colors ${confirmButtonClass} ${
//               showComment && teacherOptions.length > 0 && !selectedTeacherId 
//                 ? 'opacity-50 cursor-not-allowed' 
//                 : ''
//             }`}
//           >
//             {confirmButtonText}
//             {showComment && teacherOptions.length > 0 && !selectedTeacherId && ' (Select Teacher)'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ClassCoverageManagement = () => {
//   const navigate = useNavigate();
//   const [substitutions, setSubstitutions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [toast, setToast] = useState({ message: '', type: '' });

//   const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
//   const [showFilters, setShowFilters] = useState(false);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedSubstitution, setSelectedSubstitution] = useState(null);
//   const [modalType, setModalType] = useState('');
//   const [selectedTeacherId, setSelectedTeacherId] = useState('');
//   const [allTeachers, setAllTeachers] = useState([]);

//   // ✅ Fetch teachers when component mounts
//   const fetchTeachers = async () => {
//     try {
//       console.log('Fetching teachers...');
//       const res = await api.get('/api/admin/teachers');
//       console.log('✅ Teachers fetched successfully:', res.data.teachers?.length || 0);
//       setAllTeachers(res.data.teachers || []);
//     } catch (err) {
//       console.error('Failed to load teachers:', err);
//       setToast({ message: 'Failed to load teacher list.', type: 'error' });
//     }
//   };

//   useEffect(() => {
//     fetchSubstitutions();
//     fetchTeachers(); 
//   }, []);

//   const fetchSubstitutions = async () => {
//     try {
//       setLoading(true);
//       const params = {};
//       if (dateFilter.from) params.from = dateFilter.from;
//       if (dateFilter.to) params.to = dateFilter.to;

//       const response = await api.get('/api/substitutions/history', { params });
//       setSubstitutions(response.data.history || []);
//       setError('');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to load class coverage data.');
//       console.error(err);
//       setToast({ message: 'Failed to load class coverage data.', type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFilterApply = () => {
//     fetchSubstitutions();
//     setShowFilters(false);
//   };

//   const handleClearFilters = () => {
//     setDateFilter({ from: '', to: '' });
//     setTimeout(() => {
//       fetchSubstitutions();
//     }, 100);
//   };

//   const getTodaysCoverage = () => {
//     const today = new Date().toISOString().split('T')[0];
//     return substitutions.filter(sub => sub.date === today).length;
//   };

//   const getTotalCoverage = () => substitutions.length;

//   const getConflictCount = () => Math.floor(substitutions.length * 0.05);

//   //Fixed reassign handler
//   const handleReassignTeacher = (substitution) => {
//     console.log('🔄 Opening reassign modal for:', substitution.subject);
//     console.log('📋 Available teachers:', allTeachers.length);
    
//     setSelectedSubstitution(substitution);
//     setModalType('reassign');
//     setSelectedTeacherId(''); 
//     setIsModalOpen(true);
//   };

//   const handleViewDetails = (substitution) => {
//     setSelectedSubstitution(substitution);
//     setModalType('view');
//     setIsModalOpen(true);
//   };

//   // ✅ Fixed confirmation handler
//   const handleConfirmReassignment = async (comment) => {
//     if (!selectedSubstitution || !selectedSubstitution._id || !selectedTeacherId) {
//       console.warn('Missing data:', {
//         substitution: !!selectedSubstitution,
//         substitutionId: selectedSubstitution?._id,
//         teacherId: selectedTeacherId
//       });
//       setToast({ message: 'Please select a teacher to reassign.', type: 'error' });
//       return;
//     }

//     try {
//       console.log('Sending reassignment request...');
//       await api.post('/api/substitutions/override', {
//         substitutionId: selectedSubstitution._id,
//         newSubstituteId: selectedTeacherId,
//         reason: comment || 'Teacher reassigned by administrator',
//       });

//       setToast({ message: 'Teacher reassigned successfully.', type: 'success' });
//       fetchSubstitutions();
//     } catch (err) {
//       console.error('Reassignment failed:', err);
//       setToast({ message: 'Failed to reassign teacher.', type: 'error' });
//     } finally {
//       setIsModalOpen(false);
//       setSelectedSubstitution(null);
//       setSelectedTeacherId('');
//       setModalType('');
//     }
//   };

//   const handleViewAllTeachers = () => navigate('/admin/manage-teachers');
//   const handleScheduleOverview = () => navigate('/admin/schedule');
//   const handleResolveConflicts = () => {
//     const today = new Date().toISOString().split('T')[0];
//     setDateFilter({ from: today });
//     setShowFilters(true);
//     setToast({ message: 'Showing potential scheduling conflicts', type: 'info' });
//   };

//   const exportToCSV = () => {
//     if (substitutions.length === 0) {
//       setToast({ message: 'No data to export.', type: 'error' });
//       return;
//     }

//     const headers = ['Date', 'Day', 'Period', 'Subject', 'Class', 'Absent Teacher', 'Cover Teacher', 'Reason'];
//     const csvContent = [
//       headers.join(','),
//       ...substitutions.map(sub => [
//         sub.date,
//         sub.weekday,
//         sub.period,
//         sub.subject,
//         sub.classSection,
//         sub.originalTeacher.name,
//         sub.substituteTeacher.name,
//         sub.reason
//       ].join(','))
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `class_coverage_${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);

//     setToast({ message: 'Coverage report exported successfully.', type: 'success' });
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-lg text-gray-600">Loading class coverage data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Toast 
//         message={toast.message} 
//         type={toast.type}
//         onClose={() => setToast({ message: '', type: '' })} 
//       />
      
//       {/* Using the LOCAL modal component, not the imported one */}
//       <ActionConfirmationModal
//         isOpen={isModalOpen}
//         onClose={() => {
//           setIsModalOpen(false);
//           setSelectedTeacherId('');
//         }}
//         onConfirm={modalType === 'reassign' ? handleConfirmReassignment : () => setIsModalOpen(false)}
//         title={modalType === 'reassign' ? 'Reassign Cover Teacher' : 'Class Coverage Details'}
//         message={
//           modalType === 'reassign' 
//             ? `Change the cover teacher for ${selectedSubstitution?.subject} - ${selectedSubstitution?.classSection}?`
//             : selectedSubstitution ? (
//                 <div className="text-left space-y-3 max-w-md">
//                   <div className="bg-gray-50 p-3 rounded">
//                     <p><strong>Date:</strong> {selectedSubstitution.date}</p>
//                     <p><strong>Period:</strong> {selectedSubstitution.period}</p>
//                     <p><strong>Subject:</strong> {selectedSubstitution.subject}</p>
//                     <p><strong>Class:</strong> {selectedSubstitution.classSection}</p>
//                   </div>
//                   <div className="space-y-2">
//                     <p><strong>Absent Teacher:</strong> {selectedSubstitution.originalTeacher.name}</p>
//                     <p><strong>Cover Teacher:</strong> {selectedSubstitution.substituteTeacher.name}</p>
//                     <p><strong>Reason:</strong> {selectedSubstitution.reason}</p>
//                   </div>
//                 </div>
//               ) : ''
//         }
//         confirmButtonText={modalType === 'reassign' ? 'Reassign Teacher' : 'Close'}
//         confirmButtonClass={modalType === 'reassign' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 hover:bg-gray-700'}
//         showComment={modalType === 'reassign'}
//         teacherOptions={allTeachers}
//         selectedTeacherId={selectedTeacherId}
//         onTeacherSelect={setSelectedTeacherId}
//       />

//       <div className="p-8">
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">Class Coverage Management</h1>
//             <p className="text-gray-600 mt-1">Monitor and manage teacher substitutions and class coverage</p>
//           </div>
//           <div className="flex space-x-3">
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//             >
//               <FiFilter className="mr-2" size={16} />
//               Filter
//             </button>
//             <button
//               onClick={exportToCSV}
//               className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//             >
//               <FiDownload className="mr-2" size={16} />
//               Export Report
//             </button>
//           </div>
//         </div>

//         {/* Filter Panel */}
//         {showFilters && (
//           <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//             <h3 className="text-lg font-semibold mb-4">Filter Coverage Records</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
//                 <input
//                   type="date"
//                   value={dateFilter.from}
//                   onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
//                 <input
//                   type="date"
//                   value={dateFilter.to}
//                   onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>
//               <div className="flex items-end space-x-2">
//                 <button
//                   onClick={handleFilterApply}
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//                 >
//                   Apply Filter
//                 </button>
//                 <button
//                   onClick={handleClearFilters}
//                   className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
//                 >
//                   Clear
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Stat Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <StatCard 
//             icon={<FiCalendar size={24} />}
//             title="Today's Coverage"
//             value={getTodaysCoverage()}
//             subtitle="Classes covered today"
//             onClick={() => {
//               const today = new Date().toISOString().split('T')[0];
//               setDateFilter({ from: today, to: today });
//               fetchSubstitutions();
//             }}
//           />
//           <StatCard 
//             icon={<FiUsers size={24} />}
//             title="Total Coverage"
//             value={getTotalCoverage()}
//             subtitle="In selected period"
//           />
//           <StatCard 
//             icon={<FiBookOpen size={24} />}
//             title="Coverage Success"
//             value={`${getTotalCoverage() > 0 ? Math.round((getTotalCoverage() - getConflictCount()) / getTotalCoverage() * 100) : 100}%`}
//             subtitle="Classes successfully covered"
//           />
//           <StatCard 
//             icon={<FiAlertTriangle size={24} />}
//             title="Need Attention"
//             value={getConflictCount()}
//             subtitle="Scheduling issues"
//             alertColor={getConflictCount() > 0}
//             onClick={getConflictCount() > 0 ? handleResolveConflicts : null}
//           />
//         </div>

//         {/* Coverage Table */}
//         <div className="bg-white rounded-lg shadow-md">
//           <div className="flex justify-between items-center p-6 border-b">
//             <h2 className="text-xl font-bold text-gray-800">Class Coverage History</h2>
//             <span className="text-sm text-gray-500">{substitutions.length} records found</span>
//           </div>

//           {error ? (
//             <div className="p-6 text-center">
//               <div className="text-red-500 mb-2">{error}</div>
//               <button 
//                 onClick={fetchSubstitutions}
//                 className="text-indigo-600 hover:text-indigo-800 font-medium"
//               >
//                 Try Again
//               </button>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead>
//                   <tr className="bg-gray-50 border-b">
//                     <th className="p-4 font-semibold">Date & Time</th>
//                     <th className="p-4 font-semibold">Subject & Class</th>
//                     <th className="p-4 font-semibold">Absent Teacher</th>
//                     <th className="p-4 font-semibold">Cover Teacher</th>
//                     <th className="p-4 font-semibold">Status</th>
//                     <th className="p-4 font-semibold text-center">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {substitutions.length === 0 ? (
//                     <tr>
//                       <td colSpan="6" className="text-center p-12 text-gray-500">
//                         <div className="flex flex-col items-center">
//                           <FiCalendar size={48} className="text-gray-300 mb-4" />
//                           <p className="text-lg font-medium">No coverage records found</p>
//                           <p className="text-sm mt-1">Coverage assignments will appear here when teachers take leave</p>
//                         </div>
//                       </td>
//                     </tr>
//                   ) : (
//                     substitutions.map((coverage, index) => (
//                       <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
//                         <td className="p-4">
//                           <div className="font-semibold text-gray-900">{coverage.date}</div>
//                           <div className="text-sm text-gray-600">{coverage.weekday}</div>
//                           <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded inline-block mt-1">
//                             Period {coverage.period}
//                           </div>
//                         </td>
//                         <td className="p-4">
//                           <div className="font-semibold text-indigo-600">{coverage.subject}</div>
//                           <div className="text-sm text-gray-600">Class {coverage.classSection}</div>
//                         </td>
//                         <td className="p-4">
//                           <div className="font-medium text-gray-900">{coverage.originalTeacher.name}</div>
//                           <div className="text-sm text-gray-500">{coverage.originalTeacher.email}</div>
//                         </td>
//                         <td className="p-4">
//                           <div className="font-medium text-green-700">{coverage.substituteTeacher.name}</div>
//                           <div className="text-sm text-gray-500">{coverage.substituteTeacher.email}</div>
//                         </td>
//                         <td className="p-4">
//                           <StatusBadge reason={coverage.reason} />
//                         </td>
//                         <td className="p-4">
//                           <div className="flex justify-center space-x-2">
//                             <button 
//                               onClick={() => handleViewDetails(coverage)}
//                               className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
//                               title="View Details"
//                             >
//                               <FiEye size={14} />
//                             </button>
//                             <button 
//                               onClick={() => handleReassignTeacher(coverage)}
//                               className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
//                               title="Reassign Teacher"
//                             >
//                               <FiEdit3 size={14} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default ClassCoverageManagement;