export interface Project {
  id: string;
  code: string;
  name: string;
  location?: string;
  manager?: string;
  progress?: number;
  plan_progress?: number;
  status: 'active' | 'pending' | 'completed' | 'delayed';
  avatar?: string;
  // New fields
  owner?: string;
  type?: string;
  package?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  area?: string;
  budget?: number;
  model_url?: string;
  lat?: number;
  lng?: number;
  schedule_performance?: 'ahead' | 'on_track' | 'delayed' | 'preparing' | 'completed';
  members?: string[];
}

export interface Contract {
  id: string;
  contract_code: string;
  name?: string;
  partner_name: string;
  project_id: string;
  value: number;
  paid_amount: number;
  retention_amount: number;
  status: 'active' | 'completed' | 'terminated';
  contract_type?: 'revenue' | 'expense';
  budget_category?: string; // Link to budget category for auto-calculation
  is_risk?: boolean;
  // Date fields
  signing_date?: string;
  start_date?: string;
  end_date?: string;
  // Additional fields
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WBSItem {
  id: string;
  wbs_code?: string; // e.g. "1.1", "1.1.2"
  name: string;
  progress: number;
  level: number;
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'done' | 'delayed' | 'pending';
  assigned_to?: string;
  children?: WBSItem[];
}

export interface ProjectIssue {
  id: string;
  project_id: string;
  code: string;
  type: 'NCR' | 'RFI' | 'General';
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Closed' | 'Resolved';
  due_date: string;
  pic: string;
}

export interface ProjectBudget {
  id: string;
  project_id?: string; // Link to project
  category: string;
  budget_amount: number;
  actual_amount: number;
  committed_amount: number;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  total_projects: number;
  last_evaluation: string;
  status: 'approved' | 'restricted' | 'pending';
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id?: string;
  vendor_name?: string; // For display after join
  items_summary: string;
  location: string;
  total_amount: number;
  delivery_date: string;
  status: 'Delivering' | 'Completed' | 'Pending' | 'Cancelled';
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'Steel' | 'Cement' | 'Brick' | 'Other';
  warehouse: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  status: 'Low' | 'Normal';
}

export type DiaryStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export interface ManpowerDetail {
  role: string;
  count: number;
  company?: string;
  notes?: string;
}

export interface EquipmentDetail {
  name: string;
  count: number;
  status: 'Working' | 'Maintenance' | 'Idle';
  notes?: string;
}

export interface DailyLog {
  id: string;
  project_id: string;
  date: string;
  weather: {
    temp: number;
    condition: string;
    humidity: number;
  };
  manpower_total: number;
  manpower_details?: ManpowerDetail[];
  equipment_details?: EquipmentDetail[];
  work_content: string;
  issues: string;
  safety_details?: string;
  images: string[];
  progress_update: Record<string, string>; // { "wbs_id": "completed", "node_id": "in_progress" }
  status: DiaryStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_by?: string;
  created_at: string;
  // CDE Extended fields
  revision?: string;
  status?: 'WIP' | 'SHARED' | 'PUBLISHED' | 'ARCHIVED' | 'OBSOLETE';
  category?: string;
  discipline?: string;
  approver?: string;
  approved_at?: string;
  folder_path?: string;
}

export interface CDEDocument extends ProjectDocument {
  revision: string;
  status: 'WIP' | 'SHARED' | 'PUBLISHED' | 'ARCHIVED' | 'OBSOLETE';
}

export interface DocumentActivity {
  id: string;
  document_id: string;
  user_name: string;
  action: 'upload' | 'download' | 'approve' | 'share' | 'archive' | 'delete' | 'edit';
  details?: Record<string, any>;
  created_at: string;
}

export type AlertType = 'deadline' | 'risk' | 'document' | 'contract' | 'approval' | 'safety';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  project_id?: string;
  project_name?: string;
  project_manager?: string;
  project_code?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  source_type?: string;
  source_id?: string;
  is_read: boolean;
  is_dismissed: boolean;
  due_date?: string;
  created_at: string;
}

export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  role: string;
  department: string;
  site: string;
  status: 'active' | 'leave' | 'inactive';
  last_checkin?: string; // timestamp
  created_at?: string;
  // Auth fields
  email?: string;
  user_id?: string;
  avatar_url?: string;
  is_admin?: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string; // from Employee
  employee_id?: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  check_in: string;
  check_out?: string;
  location_lat?: number;
  location_lng?: number;
  site_id?: string;
  status: 'present' | 'absent' | 'late' | 'leave';
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  description?: string;
  requirements?: string;
  salary_range?: string;
  start_date?: string;
  end_date?: string;
  status: 'open' | 'closed' | 'paused';
  created_at?: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone?: string;
  cv_url?: string;
  cover_letter?: string;
  status: 'applied' | 'screening' | 'interviewing' | 'offered' | 'rejected';
  applied_at?: string;
}

export interface BiddingPackage {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  budget?: number;
  deadline?: string;
  status: 'draft' | 'published' | 'closed' | 'awarded';
}

export interface BiddingQuote {
  id: string;
  package_id: string;
  vendor_id: string;
  vendor_name?: string;
  price: number;
  proposal_url?: string;
  score?: number;
  status: 'submitted' | 'under_review' | 'awarded' | 'rejected';
}

export interface BankGuarantee {
  id: string;
  guarantee_code: string;
  guarantee_type: string;
  project_id: string;
  project_name?: string;
  bank_name: string;
  guarantee_value: number;
  expiry_date: string;
  status: 'active' | 'warning' | 'expired' | 'released';
}

export interface PaymentRequest {
  id: string;
  request_code: string;
  contract_id: string;
  partner_name?: string;
  project_id: string;
  project_name?: string;
  amount: number;
  submission_date: string;
  status: 'pending' | 'under_review' | 'approved' | 'paid' | 'rejected';
  is_blocked: boolean;
  block_reason?: string;
}

export interface CashFlowData {
  name: string;
  thu: number;
  chi: number;
  net: number;
}

export interface Invoice {
  id: string;
  invoice_code: string;
  invoice_type: 'sales' | 'purchase';
  project_id: string;
  project_name?: string;
  contract_id?: string;
  contract_code?: string;
  vendor_name: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  status: 'pending' | 'partially_paid' | 'paid' | 'overdue';
}

export interface PaymentRecord {
  id: string;
  payment_code: string;
  payment_type: 'receipt' | 'disbursement';
  project_id: string;
  project_name?: string;
  contract_id?: string;
  contract_code?: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  partner_name: string;
  status: 'pending' | 'completed' | 'cancelled';
  description?: string;
}

// Risk Matrix Types
export type RiskCategory = 'schedule' | 'cost' | 'safety' | 'quality' | 'legal' | 'resource';
export type RiskStatus = 'open' | 'mitigating' | 'closed' | 'accepted';
export type RiskSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ProjectRisk {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  category: RiskCategory;
  probability: number; // 1-5
  impact: number; // 1-5
  risk_score: number; // computed: probability * impact (1-25)
  status: RiskStatus;
  mitigation_plan?: string;
  owner_id?: string;
  identified_date?: string;
  review_date?: string;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  project_name?: string;
  project_code?: string;
}

export interface RiskMatrixData {
  x: number; // probability as percentage (probability * 20)
  y: number; // impact as percentage (impact * 20)
  z: number; // bubble size (risk_score * 40 for visibility)
  name: string; // project name
  status: RiskSeverity;
  color: string;
  projectId?: string;
  riskId?: string;
  title?: string;
}

// Approval System Types
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'skipped';
export type ApprovalPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ApprovalType = 'payment' | 'contract' | 'leave' | 'purchase' | 'other';

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface ApprovalWorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  name: string;
  approver_role: string;
}

export interface ApprovalRequestStep {
  id: string;
  request_id: string;
  step_id: string;
  status: ApprovalStatus;
  approver_id?: string;
  approved_at?: string;
  comments?: string;
  created_at: string;
  // Joined fields
  step_name?: string; // from step_id
  approver_name?: string;
}

export interface ApprovalRequest {
  id: string;
  title: string;
  description?: string;
  type: ApprovalType;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  requester_id: string;
  approver_id?: string; // Legacy or generic approver
  project_id?: string;
  payload?: any;
  created_at: string;
  updated_at: string;
  // Workflow fields
  workflow_id?: string;
  current_step_id?: string;
  // Joined fields
  project_name?: string;
  requester_name?: string;
  approver_name?: string;
}
// Task Management Types
export interface UserTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'high' | 'normal' | 'low';
  due_date?: string;
  assignee_ids?: string[]; // List of user IDs assigned to this task
  created_at: string;
}

export interface TaskBoardColumn {
  id: string;
  title: string;
  tasks: UserTask[];
}

// ==========================================
// PAYMENT CLAIM MANAGEMENT TYPES (QT-CL-20)
// ==========================================

// Payment Contract - Điều khoản thanh toán
export interface PaymentContract {
  id: string;
  contract_id: string; // FK to contracts table
  retention_percent: number; // VD: 5.00 = 5%
  retention_limit: number; // Hạn mức giữ lại tối đa
  advance_payment_amount: number; // Số tiền tạm ứng
  advance_repayment_rule: string; // Quy tắc hoàn ứng (JSON hoặc formula)
  vat_percent: number; // VD: 10.00 = 10%
  created_at: string;
  updated_at: string;

  // Joined fields
  contract_code?: string;
  contract_name?: string;
  project_name?: string;
  partner_name?: string;
}

// BOQ Item - Bill of Quantities (cấu trúc cây)
export interface BOQItem {
  id: string;
  payment_contract_id: string;
  bill_number: string; // VD: "Bill 1", "Bill 2"
  group_code?: string; // VD: "1.0", "2.1"
  item_code: string; // VD: "1.1.01", "2.3.05"
  description: string; // Mô tả hạng mục
  unit: string; // Đơn vị: m3, m2, kg, tấn...
  unit_rate: number; // Đơn giá
  contract_qty: number; // Khối lượng hợp đồng
  contract_amount: number; // unit_rate * contract_qty (tự động tính)
  parent_id?: string; // Cho cấu trúc cây
  created_at: string;

  // Frontend only - populated on client
  children?: BOQItem[];
  level?: number; // Tree level for display
}

// IPC Status
export type IPCStatus =
  | 'draft'           // Nháp
  | 'internal_review' // Đang duyệt nội bộ
  | 'submitted'       // Đã trình khách hàng
  | 'certified'       // Khách hàng đã xác nhận
  | 'invoiced'        // Đã xuất hóa đơn
  | 'rejected';       // Từ chối

// Interim Payment Claim - Hồ sơ thanh toán đợt
export interface InterimPaymentClaim {
  id: string;
  payment_contract_id: string;
  ipc_number: string; // VD: "Đợt 01", "No. 01"
  period_start: string; // Date
  period_end: string; // Date
  status: IPCStatus;
  submitted_date?: string; // Date
  certified_date?: string; // Date

  // Các giá trị tài chính (được tính toán)
  works_executed_amount: number; // Giá trị công việc đã hoàn thành
  variations_amount: number; // Giá trị phát sinh (đã duyệt)
  mos_amount: number; // Material On Site
  gross_total: number; // Tổng gộp
  retention_amount: number; // Giữ lại
  advance_repayment: number; // Hoàn trả tạm ứng
  net_payment: number; // Thanh toán ròng
  vat_amount: number; // Thuế VAT
  total_with_vat: number; // Tổng cộng có VAT

  // Dual tracking
  submitted_net_payment?: number; // Số tiền mình trình
  certified_net_payment?: number; // Số tiền khách duyệt

  created_by: string;
  created_at: string;
  updated_at: string;

  // Joined fields
  contract_code?: string;
  project_name?: string;
}

// IPC Work Detail - Chi tiết khối lượng từng hạng mục
export interface IPCWorkDetail {
  id: string;
  ipc_id: string;
  boq_item_id: string;

  // Khối lượng
  current_qty: number; // Khối lượng kỳ này
  cumulative_qty: number; // Lũy kế đến kỳ này

  // Giá trị
  current_amount: number; // Giá trị kỳ này
  cumulative_amount: number; // Giá trị lũy kế

  notes?: string;
  created_at: string;

  // Joined fields từ BOQItem
  item_code?: string;
  description?: string;
  unit?: string;
  unit_rate?: number;
  contract_qty?: number;
  contract_amount?: number;
}

// Variation Type
export type VariationType =
  | 'material_change'  // Thay đổi vật liệu
  | 'quantity_change'  // Thay đổi khối lượng
  | 'new_item';        // Hạng mục mới

// Variation Status
export type VariationStatus =
  | 'pending'   // Chờ duyệt
  | 'approved'  // Đã duyệt
  | 'rejected'; // Từ chối

// Variation - Phát sinh hợp đồng
export interface Variation {
  id: string;
  payment_contract_id: string;
  variation_code: string; // VD: "VO-001", "VO-002"
  type: VariationType;
  description: string;

  // Số tiền
  proposed_amount: number; // Đề xuất
  approved_amount?: number; // Đã duyệt

  status: VariationStatus;
  boq_item_id?: string; // Link to BOQ item nếu có
  approved_date?: string; // Date
  approved_by?: string;

  created_at: string;
  updated_at: string;

  // Joined fields
  item_description?: string;
}

// IPC Document Type
export type IPCDocumentType =
  | 'photo'              // Hình ảnh thi công
  | 'bienbannghiemthu'   // Biên bản nghiệm thu
  | 'boqdetail'          // Chi tiết BOQ
  | 'other';             // Khác

// IPC Document - Tài liệu đính kèm
export interface IPCDocument {
  id: string;
  ipc_id: string;
  document_type: IPCDocumentType;
  file_name: string;
  file_url: string;
  file_size: number; // bytes
  uploaded_by: string;
  uploaded_at: string;

  // Joined fields
  uploader_name?: string;
}

// IPC Workflow History - Lịch sử phê duyệt
export interface IPCWorkflowHistory {
  id: string;
  ipc_id: string;
  from_status: IPCStatus;
  to_status: IPCStatus;
  approver_id?: string;
  approver_name: string;
  comments?: string;
  action_date: string;
}

// Helper type cho financial summary
export interface IPCFinancialSummary {
  works_executed_amount: number;
  variations_amount: number;
  mos_amount: number;
  gross_total: number;
  retention_amount: number;
  advance_repayment: number;
  net_payment: number;
  vat_amount: number;
  total_with_vat: number;
}

