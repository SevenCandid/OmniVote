import { fetchWithAuth } from '../services/identityApi';
import { AuditEvent } from '../../../components/ui/BaseAuditTimeline';

export interface PaginatedAuditResponse {
  items: AuditEvent[];
  total: int;
  skip: int;
  limit: int;
}

export const auditApi = {
  getPersonalAuditLogs: async (
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
    
    return fetchWithAuth(`/audit?${params.toString()}`);
  },
};
