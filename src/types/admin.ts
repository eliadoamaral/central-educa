export interface UserActivity {
  id: string;
  name: string;
  email: string;
  created_at: string;
  role: 'admin' | 'user';
  total_logins: number;
  last_login: string | null;
  total_page_views: number;
}

export interface UserFilters {
  searchTerm?: string;
  role?: 'admin' | 'user' | '';
  dateFrom?: string;
  dateTo?: string;
  lastActivityFrom?: string;
  lastActivityTo?: string;
  minLogins?: number;
  maxLogins?: number;
  activityLevel?: 'high' | 'medium' | 'low' | 'inactive' | '';
}

export interface FilterPreset {
  id: string;
  admin_user_id: string;
  preset_name: string;
  filters: UserFilters;
  created_at: string;
}

export interface PaginatedResponse {
  users: UserActivity[];
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}

export type AdminActionType = 
  | 'role_change'
  | 'user_delete'
  | 'user_suspend'
  | 'user_reactivate'
  | 'config_change'
  | 'export_data';

export interface AdminAction {
  id: string;
  admin_user_id: string;
  admin_name?: string;
  admin_email?: string;
  action_type: AdminActionType;
  target_user_id: string | null;
  target_user_name?: string;
  target_user_email?: string;
  action_details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface SortConfig {
  column: keyof UserActivity;
  direction: 'asc' | 'desc';
}
