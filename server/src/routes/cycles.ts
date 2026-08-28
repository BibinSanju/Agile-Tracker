import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const cyclesRouter = Router();

// GET all cycles
cyclesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const cycles = await prisma.cycle.findMany({
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip,
      include: {
        issues: {
          select: { id: true, state: true, storyPoints: true }
        }
      }
    });
    res.json({ success: true, data: cycles });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST cycle
cyclesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, startDate, endDate, status } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Cycle name is required.' });

    const cycle = await prisma.cycle.create({
      data: {
        name: name.trim(),
        description: description || '',
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: status || 'active'
      }
    });
    res.status(201).json({ success: true, data: cycle });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE cycle
cyclesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.cycle.delete({ where: { id } });
    res.json({ success: true, message: `Cycle ${id} deleted.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
