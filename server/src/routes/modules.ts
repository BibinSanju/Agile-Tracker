import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const modulesRouter = Router();

// GET all modules
modulesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        issues: {
          select: { id: true, state: true, storyPoints: true }
        }
      }
    });
    res.json({ success: true, data: modules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST module
modulesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, layer, description, leadId } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Module name is required.' });

    const module = await prisma.module.create({
      data: {
        name: name.trim(),
        layer: layer || 'Layer 1: Ingestion',
        description: description || '',
        leadId: leadId || null
      }
    });
    res.status(201).json({ success: true, data: module });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE module
modulesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.module.delete({ where: { id } });
    res.json({ success: true, message: `Module ${id} deleted.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
