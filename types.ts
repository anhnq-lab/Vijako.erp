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
  type?: 'revenue' | 'expense';
  budget_category?: string; // Link to budget category for auto-calculation
  is_risk?: boolean;
  end_date?: string;
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
  last_checkin?: string;
  created_at?: string;
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
  code: string;
  type: string;
  project_id: string;
  project_name?: string;
  bank_name: string;
  value: number;
  expiry_date: string;
  status: 'active' | 'warning' | 'expired' | 'released';
}

export interface PaymentRequest {
  id: string;
  code: string;
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
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type ApprovalPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ApprovalType = 'payment' | 'contract' | 'leave' | 'purchase' | 'other';

export interface ApprovalRequest {
  id: string;
  title: string;
  description?: string;
  type: ApprovalType;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  requester_id: string;
  approver_id?: string;
  project_id?: string;
  payload?: any;
  created_at: string;
  updated_at: string;
  // Joined fields
  project_name?: string;
  requester_name?: string;
  approver_name?: string;
}
