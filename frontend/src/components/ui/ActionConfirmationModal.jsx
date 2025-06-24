import React, { useState, useEffect } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const ActionConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
  showComment = false,
}) => {
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (isOpen) {
      setComment('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-start mb-4">
          <div className="mr-3 flex-shrink-0">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${confirmButtonClass.includes('red') ? 'bg-red-100' : 'bg-green-100'}`}>
                <FiAlertTriangle className={`${confirmButtonClass.includes('red') ? 'text-red-600' : 'text-green-600'}`} size={24} />
            </div>
          </div>
          <div className='flex-grow'>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-gray-600 mt-2">{message}</p>
          </div>
        </div>

        {showComment && (
          <div className="mb-6">
            <label htmlFor="admin-comment" className="block text-sm font-medium text-gray-700 mb-1">
              Comment (Optional)
            </label>
            <textarea
              id="admin-comment"
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Provide a reason or comment..."
            ></textarea>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(comment)}
            className={`px-4 py-2 text-white rounded-md ${confirmButtonClass}`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmationModal; 