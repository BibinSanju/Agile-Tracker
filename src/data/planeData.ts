export type IssueState = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export interface PlaneMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarText: string;
  avatarColor: string;
  assignedTrack: string;
  createdAt: string;
}

export interface PlaneModule {
  id: string;
  name: string;
  layer: string;
  description: string;
  leadId?: string;
  createdAt: string;
}

export interface PlaneCycle {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
  createdAt: string;
}

export interface PlaneIssue {
  id: string;
  sequenceId: number;
  key: string; // e.g. "PRTL-1"
  title: string;
  description: string;
  state: IssueState;
  priority: IssuePriority;
  moduleId: string;
  cycleId: string;
  assigneeId: string;
  storyPoints: number;
  acceptanceCriteria: { id: string; text: string; completed: boolean }[];
  technicalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// 8 Architecture Modules from approved map
export const DEFAULT_MODULES: PlaneModule[] = [
  { id: 'mod-1', name: '1. Ingestion & Raw Input Layer', layer: 'Layer 1: Ingestion', description: 'Student prompt normalization, Whisper audio transcript ingestion, and LeetCode/CSES scrapers', createdAt: '2026-08-16' },
  { id: 'mod-2', name: '2. RTX 5070 Curation & Deduplication', layer: 'Layer 2: AI & Compilation', description: 'all-MiniLM 384-d semantic embeddings and 0.85 cosine similarity deduplication vs 5,000 DB', createdAt: '2026-08-16' },
  { id: 'mod-3', name: '3. Solution & 10 I/O Testcase Synthesizer', layer: 'Layer 2: AI & Compilation', description: 'Multi-language optimal solutions (Python/C++/Java) and 10 standard I/O testcases (sample, edge, stress)', createdAt: '2026-08-16' },
  { id: 'mod-4', name: '4. Docker Isolated Execution Sandbox', layer: 'Layer 2: AI & Compilation', description: 'Containerized runner with 128MB RAM limit, 2.0s execution timeout, and 10/10 testcase pass check', createdAt: '2026-08-16' },
  { id: 'mod-5', name: '5. Taxonomy & Moodle XML Transformer', layer: 'Layer 3: Staging & Delivery', description: 'Hierarchical category tree ($course$/top/DSA/Graphs/BFS) and CDATA XML generation', createdAt: '2026-08-16' },
  { id: 'mod-6', name: '6. Staging Queue & Faculty Review UI', layer: 'Layer 3: Staging & Delivery', description: 'Decoupled StagedQuestion DB table and bulk checkbox curation interface', createdAt: '2026-08-16' },
  { id: 'mod-7', name: '7. GitHub Actions CI/CD & Playwright', layer: 'Layer 4: CI/CD Quality Gate', description: 'ci.yml, daily-build.yml, scheduled-scraper.yml, and automated browser testing', createdAt: '2026-08-16' },
  { id: 'mod-8', name: '8. Live Production LMS & Local Server', layer: 'Layer 5: Production & LMS', description: 'Dedicated local college server PostgreSQL sync for 5,000 placement students', createdAt: '2026-08-16' }
];

// Initial Cycle targeting Kovion Tuesday Showcase
export const DEFAULT_CYCLES: PlaneCycle[] = [
  {
    id: 'cycle-1',
    name: 'Cycle 1: Kovion Showcase Sprint',
    description: 'Sprint deliverable targeting Tuesday company showcase: Ingestion, Docker Sandbox, Curation UI, and CI/CD Quality Gate.',
    startDate: '2026-08-14',
    endDate: '2026-08-19',
    status: 'active',
    createdAt: '2026-08-14'
  }
];

// All 20 Architecture Tasks initialized to TODO with 0% DONE so the team can use the dashboard
export const SEED_ARCHITECTURE_ISSUES: PlaneIssue[] = [
  {
    id: 'iss-01',
    sequenceId: 1,
    key: 'PRTL-1',
    title: 'Student Unstructured Interview Prompt Normalization Parser',
    description: 'Build prompt intake cleaner that handles voice transcript text, standardizes LaTeX math notations, and extracts problem constraints from rough student inputs.',
    state: 'todo',
    priority: 'high',
    moduleId: 'mod-1',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 3,
    acceptanceCriteria: [
      { id: 'c1', text: 'Normalizes voice note transcripts into Title, Statement, and Constraints', completed: false },
      { id: 'c2', text: 'Strips informal conversational text and validates variable boundaries', completed: false }
    ],
    technicalNotes: 'Integrated with Groq Llama-3.3 prompt formalizer template.',
    createdAt: '2026-08-16',
    updatedAt: '2026-08-16'
  },
  {
    id: 'iss-02',
    sequenceId: 2,
    key: 'PRTL-2',
    title: 'LeetCode GraphQL Problem Set Scraper Adapter',
    description: 'Implement GraphQL API client to fetch problem statements, testcase hints, difficulty rankings, and tags into raw ingestion schema.',
    state: 'todo',
    priority: 'high',
    moduleId: 'mod-1',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 5,
    acceptanceCriteria: [
      { id: 'c1', text: 'Queries questionTitle, questionContent, and topicTags', completed: false },
      { id: 'c2', text: 'Transforms HTML into clean markdown with zero script injections', completed: false }
    ],
    createdAt: '2026-08-16',
    updatedAt: '2026-08-16'
  },
  {
    id: 'iss-03',
    sequenceId: 3,
    key: 'PRTL-3',
    title: 'Codeforces & CSES Archive Question Ingestion Module',
    description: 'Build scraper adapters to extract standard competitive programming problems from CSES archive and Codeforces problemset API.',
    state: 'todo',
    priority: 'medium',
    moduleId: 'mod-1',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 5,
    acceptanceCriteria: [
      { id: 'c1', text: 'Extracts standard stdin/stdout format requirements per problem', completed: false },
      { id: 'c2', text: 'Maps timeLimit (e.g. 1.0s) and memoryLimit (e.g. 256MB)', completed: false }
    ],
    createdAt: '2026-08-16',
    updatedAt: '2026-08-16'
  },
  {
    id: 'iss-04',
    sequenceId: 4,
    key: 'PRTL-4',
    title: 'RTX 5070 Local 384-d Semantic Vector Embedding Generator',
    description: 'Configure all-MiniLM-L6-v2 embedding model on the local RTX 5070 GPU workstation to convert problem statements into 384-dimensional dense vectors.',
    state: 'todo',
    priority: 'urgent',
    moduleId: 'mod-2',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 5,
    acceptanceCriteria: [
      { id: 'c1', text: 'Inference time < 45ms per question on RTX 5070', completed: false },
      { id: 'c2', text: 'Generates normalized 384-float vectors for cosine similarity calculation', completed: false }
    ],
    technicalNotes: 'Running locally via HuggingFace sentence-transformers.',
    createdAt: '2026-08-16',
    updatedAt: '2026-08-17'
  },
  {
    id: 'iss-05',
    sequenceId: 5,
    key: 'PRTL-5',
    title: 'Cosine Similarity Deduplication Engine vs 5,000 DB Questions',
    description: 'Calculate cosine similarity of incoming vectors against the existing 5,000 question bank. Enforce strict 0.85 threshold to reject duplicates.',
    state: 'todo',
    priority: 'urgent',
    moduleId: 'mod-2',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 5,
    acceptanceCriteria: [
      { id: 'c1', text: 'Calculates cosine similarity dot product in under 100ms', completed: false },
      { id: 'c2', text: 'Flags similarity >= 0.85 as duplicate and discards', completed: false },
      { id: 'c3', text: 'Promotes similarity < 0.85 to testcase synthesizer with new UUID', completed: false }
    ],
    createdAt: '2026-08-16',
    updatedAt: '2026-08-17'
  },
  {
    id: 'iss-06',
    sequenceId: 6,
    key: 'PRTL-6',
    title: 'Multi-Language Reference Code Generator (C++20, Java 17, Python 3)',
    description: 'Synthesize verified optimal solutions across C++, Java, and Python with complete time and space complexity explanations.',
    state: 'todo',
    priority: 'high',
    moduleId: 'mod-3',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 5,
    acceptanceCriteria: [
      { id: 'c1', text: 'Outputs compilable standard stream I/O code for all 3 languages', completed: false },
      { id: 'c2', text: 'Derives explicit Big-O Time & Space complexity', completed: false }
    ],
    createdAt: '2026-08-16',
    updatedAt: '2026-08-17'
  },
  {
    id: 'iss-07',
    sequenceId: 7,
    key: 'PRTL-7',
    title: '10 Standard I/O Testcase Synthesizer (3 Sample, 4 Edge, 3 Stress)',
    description: 'Generate exactly 10 rigorous test cases per problem formatted as raw strings with newline-separated stdin and stdout.',
    state: 'todo',
    priority: 'urgent',
    moduleId: 'mod-3',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 5,
    acceptanceCriteria: [
      { id: 'c1', text: '3 Sample cases matching problem description examples', completed: false },
      { id: 'c2', text: '4 Edge cases testing boundary limits (N=1, negatives, zero values)', completed: false },
      { id: 'c3', text: '3 Stress cases testing upper scale limits (N=10^5)', completed: false }
    ],
    createdAt: '2026-08-16',
    updatedAt: '2026-08-16'
  },
  {
    id: 'iss-08',
    sequenceId: 8,
    key: 'PRTL-8',
    title: 'Ephemeral Docker Execution Sandbox with 128MB & 2.0s Ceiling',
    description: 'Containerized executor worker with strict resource isolation: 128MB memory ceiling, 2.0s execution timeout, and disabled network access.',
    state: 'todo',
    priority: 'urgent',
    moduleId: 'mod-4',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 5,
    acceptanceCriteria: [
      { id: 'c1', text: 'Executes C++, Java, and Python code against stdin', completed: false },
      { id: 'c2', text: 'Enforces strict 2.0-second SIGKILL timeout handler', completed: false },
      { id: 'c3', text: 'Enforces 128MB memory ceiling', completed: false }
    ],
    createdAt: '2026-08-16',
    updatedAt: '2026-08-17'
  },
  {
    id: 'iss-09',
    sequenceId: 9,
    key: 'PRTL-9',
    title: '10/10 Testcase Verification Runner & Compiler Stderr Logger',
    description: 'Feed all 10 testcase files into the sandbox and verify 100% output equality. Flag flaky questions if any testcase fails or times out.',
    state: 'todo',
    priority: 'high',
    moduleId: 'mod-4',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 3,
    acceptanceCriteria: [
      { id: 'c1', text: 'Compares stdout vs expectedOutput character-by-character', completed: false },
      { id: 'c2', text: 'Promotes to Staging only if 10/10 testcases pass', completed: false }
    ],
    createdAt: '2026-08-16',
    updatedAt: '2026-08-17'
  },
  {
    id: 'iss-10',
    sequenceId: 10,
    key: 'PRTL-10',
    title: 'Algorithmic Taxonomy Classifier ($course$/top/... Category Tree)',
    description: 'Classify problems into hierarchical college placement categories (e.g. $course$/top/DSA/Graphs/Breadth First Search).',
    state: 'todo',
    priority: 'medium',
    moduleId: 'mod-5',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 3,
    acceptanceCriteria: [
      { id: 'c1', text: 'Classifies into DSA, DBMS, OS, and CN domains', completed: false },
      { id: 'c2', text: 'Auto-tags difficulty: Easy, Medium, Hard', completed: false }
    ],
    createdAt: '2026-08-16',
    updatedAt: '2026-08-16'
  },
  {
    id: 'iss-11',
    sequenceId: 11,
    key: 'PRTL-11',
    title: 'Moodle Quiz XML Engine with CDATA Escaping and Scoring Rubric',
    description: 'Build XML generation engine outputting valid Moodle Quiz XML with category containers, CDATA wrapped HTML, and essay code rubrics.',
    state: 'todo',
    priority: 'urgent',
    moduleId: 'mod-5',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 5,
    acceptanceCriteria: [
      { id: 'c1', text: 'Generates <question type="category"> and <question type="essay">', completed: false },
      { id: 'c2', text: 'Wraps all HTML descriptions in <![CDATA[...]]>', completed: false },
      { id: 'c3', text: 'Includes defaultgrade 10.0 and sample solutions', completed: false }
    ],
    createdAt: '2026-08-16',
    updatedAt: '2026-08-16'
  },
  {
    id: 'iss-12',
    sequenceId: 12,
    key: 'PRTL-12',
    title: 'Isolated StagedQuestion Database Schema Migration',
    description: 'Create isolated StagedQuestion table in PostgreSQL so draft questions never interfere with live student contest tables.',
    state: 'todo',
    priority: 'high',
    moduleId: 'mod-6',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 3,
    acceptanceCriteria: [
      { id: 'c1', text: 'Stores verified testcases JSON, suggested category, and sandbox verdict', completed: false },
      { id: 'c2', text: 'Decoupled from production Question and Submission tables', completed: false }
    ],
    createdAt: '2026-08-16',
    updatedAt: '2026-08-16'
  },
  {
    id: 'iss-13',
    sequenceId: 13,
    key: 'PRTL-13',
    title: 'Faculty Curation UI with Bulk Checkbox Selection & Category Re-routing',
    description: 'Build high-speed curation table where mentors can select multiple questions, verify testcases side-by-side, and approve to live DB.',
    state: 'todo',
    priority: 'high',
    moduleId: 'mod-6',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 5,
    acceptanceCriteria: [
      { id: 'c1', text: 'Select-all and individual checkbox toggles', completed: false },
      { id: 'c2', text: 'Batch category reassignment to BFS, DFS, DP', completed: false },
      { id: 'c3', text: '1-Click "Approve & Promote" button', completed: false }
    ],
    createdAt: '2026-08-16',
    updatedAt: '2026-08-17'
  },
  {
    id: 'iss-14',
    sequenceId: 14,
    key: 'PRTL-14',
    title: 'GitHub Actions PR & Push Quality Gate Workflow (.github/workflows/ci.yml)',
    description: 'Configure automated CI workflow running TypeScript strict typecheck (tsc), production build verification, and Playwright E2E browser tests on every push/PR.',
    state: 'todo',
    priority: 'urgent',
    moduleId: 'mod-7',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 5,
    acceptanceCriteria: [
      { id: 'c1', text: 'Runs on ubuntu-latest with Node.js 20', completed: false },
      { id: 'c2', text: 'Executes npx tsc --noEmit and npm run build', completed: false },
      { id: 'c3', text: 'Blocks merge if any test fails', completed: false }
    ],
    createdAt: '2026-08-17',
    updatedAt: '2026-08-17'
  },
  {
    id: 'iss-15',
    sequenceId: 15,
    key: 'PRTL-15',
    title: 'Automated Daily Build & Regression Check (.github/workflows/daily-build.yml)',
    description: 'Scheduled daily workflow running at 6:00 AM IST (00:30 UTC) to verify full system compilation health and regression safety.',
    state: 'todo',
    priority: 'high',
    moduleId: 'mod-7',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 3,
    acceptanceCriteria: [
      { id: 'c1', text: 'Triggers on cron: 30 0 * * * and workflow_dispatch', completed: false },
      { id: 'c2', text: 'Emits daily build health telemetry to dashboard', completed: false }
    ],
    createdAt: '2026-08-17',
    updatedAt: '2026-08-17'
  },
  {
    id: 'iss-16',
    sequenceId: 16,
    key: 'PRTL-16',
    title: 'Timed Nightly Scraper & Ingestion Cron (.github/workflows/scheduled-scraper.yml)',
    description: 'Scheduled workflow running at 2:00 AM IST (20:30 UTC) to scrape new problems and ingest them into the staging queue for review.',
    state: 'todo',
    priority: 'medium',
    moduleId: 'mod-7',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 3,
    acceptanceCriteria: [
      { id: 'c1', text: 'Triggers nightly at 2:00 AM IST', completed: false },
      { id: 'c2', text: 'Stages newly scraped problems into StagedQuestion table', completed: false }
    ],
    createdAt: '2026-08-17',
    updatedAt: '2026-08-17'
  },
  {
    id: 'iss-17',
    sequenceId: 17,
    key: 'PRTL-17',
    title: 'Microsoft Playwright Automated E2E Browser Test Suite',
    description: 'Write headless browser test specs covering faculty login, checkbox selection, category re-routing, and Moodle XML download validation.',
    state: 'todo',
    priority: 'high',
    moduleId: 'mod-7',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 5,
    acceptanceCriteria: [
      { id: 'c1', text: 'Automated Playwright tests in e2e/ directory', completed: false },
      { id: 'c2', text: 'Verifies checkbox curation and Moodle XML generation', completed: false }
    ],
    createdAt: '2026-08-17',
    updatedAt: '2026-08-17'
  },
  {
    id: 'iss-18',
    sequenceId: 18,
    key: 'PRTL-18',
    title: 'Dedicated Local College Server PostgreSQL Sync & Zero-Downtime Migration',
    description: 'Connect staging promotion webhook to sync approved questions to the dedicated local college server PostgreSQL database for 5,000+ students.',
    state: 'todo',
    priority: 'urgent',
    moduleId: 'mod-8',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 5,
    acceptanceCriteria: [
      { id: 'c1', text: 'Syncs approved questions with zero downtime for live students', completed: false },
      { id: 'c2', text: 'Preserves existing student submission histories and contest ratings', completed: false }
    ],
    createdAt: '2026-08-17',
    updatedAt: '2026-08-17'
  },
  {
    id: 'iss-19',
    sequenceId: 19,
    key: 'PRTL-19',
    title: 'Moodle LMS Course Category Direct XML Import Verification',
    description: 'Verify exported Moodle XML directly in the college Moodle instance under $course$/top/DSA/Graphs/BFS.',
    state: 'todo',
    priority: 'high',
    moduleId: 'mod-8',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 3,
    acceptanceCriteria: [
      { id: 'c1', text: 'Successfully imports into Moodle Course Quiz Bank', completed: false },
      { id: 'c2', text: 'Validates question titles, descriptions, and essay code boxes', completed: false }
    ],
    createdAt: '2026-08-17',
    updatedAt: '2026-08-17'
  },
  {
    id: 'iss-20',
    sequenceId: 20,
    key: 'PRTL-20',
    title: 'Tuesday Kovion Showcase Live Demonstration Dry Run',
    description: 'Execute end-to-end rehearsal demonstrating raw prompt intake -> RTX 5070 AI deduplication -> Docker 10/10 check -> checkbox curation -> Moodle XML export -> CI/CD green badge.',
    state: 'todo',
    priority: 'urgent',
    moduleId: 'mod-8',
    cycleId: 'cycle-1',
    assigneeId: '',
    storyPoints: 8,
    acceptanceCriteria: [
      { id: 'c1', text: 'Demonstration completes in < 4 minutes', completed: false },
      { id: 'c2', text: 'Green CI/CD status badge verified', completed: false },
      { id: 'c3', text: 'Staging to live promotion demonstrated cleanly', completed: false }
    ],
    createdAt: '2026-08-17',
    updatedAt: '2026-08-17'
  }
];
