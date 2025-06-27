import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiCheckCircle, FiXCircle, FiClock, FiUsers, FiAlertCircle } from 'react-icons/fi';
import ActionConfirmationModal from '../../components/ui/ActionConfirmationModal';
import Toast from '../../components/ui/Toast';

const StatusBadge = ({ status }) => {
  const statusMap = {
    pending: {
      icon: <FiClock className="mr-2" />,
      color: 'bg-yellow-100 text-yellow-800',
      text: 'Waiting for Approval',
    },
    approved: {
      icon: <FiCheckCircle className="mr-2" />,
      color: 'bg-green-100 text-green-800',
      text: 'Approved',
    },
    rejected: {
      icon: <FiXCircle className="mr-2" />,
      color: 'bg-red-100 text-red-800',
      text: 'Not Approved',
    },
  };

  const currentStatus = statusMap[status] || statusMap.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.color}`}>
      {currentStatus.icon}
      {currentStatus.text}
    </span>
  );
};

const ManageLeaves = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('');

  const [toast, setToast] = useState({ message: '', type: '' });
  const [isGeneratingSubstitutions, setIsGeneratingSubstitutions] = useState(false);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/leaves');
        setLeaveRequests(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch leave requests.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  const handleActionClick = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setIsModalOpen(true);
  };

  const generateSubstitutionsForApprovedLeave = async (leaveRequest) => {
    try {
      setIsGeneratingSubstitutions(true);
      
      // Call your substitution generation endpoint
      const response = await api.post('/api/substitutions/generate', {
        leaveRequestId: leaveRequest._id,
        teacherId: leaveRequest.teacherId._id || leaveRequest.teacherId,
        fromDate: leaveRequest.fromDate,
        toDate: leaveRequest.toDate,
        schoolId: leaveRequest.schoolId?._id || leaveRequest.schoolId 
      });

      const { substitutions, conflicts } = response.data;

      if (conflicts && conflicts.length > 0) {
        setToast({ 
          message: `Leave approved! ${substitutions.length} class coverage arranged. ${conflicts.length} classes need manual assignment.`, 
          type: 'warning' 
        });
      } else {
        setToast({ 
          message: `Leave approved! All ${substitutions.length} classes have been covered automatically.`, 
          type: 'success' 
        });
      }

    } catch (err) {
      console.error('Failed to generate substitutions:', err);
      setToast({ 
        message: 'Leave approved, but there was an issue arranging class coverage. Please check the coverage assignments.', 
        type: 'warning' 
      });
    } finally {
      setIsGeneratingSubstitutions(false);
    }
  };

  const handleConfirmAction = async (comment) => {
    if (!selectedRequest || !actionType) return;

    const leaveId = selectedRequest._id;
    const endpoint = `/api/leaves/${leaveId}/${actionType}`;

    try {
      const response = await api.put(endpoint, { adminComment: comment });
      const updatedLeaveRequest = response.data.leaveRequest;

      // Update the UI
      setLeaveRequests(prev =>
        prev.map(req =>
          req._id === leaveId ? updatedLeaveRequest : req
        )
      );

      // If approved, generate substitutions automatically
      if (actionType === 'approve') {
        await generateSubstitutionsForApprovedLeave(updatedLeaveRequest);
      } else {
        setToast({ message: `Leave request was not approved.`, type: 'info' });
      }

    } catch (err) {
      console.error(`Failed to ${actionType} leave request:`, err);
      
      const friendlyMessage = actionType === 'approve' 
        ? 'Failed to approve the leave request. Please try again.'
        : 'Failed to process the leave request. Please try again.';
      
      setToast({ message: friendlyMessage, type: 'error' });
    } finally {
      setIsModalOpen(false);
      setSelectedRequest(null);
      setActionType('');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading leave requests...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  const pendingCount = leaveRequests.filter(req => req.status === 'pending').length;
  const approvedCount = leaveRequests.filter(req => req.status === 'approved').length;

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
        onConfirm={handleConfirmAction}
        title={actionType === 'approve' ? 'Approve Teacher Leave' : 'Decline Teacher Leave'}
        message={
          actionType === 'approve' 
            ? `Approve leave for ${selectedRequest?.teacherId?.name || 'this teacher'}? We'll automatically arrange coverage for their classes.`
            : `Decline leave request for ${selectedRequest?.teacherId?.name || 'this teacher'}?`
        }
        confirmButtonText={actionType === 'approve' ? 'Approve & Arrange Coverage' : 'Decline Request'}
        confirmButtonClass={
          actionType === 'approve'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-700'
        }
        showComment={true}
      />

      {/* Loading overlay for substitution generation */}
      {isGeneratingSubstitutions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-4"></div>
              <p className="text-lg">Arranging class coverage...</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Teacher Leave Requests</h1>
          
          {/* Quick stats */}
          <div className="flex space-x-4">
            {pendingCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                <div className="flex items-center">
                  <FiClock className="text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">{pendingCount} Waiting</span>
                </div>
              </div>
            )}
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <div className="flex items-center">
                <FiCheckCircle className="text-green-600 mr-2" />
                <span className="font-medium text-green-800">{approvedCount} Approved</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 font-semibold">Teacher Name</th>
                  <th className="p-4 font-semibold">Leave Dates</th>
                  <th className="p-4 font-semibold">Reason for Leave</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-gray-500">
                      <div className="flex flex-col items-center">
                        <FiUsers size={48} className="text-gray-300 mb-4" />
                        <p>No leave requests found.</p>
                        <p className="text-sm mt-1">Teacher leave requests will appear here when submitted.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map(request => {
                    const teacher = request.teacherId;
                    const fromDate = new Date(request.fromDate).toLocaleDateString();
                    const toDate = new Date(request.toDate).toLocaleDateString();
                    const dateRange = fromDate === toDate ? fromDate : `${fromDate} - ${toDate}`;
                    
                    return (
                      <tr key={request._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium">{teacher?.name || 'Unknown Teacher'}</div>
                          <div className="text-sm text-gray-500">{teacher?.email || 'N/A'}</div>
                        </td>
                        <td className="p-4 text-gray-600 font-medium">
                          {dateRange}
                        </td>
                        <td className="p-4 text-gray-600 max-w-xs">
                          <div className="truncate" title={request.reason}>
                            {request.reason}
                          </div>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={request.status} />
                        </td>
                        <td className="p-4 text-right">
                          {request.status === 'pending' && (
                            <div className="space-x-2">
                              <button 
                                onClick={() => handleActionClick(request, 'approve')}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium transition-colors"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleActionClick(request, 'reject')}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          {request.status === 'approved' && (
                            <span className="text-sm text-gray-500">Coverage arranged</span>
                          )}
                          {request.status === 'rejected' && (
                            <span className="text-sm text-gray-500">Request declined</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help text for admins */}
        {pendingCount > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FiAlertCircle className="text-blue-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">How it works:</h4>
                <p className="text-sm text-blue-800 mt-1">
                  When you approve a leave request, we automatically find available teachers to cover the classes. 
                  If some classes can't be covered automatically, you'll be notified to assign them manually.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageLeaves;