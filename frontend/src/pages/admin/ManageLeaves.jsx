import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import ActionConfirmationModal from '../../components/ui/ActionConfirmationModal';
import Toast from '../../components/ui/Toast';

const StatusBadge = ({ status }) => {
  const statusMap = {
    pending: {
      icon: <FiClock className="mr-2" />,
      color: 'bg-yellow-100 text-yellow-800',
      text: 'Pending',
    },
    approved: {
      icon: <FiCheckCircle className="mr-2" />,
      color: 'bg-green-100 text-green-800',
      text: 'Approved',
    },
    rejected: {
      icon: <FiXCircle className="mr-2" />,
      color: 'bg-red-100 text-red-800',
      text: 'Rejected',
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

  const handleConfirmAction = async (comment) => {
    if (!selectedRequest || !actionType) return;

    const leaveId = selectedRequest._id;
    const endpoint = `/api/leaves/${leaveId}/${actionType}`; // approve or reject

    try {
      const response = await api.put(endpoint, { adminComment: comment });

      // Update the request status locally
      setLeaveRequests(prev =>
        prev.map(req =>
          req._id === leaveId ? response.data.leaveRequest : req
        )
      );

      setToast({ message: `Leave request ${actionType}ed successfully.`, type: 'success' });

    } catch (err) {
      console.error(`Failed to ${actionType} leave request:`, err);
      setToast({ message: `Failed to ${actionType} leave request.`, type: 'error' });
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
        title={actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        message={`Are you sure you want to ${actionType} this leave request for ${selectedRequest?.teacherId?.name}?`}
        confirmButtonText={actionType === 'approve' ? 'Approve' : 'Reject'}
        confirmButtonClass={
          actionType === 'approve'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-700'
        }
        showComment={true}
      />
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Leave Requests</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 font-semibold">Teacher</th>
                  <th className="p-4 font-semibold">Dates</th>
                  <th className="p-4 font-semibold">Reason</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-gray-500">
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map(request => (
                    <tr key={request._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium">{request.teacherId.name}</div>
                        <div className="text-sm text-gray-500">{request.teacherId.email}</div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">{request.reason}</td>
                      <td className="p-4">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="p-4 text-right">
                        {request.status === 'pending' && (
                          <div className="space-x-2">
                            <button 
                              onClick={() => handleActionClick(request, 'approve')}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleActionClick(request, 'reject')}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageLeaves;
