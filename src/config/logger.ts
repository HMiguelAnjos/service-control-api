import chalk from 'chalk';

const timestamp = () => chalk.gray(`[${new Date().toLocaleTimeString('pt-BR')}]`);

export const log = {
  info: (context: string, msg: string) =>
    console.log(`${timestamp()} ${chalk.cyan(`[${context}]`)} ${msg}`),

  success: (context: string, msg: string) =>
    console.log(`${timestamp()} ${chalk.green(`[${context}]`)} ${chalk.green(msg)}`),

  warn: (context: string, msg: string) =>
    console.warn(`${timestamp()} ${chalk.yellow(`[${context}]`)} ${chalk.yellow(msg)}`),

  error: (context: string, msg: string, err?: unknown) => {
    console.error(`${timestamp()} ${chalk.red(`[${context}]`)} ${chalk.red(msg)}`);
    if (err instanceof Error) {
      console.error(chalk.red(`  → ${err.message}`));
      if (process.env.NODE_ENV !== 'production') {
        console.error(chalk.gray(err.stack ?? ''));
      }
    } else if (err !== undefined) {
      console.error(chalk.red(`  → ${String(err)}`));
    }
  },
};
