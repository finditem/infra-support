export type IncidentStatus = "Recovered" | "Ongoing" | "Warning";

export interface IncidentHistoryItem {
  id: string;
  timestamp: string;
  duration: string;
  status: IncidentStatus;
  message: string;
}
