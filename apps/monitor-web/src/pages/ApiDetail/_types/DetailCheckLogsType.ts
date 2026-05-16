import type { ApiStatus } from "@/types";

export interface ApiCheckLog {
  id: string;
  status: ApiStatus;
  time: string;
  fullDate: string;
  message: string;
  statusCode: string;
  latency: string;
}
