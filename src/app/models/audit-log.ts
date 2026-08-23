export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: number;
  username: string;
  details: string;
  timestamp: string;
}
