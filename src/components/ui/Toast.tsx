import React from 'react';
import toast, { Toaster, ToastBar } from 'react-hot-toast';

// Toast notification wrapper
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#fff',
                        color: '#1e293b',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                    },
                    success: {
                        iconTheme: {
                            primary: '#07883d',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                    },
                }}
            >
                {(t) => (
                    <ToastBar toast={t}>
                        {({ icon, message }) => (
                            <div className="flex items-center gap-3">
                                {icon}
                                <div className="flex-1">{message}</div>
                                {t.type !== 'loading' && (
                                    <button
                                        onClick={() => toast.dismiss(t.id)}
                                        className="ml-2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </ToastBar>
                )}
            </Toaster>
        </>
    );
};

// Toast helper functions
export const showToast = {
    success: (message: string) => {
        toast.success(message);
    },
    error: (message: string) => {
        toast.error(message);
    },
    loading: (message: string) => {
        return toast.loading(message);
    },
    promise: <T,>(
        promise: Promise<T>,
        msgs: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return toast.promise(promise, msgs);
    },
    dismiss: (toastId?: string) => {
        toast.dismiss(toastId);
    },
};

// Custom toast components
export const CustomToast = {
    info: (message: string) => {
        toast.custom(
            <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600">info</span>
                <span className="font-medium">{message}</span>
            </div>
        );
    },
    warning: (message: string) => {
        toast.custom(
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-yellow-600">warning</span>
                <span className="font-medium">{message}</span>
            </div>
        );
    },
};
