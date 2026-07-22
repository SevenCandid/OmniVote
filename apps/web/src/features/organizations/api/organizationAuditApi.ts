import { fetchWithAuth } from '../../identity/services/identityApi';
import { PaginatedAuditResponse } from '../../identity/api/auditApi';

export const organizationAuditApi = {
  getOrganizationAuditLogs: async (
    organizationId: string,
    skip: number = 0,
    limit: number = 50,
    eventType?: string
  ): Promise<PaginatedAuditResponse> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (eventType) {
      params.append('event_type', eventType);
    }

    return fetchWithAuth(
      `/organizations/${organizationId}/audit?${params.toString()}`
    );
  },
};
