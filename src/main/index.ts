import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';
import { errorHandler } from '../middlewares/errors/error-handlers';
import routes from '../routes';
import { logger } from '../middlewares/logger/logger';

dotenv.config();

const app = express();
app.use(express.json());
app.use(logger);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
