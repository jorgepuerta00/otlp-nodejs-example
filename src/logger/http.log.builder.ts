/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { IAttributeMapping } from './http.attribute.mapping';
import { randomUUID } from 'crypto';

export enum EventType {
  REQUEST = 'REQUEST',
  RESULT = 'RESULT',
}

/**
 * Builds a request message object.
 *
 * @param req - The HTTP request object.
 * @param requestId - The unique identifier for the request.
 * @param startTime - The start time of the request.
 * @param attributeMapping - The attribute mapping strategy.
 * @returns The request message object.
 */
export function buildRequestMessage(
  req: Request,
  attributeMapping?: IAttributeMapping
): object {
  const customAttributes = attributeMapping
    ? attributeMapping.mapAttributes(req)
    : {};

  return {
    id: randomUUID(),
    eventType: EventType.REQUEST,
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    endpoint: {
      ip: req.ip,
      payload: req.body,
    },
    ...customAttributes,
  };
}

/**
 * Builds a response message object.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @param responseBody - The response body.
 * @param startTime - The start time of the request.
 * @returns The response message object.
 */
export function buildResponseMessage(
  req: Request,
  res: Response,
  responseBody: any,
  startTime: number
): object {
  return {
    id: randomUUID(),
    eventType: EventType.RESULT,
    statusCode: res.statusCode,
    method: req.method,
    url: req.route ? req.route.path : req.originalUrl,
    duration: Date.now() - startTime,
    endpoint: {
      ip: req.ip,
      response: responseBody || {},
    },
  };
}
