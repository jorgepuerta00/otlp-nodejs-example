import { Request } from 'express';

/**  
 * Interface for a attribute mapping strategy, which maps the attributes for a given request.
*/
export interface IAttributeMapping {
  mapAttributes(req: Request): Record<string, unknown>;
}

/**
 * A custom attribute mapping strategy that maps attributes from the request object.
 */
export type AttributeSource = 'headers' | 'body' | 'query';

/**
 * Configuration for attribute mapping.
 * 
 * Example usage:
 * 
 * ```typescript
 * const customMappingConfig: AttributeMappingConfig = {
 *   username: 'headers',     // Retrieves 'username' from request headers
 *   details: {
 *     accountId: 'body',     // Retrieves 'accountId' from request body
 *     siteId: 'query'        // Retrieves 'siteId' from request query parameters
 *   }
 * };
 * ```
 * 
 * Note: Only 'headers', 'body', or 'query' are valid values for attribute sources.
 */
export interface AttributeMappingConfig {
    [key: string]: AttributeSource | AttributeMappingConfig;
}
  

/**
 * A custom attribute mapping strategy that maps attributes from the request object.
 */
export class CustomAttributeMapping implements IAttributeMapping {
    private config: AttributeMappingConfig;
  
    constructor(config: AttributeMappingConfig) {
      this.config = config;
    }
  
    mapAttributes(req: Request): Record<string, unknown> {
      return this.populateAttributes(req, this.config);
    }
  
    private populateAttributes(req: Request, config: AttributeMappingConfig): Record<string, unknown> {
      const result: Record<string, unknown> = {};
    
      for (const key in config) {
        const mapping = config[key];
    
        if (typeof mapping === 'string') {
          const value = req[mapping]?.[key];
          if (value !== undefined && value !== null) {
            result[key] = value;
          }
        } else {
          const nestedResult = this.populateAttributes(req, mapping);
          if (Object.keys(nestedResult).length > 0) {
            result[key] = nestedResult;
          }
        }
      }
    
      return result;
    }
  }
