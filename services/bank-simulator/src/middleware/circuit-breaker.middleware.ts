import { Request, Response, NextFunction } from 'express';

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
  openTime: number;
}

const state: CircuitBreakerState = {
  failures: 0,
  lastFailureTime: 0,
  isOpen: false,
  openTime: 0,
};

// Configuration
const FAILURE_THRESHOLD = 5; // Trip after 5 failures
const COOLDOWN_PERIOD_MS = 30000; // 30 seconds cooldown
const FAILURE_WINDOW_MS = 10000; // Window to count failures (10s)

export const circuitBreakerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();

  // If the circuit breaker is open, check if cooldown period has elapsed
  if (state.isOpen) {
    if (now - state.openTime > COOLDOWN_PERIOD_MS) {
      // Half-open / reset state
      state.isOpen = false;
      state.failures = 0;
    } else {
      // Circuit is open, reject immediately
      return res.status(503).json({
        success: false,
        error: { code: 'BANK_OFFLINE', message: 'Bank circuit breaker is open' },
      });
    }
  }

  // To track failures, we intercept the response end or check the simulated outcome from previous middleware.
  // We can look at `req.simulatedOutcome` if it's already set.
  const outcome = (req as any).simulatedOutcome;

  if (outcome && ['TIMEOUT', 'NETWORK_FAILURE', 'BANK_OFFLINE'].includes(outcome)) {
    // Record a failure
    if (now - state.lastFailureTime > FAILURE_WINDOW_MS) {
      // Reset window if it's been a while
      state.failures = 1;
    } else {
      state.failures++;
    }
    state.lastFailureTime = now;

    if (state.failures >= FAILURE_THRESHOLD) {
      state.isOpen = true;
      state.openTime = now;
    }
  } else if (outcome === 'SUCCESS') {
    // A success can optionally reset the failure count
    // state.failures = 0;
  }

  next();
};
