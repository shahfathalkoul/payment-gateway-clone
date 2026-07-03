import { Request, Response, NextFunction } from 'express';

const OUTCOMES = [
  'SUCCESS',
  'FAILURE',
  'PENDING',
  'TIMEOUT',
  'INSUFFICIENT_BALANCE',
  'BANK_OFFLINE',
  'NETWORK_FAILURE',
  'DUPLICATE_TRANSACTION',
];

export const simulationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Latency Simulation
  const latencyStr = req.headers['x-simulate-latency'];
  if (latencyStr && !isNaN(Number(latencyStr))) {
    const latency = Number(latencyStr);
    await new Promise((resolve) => setTimeout(resolve, latency));
  }

  // 2. Outcome Simulation
  const requestedOutcome = req.headers['x-simulate-outcome'] as string;
  let outcome = 'SUCCESS'; // Default to success if no header

  if (requestedOutcome && OUTCOMES.includes(requestedOutcome.toUpperCase())) {
    outcome = requestedOutcome.toUpperCase();
  } else if (req.headers['x-simulate-random-outcome'] === 'true') {
      // Pick a random outcome if random flag is set
      outcome = OUTCOMES[Math.floor(Math.random() * OUTCOMES.length)];
  }

  // Attach the determined outcome to the request so controllers can use it
  (req as any).simulatedOutcome = outcome;

  // Handle immediate terminal errors at middleware level
  switch (outcome) {
    case 'TIMEOUT':
      return res.status(504).json({ success: false, error: { code: 'TIMEOUT', message: 'Bank connection timed out' } });
    case 'BANK_OFFLINE':
      return res.status(503).json({ success: false, error: { code: 'BANK_OFFLINE', message: 'Bank is currently offline' } });
    case 'NETWORK_FAILURE':
      return res.status(502).json({ success: false, error: { code: 'NETWORK_FAILURE', message: 'Network failure communicating with bank' } });
    default:
      // Other outcomes (SUCCESS, FAILURE, PENDING, INSUFFICIENT_BALANCE, DUPLICATE_TRANSACTION) 
      // are handled by the controller since they usually return 200 with a specific status in the body.
      next();
  }
};
