import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const membersRouter = Router();

// GET all members
membersRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        issues: {
          select: { id: true, state: true, storyPoints: true }
        }
      }
    });
    res.json({ success: true, data: members });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST register member
membersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, role, avatarColor, assignedTrack } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }

    const cleanName = name.trim();
    const cleanEmail = email?.trim() || `${cleanName.toLowerCase().replace(/\s+/g, '')}@college.edu`;
    const avatarText = cleanName.charAt(0).toUpperCase();

    const member = await prisma.member.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        role: role || 'Junior Developer',
        avatarText,
        avatarColor: avatarColor || '#3f7bf6',
        assignedTrack: assignedTrack || 'General Development'
      }
    });

    res.status(201).json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE member
membersRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.member.delete({ where: { id } });
    res.json({ success: true, message: `Member ${id} removed successfully.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
