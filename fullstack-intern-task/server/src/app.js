import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, Postman) and whitelisted browser origins
      if (!origin || env.clientUrls.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);
app.use(express.json({ limit: '10kb' }));
if (!env.isProd) app.use(morgan('dev'));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
