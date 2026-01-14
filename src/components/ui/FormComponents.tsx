import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// Form Field Wrapper
interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, required, hint, children }) => {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">
                {label}
                {required && <span className="text-alert ml-1">*</span>}
            </label>
            {children}
            {hint && !error && (
                <p className="text-xs text-slate-500">{hint}</p>
            )}
            {error && (
                <p className="text-xs text-alert flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {error}
                </p>
            )}
        </div>
    );
};

// Text Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, hint, icon, className = '', ...props }) => {
    const inputElement = (
        <div className="relative">
            {icon && (
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    {icon}
                </span>
            )}
            <input
                className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-white border ${error ? 'border-alert focus:ring-alert/20' : 'border-slate-200 focus:ring-primary/20'
                    } rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${className}`}
                {...props}
            />
        </div>
    );

    if (label) {
        return (
            <FormField label={label} error={error} hint={hint} required={props.required}>
                {inputElement}
            </FormField>
        );
    }

    return inputElement;
};

// Select
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, hint, options, className = '', ...props }) => {
    const selectElement = (
        <div className="relative">
            <select
                className={`w-full pl-4 pr-10 py-2.5 bg-white border ${error ? 'border-alert focus:ring-alert/20' : 'border-slate-200 focus:ring-primary/20'
                    } rounded-lg text-sm focus:outline-none focus:ring-2 transition-all appearance-none ${className}`}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                expand_more
            </span>
        </div>
    );

    if (label) {
        return (
            <FormField label={label} error={error} hint={hint} required={props.required}>
                {selectElement}
            </FormField>
        );
    }

    return selectElement;
};

// Textarea
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, hint, className = '', ...props }) => {
    const textareaElement = (
        <textarea
            className={`w-full px-4 py-2.5 bg-white border ${error ? 'border-alert focus:ring-alert/20' : 'border-slate-200 focus:ring-primary/20'
                } rounded-lg text-sm focus:outline-none focus:ring-2 transition-all resize-none ${className}`}
            rows={4}
            {...props}
        />
    );

    if (label) {
        return (
            <FormField label={label} error={error} hint={hint} required={props.required}>
                {textareaElement}
            </FormField>
        );
    }

    return textareaElement;
};

// Checkbox
interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, description, className = '', ...props }) => {
    return (
        <label className="flex items-start gap-3 cursor-pointer group">
            <input
                type="checkbox"
                className={`mt-0.5 size-5 rounded border-slate-300 text-primary focus:ring-primary/20 focus:ring-2 cursor-pointer ${className}`}
                {...props}
            />
            <div className="flex-1">
                <span className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">
                    {label}
                </span>
                {description && (
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                )}
            </div>
        </label>
    );
};

// Radio
interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    description?: string;
}

export const Radio: React.FC<RadioProps> = ({ label, description, className = '', ...props }) => {
    return (
        <label className="flex items-start gap-3 cursor-pointer group">
            <input
                type="radio"
                className={`mt-0.5 size-5 border-slate-300 text-primary focus:ring-primary/20 focus:ring-2 cursor-pointer ${className}`}
                {...props}
            />
            <div className="flex-1">
                <span className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">
                    {label}
                </span>
                {description && (
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                )}
            </div>
        </label>
    );
};

// Date Input
interface DateInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const DateInput: React.FC<DateInputProps> = ({ label, error, hint, className = '', ...props }) => {
    return (
        <Input
            type="date"
            label={label}
            error={error}
            hint={hint}
            icon="calendar_today"
            className={className}
            {...props}
        />
    );
};

// File Input
interface FileInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    onFileSelect?: (files: FileList | null) => void;
}

export const FileInput: React.FC<FileInputProps> = ({ label, error, hint, onFileSelect, className = '', ...props }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onFileSelect) {
            onFileSelect(e.target.files);
        }
    };

    const inputElement = (
        <div className="relative">
            <input
                type="file"
                onChange={handleChange}
                className="hidden"
                id="file-upload"
                {...props}
            />
            <label
                htmlFor="file-upload"
                className={`flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border-2 border-dashed ${error ? 'border-alert' : 'border-slate-200 hover:border-primary'
                    } rounded-lg text-sm font-medium text-slate-600 hover:text-primary cursor-pointer transition-all ${className}`}
            >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                <span>Chọn file hoặc kéo thả vào đây</span>
            </label>
        </div>
    );

    if (label) {
        return (
            <FormField label={label} error={error} hint={hint}>
                {inputElement}
            </FormField>
        );
    }

    return inputElement;
};

// Form Actions (Submit, Cancel buttons)
interface FormActionsProps {
    onSubmit?: () => void;
    onCancel?: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    submitDisabled?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
    onSubmit,
    onCancel,
    submitLabel = 'Lưu',
    cancelLabel = 'Hủy',
    loading = false,
    submitDisabled = false,
}) => {
    return (
        <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
            {onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {cancelLabel}
                </button>
            )}
            <button
                type={onSubmit ? 'button' : 'submit'}
                onClick={onSubmit}
                disabled={loading || submitDisabled}
                className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
            >
                {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                <span>{submitLabel}</span>
            </button>
        </div>
    );
};
