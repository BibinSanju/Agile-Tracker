import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const issuesRouter = Router();

// GET all issues
issuesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { state, priority, moduleId, assigneeId, cycleId } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (state && typeof state === 'string') where.state = state;
    if (priority && typeof priority === 'string') where.priority = priority;
    if (moduleId && typeof moduleId === 'string') where.moduleId = moduleId;
    if (assigneeId && typeof assigneeId === 'string') where.assigneeId = assigneeId;
    if (cycleId && typeof cycleId === 'string') where.cycleId = cycleId;

    const issues = await prisma.issue.findMany({
      where,
      orderBy: { sequenceId: 'asc' },
      take: limit,
      skip,
      include: {
        assignee: true,
        module: true,
        cycle: true
      }
    });

    const formatted = issues.map((i: any) => ({
      ...i,
      acceptanceCriteria: JSON.parse(i.acceptanceCriteria || '[]')
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create issue
issuesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, state, priority, moduleId, cycleId, assigneeId, storyPoints, acceptanceCriteria, technicalNotes } = req.body;

    if (!title || !moduleId || !cycleId) {
      return res.status(400).json({ success: false, error: 'Title, moduleId, and cycleId are required.' });
    }

    const lastIssue = await prisma.issue.findFirst({
      orderBy: { sequenceId: 'desc' },
      select: { sequenceId: true }
    });
    const sequenceId = (lastIssue?.sequenceId || 0) + 1;
    const key = `PRTL-${sequenceId}`;

    const newIssue = await prisma.issue.create({
      data: {
        sequenceId,
        key,
        title: title.trim(),
        description: description?.trim() || '',
        state: state || 'todo',
        priority: priority || 'medium',
        moduleId,
        cycleId,
        assigneeId: assigneeId || null,
        storyPoints: Number(storyPoints) || 3,
        acceptanceCriteria: JSON.stringify(acceptanceCriteria || []),
        technicalNotes: technicalNotes || null
      },
      include: {
        assignee: true,
        module: true
      }
    });

    res.status(201).json({
      success: true,
      data: {
        ...newIssue,
        acceptanceCriteria: JSON.parse(newIssue.acceptanceCriteria)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH update issue
issuesRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, description, state, priority, moduleId, cycleId, assigneeId, storyPoints, acceptanceCriteria, technicalNotes } = req.body;

    const data: any = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description.trim();
    if (state !== undefined) data.state = state;
    if (priority !== undefined) data.priority = priority;
    if (moduleId !== undefined) data.moduleId = moduleId;
    if (cycleId !== undefined) data.cycleId = cycleId;
    if (assigneeId !== undefined) data.assigneeId = assigneeId || null;
    if (storyPoints !== undefined) data.storyPoints = Number(storyPoints);
    if (acceptanceCriteria !== undefined) data.acceptanceCriteria = JSON.stringify(acceptanceCriteria);
    if (technicalNotes !== undefined) data.technicalNotes = technicalNotes;

    const updated = await prisma.issue.update({
      where: { id },
      data,
      include: {
        assignee: true,
        module: true
      }
    });

    res.json({
      success: true,
      data: {
        ...updated,
        acceptanceCriteria: JSON.parse(updated.acceptanceCriteria)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE issue
issuesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.issue.delete({ where: { id } });
    res.json({ success: true, message: `Issue ${id} deleted successfully.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
