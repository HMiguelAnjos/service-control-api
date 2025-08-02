// src/middlewares/logger.ts
import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';

export function logger(req: Request, res: Response, next: NextFunction) {
  const now = new Date().toLocaleTimeString();
  const method = chalk.blueBright(req.method);
  const url = chalk.yellowBright(req.originalUrl);
  const time = chalk.gray(`[${now}]`);
  const statusCodeRange = String(Math.abs(res.statusCode))[0];
  let statusCode;
  if(statusCodeRange === '4' || statusCodeRange === '5') statusCode = chalk.red(res.statusCode);
  else statusCode = chalk.green(res.statusCode);

  console.log(`${time} ${method} ${url} ${statusCode}`);

  next();
}
