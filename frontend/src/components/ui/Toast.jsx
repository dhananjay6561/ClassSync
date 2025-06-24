import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const toastTypes = {
  success: {
    bg: 'bg-green-600',
    icon: <FiCheckCircle />,
  },
  error: {
    bg: 'bg-red-600',
    icon: <FiAlertTriangle />,
  },
  info: {
    bg: 'bg-blue-600',
    icon: <FiAlertTriangle />,
  }
};

const Toast = ({ message, type = 'info', onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for fade-out
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const toastStyle = toastTypes[type] || toastTypes.info;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-4 transition-all duration-300 ${toastStyle.bg} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ minWidth: 250 }}
    >
      <div className="flex-shrink-0">{toastStyle.icon}</div>
      <div className="flex-grow">{message}</div>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="ml-2 text-white hover:text-gray-200">
        <FiX />
      </button>
    </div>
  );
};

export default Toast; 