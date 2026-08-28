import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { supabase, requireAuth, requireAdmin } from '../supabase.js';

export const authRouter = Router();

// POST register user (Admin only)
// Since this is a company platform, only Admins should invite/create users.
authRouter.post('/invite', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, accessLevel, avatarText, avatarColor, assignedTrack } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Email, password, and name are required.' });
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto confirm since admin is inviting
    });

    if (authError || !authData.user) {
      return res.status(400).json({ success: false, error: authError?.message || 'Failed to create Supabase user' });
    }

    // 2. Create the Member in our PostgreSQL database using Prisma
    const newMember = await prisma.member.create({
      data: {
        authId: authData.user.id,
        email,
        name,
        role: role || 'Junior Developer',
        accessLevel: accessLevel || 'WORKER',
        avatarText: avatarText || name.substring(0, 2).toUpperCase(),
        avatarColor: avatarColor || '#3f7bf6',
        assignedTrack: assignedTrack || 'General Development'
      }
    });

    res.status(201).json({ success: true, data: newMember });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET current user profile
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  if (!req.member) {
    return res.status(404).json({ success: false, error: 'Profile not found' });
  }
  res.json({ success: true, data: req.member });
});
