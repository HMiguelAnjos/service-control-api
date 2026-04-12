import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';

export function logger(req: Request, res: Response, next: NextFunction) {
  const method = chalk.blueBright(req.method);
  const url = chalk.yellowBright(req.originalUrl);

  res.on('finish', () => {
    const time = chalk.gray(`[${new Date().toLocaleTimeString()}]`);
    const statusCodeRange = String(res.statusCode)[0];
    const statusCode =
      statusCodeRange === '4' || statusCodeRange === '5'
        ? chalk.red(res.statusCode)
        : chalk.green(res.statusCode);

    console.log(`${time} ${method} ${url} ${statusCode}`);
  });

  next();
}
