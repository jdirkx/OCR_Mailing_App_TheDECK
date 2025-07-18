export type AuditLog = {
  id: string;
  email: string;
  userName: string;
  action: string;
  meta?: unknown;
  createdAt?: Date;
};
