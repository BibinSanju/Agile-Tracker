import { Groq } from 'groq-sdk';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface RawQuestionInput {
  text: string;
  title?: string;
  difficulty?: QuestionDifficulty;
  suggestedCategory?: string;
  source?: string;
}

export interface StructuredQuestion {
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  difficulty: QuestionDifficulty;
  suggestedCategory: string;
}

export interface QuestionAssets {
  referenceSolution: { language: string; code: string };
  testCases: Array<{ id: number; input: string; expectedOutput: string; isSample: boolean }>;
}

export interface ExistingQuestion {
  id: string;
  title: string;
  description: string;
}

export interface DuplicateMatch {
  id: string;
  title: string;
  similarity: number;
}

export interface QuestionAiAdapter {
  formalize(rawText: string, source: string): Promise<Partial<StructuredQuestion>>;
  synthesize(question: StructuredQuestion): Promise<Partial<QuestionAssets>>;
}

export interface ProcessedQuestion {
  question: StructuredQuestion;
  assets: QuestionAssets;
  duplicate: DuplicateMatch | null;
  closestMatch: DuplicateMatch | null;
  processingMode: 'ai' | 'local';
  warnings: string[];
}

export interface FormalizedQuestion {
  question: StructuredQuestion;
  processingMode: 'ai' | 'local';
  warnings: string[];
}

export const DEFAULT_DUPLICATE_THRESHOLD = 0.85;
export const DEFAULT_CATEGORY = 'DSA/Uncategorised/Needs Tagging';

const VALID_DIFFICULTIES = new Set<QuestionDifficulty>(['Easy', 'Medium', 'Hard']);
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'given', 'in', 'into', 'is',
  'it', 'of', 'on', 'or', 'return', 'that', 'the', 'to', 'using', 'with', 'you', 'your'
]);

const CATEGORY_RULES: Array<[RegExp, string]> = [
  [/\b(shortest path|dijkstra|bellman|floyd)\b/i, 'DSA/Graphs/Shortest Paths'],
  [/\b(bfs|breadth[- ]first)\b/i, 'DSA/Graphs/Breadth First Search (BFS)'],
  [/\b(dfs|depth[- ]first)\b/i, 'DSA/Graphs/Depth First Search (DFS)'],
  [/\b(graph|edges?|vertices|vertex|adjacen)\b/i, 'DSA/Graphs/Traversal'],
  [/\b(binary search tree|bst)\b/i, 'DSA/Trees/Binary Search Tree'],
  [/\b(dynamic programming|\bdp\b|knapsack|memoization)\b/i, 'DSA/Dynamic Programming/1D-DP'],
  [/\b(sql|database|query|table|join)\b/i, 'DBMS/SQL/Complex Queries'],
  [/\b(process|thread|deadlock|scheduling)\b/i, 'Operating Systems/Process Scheduling'],
  [/\b(binary search|sorted array)\b/i, 'DSA/Searching/Binary Search'],
  [/\b(tree|subtree|ancestor)\b/i, 'DSA/Trees/Binary Search Tree'],
  [/\b(string|substring|characters?|words?)\b/i, 'DSA/Strings/Manipulation'],
  [/\b(array|subarray|numbers?|integers?)\b/i, 'DSA/Arrays/Traversal']
];

function cleanString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function titleFromText(text: string): string {
  const firstLine = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(Boolean) || 'Untitled question';
  const withoutPrefix = firstLine.replace(/^(?:#{1,6}\s*|q(?:uestion)?\s*\d*\s*[:.)-]\s*)/i, '').trim();
  const title = withoutPrefix || firstLine;
  return title.length <= 120 ? title : `${title.slice(0, 117).trimEnd()}...`;
}

function inferCategory(text: string): string {
  for (const [pattern, category] of CATEGORY_RULES) {
    if (pattern.test(text)) return category;
  }
  return DEFAULT_CATEGORY;
}

function inferDifficulty(text: string): QuestionDifficulty {
  if (/\b(hard|advanced|optimi[sz]e|10\^6|10\^9|np-hard)\b/i.test(text)) return 'Hard';
  if (/\b(easy|basic|beginner)\b/i.test(text)) return 'Easy';
  return 'Medium';
}

function section(text: string, heading: string): string {
  const pattern = new RegExp(
    `(?:^|\\n)\\s*${heading}\\s*:?\\s*([\\s\\S]*?)(?=\\n\\s*(?:input(?: format)?|output(?: format)?|constraints?|examples?)\\s*:|$)`,
    'i'
  );
  return pattern.exec(text)?.[1]?.trim() || '';
}

function constraintsFromText(text: string): string[] {
  const explicit = section(text, 'constraints?');
  if (explicit) {
    return explicit.split(/\r?\n|;/).map(value => value.replace(/^[-*•]\s*/, '').trim()).filter(Boolean);
  }
  return Array.from(text.matchAll(/(?:^|\s)([A-Za-z]\w*\s*(?:<=|<|>=|>)\s*[^,.;\n]+)/g))
    .map(match => match[1].trim())
    .slice(0, 10);
}

export function localFormalize(input: RawQuestionInput): StructuredQuestion {
  const text = cleanString(input.text);
  if (!text) throw new Error('Question text is required.');
  const difficulty = VALID_DIFFICULTIES.has(input.difficulty as QuestionDifficulty)
    ? input.difficulty as QuestionDifficulty
    : inferDifficulty(text);

  return {
    title: cleanString(input.title) || titleFromText(text),
    description: text,
    inputFormat: section(text, 'input(?: format)?'),
    outputFormat: section(text, 'output(?: format)?'),
    constraints: constraintsFromText(text),
    difficulty,
    suggestedCategory: cleanString(input.suggestedCategory) || inferCategory(text)
  };
}

export function formatStructuredDescription(question: StructuredQuestion): string {
  const sections = [question.description];
  if (question.inputFormat) sections.push(`Input Format:\n${question.inputFormat}`);
  if (question.outputFormat) sections.push(`Output Format:\n${question.outputFormat}`);
  if (question.constraints.length) sections.push(`Constraints:\n${question.constraints.map(value => `- ${value}`).join('\n')}`);
  return sections.join('\n\n');
}

function normalizedTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

function termVector(text: string): Map<string, number> {
  const vector = new Map<string, number>();
  for (const token of normalizedTokens(text)) vector.set(token, (vector.get(token) || 0) + 1);
  return vector;
}

export function cosineTextSimilarity(left: string, right: string): number {
  const a = termVector(left);
  const b = termVector(right);
  if (a.size === 0 || b.size === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const value of a.values()) normA += value * value;
  for (const value of b.values()) normB += value * value;
  for (const [term, value] of a) dot += value * (b.get(term) || 0);
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function normalizedExactText(text: string): string {
  return normalizedTokens(text).join(' ');
}

export function findClosestQuestion(
  candidate: StructuredQuestion,
  existingQuestions: ExistingQuestion[]
): DuplicateMatch | null {
  let closest: DuplicateMatch | null = null;
  const candidateBody = `${candidate.title} ${candidate.title} ${candidate.description}`;

  for (const existing of existingQuestions) {
    const exactTitle = normalizedExactText(candidate.title) === normalizedExactText(existing.title);
    const titleScore = cosineTextSimilarity(candidate.title, existing.title);
    const bodyScore = cosineTextSimilarity(candidateBody, `${existing.title} ${existing.title} ${existing.description}`);
    const similarity = exactTitle ? 1 : Math.max(titleScore, (titleScore * 0.35) + (bodyScore * 0.65));
    const rounded = Number(Math.min(1, similarity).toFixed(3));
    if (!closest || rounded > closest.similarity) {
      closest = { id: existing.id, title: existing.title, similarity: rounded };
    }
  }

  return closest;
}

function validatedStructuredQuestion(
  fallback: StructuredQuestion,
  value: Partial<StructuredQuestion>
): StructuredQuestion {
  const difficulty = VALID_DIFFICULTIES.has(value.difficulty as QuestionDifficulty)
    ? value.difficulty as QuestionDifficulty
    : fallback.difficulty;
  return {
    title: cleanString(value.title) || fallback.title,
    description: cleanString(value.description) || fallback.description,
    inputFormat: cleanString(value.inputFormat) || fallback.inputFormat,
    outputFormat: cleanString(value.outputFormat) || fallback.outputFormat,
    constraints: Array.isArray(value.constraints)
      ? value.constraints.map(cleanString).filter(Boolean)
      : fallback.constraints,
    difficulty,
    suggestedCategory: cleanString(value.suggestedCategory) || fallback.suggestedCategory
  };
}

function validatedAssets(value: Partial<QuestionAssets>): QuestionAssets {
  const solution = value.referenceSolution;
  const testCases = Array.isArray(value.testCases)
    ? value.testCases
      .filter(test => test && typeof test.input === 'string' && typeof test.expectedOutput === 'string')
      .slice(0, 10)
      .map((test, index) => ({
        id: index + 1,
        input: test.input,
        expectedOutput: test.expectedOutput,
        isSample: Boolean(test.isSample)
      }))
    : [];
  return {
    referenceSolution: {
      language: cleanString(solution?.language),
      code: cleanString(solution?.code)
    },
    testCases
  };
}

export async function processRawQuestion(
  input: RawQuestionInput,
  existingQuestions: ExistingQuestion[],
  options: { ai?: QuestionAiAdapter | null; duplicateThreshold?: number } = {}
): Promise<ProcessedQuestion> {
  const formalized = await formalizeRawQuestion(input, options.ai);
  const question = formalized.question;
  const processingMode = formalized.processingMode;
  const warnings = [...formalized.warnings];

  const closestMatch = findClosestQuestion(question, existingQuestions);
  const threshold = options.duplicateThreshold ?? DEFAULT_DUPLICATE_THRESHOLD;
  const duplicate = closestMatch && closestMatch.similarity >= threshold ? closestMatch : null;
  let assets: QuestionAssets = validatedAssets({});

  if (!duplicate && options.ai) {
    try {
      assets = validatedAssets(await options.ai.synthesize(question));
    } catch (error) {
      warnings.push(`AI testcase generation failed; the question was staged without generated assets: ${(error as Error).message}`);
    }
  }

  return { question, assets, duplicate, closestMatch, processingMode, warnings };
}

export async function formalizeRawQuestion(
  input: RawQuestionInput,
  ai: QuestionAiAdapter | null = null
): Promise<FormalizedQuestion> {
  const fallback = localFormalize(input);
  const warnings: string[] = [];
  let question = fallback;
  let processingMode: FormalizedQuestion['processingMode'] = 'local';

  if (ai) {
    try {
      question = validatedStructuredQuestion(
        fallback,
        await ai.formalize(input.text, input.source || 'Student_Interview')
      );
      // Explicit faculty selections always win over an inferred AI value.
      if (cleanString(input.title)) question.title = cleanString(input.title);
      if (cleanString(input.suggestedCategory)) question.suggestedCategory = cleanString(input.suggestedCategory);
      if (VALID_DIFFICULTIES.has(input.difficulty as QuestionDifficulty)) question.difficulty = input.difficulty as QuestionDifficulty;
      processingMode = 'ai';
    } catch (error) {
      warnings.push(`AI formalization failed; local structuring was used: ${(error as Error).message}`);
    }
  }
  return { question, processingMode, warnings };
}

export function createGroqQuestionAi(apiKey = process.env.GROQ_API_KEY): QuestionAiAdapter | null {
  if (!apiKey) return null;
  const groq = new Groq({ apiKey });
  const model = process.env.GROQ_QUESTION_MODEL || 'openai/gpt-oss-120b';

  const ask = async (system: string, user: string): Promise<Record<string, unknown>> => {
    const completion = await groq.chat.completions.create({
      model,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      response_format: { type: 'json_object' }
    });
    return JSON.parse(completion.choices[0]?.message?.content || '{}');
  };

  return {
    formalize: async (rawText, source) => ask(
      `You are an expert programming-question curator. Convert raw interview text into strict JSON with keys: title, description, inputFormat, outputFormat, constraints (string array), difficulty (Easy, Medium, or Hard), and suggestedCategory. Preserve all requirements and never invent missing numeric constraints. Return JSON only.`,
      `Source: ${source}\n\nRaw question:\n${rawText}`
    ) as Promise<Partial<StructuredQuestion>>,
    synthesize: async question => ask(
      `Generate a correct reference solution and exactly 10 standard-I/O test cases: 3 samples, 4 edge cases, and 3 stress cases. Return strict JSON: { "referenceSolution": { "language": "cpp", "code": string }, "testCases": [{ "id": number, "input": string, "expectedOutput": string, "isSample": boolean }] }. Return JSON only.`,
      JSON.stringify(question)
    ) as Promise<Partial<QuestionAssets>>
  };
}
