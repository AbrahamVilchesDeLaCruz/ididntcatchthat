export function parseDatabaseUrl(databaseUrl?: string): URL {
  return new URL(databaseUrl ?? 'postgres://localhost/defaultdb');
}

export function resolveDbSsl(
  hostname: string,
): false | { rejectUnauthorized: boolean } {
  if (process.env.NODE_ENV === 'production') {
    return { rejectUnauthorized: true };
  }
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return false;
  }
  return { rejectUnauthorized: false };
}
