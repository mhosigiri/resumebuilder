import cors, { CorsOptions } from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import resumeRoutes from './routes/resumeRoutes';
import { env } from './config/env';

const app = express();

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', resumeRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const status = error.status ?? 500;
  console.error(error);
  res.status(status).json({
    message: error.message ?? 'Internal server error',
  });
});

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}`);
});


