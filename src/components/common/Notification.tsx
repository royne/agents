import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? FaCheckCircle : FaExclamationCircle;

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl z-[9999] flex items-center gap-4 animate-slide-up`}>
      <Icon className="text-xl" />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity ml-2">
        <FaTimes />
      </button>
    </div>
  );
};

export default Notification;
