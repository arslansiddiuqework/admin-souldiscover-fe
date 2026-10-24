import { apiClient } from "./apiClient";

export type SecurityOverview = {
  windowDays: number;
  metrics: {
    failedLogins: number;
    mfaFailures: number;
    permissionDenials: number;
    reauthFailures: number;
    crisisThisWeek: number;
    privilegedActions: number;
    activeAdmins: number;
    adminsWithMfa: number;
    superAdminsWithoutMfa: number;
  };
  warnings: {
    code: string;
    severity: "WARNING" | "CRITICAL" | "INFO";
    message: string;
  }[];
  recentEvents: {
    _id: string;
    category: string;
    severity: string;
    action: string;
    description: string;
    actorType: string;
    email?: string;
    ip?: string;
    createdAt: string;
  }[];
};

export const securityService = {
  async getOverview(): Promise<SecurityOverview> {
    const { data } = await apiClient.get<SecurityOverview>("/security/overview");
    return data;
  },
};
