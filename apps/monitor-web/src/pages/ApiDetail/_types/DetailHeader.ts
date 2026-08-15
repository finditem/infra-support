export interface ApiDetailData {
  id: string;
  name: string;
  description: string;
  category: string;
  source: string;
  sourceUrl: string | null;
  requestUrl: string | null;
  httpMethod: string;
  checkIntervalMinutes: number;
  isNotificationEnabled: boolean;
  iconUrl: string | null;
  isActive: boolean;
  memo: string;
}
