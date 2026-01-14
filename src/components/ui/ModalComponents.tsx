import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showClose?: boolean;
    closeOnBackdrop?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    size = 'md',
    showClose = true,
    closeOnBackdrop = true
}) => {
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-full mx-4'
    };

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeOnBackdrop ? onClose : undefined}
            />

            {/* Modal */}
            <div className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                        {subtitle && (
                            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
                        )}
                    </div>
                    {showClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-slate-400">close</span>
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Confirmation Dialog
interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Xác nhận',
    cancelLabel = 'Hủy',
    variant = 'primary',
    loading = false
}) => {
    const variants = {
        danger: {
            icon: 'error',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            buttonBg: 'bg-red-600 hover:bg-red-700',
            shadow: 'shadow-red-600/20'
        },
        warning: {
            icon: 'warning',
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
            shadow: 'shadow-yellow-600/20'
        },
        primary: {
            icon: 'info',
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
            buttonBg: 'bg-primary hover:bg-primary/90',
            shadow: 'shadow-primary/20'
        }
    };

    const style = variants[variant];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={loading ? undefined : onClose}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    {/* Icon */}
                    <div className={`${style.iconBg} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
                        <span className={`material-symbols-outlined text-[28px] ${style.iconColor}`}>
                            {style.icon}
                        </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                    <p className="text-sm text-slate-600">{message}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-6">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 disabled:opacity-50 transition-all"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 px-6 py-2.5 ${style.buttonBg} text-white rounded-lg font-bold text-sm disabled:opacity-50 shadow-lg ${style.shadow} transition-all flex items-center justify-center gap-2`}
                        >
                            {loading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            )}
                            <span>{confirmLabel}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Drawer (Side modal)
interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    position?: 'left' | 'right';
    width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    position = 'right',
    width = '400px'
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const slideClass = position === 'right'
        ? 'right-0 animate-in slide-in-from-right'
        : 'left-0 animate-in slide-in-from-left';

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`absolute top-0 bottom-0 ${slideClass} bg-white shadow-2xl duration-300 flex flex-col`}
                style={{ width }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                        {subtitle && (
                            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
