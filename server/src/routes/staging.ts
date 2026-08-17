import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const stagingRouter = Router();

// GET all staged questions
stagingRouter.get('/questions', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status && typeof status === 'string') where.status = status;

    const questions = await prisma.stagedQuestion.findMany({
      where,
      orderBy: { submittedAt: 'desc' }
    });

    const parsed = questions.map(q => ({
      ...q,
      referenceSolution: JSON.parse(q.referenceSolution || '{}'),
      testCases: JSON.parse(q.testCases || '[]')
    }));

    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST stage a new question (e.g. from Scraper / AI Synthesizer)
stagingRouter.post('/questions', async (req: Request, res: Response) => {
  try {
    const { title, description, source, difficulty, suggestedCategory, similarityScore, referenceSolution, testCases, testPassRate, sandboxStatus } = req.body;

    if (!title || !description || !suggestedCategory) {
      return res.status(400).json({ success: false, error: 'Title, description, and suggestedCategory are required.' });
    }

    const staged = await prisma.stagedQuestion.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        source: source || 'Student_Interview',
        difficulty: difficulty || 'Medium',
        suggestedCategory,
        confirmedCategory: suggestedCategory,
        status: 'PENDING_REVIEW',
        similarityScore: similarityScore || 0.0,
        referenceSolution: JSON.stringify(referenceSolution || {}),
        testCases: JSON.stringify(testCases || []),
        testPassRate: testPassRate || '10/10 Passed',
        sandboxStatus: sandboxStatus || 'VERIFIED'
      }
    });

    res.status(201).json({ success: true, data: staged });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH 1-Click approve question
stagingRouter.patch('/questions/:id/approve', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { confirmedCategory } = req.body;

    const updated = await prisma.stagedQuestion.update({
      where: { id },
      data: {
        status: 'APPROVED',
        confirmedCategory: confirmedCategory || undefined
      }
    });

    res.json({ success: true, data: updated, message: 'Question approved for production promotion.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET export Moodle XML
stagingRouter.get('/export-moodle-xml', async (_req: Request, res: Response) => {
  try {
    const approved = await prisma.stagedQuestion.findMany({
      where: { status: 'APPROVED' }
    });

    if (approved.length === 0) {
      return res.status(400).json({ success: false, error: 'No approved questions available to export.' });
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n`;
    const categories = Array.from(new Set(approved.map(q => q.confirmedCategory || q.suggestedCategory)));

    categories.forEach(cat => {
      xml += `  <question type="category">\n`;
      xml += `    <category>\n`;
      xml += `      <text>$course$/top/${cat}</text>\n`;
      xml += `    </category>\n`;
      xml += `    <info format="moodle_auto_format">\n`;
      xml += `      <text>Curated by IntelX AI Pipeline</text>\n`;
      xml += `    </info>\n`;
      xml += `  </question>\n\n`;

      const catQuestions = approved.filter(q => (q.confirmedCategory || q.suggestedCategory) === cat);
      catQuestions.forEach(q => {
        const cleanTitle = q.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const refCode = JSON.parse(q.referenceSolution || '{}');
        const tc = JSON.parse(q.testCases || '[]');

        xml += `  <question type="essay">\n`;
        xml += `    <name><text>${cleanTitle}</text></name>\n`;
        xml += `    <questiontext format="html">\n`;
        xml += `      <text><![CDATA[\n`;
        xml += `        <h3>${q.title}</h3>\n`;
        xml += `        <p>${q.description}</p>\n`;
        xml += `        <h4>Sample Standard I/O Test Case</h4>\n`;
        xml += `        <pre>Input:\n${tc[0]?.input || ''}\n\nExpected Output:\n${tc[0]?.expectedOutput || ''}</pre>\n`;
        xml += `      ]]></text>\n`;
        xml += `    </questiontext>\n`;
        xml += `    <generalfeedback format="html">\n`;
        xml += `      <text><![CDATA[<p>Reference Code:</p><pre>${refCode.code || ''}</pre>]]></text>\n`;
        xml += `    </generalfeedback>\n`;
        xml += `    <defaultgrade>10.0000000</defaultgrade>\n`;
        xml += `  </question>\n\n`;
      });
    });

    xml += `</quiz>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="moodle_quiz_export_${Date.now()}.xml"`);
    res.send(xml);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
