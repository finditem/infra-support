type TeamsWritable = {
  name: string;
  /** 언급에 쓰는 식별자. DB 트리거가 name에서 공백을 제거해 채우므로 직접 넣지 않는다. */
  slug: string;
  /** profiles.color와 같은 'hsl(h 70% 85%)' 형식. DB 트리거가 insert 시점에 채운다. */
  color: string;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export interface TeamsRow extends TeamsWritable {
  id: string;
}

export type TeamsInsert = Omit<TeamsWritable, "slug" | "color" | "created_at" | "updated_at"> & {
  id?: string;
  slug?: string;
  color?: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TeamsUpdate = Partial<TeamsWritable>;
