import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import importExportRoutes from './routes/importExport';
import reportRoutes from './routes/reports';
import userRoutes from './routes/users';
import pino from 'pino';
import pinoHttp from 'pino-http';

const app = express();

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
app.use(pinoHttp({ logger }));

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: false }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: 60_000, limit: 100 }));

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', version: process.env.npm_package_version, uptime: process.uptime() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1', importExportRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/users', userRoutes);

async function start() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fms';
  await mongoose.connect(mongoUri);
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    logger.info({ port }, 'Server started');
  });
}

start().catch((err) => {
  logger.error(err, 'Failed to start');
  process.exit(1);
});
