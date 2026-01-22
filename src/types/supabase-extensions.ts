// Temporary type extensions until Supabase types are regenerated
export interface UserAccessLog {
  id?: string;
  user_id: string;
  page_route?: string;
  access_type: 'login' | 'page_view';
  accessed_at?: string;
}
