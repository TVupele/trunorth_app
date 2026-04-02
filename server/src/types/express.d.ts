import { Request } from 'express';

// Interface for the user object attached to the request
export interface User {
  userId: string;
  role: string;
}

// Extend the Express Request interface to include the user object
export interface AuthenticatedRequest extends Request {
  user?: User;
}