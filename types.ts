export interface Project {
  id: string;
  code: string;
  name: string;
  location: string;
  manager: string;
  progress: number;
  planProgress: number;
  status: 'active' | 'pending' | 'completed' | 'delayed';
  avatar?: string;
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
  volume: string;
  price: string;
  materials?: string;
  children?: WBSItem[];
  level: number;
}
