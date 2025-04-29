import { Request, Response, NextFunction } from 'express';
import {ObjectSchema} from 'joi';

//validate payload object
export const ValidateJoi = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
      try {
          await schema.validateAsync(req.body);
          next();
      } catch (error:any) {
        return res.status(400).json({ error: error.details[0].message });
      }
  };
};