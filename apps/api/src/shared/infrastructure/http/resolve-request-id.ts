import { type Request } from 'express';

export function resolveRequestId(req: Request): string {
  const header = req.headers['x-request-id'];
  if (typeof header === 'string' && header.trim()) {
    return header;
  }
  return crypto.randomUUID();
}
