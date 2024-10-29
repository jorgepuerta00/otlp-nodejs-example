import { Request } from 'express';
import { Attributes } from '@opentelemetry/api';
import { ILabelEnrichment } from './src/metrics/label.metrics.enrichment';

export class CustomLabelEnrichment implements ILabelEnrichment {

    enrichLabels(req: Request): Attributes {
      const preparerId = this.getPreparerId(req);
      return preparerId ? { preparerId } : { };
    }
  
    private getPreparerId(req: Request): string {
      const { query = {}, headers = {}, body = {} } = req;
  
      const possibleValues = [
        headers.siteId,
        headers.preparerid,
        body.clientNumber,
        body.siteId,
        query.clientNumber,
        query.siteId,
        query.preparerid,
      ];
    
      return possibleValues.find(value => value !== undefined && value !== null) || '';
    }
  }