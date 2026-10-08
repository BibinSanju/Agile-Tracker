import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import {
  createGroqQuestionAi,
  DEFAULT_DUPLICATE_THRESHOLD,
  formatStructuredDescription,
  processRawQuestion,
  QuestionDifficulty
} from '../services/questionIngestion.js';

export const stagingRouter = Router();

function cleanString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

// GET all staged questions
stagingRouter.get('/questions', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && typeof status === 'string') where.status = status;

    const questions = await prisma.stagedQuestion.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      take: limit,
      skip
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

// POST stage a new question from raw text or a structured ingestion source.
stagingRouter.post('/questions', async (req: Request, res: Response) => {
  try {
    const {
      text,
      title,
      description,
      source,
      difficulty,
      suggestedCategory,
      referenceSolution,
      testCases
    } = req.body ?? {};

    const rawText = cleanString(text);
    const cleanDescription = cleanString(description) || rawText;

    if (!cleanDescription) {
      return res.status(400).json({ success: false, error: 'Question text is required.' });
    }

    const existing = await prisma.stagedQuestion.findMany({
      select: { id: true, title: true, description: true }
    });
    const configuredThreshold = Number(process.env.DUPLICATE_THRESHOLD);
    const duplicateThreshold = Number.isFinite(configuredThreshold)
      ? Math.max(0, Math.min(1, configuredThreshold))
      : DEFAULT_DUPLICATE_THRESHOLD;
    const processed = await processRawQuestion(
      {
        text: cleanDescription,
        title: cleanString(title) || undefined,
        difficulty: cleanString(difficulty) as QuestionDifficulty || undefined,
        suggestedCategory: cleanString(suggestedCategory) || undefined,
        source: cleanString(source) || 'Student_Interview'
      },
      existing,
      { ai: createGroqQuestionAi(), duplicateThreshold }
    );

    if (processed.duplicate) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_QUESTION',
        error: `A similar question already exists: ${processed.duplicate.title}`,
        duplicate: processed.duplicate,
        processing: {
          mode: processed.processingMode,
          duplicateChecked: true,
          threshold: duplicateThreshold,
          warnings: processed.warnings
        }
      });
    }

    const suppliedTests = Array.isArray(testCases) ? testCases : null;
    const suppliedSolution = referenceSolution && typeof referenceSolution === 'object' ? referenceSolution : null;
    const finalTests = suppliedTests ?? processed.assets.testCases;
    const finalSolution = suppliedSolution ?? processed.assets.referenceSolution;

    const staged = await prisma.stagedQuestion.create({
      data: {
        title: processed.question.title,
        description: formatStructuredDescription(processed.question),
        source: cleanString(source) || 'Student_Interview',
        difficulty: processed.question.difficulty,
        suggestedCategory: processed.question.suggestedCategory,
        confirmedCategory: processed.question.suggestedCategory,
        status: 'PENDING_REVIEW',
        similarityScore: processed.closestMatch?.similarity || 0,
        isDuplicate: false,
        referenceSolution: JSON.stringify(finalSolution),
        testCases: JSON.stringify(finalTests),
        // Generated cases are not verified until a sandbox executes them.
        testPassRate: finalTests.length ? `0/${finalTests.length} Pending` : 'Pending',
        sandboxStatus: 'PENDING'
      }
    });

    res.status(201).json({
      success: true,
      data: {
        ...staged,
        referenceSolution: JSON.parse(staged.referenceSolution || '{}'),
        testCases: JSON.parse(staged.testCases || '[]')
      },
      processing: {
        mode: processed.processingMode,
        duplicateChecked: true,
        threshold: duplicateThreshold,
        closestMatch: processed.closestMatch,
        assetsGenerated: processed.assets.testCases.length > 0 || Boolean(processed.assets.referenceSolution.code),
        warnings: processed.warnings
      }
    });
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
        // Escape special characters for XML properly
        const escapeXml = (unsafe: string) => {
            return unsafe.replace(/[<>&'"]/g, (c) => {
                switch (c) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '\'': return '&apos;';
                    case '"': return '&quot;';
                    default: return c;
                }
            });
        };

        const cleanTitle = escapeXml(q.title);
        const refCode = JSON.parse(q.referenceSolution || '{}');
        const tc = JSON.parse(q.testCases || '[]');
        const cleanDesc = escapeXml(q.description || '');
        const cleanInput = tc[0]?.input ? escapeXml(tc[0].input) : '';
        const cleanOutput = tc[0]?.expectedOutput ? escapeXml(tc[0].expectedOutput) : '';
        const cleanRefCode = refCode.code ? escapeXml(refCode.code) : '';

        xml += `  <question type="essay">\n`;
        xml += `    <name><text>${cleanTitle}</text></name>\n`;
        xml += `    <questiontext format="html">\n`;
        xml += `      <text><![CDATA[\n`;
        xml += `        <h3>${cleanTitle}</h3>\n`;
        xml += `        <p>${cleanDesc}</p>\n`;
        xml += `        <h4>Sample Standard I/O Test Case</h4>\n`;
        xml += `        <pre>Input:\n${cleanInput}\n\nExpected Output:\n${cleanOutput}</pre>\n`;
        xml += `      ]]></text>\n`;
        xml += `    </questiontext>\n`;
        xml += `    <generalfeedback format="html">\n`;
        xml += `      <text><![CDATA[<p>Reference Code:</p><pre>${cleanRefCode}</pre>]]></text>\n`;
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
