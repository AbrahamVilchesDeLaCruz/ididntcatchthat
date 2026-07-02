type ApiEnvelopeSchema = {
  type: 'object';
  properties: {
    data: { example: unknown };
    meta: {
      type: 'object';
      properties: {
        timestamp: { type: 'string'; example: string };
        request_id: { type: 'string'; example: string };
      };
    };
  };
};

/** OpenAPI schema fragment for `{ data, meta }` query responses. */
export function apiEnvelopeSchema(dataExample: unknown): ApiEnvelopeSchema {
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
