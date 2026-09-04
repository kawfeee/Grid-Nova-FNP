// =============================================================================
// GridNova Auth & Role Middleware
// Conforms to Rules 38, 39, 40, 47 and TRD Section 25, 43
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { store } from '../data/store.js';
import { UserProfile } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Check Authorization header or x-user-id header
  const authHeader = req.headers.authorization;
  const customUserId = req.headers['x-user-id'] as string;

  let userId: string | undefined = customUserId;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    // In demo/dev mode, token can directly be the user ID or email
    if (token) {
      const byId = store.getProfileById(token);
      if (byId) {
        userId = byId.id;
      } else {
        const byEmail = store.getProfileByEmail(token);
        if (byEmail) {
          userId = byEmail.id;
        }
      }
    }
  }

  // Fallback: Default to Citizen A if no user specified in dev/demo mode
  if (!userId) {
    userId = '00000000-0000-0000-0000-000000000002'; // Citizen A
  }

  const user = store.getProfileById(userId);
  if (!user) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'User profile not found or unauthenticated' },
    });
    return;
  }

  req.user = user;
  next();
}

export function requireRole(requiredRole: 'admin' | 'citizen') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    // Rule 39 & 47: Server-side authoritative role verification
    if (requiredRole === 'admin' && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: Administrator privileges required',
        },
      });
      return;
    }

    next();
  };
}
