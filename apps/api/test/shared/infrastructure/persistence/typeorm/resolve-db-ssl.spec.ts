import {
  parseDatabaseUrl,
  resolveDbSsl,
} from '@/shared/infrastructure/persistence/typeorm/resolve-db-ssl';

const url = (raw: string): URL => parseDatabaseUrl(raw);

describe('shared/infrastructure/persistence/typeorm resolveDbSsl', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.DATABASE_CA_CERT;
  });

  afterAll(() => {
    process.env = env;
  });

  it('should disable ssl in test', () => {
    process.env.NODE_ENV = 'test';
    expect(resolveDbSsl(url('postgres://aiven.example.com/db'))).toBe(false);
  });

  it('should disable ssl for localhost outside test', () => {
    process.env.NODE_ENV = 'production';
    expect(resolveDbSsl(url('postgres://localhost/db'))).toBe(false);
    expect(resolveDbSsl(url('postgres://127.0.0.1/db'))).toBe(false);
  });

  it('should disable ssl when ?sslmode=disable is set in the URL', () => {
    process.env.NODE_ENV = 'production';
    expect(
      resolveDbSsl(url('postgres://postgres:5432/db?sslmode=disable')),
    ).toBe(false);
  });

  it('should use custom CA when DATABASE_CA_CERT is set', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_CA_CERT =
      '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----';

    expect(resolveDbSsl(url('postgres://aiven.example.com/db'))).toEqual({
      rejectUnauthorized: true,
      ca: process.env.DATABASE_CA_CERT,
    });
  });

  it('should allow remote ssl without strict verification when no CA is configured', () => {
    process.env.NODE_ENV = 'production';

    expect(resolveDbSsl(url('postgres://aiven.example.com/db'))).toEqual({
      rejectUnauthorized: false,
    });
  });
});

describe('parseDatabaseUrl', () => {
  it('should parse DATABASE_URL hostnames', () => {
    const url = parseDatabaseUrl(
      'postgres://user:pass@pg-prod.aivencloud.com:12345/defaultdb?sslmode=require',
    );

    expect(url.hostname).toBe('pg-prod.aivencloud.com');
    expect(url.port).toBe('12345');
  });
});
