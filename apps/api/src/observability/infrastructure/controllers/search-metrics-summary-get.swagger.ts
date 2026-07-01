import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseMetaSwagger } from '@/shared/infrastructure/http/response/api-response-meta.swagger';

export class MetricsSummarySampleSwagger {
  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  labels: Record<string, string>;

  @ApiProperty({ example: 42 })
  value: number;
}

export class MetricsSummaryEntrySwagger {
  @ApiProperty({ example: 'http_requests_total' })
  name: string;

  @ApiProperty({ example: 'Total HTTP requests' })
  help: string;

  @ApiProperty({ example: 'counter' })
  type: string;

  @ApiProperty({ type: [MetricsSummarySampleSwagger] })
  samples: MetricsSummarySampleSwagger[];
}

export class SearchMetricsSummaryDataSwagger {
  @ApiProperty({ type: [MetricsSummaryEntrySwagger] })
  metrics: MetricsSummaryEntrySwagger[];
}

export class SearchMetricsSummaryEnvelopeSwagger {
  @ApiProperty({ type: SearchMetricsSummaryDataSwagger })
  data: SearchMetricsSummaryDataSwagger;

  @ApiProperty({ type: ApiResponseMetaSwagger })
  meta: ApiResponseMetaSwagger;
}
