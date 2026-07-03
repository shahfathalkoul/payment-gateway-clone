import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { metricsMiddleware, generateRequestId, withContext } from '@payment-gateway/shared-utils';
import { errorMiddleware } from './middleware/error.middleware';

// Routes will be imported here
import authRoutes from './modules/auth/auth.routes';
import apiKeysRoutes from './modules/api-keys/api-keys.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { setupSwagger } from './swagger/swagger';

const app = express();

// Context injection middleware
app.use((req, _res, next) => {
  const requestId = (req.headers['x-request-id'] as string) || generateRequestId();
  const correlationId = req.headers['x-correlation-id'] as string;
  withContext({ requestId, correlationId }, () => next());
});

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Metrics
app.use(metricsMiddleware('merchant-service'));

// Swagger Docs
setupSwagger(app);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Register routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/api-keys', apiKeysRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorMiddleware);

export { app };
