import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { Request, Response, NextFunction } from 'express';
import { prisma } from './db.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('\n\n❌ FATAL ERROR: You forgot to add SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY to your Render Environment Variables! The server cannot start without them.\n\n');
}

// Use Service Role key for admin privileges in the backend
export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    WebSocket,
  } as any,
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Extend Express Request to include user and member info
declare global {
  namespace Express {
    interface Request {
      user?: any;
      member?: any;
    }
  }
}

// Middleware to authenticate requests via Bearer Token (Supabase JWT)
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
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

    // Fetch the corresponding member record from our database
    const member = await prisma.member.findUnique({
      where: { authId: user.id }
    });

    if (member) {
      req.member = member;
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Unauthorized: Token verification failed' });
  }
};

// Middleware to enforce ADMIN role
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.member) {
    return res.status(403).json({ success: false, error: 'Forbidden: Member profile not found' });
  }

  if (req.member.accessLevel !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Forbidden: Requires ADMIN access' });
  }

  next();
};
