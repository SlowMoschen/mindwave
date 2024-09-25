import { Request, Response } from "express";
import { ObjectSchema } from "joi";

export async function ValidateSchemaHTTP(schema: ObjectSchema) {
  return async (req: Request, res: Response, next: Function) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    next();
  };
}

export function ValidateSchemaWS(schema: ObjectSchema, data: unknown) {
  const { error } = schema.validate(data);
  return error ? error : null;
}
