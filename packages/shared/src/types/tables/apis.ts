type ApisWritable = {
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
};

export interface ApisRow extends ApisWritable {
  id: string;
}

export type ApisInsert =
  Omit<ApisWritable, "description" | "source_url" | "icon_url" | "is_active" | "memo" | "created_at" | "updated_at"> & {
    id?: string;
    description?: string | null;
    source_url?: string | null;
    icon_url?: string | null;
    is_active?: boolean | null;
    memo?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };

export type ApisUpdate = Partial<ApisWritable>;
