import { SetMetadata } from '@nestjs/common';
import { Attributes } from '@opentelemetry/api';

export const API_LABELS_KEY = 'apiLabels';

export function ApplyLabels(labels: Attributes) {
  return SetMetadata(API_LABELS_KEY, labels);
}
