import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { generateRequestId, withContext, createLogger, BaseError } from '@payment-gateway/shared-utils';
import { acquireRouter } from './modules/acquire/routes';
import { otpRouter } from './modules/otp/routes';

const app = express();
const logger = createLogger({ service: 'bank-simulator' });

// Context injection middleware
app.use((req, _res, next) => {
  const requestId = (req.headers['x-request-id'] as string) || generateRequestId();
  const correlationId = req.headers['x-correlation-id'] as string;
  withContext({ requestId, correlationId }, () => next());
});

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'bank-simulator' });
});

// Routes will be registered here
app.use('/api/v1/acquire', acquireRouter);
app.use('/api/v1/otp', otpRouter);

// Global Error Handler
app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled Exception', { error: error.message });
  
  if (error instanceof BaseError) {
    res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message },
    });
    return;
  }
  
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Bank Simulator encountered an error' },
  });
});

export { app };
