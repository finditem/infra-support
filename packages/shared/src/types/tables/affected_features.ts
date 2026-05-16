import type { ApisRow } from "./apis";

type AffectedFeaturesWritable = {
  api_id: ApisRow["id"];
  feature_name: string;
  created_at: string | null;
};

export interface AffectedFeaturesRow extends AffectedFeaturesWritable {
  id: string;
}

export type AffectedFeaturesInsert = Omit<AffectedFeaturesWritable, "created_at"> & {
  id?: string;
  created_at?: string | null;
};

export type AffectedFeaturesUpdate = Partial<AffectedFeaturesWritable>;
