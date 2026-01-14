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
}

export interface Contract {
  id: string;
  contract_code: string;
  partner_name: string;
  project_id: string;
  value: number;
  paid_amount: number;
  retention_amount: number;
  status: 'active' | 'completed' | 'terminated';
  type?: 'revenue' | 'expense';
  budget_category?: string; // Link to budget category for auto-calculation
  is_risk?: boolean;
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
}
