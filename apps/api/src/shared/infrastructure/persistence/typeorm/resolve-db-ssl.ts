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
 * - test env: disabled.
 * - localhost / 127.0.0.1: disabled.
 * - ?sslmode=disable in the URL (e.g. local Docker with plain Postgres): disabled.
 * - Remote + DATABASE_CA_CERT (Aiven ca.pem): verify chain with custom CA.
 * - Remote without CA: encrypted, no chain verification (Aiven default).
 */
export function resolveDbSsl(url: URL): DbSslConfig {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }

  if (isLocalHost(url.hostname)) {
    return false;
  }

  if (url.searchParams.get('sslmode') === 'disable') {
    return false;
  }

  const ca = process.env.DATABASE_CA_CERT?.trim();
  if (ca) {
    return { rejectUnauthorized: true, ca };
  }

  return { rejectUnauthorized: false };
}
