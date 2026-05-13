export type LogStatus = "normal" | "error" | "pending";

export interface ApiCheckLog {
  id: string;
  status: LogStatus;
  time: string;
  fullDate: string;
  message: string;
  statusCode: string;
  latency: string;
}
