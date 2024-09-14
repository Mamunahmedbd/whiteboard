import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { appRoutes } from '@/routes/index';
import config from '../config/index';
import setupMiddlewares from './middleware';

const app = express();

if (config.isProduction) {
  app.use(compression());
}

// Middlewares..
const middlewares = setupMiddlewares();

app.disable('x-powered-by');
app.use(helmet());
app.use(middlewares);
app.use(
  cors({
    origin: config.isProduction
      ? config.corsOrigin.prod
      : config.corsOrigin.dev,
  }),
);

appRoutes(app);

export default app;
