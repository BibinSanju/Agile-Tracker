/**
 * Nightly Scraper & Ingestion Pipeline
 *
 * Pulls recently published problems from public sources, de-duplicates them
 * against what is already staged, optionally enriches them with Groq, and
 * inserts them into the StagedQuestion table for faculty review.
 *
 *   npm run scrape                       # LeetCode + Codeforces, 10 each, write to DB
 *   npm run scrape -- --dry-run          # no DB needed; prints what would be staged
 *   npm run scrape -- --source leetcode --limit 5
 *   npm run scrape -- --enrich           # Groq: formalise + 10 testcases + solution
 *
 * Env: DATABASE_URL / DIRECT_URL (unless --dry-run), GROQ_API_KEY (for --enrich).
 *
 * Sources
 *  - LeetCode  : public GraphQL. Full statement + worked examples (turned into
 *                sample I/O test cases). Paid-only problems are skipped.
 *  - Codeforces: public REST API. Title, tags and rating only – the statement
 *                is not exposed by the API, so the description links to it.
 *  - CSES      : no API; not implemented.
 *
 * Honesty notes: nothing here executes code. Staged rows are written with
 * sandboxStatus=PENDING and testPassRate="Pending" so the review UI never
 * claims a verification that did not happen.
 */
import 'dotenv/config';

type Source = 'LeetCode' | 'Codeforces';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

interface Candidate {
  title: string;
  description: string;
  source: Source;
  sourceUrl: string;
  difficulty: Difficulty;
  suggestedCategory: string;
  tags: string[];
  testCases: TestCase[];
  referenceSolution: { language: string; code: string } | null;
}

interface Options {
  sources: Source[];
  limit: number;
  dryRun: boolean;
  enrich: boolean;
  duplicateThreshold: number;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): Options {
  const opts: Options = {
    sources: ['LeetCode', 'Codeforces'],
    limit: 10,
    dryRun: false,
    enrich: false,
    duplicateThreshold: 0.85,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--enrich') opts.enrich = true;
    else if (a === '--limit') opts.limit = Math.max(1, Math.min(50, Number(argv[++i]) || 10));
    else if (a === '--source') {
      opts.sources = String(argv[++i] ?? '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
        .map((s) => (s === 'leetcode' ? 'LeetCode' : s === 'codeforces' ? 'Codeforces' : null))
        .filter((s): s is Source => s !== null);
      if (opts.sources.length === 0) throw new Error('--source expects leetcode and/or codeforces');
    }
  }
  return opts;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const UA = 'IntelX-AgileTracker-Scraper/1.0 (+https://github.com/BibinSanju/Agile-Tracker)';

async function fetchJson<T>(url: string, init?: RequestInit, retries = 2): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { ...init, headers: { 'User-Agent': UA, ...(init?.headers ?? {}) } });
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
      return (await res.json()) as T;
    } catch (e) {
      if (attempt >= retries) throw e;
      await sleep(1000 * (attempt + 1));
    }
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Minimal HTML → plain text good enough for problem statements. */
function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<\s*(br|\/p|\/li|\/pre|\/h\d)\s*\/?>/gi, '\n')
      .replace(/<\s*li[^>]*>/gi, '• ')
      .replace(/<sup>(.*?)<\/sup>/gi, '^$1')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\uFFFD/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

/** Extract "Input: … Output: …" pairs from a LeetCode statement. */
function extractExamples(html: string): TestCase[] {
  const text = htmlToText(html);
  const re = /Input:\s*([\s\S]*?)\s*Output:\s*([^\n]*)/g;
  const cases: TestCase[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) && cases.length < 5) {
    const input = m[1].replace(/\s*\n\s*/g, '\n').trim();
    const output = m[2].trim();
    if (input && output) cases.push({ id: cases.length + 1, input, expectedOutput: output, isSample: true });
  }
  return cases;
}

// Tag → Moodle-style category path. Unknown tags fall back to DSA/General/<Tag>.
const CATEGORY_MAP: Record<string, string> = {
  'array': 'DSA/Arrays/Traversal',
  'string': 'DSA/Strings/Manipulation',
  'strings': 'DSA/Strings/Manipulation',
  'hash table': 'DSA/Hashing/Hash Map',
  'hashing': 'DSA/Hashing/Hash Map',
  'two pointers': 'DSA/Arrays/Two Pointers',
  'sliding window': 'DSA/Arrays/Sliding Window',
  'binary search': 'DSA/Searching/Binary Search',
  'sorting': 'DSA/Sorting/Comparison Sorts',
  'sortings': 'DSA/Sorting/Comparison Sorts',
  'stack': 'DSA/Stacks & Queues/Stack',
  'queue': 'DSA/Stacks & Queues/Queue',
  'linked list': 'DSA/Linked Lists/Singly Linked List',
  'tree': 'DSA/Trees/Binary Trees',
  'trees': 'DSA/Trees/Binary Trees',
  'binary tree': 'DSA/Trees/Binary Trees',
  'binary search tree': 'DSA/Trees/BST',
  'heap (priority queue)': 'DSA/Heaps/Priority Queue',
  'trie': 'DSA/Trees/Trie',
  'graph': 'DSA/Graphs/Traversal',
  'graphs': 'DSA/Graphs/Traversal',
  'breadth-first search': 'DSA/Graphs/Breadth First Search (BFS)',
  'depth-first search': 'DSA/Graphs/Depth First Search (DFS)',
  'dfs and similar': 'DSA/Graphs/Depth First Search (DFS)',
  'shortest paths': 'DSA/Graphs/Shortest Paths',
  'topological sort': 'DSA/Graphs/Topological Sort',
  'union find': 'DSA/Graphs/Disjoint Set Union',
  'dsu': 'DSA/Graphs/Disjoint Set Union',
  'dynamic programming': 'DSA/Dynamic Programming/1D & 2D DP',
  'dp': 'DSA/Dynamic Programming/1D & 2D DP',
  'greedy': 'DSA/Greedy/Interval & Selection',
  'backtracking': 'DSA/Recursion/Backtracking',
  'recursion': 'DSA/Recursion/Basics',
  'divide and conquer': 'DSA/Recursion/Divide & Conquer',
  'bit manipulation': 'DSA/Math/Bit Manipulation',
  'bitmasks': 'DSA/Math/Bit Manipulation',
  'math': 'DSA/Math/Number Theory',
  'number theory': 'DSA/Math/Number Theory',
  'combinatorics': 'DSA/Math/Combinatorics',
  'geometry': 'DSA/Math/Geometry',
  'matrix': 'DSA/Arrays/Matrix',
  'prefix sum': 'DSA/Arrays/Prefix Sum',
  'simulation': 'DSA/Implementation/Simulation',
  'implementation': 'DSA/Implementation/Simulation',
  'brute force': 'DSA/Implementation/Brute Force',
  'constructive algorithms': 'DSA/Constructive/Constructive Algorithms',
  'data structures': 'DSA/Data Structures/General',
  'segment tree': 'DSA/Data Structures/Segment Tree',
  'binary indexed tree': 'DSA/Data Structures/Fenwick Tree',
  'monotonic stack': 'DSA/Stacks & Queues/Monotonic Stack',
  'design': 'DSA/Design/Data Structure Design',
  'interactive': 'DSA/Interactive/Interactive Problems',
  'games': 'DSA/Game Theory/Combinatorial Games',
};

// Keyword fallback for problems that have no tags yet (LeetCode adds topic
// tags days after release). Order matters: more specific patterns first.
const KEYWORD_RULES: Array<[RegExp, string]> = [
  [/\b(shortest path|dijkstra|bellman|floyd)\b/i, 'DSA/Graphs/Shortest Paths'],
  [/\b(bfs|breadth[- ]first)\b/i, 'DSA/Graphs/Breadth First Search (BFS)'],
  [/\b(dfs|depth[- ]first)\b/i, 'DSA/Graphs/Depth First Search (DFS)'],
  [/\b(graph|edges?|vertices|vertex|adjacen)/i, 'DSA/Graphs/Traversal'],
  [/\b(binary search tree|bst)\b/i, 'DSA/Trees/BST'],
  [/\b(binary tree|treenode|root of a tree|subtree|ancestor)\b/i, 'DSA/Trees/Binary Trees'],
  [/\b(trie|prefix tree)\b/i, 'DSA/Trees/Trie'],
  [/\b(linked list|listnode)\b/i, 'DSA/Linked Lists/Singly Linked List'],
  [/\b(heap|priority queue|k(-| )?th (largest|smallest))\b/i, 'DSA/Heaps/Priority Queue'],
  [/\b(monotonic stack|next greater|previous smaller)\b/i, 'DSA/Stacks & Queues/Monotonic Stack'],
  [/\b(stack|parenthes[ei]s|brackets?)\b/i, 'DSA/Stacks & Queues/Stack'],
  [/\b(queue|deque)\b/i, 'DSA/Stacks & Queues/Queue'],
  [/\b(dynamic programming|dp|memoi[sz]|minimum (cost|number of operations)|maximum (score|profit)|number of ways)\b/i, 'DSA/Dynamic Programming/1D & 2D DP'],
  [/\bxor\b|\bbitmask|\bbitwise\b/i, 'DSA/Math/Bit Manipulation'],
  [/\b(prime|gcd|lcm|divisor|modulo|factorial|combinator)/i, 'DSA/Math/Number Theory'],
  [/\b(interval|meeting|overlap)/i, 'DSA/Greedy/Interval & Selection'],
  [/\b(sliding window|window of size|substring of length)/i, 'DSA/Arrays/Sliding Window'],
  [/\b(two pointers|palindrom)/i, 'DSA/Arrays/Two Pointers'],
  [/\b(prefix sum|running sum|subarray sum)/i, 'DSA/Arrays/Prefix Sum'],
  [/\b(binary search|sorted array)/i, 'DSA/Searching/Binary Search'],
  [/\b(matrix|grid|cells?)\b/i, 'DSA/Arrays/Matrix'],
  [/\b(permutation|combination|subsets?|backtrack)/i, 'DSA/Recursion/Backtracking'],
  [/\b(hash ?(map|set|table)|frequency|distinct|duplicate)/i, 'DSA/Hashing/Hash Map'],
  [/\b(string|substring|characters?|letters?|words?)\b/i, 'DSA/Strings/Manipulation'],
  [/\b(subarray|rotation|rotate)\b/i, 'DSA/Arrays/Subarrays & Rotation'],
  [/\b(sort(ed|ing)?)\b/i, 'DSA/Sorting/Comparison Sorts'],
  [/\b(array|nums)\b/i, 'DSA/Arrays/Traversal'],
  [/\b(simulat|game|turns?)\b/i, 'DSA/Implementation/Simulation'],
];

function categoryFor(tags: string[], text = ''): string {
  for (const t of tags) {
    const hit = CATEGORY_MAP[t.toLowerCase()];
    if (hit) return hit;
  }
  if (tags[0]) return `DSA/General/${tags[0].replace(/\b\w/g, (c) => c.toUpperCase())}`;
  for (const [re, cat] of KEYWORD_RULES) if (re.test(text)) return cat;
  return 'DSA/Uncategorised/Needs Tagging';
}

function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

const STOP = new Set(['the', 'a', 'an', 'of', 'in', 'to', 'and', 'or', 'with', 'for', 'on', 'by', 'from', 'is', 'ii', 'iii', 'iv']);

function tokens(t: string): Set<string> {
  return new Set(normalizeTitle(t).split(' ').filter((w) => w && !STOP.has(w)));
}

/** Jaccard similarity of title tokens – a cheap stand-in for embeddings. */
function titleSimilarity(a: string, b: string): number {
  const A = tokens(a);
  const B = tokens(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

async function scrapeLeetCode(limit: number): Promise<Candidate[]> {
  const gql = async <T>(query: string, variables: Record<string, unknown>) => {
    const json = await fetchJson<{ data: T; errors?: unknown[] }>('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
      body: JSON.stringify({ query, variables }),
    });
    if (json.errors?.length) throw new Error(`LeetCode GraphQL error: ${JSON.stringify(json.errors).slice(0, 200)}`);
    return json.data;
  };

  interface ListItem {
    questionFrontendId: string;
    title: string;
    titleSlug: string;
    difficulty: Difficulty;
    paidOnly: boolean;
    topicTags: { name: string }[];
  }

  // Newest problems have the highest frontend IDs; ask for a descending sort
  // and fall back to paging from the end if the sort option is rejected.
  const LIST = `query list($limit:Int,$skip:Int,$filters:QuestionListFilterInput){
    problemsetQuestionList: questionList(categorySlug:"algorithms", limit:$limit, skip:$skip, filters:$filters){
      total: totalNum
      questions: data { questionFrontendId title titleSlug difficulty paidOnly: isPaidOnly topicTags { name } }
    }}`;

  let items: ListItem[] = [];
  const want = limit * 2; // over-fetch: some will be paid-only
  try {
    const d = await gql<{ problemsetQuestionList: { total: number; questions: ListItem[] } }>(LIST, {
      limit: want,
      skip: 0,
      filters: { orderBy: 'FRONTEND_ID', sortOrder: 'DESCENDING' },
    });
    items = d.problemsetQuestionList.questions;
  } catch {
    const head = await gql<{ problemsetQuestionList: { total: number; questions: ListItem[] } }>(LIST, { limit: 1, skip: 0, filters: {} });
    const total = head.problemsetQuestionList.total;
    const d = await gql<{ problemsetQuestionList: { total: number; questions: ListItem[] } }>(LIST, {
      limit: want,
      skip: Math.max(0, total - want),
      filters: {},
    });
    items = d.problemsetQuestionList.questions.reverse();
  }

  const DETAIL = `query detail($slug:String!){ question(titleSlug:$slug){ content } }`;
  const out: Candidate[] = [];
  for (const it of items) {
    if (out.length >= limit) break;
    if (it.paidOnly) continue;
    let content = '';
    try {
      const d = await gql<{ question: { content: string | null } }>(DETAIL, { slug: it.titleSlug });
      content = d.question?.content ?? '';
    } catch (e) {
      console.warn(`  ! LeetCode content failed for ${it.titleSlug}: ${(e as Error).message}`);
    }
    await sleep(300); // be polite
    if (!content) continue;
    const tags = it.topicTags.map((t) => t.name);
    const description = htmlToText(content);
    out.push({
      title: `${it.title}`,
      description,
      source: 'LeetCode',
      sourceUrl: `https://leetcode.com/problems/${it.titleSlug}/`,
      difficulty: it.difficulty,
      // Brand-new problems carry no topic tags yet; classify from the text.
      suggestedCategory: categoryFor(tags, `${it.title}\n${description.slice(0, 600)}`),
      tags,
      testCases: extractExamples(content),
      referenceSolution: null,
    });
  }
  return out;
}

async function scrapeCodeforces(limit: number): Promise<Candidate[]> {
  interface CFProblem { contestId?: number; index: string; name: string; rating?: number; tags: string[] }
  const json = await fetchJson<{ status: string; result: { problems: CFProblem[] } }>('https://codeforces.com/api/problemset.problems');
  if (json.status !== 'OK') throw new Error('Codeforces API returned non-OK status');

  const toDifficulty = (r?: number): Difficulty => (r == null ? 'Medium' : r < 1300 ? 'Easy' : r < 1900 ? 'Medium' : 'Hard');

  // The API lists newest contests first. Skip problems that have no tags or
  // no contest id (not linkable), and prefer rated ones (contest finished).
  return json.result.problems
    .filter((p) => p.contestId && p.tags.length > 0)
    .slice(0, limit * 4)
    .sort((a, b) => Number(Boolean(b.rating)) - Number(Boolean(a.rating)))
    .slice(0, limit)
    .map((p) => {
      const url = `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`;
      return {
        title: `${p.name} (Codeforces ${p.contestId}${p.index})`,
        description:
          `Codeforces problem ${p.contestId}${p.index}${p.rating ? ` · rating ${p.rating}` : ''}.\n` +
          `Tags: ${p.tags.join(', ')}.\n\n` +
          `The Codeforces API does not expose problem statements. Read the full statement, ` +
          `constraints and samples at: ${url}\n\n` +
          `Faculty action: paste the formal statement here before approval.`,
        source: 'Codeforces' as const,
        sourceUrl: url,
        difficulty: toDifficulty(p.rating),
        suggestedCategory: categoryFor(p.tags),
        tags: p.tags,
        testCases: [],
        referenceSolution: null,
      };
    });
}

// ---------------------------------------------------------------------------
// Optional Groq enrichment (same prompts as routes/ai.ts, run offline)
// ---------------------------------------------------------------------------

async function enrichWithGroq(c: Candidate): Promise<Candidate> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return c;
  const { Groq } = await import('groq-sdk');
  const groq = new Groq({ apiKey: key });
  const model = 'openai/gpt-oss-120b';

  const ask = async (system: string, user: string) => {
    const r = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
    });
    return JSON.parse(r.choices[0]?.message?.content || '{}');
  };

  try {
    const formal = await ask(
      `You are an expert DSA problem curator. Rewrite the given problem as a formal statement for standard-I/O judging.
Return JSON: { "description": string (statement + Input Format + Output Format + Constraints), "suggestedCategory": string like DSA/Graphs/BFS }`,
      `Title: ${c.title}\nTags: ${c.tags.join(', ')}\nSource: ${c.sourceUrl}\n\n${c.description}`
    );
    const tests = await ask(
      `Generate exactly 10 standard-input/standard-output test cases for the problem: 3 samples, 4 edge cases, 3 stress cases (keep stress inputs under 2KB).
Return JSON: { "testCases": [ { "id": number, "input": string, "expectedOutput": string, "isSample": boolean } ] }`,
      `Title: ${c.title}\n\n${formal.description || c.description}`
    );
    const sol = await ask(
      `Write an optimal, complete C++17 solution reading from stdin and writing to stdout.
Return JSON: { "language": "cpp", "code": string }`,
      `Title: ${c.title}\n\n${formal.description || c.description}`
    );
    return {
      ...c,
      description: typeof formal.description === 'string' && formal.description.length > 40 ? formal.description : c.description,
      suggestedCategory: typeof formal.suggestedCategory === 'string' && formal.suggestedCategory.startsWith('DSA/') ? formal.suggestedCategory : c.suggestedCategory,
      testCases: Array.isArray(tests.testCases) && tests.testCases.length >= 3 ? tests.testCases : c.testCases,
      referenceSolution: sol && typeof sol.code === 'string' ? { language: sol.language || 'cpp', code: sol.code } : c.referenceSolution,
    };
  } catch (e) {
    console.warn(`  ! Groq enrichment failed for "${c.title}": ${(e as Error).message}`);
    return c;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface Outcome { candidate: Candidate; action: 'staged' | 'duplicate' | 'would-stage'; similarity: number; matchedTitle?: string }

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const started = Date.now();
  console.log(`🕷️  Scraper starting · sources=${opts.sources.join(',')} limit=${opts.limit} dryRun=${opts.dryRun} enrich=${opts.enrich}`);

  // 1. Collect candidates
  const candidates: Candidate[] = [];
  for (const s of opts.sources) {
    try {
      const got = s === 'LeetCode' ? await scrapeLeetCode(opts.limit) : await scrapeCodeforces(opts.limit);
      console.log(`  ✓ ${s}: ${got.length} candidate(s)`);
      candidates.push(...got);
    } catch (e) {
      console.error(`  ✗ ${s} failed: ${(e as Error).message}`);
    }
  }
  if (candidates.length === 0) {
    console.error('No candidates fetched from any source.');
    process.exitCode = 1;
    return;
  }

  // 2. Load what is already staged (titles are enough for de-duplication)
  let existing: { title: string; source: string }[] = [];
  let prisma: import('@prisma/client').PrismaClient | null = null;
  if (!opts.dryRun) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set (use --dry-run to run without a database).');
    const { prisma: p } = await import('./db.js');
    prisma = p;
    existing = await prisma.stagedQuestion.findMany({ select: { title: true, source: true } });
    console.log(`  · ${existing.length} question(s) already staged`);
  }

  // 3. De-duplicate, enrich, insert
  const outcomes: Outcome[] = [];
  const seenThisRun: string[] = [];
  for (let c of candidates) {
    const pool = [...existing.map((e) => e.title), ...seenThisRun];
    let best = 0;
    let matched: string | undefined;
    for (const t of pool) {
      const sim = normalizeTitle(t) === normalizeTitle(c.title) ? 1 : titleSimilarity(t, c.title);
      if (sim > best) {
        best = sim;
        matched = t;
      }
    }
    if (best >= opts.duplicateThreshold) {
      outcomes.push({ candidate: c, action: 'duplicate', similarity: best, matchedTitle: matched });
      continue;
    }
    seenThisRun.push(c.title);

    if (opts.enrich) c = await enrichWithGroq(c);

    if (opts.dryRun || !prisma) {
      outcomes.push({ candidate: c, action: 'would-stage', similarity: best });
      continue;
    }

    await prisma.stagedQuestion.create({
      data: {
        title: c.title,
        description: `${c.description}\n\nSource: ${c.sourceUrl}`,
        source: c.source,
        difficulty: c.difficulty,
        suggestedCategory: c.suggestedCategory,
        confirmedCategory: c.suggestedCategory,
        status: 'PENDING_REVIEW',
        similarityScore: Number(best.toFixed(3)),
        isDuplicate: false,
        referenceSolution: JSON.stringify(c.referenceSolution ?? {}),
        testCases: JSON.stringify(c.testCases),
        // Nothing has been executed in a sandbox – say so.
        testPassRate: c.testCases.length ? `0/${c.testCases.length} Pending` : 'Pending',
        sandboxStatus: 'PENDING',
      },
    });
    outcomes.push({ candidate: c, action: 'staged', similarity: best });
  }

  if (prisma) await prisma.$disconnect();

  // 4. Report
  const staged = outcomes.filter((o) => o.action !== 'duplicate');
  const dups = outcomes.filter((o) => o.action === 'duplicate');
  console.log('');
  for (const o of outcomes) {
    const tag = o.action === 'duplicate' ? `≈ dup (${o.similarity.toFixed(2)} vs "${o.matchedTitle}")` : o.action;
    console.log(`  ${o.action === 'duplicate' ? '↷' : '＋'} [${o.candidate.source}] ${o.candidate.title} · ${o.candidate.difficulty} · ${o.candidate.suggestedCategory} · ${o.candidate.testCases.length} tc · ${tag}`);
  }
  console.log(`\n✅ Done in ${((Date.now() - started) / 1000).toFixed(1)}s · ${staged.length} ${opts.dryRun ? 'would be staged' : 'staged'} · ${dups.length} duplicate(s) skipped`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFileSync } = await import('node:fs');
    const rows = outcomes
      .map((o) => `| ${o.candidate.source} | [${o.candidate.title}](${o.candidate.sourceUrl}) | ${o.candidate.difficulty} | ${o.candidate.suggestedCategory} | ${o.candidate.testCases.length} | ${o.action}${o.matchedTitle ? ` (≈ ${o.matchedTitle})` : ''} |`)
      .join('\n');
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### 🕷️ Nightly scraper${opts.dryRun ? ' (dry run)' : ''}\n\n` +
        `**${staged.length}** ${opts.dryRun ? 'would be staged' : 'staged'}, **${dups.length}** duplicates skipped, enrich=${opts.enrich}\n\n` +
        `| Source | Problem | Difficulty | Category | Test cases | Action |\n|---|---|---|---|---|---|\n${rows}\n`
    );
  }
}

main().catch((e) => {
  console.error('❌ Scraper failed:', e);
  process.exit(1);
});
