import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';
import { errorHandler } from '../middlewares/errors/error-handlers';
import routes from '../routes';
import { logger } from '../middlewares/logger/logger';
import { log } from '../config/logger';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
  }),
);

app.use(express.json());
app.use(logger);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', routes);
app.use(errorHandler);

// ── Variáveis obrigatórias ──────────────────────────────────
if (!process.env.JWT_SECRET) {
  log.error('Config', 'JWT_SECRET não definido no .env — a aplicação não funcionará corretamente');
}

// ── Erros não capturados ────────────────────────────────────
process.on('uncaughtException', (err) => {
  log.error('Process', 'Exceção não capturada (uncaughtException)', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log.error('Process', 'Promise rejeitada sem tratamento (unhandledRejection)', reason);
});

// ── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  log.success('Server', `Rodando em http://localhost:${PORT}`);
  log.info('Server', `Ambiente: ${process.env.NODE_ENV ?? 'development'}`);
  log.info('Server', `Documentação: http://localhost:${PORT}/api-docs`);
});
