import { Request } from 'express';

export interface AuthUser {
  userId: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

declare global {
  namespace Express {
    interface User extends AuthUser {}
    interface Request {
      file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      };
    }
  }
}