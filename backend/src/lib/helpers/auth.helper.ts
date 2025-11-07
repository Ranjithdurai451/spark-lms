import { JWT_SECRET } from "../constants";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const createToken = <T extends object>(
  payload: T,
  time: jwt.SignOptions["expiresIn"]
) => jwt.sign(payload, JWT_SECRET, { expiresIn: time });

export const verifyToken = <T extends object = JwtPayload>(
  token: string
): { valid: true; payload: T } | { valid: false; message: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as T;
    return { valid: true, payload: decoded };
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return { valid: false, message: "Token expired" };
    }
    return { valid: false, message: "Invalid token" };
  }
};
