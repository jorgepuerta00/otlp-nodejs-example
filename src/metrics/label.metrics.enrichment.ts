import { Attributes } from '@opentelemetry/api';
import { Request } from 'express';

/**
 * Interface for a label enrichment strategy, which enriches the labels for a given request.
 * 
 * Example implementation:
 * 
 * ```typescript
 * export class CustomLabelEnrichment implements ILabelEnrichment {
 *   enrichLabels(req: Request): Attributes {
 *     const preparerId = this.getPreparerId(req);
 *     return preparerId ? { preparerId } : {};
 *   }
 *
 *   private getPreparerId(req: Request): string {
 *     const { query = {}, headers = {}, body = {} } = req;
 *
 *     const possibleValues = [
 *       headers.siteId,
 *       headers.preparerid,
 *       body.clientNumber,
 *       body.siteId,
 *       query.clientNumber,
 *       query.siteId,
 *       query.preparerid,
 *     ];
 *
 *     return (
 *       possibleValues.find((value) => value !== undefined && value !== null) ||
 *       ''
 *     );
 *   }
 * }
 * ```
 */
export interface ILabelEnrichment {
    enrichLabels(req: Request): Attributes;
}