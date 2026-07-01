export const API_ENVELOPE_META_SCHEMA = {
  type: 'object' as const,
  required: ['timestamp', 'request_id'],
  properties: {
    timestamp: {
      type: 'string',
      format: 'date-time',
      example: '2026-06-30T12:00:00.000Z',
    },
    request_id: { type: 'string', example: 'req_abc123' },
  },
};
