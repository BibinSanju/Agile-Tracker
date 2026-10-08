import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { Request, Response, NextFunction } from 'express';
import { prisma } from './db.js';

// Polyfill WebSocket globally for Node 20 so Supabase Realtime works.
(globalThis as any).WebSocket = WebSocket;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Credentials are optional during local development. Protected auth routes
// return 503 until they are configured instead of crashing the whole API.
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

declare global {
  namespace Express {
    interface Request {
      user?: any;
      member?: any;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!supabase) {
    return res.status(503).json({
      success: false,
      error: 'Authentication is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }

    req.user = user;

    const member = await prisma.member.findUnique({
      where: { authId: user.id }
    });

    if (member) req.member = member;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Unauthorized: Token verification failed' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.member) {
    return res.status(403).json({ success: false, error: 'Forbidden: Member profile not found' });
  }

  if (req.member.accessLevel !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Forbidden: Requires ADMIN access' });
  }

  next();
};
