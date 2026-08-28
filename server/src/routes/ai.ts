import { Router, Request, Response } from 'express';
import { Groq } from 'groq-sdk';

export const aiRouter = Router();

const groqApiKey = process.env.GROQ_API_KEY || '';
const groq = new Groq({ apiKey: groqApiKey });

// Dedicated client for Agile features to prevent quota exhaustion
const groqAgileApiKey = process.env.AUTO_GEN_API || groqApiKey;
const groqAgile = new Groq({ apiKey: groqAgileApiKey });

// POST formalize raw prompt
aiRouter.post('/formalize', async (req: Request, res: Response) => {
  try {
    const { rawText, source } = req.body;
    if (!rawText) return res.status(400).json({ success: false, error: 'rawText is required.' });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert DSA problem curator for university placement training.
Given a raw prompt or voice transcript, extract and format it into clean JSON with:
- title: concise descriptive title
- description: formal mathematical problem statement
- inputFormat: standard stream input description
- outputFormat: standard stream output description
- constraints: list of mathematical boundary constraints (e.g. 1 <= N <= 10^5)
- difficulty: Easy, Medium, or Hard
- suggestedCategory: Category path like DSA/Graphs/BFS or DSA/Dynamic Programming/Knapsack
Return strictly valid JSON only.`
        },
        {
          role: 'user',
          content: `Raw Prompt:\n${rawText}\nSource: ${source || 'Student_Interview'}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST synthesize 10 standard I/O test cases
aiRouter.post('/synthesize-testcases', async (req: Request, res: Response) => {
  try {
    const { title, description, constraints } = req.body;
    if (!title || !description) return res.status(400).json({ success: false, error: 'Title and description are required.' });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an elite competitive programming test case generator.
Generate exactly 10 rigorous standard I/O test cases (3 sample cases, 4 boundary/edge cases, 3 stress cases).
Also provide verified optimal solution code in C++20 and Python 3.12.
Return valid JSON with:
- referenceSolution: { language: "cpp", code: "..." }
- testCases: array of 10 objects: { id: 1..10, input: "raw stdin string", expectedOutput: "raw stdout string", isSample: boolean }
Return strictly valid JSON only.`
        },
        {
          role: 'user',
          content: `Problem Title: ${title}\nDescription: ${description}\nConstraints: ${JSON.stringify(constraints || [])}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
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

    const completion = await groqAgile.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
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
