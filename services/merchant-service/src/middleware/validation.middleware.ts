import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '@payment-gateway/shared-utils';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          details[path] = err.message;
        });
        next(new ValidationError('Invalid request data', details));
      } else {
        next(error);
      }
    }
  };
};
