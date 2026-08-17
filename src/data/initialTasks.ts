export interface Task {
  id: string;
  key: string;
  title: string;
  description: string;
  epicId: string;
  epicName: string;
  status: 'backlog' | 'in_progress' | 'in_review' | 'done';
  assignee: string;
  assigneeRole: string;
  storyPoints: number;
  priority: 'high' | 'medium' | 'low';
  architectureLayer: string;
  acceptanceCriteria: string[];
  createdAt: string;
}

export interface Epic {
  id: string;
  name: string;
  code: string;
  layer: string;
  color: string;
  description: string;
}

export const INITIAL_EPICS: Epic[] = [
  {
    id: 'epic-1',
    code: 'INGEST',
    name: '1. Ingestion & Raw Input Layer',
    layer: 'Layer 1: Ingestion',
    color: '#38bdf8',
    description: 'Student unstructured interview prompts, audio intake, and automated timed scrapers'
  },
  {
    id: 'epic-2',
    code: 'CURATE',
    name: '2. Curation & Deduplication Engine',
    layer: 'Layer 2: AI & Compilation',
    color: '#818cf8',
    description: 'LLM formalization, 384-d vector embeddings, and cosine similarity search against 5,000 DB'
  },
  {
    id: 'epic-3',
    code: 'SYNTH',
    name: '3. Solution & Testcase Synthesizer',
    layer: 'Layer 2: AI & Compilation',
    color: '#c084fc',
    description: 'Optimal C++/Java/Python reference code and 10 Standard I/O test cases synthesis'
  },
  {
    id: 'epic-4',
    code: 'SANDBOX',
    name: '4. Docker Execution Sandbox',
    layer: 'Layer 2: AI & Compilation',
    color: '#f43f5e',
    description: 'Ephemeral worker container (128MB RAM, 2s limit) with 10/10 testcase verification'
  },
  {
    id: 'epic-5',
    code: 'TAXONOMY',
    name: '5. Taxonomy & Moodle XML Transformer',
    layer: 'Layer 3: Staging & Delivery',
    color: '#fbbf24',
    description: 'Hierarchical category classifier ($course$/top/DSA/Graphs/BFS) and CDATA XML engine'
  },
  {
    id: 'epic-6',
    code: 'STAGING',
    name: '6. Staging & Faculty Review Queue',
    layer: 'Layer 3: Staging & Delivery',
    color: '#34d399',
    description: 'Isolated StagedQuestion table, bulk checkbox curation UI, and side-by-side diff inspector'
  },
  {
    id: 'epic-7',
    code: 'CICD',
    name: '7. CI/CD & Automated Playwright Testing',
    layer: 'Layer 4: CI/CD Quality Gates',
    color: '#f59e0b',
    description: 'GitHub Actions CI, Playwright E2E browser tests, daily build, and zero-regression gates'
  },
  {
    id: 'epic-8',
    code: 'PROD',
    name: '8. Live Production Server & LMS Practice',
    layer: 'Layer 5: Production & LMS',
    color: '#4ade80',
    description: 'Dedicated college portal server, live PostgreSQL DB, and 5,000+ student practice'
  }
];

export const INITIAL_TASKS: Task[] = [
  // EPIC 1: INGESTION
  {
    id: 'task-101',
    key: 'INGEST-1',
    title: 'Student Unstructured Interview Prompt Intake Parser',
    description: 'Build prompt normalization utility that cleans grammar, standardizes math notations, and extracts mathematical constraints from raw student input.',
    epicId: 'epic-1',
    epicName: '1. Ingestion & Raw Input Layer',
    status: 'done',
    assignee: 'Lead Dev (Bibin)',
    assigneeRole: 'Lead Architect',
    storyPoints: 3,
    priority: 'high',
    architectureLayer: 'Layer 1: Ingestion',
    acceptanceCriteria: [
      'Accepts raw strings and voice transcript text',
      'Outputs standardized Title, Description, and Constraints JSON',
      'Handles LaTeX equations and boundary specifications'
    ],
    createdAt: '2026-08-16'
  },
  {
    id: 'task-102',
    key: 'INGEST-2',
    title: 'LeetCode GraphQL Scraper Adapter',
    description: 'Connect scraper to fetch problem statements, tags, difficulty ratings, and official constraints directly via GraphQL.',
    epicId: 'epic-1',
    epicName: '1. Ingestion & Raw Input Layer',
    status: 'done',
    assignee: 'Junior 1 (Arun)',
    assigneeRole: 'Scraper Specialist',
    storyPoints: 5,
    priority: 'high',
    architectureLayer: 'Layer 1: Ingestion',
    acceptanceCriteria: [
      'Extracts titleSlug, contentHtml, and topicTags',
      'Normalizes HTML formatting into clean Markdown/text',
      'Supports batch query of 50 questions per run'
    ],
    createdAt: '2026-08-16'
  },
  {
    id: 'task-103',
    key: 'INGEST-3',
    title: 'Codeforces & CSES Problem Set Ingestion Module',
    description: 'Build scraper adapters to parse Codeforces API and CSES standard problem archives.',
    epicId: 'epic-1',
    epicName: '1. Ingestion & Raw Input Layer',
    status: 'done',
    assignee: 'Junior 2 (Dinesh)',
    assigneeRole: 'Data Ingestion Dev',
    storyPoints: 5,
    priority: 'medium',
    architectureLayer: 'Layer 1: Ingestion',
    acceptanceCriteria: [
      'Parses CSES input/output format specifications',
      'Formats problems into unified staging payload schema',
      'Validates time/memory constraints per problem'
    ],
    createdAt: '2026-08-16'
  },

  // EPIC 2: CURATION & DEDUPLICATION
  {
    id: 'task-201',
    key: 'CURATE-1',
    title: '384-Dimensional Embedding Vector Generator',
    description: 'Integrate all-MiniLM-L6-v2 vectorizer on the RTX 5070 GPU machine to generate semantic embeddings for all incoming questions.',
    epicId: 'epic-2',
    epicName: '2. Curation & Deduplication Engine',
    status: 'in_progress',
    assignee: 'Junior 3 (Harish)',
    assigneeRole: 'AI/ML Engineer',
    storyPoints: 5,
    priority: 'high',
    architectureLayer: 'Layer 2: AI & Compilation',
    acceptanceCriteria: [
      'Generates 384-float vector array in < 50ms per question',
      'Normalizes vector for Euclidean and Cosine calculations',
      'Runs locally on the RTX 5070 GPU machine'
    ],
    createdAt: '2026-08-16'
  },
  {
    id: 'task-202',
    key: 'CURATE-2',
    title: 'Cosine Similarity Deduplication vs 5,000 DB Questions',
    description: 'Implement semantic vector search against existing 5,000+ question bank with a strict 0.85 similarity threshold to eliminate duplicate questions.',
    epicId: 'epic-2',
    epicName: '2. Curation & Deduplication Engine',
    status: 'in_progress',
    assignee: 'Lead Dev (Bibin)',
    assigneeRole: 'Lead Architect',
    storyPoints: 5,
    priority: 'high',
    architectureLayer: 'Layer 2: AI & Compilation',
    acceptanceCriteria: [
      'Calculates cosine similarity = (A · B) / (||A|| * ||B||)',
      'Rejects questions with similarity >= 0.85 and links to existing ID',
      'Promotes questions with similarity < 0.85 with new UUID'
    ],
    createdAt: '2026-08-16'
  },

  // EPIC 3: TESTCASE & SOLUTION SYNTHESIS
  {
    id: 'task-301',
    key: 'SYNTH-1',
    title: 'Multi-Language Optimal Reference Code Generator',
    description: 'Prompt engine on RTX 5070 / Groq to synthesize verified optimal solutions in Python 3.12, C++20 (g++ 17), and Java 17.',
    epicId: 'epic-3',
    epicName: '3. Solution & Testcase Synthesizer',
    status: 'in_review',
    assignee: 'Lead Dev (Bibin)',
    assigneeRole: 'Lead Architect',
    storyPoints: 5,
    priority: 'high',
    architectureLayer: 'Layer 2: AI & Compilation',
    acceptanceCriteria: [
      'Outputs compilable C++, Java, and Python code',
      'Includes Time Complexity and Space Complexity derivations',
      'Uses standard stream I/O (cin/cout, Scanner, sys.stdin)'
    ],
    createdAt: '2026-08-16'
  },
  {
    id: 'task-302',
    key: 'SYNTH-2',
    title: '10 Standard I/O Testcase Generator (Sample, Edge, Stress)',
    description: 'Generate exactly 10 rigorous test cases per problem: 3 sample cases, 4 boundary/edge cases (N=1, negative, max values), and 3 stress performance cases (N=10^5).',
    epicId: 'epic-3',
    epicName: '3. Solution & Testcase Synthesizer',
    status: 'done',
    assignee: 'Lead Dev (Bibin)',
    assigneeRole: 'Lead Architect',
    storyPoints: 5,
    priority: 'high',
    architectureLayer: 'Layer 2: AI & Compilation',
    acceptanceCriteria: [
      'Generates exact 10 testcases per problem',
      'Formatted as raw strings separated by \\n',
      'Includes maximum boundary stress cases'
    ],
    createdAt: '2026-08-16'
  },

  // EPIC 4: DOCKER SANDBOX
  {
    id: 'task-401',
    key: 'SANDBOX-1',
    title: 'Ephemeral Docker Execution Sandbox with 128MB Limit',
    description: 'Set up containerized code execution sandbox with strict resource limits: 128MB RAM, 1 CPU Core, 2.0s execution timeout, and disabled network access.',
    epicId: 'epic-4',
    epicName: '4. Docker Execution Sandbox',
    status: 'in_progress',
    assignee: 'Junior 4 (Karthik)',
    assigneeRole: 'DevOps / Backend',
    storyPoints: 5,
    priority: 'high',
    architectureLayer: 'Layer 2: AI & Compilation',
    acceptanceCriteria: [
      'Enforces 128MB memory ceiling and 2.0s timeout',
      'Compiles C++ (g++ -O3), Java (javac), and Python3',
      'Captures stdout, stderr, and execution time in ms'
    ],
    createdAt: '2026-08-16'
  },
  {
    id: 'task-402',
    key: 'SANDBOX-2',
    title: '10/10 Testcase Verification & Flakiness Handler',
    description: 'Automated runner that feeds all 10 testcase stdin files into the sandbox and verifies that actual stdout matches expectedOutput character-by-character.',
    epicId: 'epic-4',
    epicName: '4. Docker Execution Sandbox',
    status: 'in_review',
    assignee: 'Junior 4 (Karthik)',
    assigneeRole: 'DevOps / Backend',
    storyPoints: 3,
    priority: 'high',
    architectureLayer: 'Layer 2: AI & Compilation',
    acceptanceCriteria: [
      'Passes only if 10/10 testcases match expectedOutput',
      'Flags question as FLAKY if any timeout or runtime error occurs',
      'Logs full compiler stderr on failure'
    ],
    createdAt: '2026-08-16'
  },

  // EPIC 5: TAXONOMY & MOODLE XML
  {
    id: 'task-501',
    key: 'TAXONOMY-1',
    title: 'Algorithmic Taxonomy Classifier ($course$/top/... hierarchy)',
    description: 'Classifier engine that maps problems into the deep college category tree (e.g. $course$/top/DSA/Graphs/Breadth First Search).',
    epicId: 'epic-5',
    epicName: '5. Taxonomy & Moodle XML Transformer',
    status: 'done',
    assignee: 'Junior 3 (Harish)',
    assigneeRole: 'AI/ML Engineer',
    storyPoints: 3,
    priority: 'medium',
    architectureLayer: 'Layer 3: Staging & Delivery',
    acceptanceCriteria: [
      'Supports DSA, DBMS, OS, Computer Networks, and System Design tracks',
      'Auto-tags difficulty: Easy, Medium, Hard',
      'Outputs valid Moodle category path'
    ],
    createdAt: '2026-08-16'
  },
  {
    id: 'task-502',
    key: 'TAXONOMY-2',
    title: 'Moodle Quiz XML Generation Engine with CDATA Escaping',
    description: 'Build Moodle-compliant XML exporter generating <question type="category"> and <question type="essay"> with CDATA HTML formatting and rubrics.',
    epicId: 'epic-5',
    epicName: '5. Taxonomy & Moodle XML Transformer',
    status: 'done',
    assignee: 'Lead Dev (Bibin)',
    assigneeRole: 'Lead Architect',
    storyPoints: 5,
    priority: 'high',
    architectureLayer: 'Layer 3: Staging & Delivery',
    acceptanceCriteria: [
      'Generates valid XML validated against Moodle DTD/XSD',
      'Wraps all HTML descriptions in <![CDATA[...]]>',
      'Includes rubric scoring guidelines and sample solutions'
    ],
    createdAt: '2026-08-16'
  },

  // EPIC 6: STAGING & FACULTY REVIEW
  {
    id: 'task-601',
    key: 'STAGING-1',
    title: 'Isolated StagedQuestion Database Schema Migration',
    description: 'Create decoupled StagedQuestion table to ensure draft questions never pollute the live production table of 5,000+ placement students.',
    epicId: 'epic-6',
    epicName: '6. Staging & Faculty Review Queue',
    status: 'done',
    assignee: 'Lead Dev (Bibin)',
    assigneeRole: 'Lead Architect',
    storyPoints: 3,
    priority: 'high',
    architectureLayer: 'Layer 3: Staging & Delivery',
    acceptanceCriteria: [
      'Stores verified testcases (JSON), status, and proposed category',
      'Completely decoupled from live Question table',
      'Supports 1-click promotion to production'
    ],
    createdAt: '2026-08-16'
  },
  {
    id: 'task-602',
    key: 'STAGING-2',
    title: 'Faculty Curation UI with Bulk Checkboxes & Category Switcher',
    description: 'Build clean, high-speed curation table where mentors can select 10-50 questions at once, re-route to BFS/DFS/DP, and approve to live.',
    epicId: 'epic-6',
    epicName: '6. Staging & Faculty Review Queue',
    status: 'in_progress',
    assignee: 'Junior 5 (Sanjay)',
    assigneeRole: 'Frontend Developer',
    storyPoints: 5,
    priority: 'high',
    architectureLayer: 'Layer 3: Staging & Delivery',
    acceptanceCriteria: [
      'Supports select-all and individual checkbox toggles',
      'Dropdown category re-assignment with instant badge update',
      '1-Click "Approve & Promote to Production DB" button'
    ],
    createdAt: '2026-08-16'
  },

  // EPIC 7: CI/CD & AUTOMATION
  {
    id: 'task-701',
    key: 'CICD-1',
    title: 'GitHub Actions PR & Push Quality Gate (.github/workflows/ci.yml)',
    description: 'Configure automated CI pipeline running ESLint, TypeScript typecheck, production build verification, and Playwright E2E tests on every push/PR.',
    epicId: 'epic-7',
    epicName: '7. CI/CD & Automated Playwright Testing',
    status: 'done',
    assignee: 'Lead Dev (Bibin)',
    assigneeRole: 'Lead Architect',
    storyPoints: 5,
    priority: 'high',
    architectureLayer: 'Layer 4: CI/CD Quality Gates',
    acceptanceCriteria: [
      'Runs on ubuntu-latest with Node.js 20',
      'Executes npx tsc --noEmit and npm run build',
      'Blocks PR merge if any test or typecheck fails'
    ],
    createdAt: '2026-08-17'
  },
  {
    id: 'task-702',
    key: 'CICD-2',
    title: 'Automated Daily Build & Regression Check (.github/workflows/daily-build.yml)',
    description: 'Scheduled daily workflow running at 6:00 AM IST to verify full system compilation health and regression safety.',
    epicId: 'epic-7',
    epicName: '7. CI/CD & Automated Playwright Testing',
    status: 'done',
    assignee: 'Lead Dev (Bibin)',
    assigneeRole: 'Lead Architect',
    storyPoints: 3,
    priority: 'high',
    architectureLayer: 'Layer 4: CI/CD Quality Gates',
    acceptanceCriteria: [
      'Triggers automatically on cron: 30 0 * * *',
      'Supports manual workflow_dispatch execution',
      'Emits daily health report badge to Agile dashboard'
    ],
    createdAt: '2026-08-17'
  },
  {
    id: 'task-703',
    key: 'CICD-3',
    title: 'Microsoft Playwright Automated E2E Browser Test Suite',
    description: 'Write headless browser test specs covering faculty login, checkbox selection, category re-routing, and Moodle XML download validation.',
    epicId: 'epic-7',
    epicName: '7. CI/CD & Automated Playwright Testing',
    status: 'in_progress',
    assignee: 'Junior 5 (Sanjay)',
    assigneeRole: 'Frontend Developer',
    storyPoints: 5,
    priority: 'high',
    architectureLayer: 'Layer 4: CI/CD Quality Gates',
    acceptanceCriteria: [
      'Runs headless Chromium test in < 15 seconds',
      'Validates XML download contents and category paths',
      'Generates HTML trace reports on failure'
    ],
    createdAt: '2026-08-17'
  },

  // EPIC 8: PRODUCTION & LMS
  {
    id: 'task-801',
    key: 'PROD-1',
    title: 'Dedicated Local College Server Sync & Zero-Downtime Migration',
    description: 'Connect staging promotion webhook to sync approved questions to the dedicated local college server PostgreSQL database.',
    epicId: 'epic-8',
    epicName: '8. Live Production Server & LMS Practice',
    status: 'in_progress',
    assignee: 'Lead Dev (Bibin)',
    assigneeRole: 'Lead Architect',
    storyPoints: 5,
    priority: 'high',
    architectureLayer: 'Layer 5: Production & LMS',
    acceptanceCriteria: [
      'Syncs approved questions with zero downtime for live students',
      'Preserves existing student submission histories and contest ratings',
      'Emits success telemetry to Agile Dashboard'
    ],
    createdAt: '2026-08-17'
  },
  {
    id: 'task-802',
    key: 'PROD-2',
    title: 'Tuesday Kovion Showcase Live Demo Readiness & Dry Run',
    description: 'Perform end-to-end dry run demonstrating rough prompt intake -> AI curation -> sandbox 10/10 check -> checkbox curation -> Moodle XML export -> CI/CD green badge.',
    epicId: 'epic-8',
    epicName: '8. Live Production Server & LMS Practice',
    status: 'backlog',
    assignee: 'All Team Leads',
    assigneeRole: 'Core Team',
    storyPoints: 8,
    priority: 'high',
    architectureLayer: 'Layer 5: Production & LMS',
    acceptanceCriteria: [
      'Complete end-to-end demonstration in under 4 minutes',
      'Live green CI/CD build badge visible on dashboard',
      'Moodle XML import verified in test course instance'
    ],
    createdAt: '2026-08-17'
  }
];
