export type DbSslConfig =
  | false
  | {
      rejectUnauthorized: boolean;
      ca?: string;
    };

export function parseDatabaseUrl(databaseUrl?: string): URL {
  return new URL(databaseUrl ?? 'postgres://localhost/defaultdb');
}

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/**
 * SSL for PostgreSQL (Aiven in prod/dev remote).
 *
 * - Local / test: disabled.
 * - Remote + DATABASE_CA_CERT (Aiven ca.pem): verify chain with custom CA.
 * - Remote without CA: encrypted connection, no chain verification (Aiven default
 *   until ca.pem is configured in Doppler as DATABASE_CA_CERT).
 */
export function resolveDbSsl(hostname: string): DbSslConfig {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }

  if (isLocalHost(hostname)) {
    return false;
  }

  const ca = process.env.DATABASE_CA_CERT?.trim();
  if (ca) {
    return { rejectUnauthorized: true, ca };
  }

  return { rejectUnauthorized: false };
}
