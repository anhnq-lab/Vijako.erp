import React, { useState } from 'react';
import { Modal } from '../ui/ModalComponents';
import { Input, Select, Textarea, DateInput, FormActions } from '../ui/FormComponents';
import { showToast } from '../ui/Toast';

interface ProjectFormData {
    code: string;
    name: string;
    location: string;
    manager: string;
    type: string;
    start_date: string;
    end_date: string;
    budget: string;
    description: string;
    status: 'active' | 'pending' | 'completed';
}

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectFormData) => Promise<void>;
    initialData?: Partial<ProjectFormData>;
    mode?: 'create' | 'edit';
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode = 'create'
}) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});

    const [formData, setFormData] = useState<ProjectFormData>({
        code: initialData?.code || '',
        name: initialData?.name || '',
        location: initialData?.location || '',
        manager: initialData?.manager || '',
        type: initialData?.type || '',
        start_date: initialData?.start_date || '',
        end_date: initialData?.end_date || '',
        budget: initialData?.budget || '',
        description: initialData?.description || '',
        status: initialData?.status || 'active',
    });

    const handleChange = (field: keyof ProjectFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Mã dự án là bắt buộc';
        }
        if (!formData.name.trim()) {
            newErrors.name = 'Tên dự án là bắt buộc';
        }
        if (!formData.location.trim()) {
            newErrors.location = 'Địa điểm là bắt buộc';
        }
        if (!formData.manager.trim()) {
            newErrors.manager = 'Chủ đầu tư là bắt buộc';
        }
        if (!formData.start_date) {
            newErrors.start_date = 'Ngày bắt đầu là bắt buộc';
        }
        if (formData.budget && isNaN(Number(formData.budget))) {
            newErrors.budget = 'Ngân sách phải là số';
        }
        if (formData.start_date && formData.end_date) {
            if (new Date(formData.end_date) < new Date(formData.start_date)) {
                newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            showToast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
            showToast.success(mode === 'create' ? 'Tạo dự án thành công' : 'Cập nhật dự án thành công');
            onClose();
        } catch (error) {
            showToast.error('Có lỗi xảy ra. Vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (Object.values(formData).some(v => v !== '')) {
            if (window.confirm('Bạn có chắc muốn hủy? Các thay đổi sẽ không được lưu.')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Tạo dự án mới' : 'Chỉnh sửa dự án'}
            subtitle={mode === 'create' ? 'Nhập thông tin dự án xây dựng' : `Cập nhật thông tin: ${initialData?.name}`}
            size="lg"
            closeOnBackdrop={false}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">info</span>
                        Thông tin cơ bản
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Mã dự án"
                            placeholder="VD: PR2500001"
                            value={formData.code}
                            onChange={(e) => handleChange('code', e.target.value)}
                            error={errors.code}
                            required
                            icon="tag"
                        />
                        <Input
                            label="Tên dự án"
                            placeholder="VD: Trường Tiểu học Tiên Sơn"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            error={errors.name}
                            required
                            icon="domain"
                        />
                    </div>
                </div>

                {/* Location & Owner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Địa điểm"
                        placeholder="VD: Xã Minh Trí, Huyện Sóc Sơn"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        error={errors.location}
                        required
                        icon="location_on"
                    />
                    <Input
                        label="Chủ đầu tư"
                        placeholder="VD: UBND Huyện Sóc Sơn"
                        value={formData.manager}
                        onChange={(e) => handleChange('manager', e.target.value)}
                        error={errors.manager}
                        required
                        icon="business"
                    />
                </div>

                {/* Type & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Loại dự án"
                        value={formData.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        options={[
                            { value: '', label: 'Chọn loại dự án' },
                            { value: 'residential', label: 'Nhà ở' },
                            { value: 'infrastructure', label: 'Hạ tầng' },
                            { value: 'commercial', label: 'Thương mại' },
                            { value: 'education', label: 'Giáo dục' },
                            { value: 'healthcare', label: 'Y tế' },
                            { value: 'industrial', label: 'Công nghiệp' },
                        ]}
                    />
                    <Select
                        label="Trạng thái"
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value as any)}
                        required
                        options={[
                            { value: 'active', label: 'Đang thi công' },
                            { value: 'pending', label: 'Chuẩn bị' },
                            { value: 'completed', label: 'Hoàn thành' },
                        ]}
                    />
                </div>

                {/* Timeline */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        Thời gian thực hiện
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DateInput
                            label="Ngày bắt đầu"
                            value={formData.start_date}
                            onChange={(e) => handleChange('start_date', e.target.value)}
                            error={errors.start_date}
                            required
                        />
                        <DateInput
                            label="Ngày kết thúc dự kiến"
                            value={formData.end_date}
                            onChange={(e) => handleChange('end_date', e.target.value)}
                            error={errors.end_date}
                        />
                    </div>
                </div>

                {/* Budget */}
                <Input
                    label="Ngân sách (VNĐ)"
                    type="number"
                    placeholder="VD: 15000000000"
                    value={formData.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    error={errors.budget}
                    icon="payments"
                    hint="Nhập ngân sách tổng dự án"
                />

                {/* Description */}
                <Textarea
                    label="Mô tả dự án"
                    placeholder="Nhập mô tả chi tiết về dự án..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                />

                {/* Form Actions */}
                <FormActions
                    onCancel={handleCancel}
                    submitLabel={mode === 'create' ? 'Tạo dự án' : 'Cập nhật'}
                    loading={loading}
                />
            </form>
        </Modal>
    );
};
