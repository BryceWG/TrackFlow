import { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  show: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type, message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        rounded-lg p-4 shadow-lg max-w-sm
        ${type === 'success' ? 'bg-green-50 text-green-800' : ''}
        ${type === 'error' ? 'bg-red-50 text-red-800' : ''}
        ${type === 'warning' ? 'bg-yellow-50 text-yellow-800' : ''}
        ${type === 'info' ? 'bg-blue-50 text-blue-800' : ''}
      `}>
        <div className="flex items-center">
          {type === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />}
          {type === 'error' && <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />}
          {type === 'warning' && <ExclamationCircleIcon className="h-5 w-5 text-yellow-400 mr-2" />}
          {type === 'info' && <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2" />}
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}; 