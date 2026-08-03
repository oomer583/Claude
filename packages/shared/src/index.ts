export const serviceStatuses = ["ok"] as const;

export type ServiceStatus = (typeof serviceStatuses)[number];

export interface HealthResponse {
  service: "api";
  status: ServiceStatus;
  timestamp: string;
  version: string;
}
