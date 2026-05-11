import type { ApisRow } from "./apis";

export interface AffectedFeaturesRow {
  id: string;
  api_id: ApisRow["id"];
  feature_name: string;
  created_at: string | null;
}

export interface AffectedFeaturesInsert {
  id?: string;
  api_id: ApisRow["id"];
  feature_name: string;
  created_at?: string | null;
}

export interface AffectedFeaturesUpdate {
  api_id?: ApisRow["id"];
  feature_name?: string;
  created_at?: string | null;
}
