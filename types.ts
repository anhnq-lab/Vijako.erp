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
}

export interface Contract {
  id: string;
  code: string;
  partner: string;
  project: string;
  value: number;
  paid: number;
  retention: number;
  status: 'active' | 'completed';
  warning?: boolean;
}

export interface WBSItem {
  id: string;
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
