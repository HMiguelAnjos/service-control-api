import { Request, Response, NextFunction } from 'express';
import { BadRequest } from "./bad-request";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof BadRequest) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof Error) {
    return res.status(500).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Internal Server Error' });
}
