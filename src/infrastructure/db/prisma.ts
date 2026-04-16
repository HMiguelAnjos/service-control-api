import { PrismaClient } from '@prisma/client';
import { log } from '../../config/logger';

const prisma = new PrismaClient({
  log: [
    { level: 'error', emit: 'event' },
    { level: 'warn',  emit: 'event' },
  ],
});

prisma.$on('error', (e) => {
  log.error('Prisma', `Erro na query: ${e.message}`);
});

prisma.$on('warn', (e) => {
  log.warn('Prisma', e.message);
});

prisma.$connect()
  .then(() => log.success('Database', 'Conectado ao PostgreSQL'))
  .catch((err) => log.error('Database', 'Falha ao conectar ao PostgreSQL', err));

export default prisma;
