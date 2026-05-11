export interface ApisRow {
  id: string;
  name: string;
  description: string | null;
  source: string;
  source_url: string | null;
  category: string;
  icon_url: string | null;
  is_active: boolean | null;
  memo: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ApisInsert {
  id?: string;
  name: string;
  description?: string | null;
  source: string;
  source_url?: string | null;
  category: string;
  icon_url?: string | null;
  is_active?: boolean | null;
  memo?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ApisUpdate {
  name?: string;
  description?: string | null;
  source?: string;
  source_url?: string | null;
  category?: string;
  icon_url?: string | null;
  is_active?: boolean | null;
  memo?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
