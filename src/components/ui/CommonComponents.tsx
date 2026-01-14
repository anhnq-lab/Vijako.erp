import React, { useState } from 'react';
import { showToast } from './Toast';

interface SearchBarProps {
    placeholder?: string;
    onSearch?: (query: string) => void;
    className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Tìm kiếm...',
    onSearch,
    className = '',
}) => {
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(query);
        } else {
            showToast.info(`Đang tìm kiếm: ${query}`);
        }
    };

    const handleClear = () => {
        setQuery('');
        if (onSearch) onSearch('');
    };

    return (
        <form onSubmit={handleSearch} className={`relative ${className}`}>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
            </span>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {query && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
            )}
        </form>
    );
};

interface FilterButtonProps {
    label: string;
    icon?: string;
    active?: boolean;
    onClick?: () => void;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
    label,
    icon = 'filter_list',
    active = false,
    onClick,
}) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${active
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
        >
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
            <span>{label}</span>
        </button>
    );
};

export const QuickActionButton: React.FC<{
    label: string;
    icon: string;
    onClick?: () => void;
    variant?: 'primary' | 'success' | 'warning' | 'danger';
}> = ({ label, icon, onClick, variant = 'primary' }) => {
    const variants = {
        primary: 'bg-primary hover:bg-primary/90 shadow-primary/20',
        success: 'bg-success hover:bg-success/90 shadow-success/20',
        warning: 'bg-warning hover:bg-warning/90 shadow-warning/20',
        danger: 'bg-alert hover:bg-alert/90 shadow-alert/20',
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-lg text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-100 ${variants[variant]}`}
        >
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
            <span>{label}</span>
        </button>
    );
};

export const EmptyState: React.FC<{
    icon: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}> = ({ icon, title, description, actionLabel, onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
                <span className="material-symbols-outlined text-[48px] text-slate-400">{icon}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
            {description && <p className="text-sm text-slate-500 text-center max-w-md mb-6">{description}</p>}
            {actionLabel && onAction && (
                <QuickActionButton label={actionLabel} icon="add" onClick={onAction} />
            )}
        </div>
    );
};

export const Badge: React.FC<{
    label: string;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md';
}> = ({ label, variant = 'default', size = 'md' }) => {
    const variants = {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-yellow-800',
        danger: 'bg-alert/10 text-alert',
        info: 'bg-blue-50 text-blue-700',
    };

    const sizes = {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
    };

    return (
        <span className={`inline-flex items-center rounded-full font-bold ${variants[variant]} ${sizes[size]}`}>
            {label}
        </span>
    );
};
