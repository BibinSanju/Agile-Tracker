import { Router, Request, Response } from 'express';
import { Groq } from 'groq-sdk';
import { createGroqQuestionAi, formalizeRawQuestion, localFormalize } from '../services/questionIngestion.js';

export const aiRouter = Router();

const groqApiKey = process.env.GROQ_API_KEY || '';

// Dedicated client for Agile features to prevent quota exhaustion
const groqAgileApiKey = process.env.AUTO_GEN_API || groqApiKey;
const groqAgile = groqAgileApiKey ? new Groq({ apiKey: groqAgileApiKey }) : null;

// POST formalize raw prompt
aiRouter.post('/formalize', async (req: Request, res: Response) => {
  try {
    const { rawText, source } = req.body;
    if (!rawText) return res.status(400).json({ success: false, error: 'rawText is required.' });

    const result = await formalizeRawQuestion(
      { text: rawText, source: source || 'Student_Interview' },
      createGroqQuestionAi()
    );
    res.json({
      success: true,
      data: result.question,
      processing: { mode: result.processingMode, warnings: result.warnings }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST synthesize 10 standard I/O test cases
aiRouter.post('/synthesize-testcases', async (req: Request, res: Response) => {
  try {
    const { title, description, constraints } = req.body;
    if (!title || !description) return res.status(400).json({ success: false, error: 'Title and description are required.' });

    const ai = createGroqQuestionAi();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'AI testcase generation is not configured. Add GROQ_API_KEY.'
      });
    }
    const structured = localFormalize({ text: description, title });
    structured.constraints = Array.isArray(constraints) ? constraints.map(String) : structured.constraints;
    const result = await ai.synthesize(structured);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST generate issue acceptance criteria
aiRouter.post('/generate-criteria', async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, error: 'Title is required.' });
    if (!groqAgile) {
      return res.status(503).json({ success: false, error: 'AI generation is not configured. Add AUTO_GEN_API or GROQ_API_KEY.' });
    }

    const completion = await groqAgile.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: `You are an expert Agile Product Manager and Senior Software Engineer.
Given a task title and description, generate exactly 3-5 high-quality, actionable Acceptance Criteria.
Return valid JSON exactly in this format:
{ "criteria": ["criterion 1", "criterion 2", "criterion 3"] }
Do not return any other text.`
        },
        {
          role: 'user',
          content: `Issue Title: ${title}\nDescription: ${description || 'No description'}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{"criteria":[]}');
    res.json({ success: true, data: result.criteria });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
