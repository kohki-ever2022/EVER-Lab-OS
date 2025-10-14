import React from 'react';
import { useToast } from '../../contexts/ToastContext';

type ToastType = 'success' | 'error' | 'info' | 'warning';

const Toast: React.FC = () => {
    const { toasts } = useToast();
    if (!toasts.length) return null;

    const getToastBgColor = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'info':
            default:
                return 'bg-blue-500';
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <div key={toast.id} className={`p-4 rounded-lg shadow-lg text-white ${getToastBgColor(toast.type)}`}>
                    {toast.message}
                </div>
            ))}
        </div>
    );
};

export default Toast;
