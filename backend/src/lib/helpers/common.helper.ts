import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Body", req.body);
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const firstError = result.error.issues[0];
        const errorMessage = firstError.message || "Validation failed";
        res.status(400).json({ message: errorMessage });
        return;
      }

      req.body = result.data;
      next();
    } catch (error) {
      res.status(500).json({ message: "Internal validation error occurred." });
    }
  };
};
