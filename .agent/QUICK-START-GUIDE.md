# 🚀 QUICK START GUIDE - VIJAKO ERP v1.3.0

## 📝 SỬ DỤNG CÁC COMPONENTS MỚI

### 1. FORM - Tạo form đơn giản
```typescript
import { Input, Select, FormActions } from './src/components/ui/FormComponents';
import { useState } from 'react';

function MyForm() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Tên"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
        icon="person"
      />

      <Select
        label="Trạng thái"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        options={[
          { value: 'active', label: 'Hoạt động' },
          { value: 'inactive', label: 'Không hoạt động' }
        ]}
        required
      />

      <FormActions
        onCancel={() => console.log('Cancel')}
        submitLabel="Lưu"
      />
    </form>
  );
}
```

### 2. FILTERS - Thêm bộ lọc nâng cao
```typescript
import { AdvancedFilters, QuickFilters } from './src/components/ui/FilterComponents';

function MyList() {
  const [filterValues, setFilterValues] = useState({});

  const filterConfig = [
    { key: 'name', label: 'Tên', type: 'text' },
    { key: 'status', label: 'Trạng thái', type: 'select', 
      options: [
        { value: 'active', label: 'Hoạt động' }
      ]
    },
    { key: 'date', label: 'Ngày', type: 'date' }
  ];

  return (
    <>
      <QuickFilters
        filters={[
          { id: 'all', label: 'Tất cả', icon: 'apps' },
          { id: 'active', label: 'Hoạt động', icon: 'check' }
        ]}
        activeId="all"
        onChange={(id) => console.log(id)}
      />

      <AdvancedFilters
        filters={filterConfig}
        values={filterValues}
        onChange={setFilterValues}
        onApply={() => console.log('Apply', filterValues)}
      />
    </>
  );
}
```

### 3. EXPORT - Xuất dữ liệu
```typescript
import { ExportButton } from './src/components/ui/ExportComponents';

function MyTable() {
  const data = [
    { name: 'Dự án 1', status: 'Hoạt động', budget: 1000000 },
    { name: 'Dự án 2', status: 'Hoàn thành', budget: 2000000 }
  ];

  return (
    <div>
      <ExportButton
        data={data}
        filename="danh-sach-du-an"
        title="Danh sách Dự án"
        variant="primary"
      />
      {/* Your table here */}
    </div>
  );
}
```

### 4. MODAL - Hiển thị form trong modal
```typescript
import { Modal } from './src/components/ui/ModalComponents';
import { ProjectFormModal } from './src/components/forms/ProjectFormModal';

function MyPage() {
  const [showModal, setShowModal] = useState(false);

  // Simple Modal
  return (
    <>
      <button onClick={() => setShowModal(true)}>Mở Modal</button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tiêu đề"
        size="md"
      >
        <p>Nội dung modal ở đây</p>
      </Modal>

      {/* Or use ready-made form modal */}
      <ProjectFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={async (data) => {
          console.log('Submit', data);
          // API call here
        }}
        mode="create"
      />
    </>
  );
}
```

### 5. CONFIRM DIALOG - Xác nhận hành động
```typescript
import { ConfirmDialog } from './src/components/ui/ModalComponents';

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    // Delete logic
    setShowConfirm(false);
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Xóa</button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa mục này?"
        variant="danger"
        confirmLabel="Xóa"
      />
    </>
  );
}
```

---

## 🎯 KEYBOARD SHORTCUTS

| Phím | Chức năng |
|------|-----------|
| **Cmd/Ctrl + K** | Mở Global Search |
| **ESC** | Đóng Modal/Dialog |
| **↑ ↓** | Di chuyển trong search results |
| **Enter** | Chọn/Submit |

---

## 📦 COMPLETE PAGE EXAMPLE

```typescript
import React, { useState, useEffect } from 'react';
import { PageHeader } from './src/components/ui/Breadcrumbs';
import { DataTable, Column } from './src/components/ui/DataTable';
import { AdvancedFilters } from './src/components/ui/FilterComponents';
import { ExportButton } from './src/components/ui/ExportComponents';
import { ProjectFormModal } from './src/components/forms/ProjectFormModal';
import { ConfirmDialog } from './src/components/ui/ModalComponents';
import { QuickActionButton } from './src/components/ui/CommonComponents';
import { Badge } from './src/components/ui/CommonComponents';

interface Project {
  id: string;
  code: string;
  name: string;
  status: string;
  budget: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState({});

  // Load data
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      // const data = await projectService.getAllProjects();
      // setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns: Column<Project>[] = [
    { key: 'code', label: 'Mã DA', sortable: true },
    { key: 'name', label: 'Tên dự án', sortable: true },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (project) => (
        <Badge
          label={project.status}
          variant={project.status === 'active' ? 'success' : 'default'}
        />
      )
    },
    { key: 'budget', label: 'Ngân sách', sortable: true }
  ];

  // Handlers
  const handleCreate = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    // await projectService.deleteProject(deleteId);
    setDeleteId(null);
    loadProjects();
  };

  const handleSubmit = async (data: any) => {
    if (editingProject) {
      // await projectService.updateProject(editingProject.id, data);
    } else {
      // await projectService.createProject(data);
    }
    loadProjects();
  };

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Quản lý Dự án"
        subtitle={`${projects.length} dự án`}
        icon="domain"
        actions={
          <>
            <ExportButton
              data={projects}
              filename="danh-sach-du-an"
              title="Danh sách Dự án"
              variant="secondary"
            />
            <QuickActionButton
              label="Tạo dự án"
              icon="add"
              onClick={handleCreate}
            />
          </>
        }
      />

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Filters */}
        <AdvancedFilters
          filters={[
            { key: 'name', label: 'Tên dự án', type: 'text' },
            { key: 'status', label: 'Trạng thái', type: 'select',
              options: [
                { value: 'active', label: 'Hoạt động' },
                { value: 'completed', label: 'Hoàn thành' }
              ]
            },
            { key: 'startDate', label: 'Ngày bắt đầu', type: 'date' }
          ]}
          values={filterValues}
          onChange={setFilterValues}
        />

        {/* Table */}
        <DataTable
          data={projects}
          columns={columns}
          loading={loading}
          onRowClick={handleEdit}
          emptyMessage="Chưa có dự án nào"
        />
      </div>

      {/* Form Modal */}
      <ProjectFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        initialData={editingProject || undefined}
        mode={editingProject ? 'edit' : 'create'}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa dự án này?"
        variant="danger"
        confirmLabel="Xóa"
      />
    </>
  );
}
```

---

## ✅ CHECKLIST SỬ DỤNG

### Khi tạo trang mới:
- [ ] Import PageHeader cho header
- [ ] Import DataTable cho bảng dữ liệu
- [ ] Import AdvancedFilters cho bộ lọc
- [ ] Import ExportButton cho xuất dữ liệu
- [ ] Import Form Modal cho CRUD
- [ ] Import ConfirmDialog cho xác nhận xóa

### Khi tạo form:
- [ ] Import form components cần thiết
- [ ] Setup state cho form data
- [ ] Setup state cho errors
- [ ] Viết validate function
- [ ] Handle submit
- [ ] Handle cancel
- [ ] Add loading state

---

## 🎨 STYLING TIPS

### Colors
- Primary: `#1f3f89` (Blue)
- Success: `#07883d` (Green)
- Warning: `#FACC15` (Yellow)
- Alert: `#EF4444` (Red)

### Spacing
- Small gap: `gap-2` (8px)
- Medium gap: `gap-4` (16px)
- Large gap: `gap-6` (24px)

### Padding
- Form padding: `p-6`
- Card padding: `p-5`
- Button padding: `px-6 py-2.5`

---

## 🐛 TROUBLESHOOTING

### Form không submit?
- Kiểm tra `onSubmit` event handler
- Kiểm tra validation function
- Check console for errors

### Export không work?
- Verify data format (array of objects)
- Check XLSX library imported
- Check browser console

### Modal không hiện?
- Verify `isOpen` prop
- Check z-index conflicts
- Ensure Modal is rendered

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Check console for errors
2. Review component props
3. Check TypeScript types
4. Review documentation

---

*Quick Start Guide v1.0 - Updated: 14/01/2026*
