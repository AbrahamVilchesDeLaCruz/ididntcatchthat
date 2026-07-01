/** OpenAPI schema fragment for `{ data, meta }` query responses. */
export function apiEnvelopeSchema(dataExample: Record<string, unknown>): {
  type: 'object';
  properties: Record<string, unknown>;
} {
  return {
    type: 'object',
    properties: {
      data: { example: dataExample },
      meta: {
        type: 'object',
        properties: {
          timestamp: {
            type: 'string',
            example: '2026-06-30T12:00:00.000Z',
          },
          request_id: { type: 'string', example: 'req_abc123' },
        },
      },
    },
  };
}
