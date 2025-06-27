import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const ActionConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
  showComment = false,
  iconType = 'alert',
  teacherOptions = [],
  selectedTeacherId = '',
  onTeacherSelect = () => {},
}) => {
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (isOpen) {
      setComment('');
      console.log('=== MODAL DEBUG INFO ===');
      console.log('Teachers available:', teacherOptions.length);
      console.log('Show comment:', showComment);
      console.log('========================');
    }
  }, [isOpen, teacherOptions, showComment, selectedTeacherId]);

  if (!isOpen) return null;

  const isRed = confirmButtonClass.includes('red');
  const iconColorClass = isRed ? 'text-red-600' : 'text-green-600';
  const bgColorClass = isRed ? 'bg-red-100' : 'bg-green-100';

  const handleConfirm = () => {
    onConfirm(comment);
    setComment('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-start mb-4">
          <div className={`mr-3 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${bgColorClass}`}>
            {iconType === 'alert' ? (
              <FiAlertTriangle className={iconColorClass} size={24} />
            ) : (
              <FiCheckCircle className={iconColorClass} size={24} />
            )}
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <div className="text-gray-600">
              {typeof message === 'string' ? <p>{message}</p> : message}
            </div>
          </div>
        </div>

        {/* Teacher Selection Section - Always shows when showComment is true */}
        {showComment && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Cover Teacher *
            </label>
            
            <select
              value={selectedTeacherId}
              onChange={(e) => {
                console.log('Teacher selected:', e.target.value);
                onTeacherSelect(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Select a Teacher --</option>
              
              {/* Show "No teachers found" when array is empty */}
              {teacherOptions.length === 0 ? (
                <option value="" disabled className="text-red-600">
                  No teachers found
                </option>
              ) : (
                teacherOptions.map((teacher) => (
                  <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
                    {teacher.name} {teacher.email ? `(${teacher.email})` : ''}
                  </option>
                ))
              )}
            </select>
            
            {/* Status indicator below dropdown */}
            <div className="mt-2">
              {teacherOptions.length === 0 ? (
                <p className="text-sm text-red-600 font-medium">
                  No teachers available. Check your API endpoint or database.
                </p>
              ) : (
                <p className="text-sm text-green-600">
                  {teacherOptions.length} teachers loaded successfully
                </p>
              )}
            </div>

            {/* Comment/Reason field */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Change (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter reason for reassignment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={showComment && teacherOptions.length === 0}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${confirmButtonClass} ${
              showComment && teacherOptions.length === 0
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
          >
            {confirmButtonText}
            {showComment && teacherOptions.length === 0 && ' (No Teachers Available)'}
            {showComment && teacherOptions.length > 0 && !selectedTeacherId && ' (Select Teacher)'}
          </button>
        </div>

        {/* Debug info - remove in production */}
        <div className="mt-4 p-3 bg-gray-50 border rounded text-xs text-gray-600">
          <strong>Debug:</strong> {teacherOptions.length} teachers loaded | 
          Selected: {selectedTeacherId || 'None'} | 
          Show dropdown: {showComment ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmationModal;