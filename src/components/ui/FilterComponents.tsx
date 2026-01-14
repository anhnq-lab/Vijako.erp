import React, { useState } from 'react';
import { Input, Select, DateInput } from './FormComponents';

export interface FilterConfig {
    key: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'daterange' | 'number';
    options?: { value: string | number; label: string }[];
    placeholder?: string;
}

export interface FilterValues {
    [key: string]: any;
}

interface AdvancedFiltersProps {
    filters: FilterConfig[];
    values: FilterValues;
    onChange: (values: FilterValues) => void;
    onApply?: () => void;
    onReset?: () => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
    filters,
    values,
    onChange,
    onApply,
    onReset,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const activeFiltersCount = Object.values(values).filter(v => v !== '' && v !== null && v !== undefined).length;

    const handleChange = (key: string, value: any) => {
        onChange({ ...values, [key]: value });
    };

    const handleReset = () => {
        const resetValues: FilterValues = {};
        filters.forEach(f => resetValues[f.key] = '');
        onChange(resetValues);
        if (onReset) onReset();
    };

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Filter Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">filter_list</span>
                    <span>Bộ lọc nâng cao</span>
                    {activeFiltersCount > 0 && (
                        <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                    <span className={`material-symbols-outlined text-[20px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </button>

                {activeFiltersCount > 0 && (
                    <button
                        onClick={handleReset}
                        className="text-xs font-bold text-slate-500 hover:text-alert transition-colors"
                    >
                        Xóa bộ lọc
                    </button>
                )}
            </div>

            {/* Filter Content */}
            {isExpanded && (
                <div className="p-6 bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {filters.map((filter) => (
                            <div key={filter.key}>
                                {filter.type === 'text' && (
                                    <Input
                                        label={filter.label}
                                        placeholder={filter.placeholder}
                                        value={values[filter.key] || ''}
                                        onChange={(e) => handleChange(filter.key, e.target.value)}
                                    />
                                )}
                                {filter.type === 'select' && filter.options && (
                                    <Select
                                        label={filter.label}
                                        options={[{ value: '', label: 'Tất cả' }, ...filter.options]}
                                        value={values[filter.key] || ''}
                                        onChange={(e) => handleChange(filter.key, e.target.value)}
                                    />
                                )}
                                {filter.type === 'date' && (
                                    <DateInput
                                        label={filter.label}
                                        value={values[filter.key] || ''}
                                        onChange={(e) => handleChange(filter.key, e.target.value)}
                                    />
                                )}
                                {filter.type === 'number' && (
                                    <Input
                                        type="number"
                                        label={filter.label}
                                        placeholder={filter.placeholder}
                                        value={values[filter.key] || ''}
                                        onChange={(e) => handleChange(filter.key, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onApply}
                            className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">search</span>
                            <span>Áp dụng</span>
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all"
                        >
                            Đặt lại
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Quick Filters (Chips)
interface QuickFilter {
    id: string;
    label: string;
    icon?: string;
}

interface QuickFiltersProps {
    filters: QuickFilter[];
    activeId?: string;
    onChange: (id: string) => void;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({ filters, activeId, onChange }) => {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onChange(filter.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeId === filter.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    {filter.icon && (
                        <span className="material-symbols-outlined text-[18px]">{filter.icon}</span>
                    )}
                    <span>{filter.label}</span>
                </button>
            ))}
        </div>
    );
};

// Filter Tags (Active filters display)
interface FilterTag {
    key: string;
    label: string;
    value: string;
}

interface FilterTagsProps {
    tags: FilterTag[];
    onRemove: (key: string) => void;
    onClearAll?: () => void;
}

export const FilterTags: React.FC<FilterTagsProps> = ({ tags, onRemove, onClearAll }) => {
    if (tags.length === 0) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500">Đang lọc:</span>
            {tags.map((tag) => (
                <div
                    key={tag.key}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold"
                >
                    <span>{tag.label}: {tag.value}</span>
                    <button
                        onClick={() => onRemove(tag.key)}
                        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                </div>
            ))}
            {onClearAll && (
                <button
                    onClick={onClearAll}
                    className="text-xs font-bold text-slate-500 hover:text-alert transition-colors"
                >
                    Xóa tất cả
                </button>
            )}
        </div>
    );
};
