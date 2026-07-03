import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { metricsMiddleware, generateRequestId, withContext } from '@payment-gateway/shared-utils';
import { errorMiddleware } from './middleware/error.middleware';
import paymentRoutes from './modules/payments/payments.routes';

const app = express();

// Context injection middleware
app.use((req, _res, next) => {
  const requestId = (req.headers['x-request-id'] as string) || generateRequestId();
  const correlationId = req.headers['x-correlation-id'] as string;
  withContext({ requestId, correlationId }, () => next());
});

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', exposedHeaders: ['x-idempotency-replay'] }));
app.use(express.json());

// Metrics
app.use(metricsMiddleware('payment-gateway'));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Register routes
app.use('/api/v1/payments', paymentRoutes);

// Global Error Handler
app.use(errorMiddleware);

export { app };
