export interface DetailSettingsData {
  requestUrl: string;
  httpMethod: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  checkInterval: string;
  isActive: boolean;
  isNotificationEnabled: boolean;
}
