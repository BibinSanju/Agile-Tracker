import { prisma } from './db.js';

async function seed() {
  console.log('🌱 Seeding fresh architecture plan into backend database...');

  // 1. Modules
  await prisma.module.deleteMany();
  const defaultModules = [
    { id: 'mod-1', name: '1. Ingestion & Raw Input Layer', layer: 'Layer 1: Ingestion', description: 'Student prompt normalization, Whisper audio transcript ingestion, and LeetCode/CSES scrapers' },
    { id: 'mod-2', name: '2. RTX 5070 Curation & Deduplication', layer: 'Layer 2: AI & Compilation', description: 'all-MiniLM 384-d semantic embeddings and 0.85 cosine similarity deduplication vs 5,000 DB' },
    { id: 'mod-3', name: '3. Solution & 10 I/O Testcase Synthesizer', layer: 'Layer 2: AI & Compilation', description: 'Multi-language optimal solutions (Python/C++/Java) and 10 standard I/O testcases (sample, edge, stress)' },
    { id: 'mod-4', name: '4. Docker Isolated Execution Sandbox', layer: 'Layer 2: AI & Compilation', description: 'Containerized runner with 128MB RAM limit, 2.0s execution timeout, and 10/10 testcase pass check' },
    { id: 'mod-5', name: '5. Taxonomy & Moodle XML Transformer', layer: 'Layer 3: Staging & Delivery', description: 'Hierarchical category tree ($course$/top/DSA/Graphs/BFS) and CDATA XML generation' },
    { id: 'mod-6', name: '6. Staging Queue & Faculty Review UI', layer: 'Layer 3: Staging & Delivery', description: 'Decoupled StagedQuestion DB table and bulk checkbox curation interface' },
    { id: 'mod-7', name: '7. GitHub Actions CI/CD & Playwright', layer: 'Layer 4: CI/CD Quality Gate', description: 'ci.yml, daily-build.yml, scheduled-scraper.yml, and automated browser testing' },
    { id: 'mod-8', name: '8. Live Production LMS & Local Server', layer: 'Layer 5: Production & LMS', description: 'Dedicated local college server PostgreSQL sync for 5,000 placement students' }
  ];

  for (const m of defaultModules) {
    await prisma.module.create({ data: m });
  }

  // 2. Cycles
  await prisma.cycle.deleteMany();
  await prisma.cycle.create({
    data: {
      id: 'cycle-1',
      name: 'Cycle 1: Executive Showcase Sprint',
      description: 'Sprint deliverable targeting Tuesday company showcase: Ingestion, Docker Sandbox, Curation UI, and CI/CD Quality Gate.',
      startDate: '2026-08-14',
      endDate: '2026-08-19',
      status: 'active'
    }
  });

  // 3. 20 Architecture Plan Issues (All in TODO state with 0% marked as done)
  await prisma.issue.deleteMany();
  const initialIssues = [
    { sequenceId: 1, key: 'PRTL-1', title: 'Student Unstructured Interview Prompt Normalization Parser', description: 'Build prompt intake cleaner that handles voice transcript text, standardizes LaTeX math notations, and extracts problem constraints from rough student inputs.', state: 'todo', priority: 'high', moduleId: 'mod-1', cycleId: 'cycle-1', storyPoints: 3, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Normalizes voice note transcripts into Title, Statement, and Constraints', completed: false }, { id: 'c2', text: 'Strips informal conversational text and validates variable boundaries', completed: false }]) },
    { sequenceId: 2, key: 'PRTL-2', title: 'LeetCode GraphQL Problem Set Scraper Adapter', description: 'Implement GraphQL API client to fetch problem statements, testcase hints, difficulty rankings, and tags into raw ingestion schema.', state: 'todo', priority: 'high', moduleId: 'mod-1', cycleId: 'cycle-1', storyPoints: 5, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Queries questionTitle, questionContent, and topicTags', completed: false }, { id: 'c2', text: 'Transforms HTML into clean markdown with zero script injections', completed: false }]) },
    { sequenceId: 3, key: 'PRTL-3', title: 'Codeforces & CSES Archive Question Ingestion Module', description: 'Build scraper adapters to extract standard competitive programming problems from CSES archive and Codeforces problemset API.', state: 'todo', priority: 'medium', moduleId: 'mod-1', cycleId: 'cycle-1', storyPoints: 5, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Extracts standard stdin/stdout format requirements per problem', completed: false }, { id: 'c2', text: 'Maps timeLimit (e.g. 1.0s) and memoryLimit (e.g. 256MB)', completed: false }]) },
    { sequenceId: 4, key: 'PRTL-4', title: 'RTX 5070 Local 384-d Semantic Vector Embedding Generator', description: 'Configure all-MiniLM-L6-v2 embedding model on the local RTX 5070 GPU workstation to convert problem statements into 384-dimensional dense vectors.', state: 'todo', priority: 'urgent', moduleId: 'mod-2', cycleId: 'cycle-1', storyPoints: 5, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Inference time < 45ms per question on RTX 5070', completed: false }, { id: 'c2', text: 'Generates normalized 384-float vectors for cosine similarity calculation', completed: false }]) },
    { sequenceId: 5, key: 'PRTL-5', title: 'Cosine Similarity Deduplication Engine vs 5,000 DB Questions', description: 'Calculate cosine similarity of incoming vectors against the existing 5,000 question bank. Enforce strict 0.85 threshold to reject duplicates.', state: 'todo', priority: 'urgent', moduleId: 'mod-2', cycleId: 'cycle-1', storyPoints: 5, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Calculates cosine similarity dot product in under 100ms', completed: false }, { id: 'c2', text: 'Flags similarity >= 0.85 as duplicate and discards', completed: false }, { id: 'c3', text: 'Promotes similarity < 0.85 to testcase synthesizer with new UUID', completed: false }]) },
    { sequenceId: 6, key: 'PRTL-6', title: 'Multi-Language Reference Code Generator (C++20, Java 17, Python 3)', description: 'Synthesize verified optimal solutions across C++, Java, and Python with complete time and space complexity explanations.', state: 'todo', priority: 'high', moduleId: 'mod-3', cycleId: 'cycle-1', storyPoints: 5, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Outputs compilable standard stream I/O code for all 3 languages', completed: false }, { id: 'c2', text: 'Derives explicit Big-O Time & Space complexity', completed: false }]) },
    { sequenceId: 7, key: 'PRTL-7', title: '10 Standard I/O Testcase Synthesizer (3 Sample, 4 Edge, 3 Stress)', description: 'Generate exactly 10 rigorous test cases per problem formatted as raw strings with newline-separated stdin and stdout.', state: 'todo', priority: 'urgent', moduleId: 'mod-3', cycleId: 'cycle-1', storyPoints: 5, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: '3 Sample cases matching problem description examples', completed: false }, { id: 'c2', text: '4 Edge cases testing boundary limits (N=1, negatives, zero values)', completed: false }, { id: 'c3', text: '3 Stress cases testing upper scale limits (N=10^5)', completed: false }]) },
    { sequenceId: 8, key: 'PRTL-8', title: 'Ephemeral Docker Execution Sandbox with 128MB & 2.0s Ceiling', description: 'Containerized executor worker with strict resource isolation: 128MB memory ceiling, 2.0s execution timeout, and disabled network access.', state: 'todo', priority: 'urgent', moduleId: 'mod-4', cycleId: 'cycle-1', storyPoints: 5, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Executes C++, Java, and Python code against stdin', completed: false }, { id: 'c2', text: 'Enforces strict 2.0-second SIGKILL timeout handler', completed: false }, { id: 'c3', text: 'Enforces 128MB memory ceiling', completed: false }]) },
    { sequenceId: 9, key: 'PRTL-9', title: '10/10 Testcase Verification Runner & Compiler Stderr Logger', description: 'Feed all 10 testcase files into the sandbox and verify 100% output equality. Flag flaky questions if any testcase fails or times out.', state: 'todo', priority: 'high', moduleId: 'mod-4', cycleId: 'cycle-1', storyPoints: 3, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Compares stdout vs expectedOutput character-by-character', completed: false }, { id: 'c2', text: 'Promotes to Staging only if 10/10 testcases pass', completed: false }]) },
    { sequenceId: 10, key: 'PRTL-10', title: 'Algorithmic Taxonomy Classifier ($course$/top/... Category Tree)', description: 'Classify problems into hierarchical college placement categories (e.g. $course$/top/DSA/Graphs/Breadth First Search).', state: 'todo', priority: 'medium', moduleId: 'mod-5', cycleId: 'cycle-1', storyPoints: 3, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Classifies into DSA, DBMS, OS, and CN domains', completed: false }, { id: 'c2', text: 'Auto-tags difficulty: Easy, Medium, Hard', completed: false }]) },
    { sequenceId: 11, key: 'PRTL-11', title: 'Moodle Quiz XML Engine with CDATA Escaping and Scoring Rubric', description: 'Build XML generation engine outputting valid Moodle Quiz XML with category containers, CDATA wrapped HTML, and essay code rubrics.', state: 'todo', priority: 'urgent', moduleId: 'mod-5', cycleId: 'cycle-1', storyPoints: 5, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Generates <question type="category"> and <question type="essay">', completed: false }, { id: 'c2', text: 'Wraps all HTML descriptions in <![CDATA[...]]>', completed: false }, { id: 'c3', text: 'Includes defaultgrade 10.0 and sample solutions', completed: false }]) },
    { sequenceId: 12, key: 'PRTL-12', title: 'Isolated StagedQuestion Database Schema Migration', description: 'Create isolated StagedQuestion table in PostgreSQL so draft questions never interfere with live student contest tables.', state: 'todo', priority: 'high', moduleId: 'mod-6', cycleId: 'cycle-1', storyPoints: 3, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Stores verified testcases JSON, suggested category, and sandbox verdict', completed: false }, { id: 'c2', text: 'Decoupled from production Question and Submission tables', completed: false }]) },
    { sequenceId: 13, key: 'PRTL-13', title: 'Faculty Curation UI with Bulk Checkbox Selection & Category Re-routing', description: 'Build high-speed curation table where mentors can select multiple questions, verify testcases side-by-side, and approve to live DB.', state: 'todo', priority: 'high', moduleId: 'mod-6', cycleId: 'cycle-1', storyPoints: 5, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Select-all and individual checkbox toggles', completed: false }, { id: 'c2', text: 'Batch category reassignment to BFS, DFS, DP', completed: false }, { id: 'c3', text: '1-Click "Approve & Promote" button', completed: false }]) },
    { sequenceId: 14, key: 'PRTL-14', title: 'GitHub Actions PR & Push Quality Gate Workflow (.github/workflows/ci.yml)', description: 'Configure automated CI workflow running TypeScript strict typecheck (tsc), production build verification, and Playwright E2E browser tests on every push/PR.', state: 'todo', priority: 'urgent', moduleId: 'mod-7', cycleId: 'cycle-1', storyPoints: 5, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Runs on ubuntu-latest with Node.js 20', completed: false }, { id: 'c2', text: 'Executes npx tsc --noEmit and npm run build', completed: false }, { id: 'c3', text: 'Blocks merge if any test fails', completed: false }]) },
    { sequenceId: 15, key: 'PRTL-15', title: 'Automated Daily Build & Regression Check (.github/workflows/daily-build.yml)', description: 'Scheduled daily workflow running at 6:00 AM IST (00:30 UTC) to verify full system compilation health and regression safety.', state: 'todo', priority: 'high', moduleId: 'mod-7', cycleId: 'cycle-1', storyPoints: 3, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Triggers on cron: 30 0 * * * and workflow_dispatch', completed: false }, { id: 'c2', text: 'Emits daily build health telemetry to dashboard', completed: false }]) },
    { sequenceId: 16, key: 'PRTL-16', title: 'Timed Nightly Scraper & Ingestion Cron (.github/workflows/scheduled-scraper.yml)', description: 'Scheduled workflow running at 2:00 AM IST (20:30 UTC) to scrape new problems and ingest them into the staging queue for review.', state: 'todo', priority: 'medium', moduleId: 'mod-7', cycleId: 'cycle-1', storyPoints: 3, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Triggers nightly at 2:00 AM IST', completed: false }, { id: 'c2', text: 'Stages newly scraped problems into StagedQuestion table', completed: false }]) },
    { sequenceId: 17, key: 'PRTL-17', title: 'Microsoft Playwright Automated E2E Browser Test Suite', description: 'Write headless browser test specs covering faculty login, checkbox selection, category re-routing, and Moodle XML download validation.', state: 'todo', priority: 'high', moduleId: 'mod-7', cycleId: 'cycle-1', storyPoints: 5, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Automated Playwright tests in e2e/ directory', completed: false }, { id: 'c2', text: 'Verifies checkbox curation and Moodle XML generation', completed: false }]) },
    { sequenceId: 18, key: 'PRTL-18', title: 'Dedicated Local College Server PostgreSQL Sync & Zero-Downtime Migration', description: 'Connect staging promotion webhook to sync approved questions to the dedicated local college server PostgreSQL database for 5,000+ students.', state: 'todo', priority: 'urgent', moduleId: 'mod-8', cycleId: 'cycle-1', storyPoints: 5, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Syncs approved questions with zero downtime for live students', completed: false }, { id: 'c2', text: 'Preserves existing student submission histories and contest ratings', completed: false }]) },
    { sequenceId: 19, key: 'PRTL-19', title: 'Moodle LMS Course Category Direct XML Import Verification', description: 'Verify exported Moodle XML directly in the college Moodle instance under $course$/top/DSA/Graphs/BFS.', state: 'todo', priority: 'high', moduleId: 'mod-8', cycleId: 'cycle-1', storyPoints: 3, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Successfully imports into Moodle Course Quiz Bank', completed: false }, { id: 'c2', text: 'Validates question titles, descriptions, and essay code boxes', completed: false }]) },
    { sequenceId: 20, key: 'PRTL-20', title: 'Tuesday Executive Showcase Live Demonstration Dry Run', description: 'Execute end-to-end rehearsal demonstrating raw prompt intake -> RTX 5070 AI deduplication -> Docker 10/10 check -> checkbox curation -> Moodle XML export -> CI/CD green badge.', state: 'todo', priority: 'urgent', moduleId: 'mod-8', cycleId: 'cycle-1', storyPoints: 8, acceptanceCriteria: JSON.stringify([{ id: 'c1', text: 'Demonstration completes in < 4 minutes', completed: false }, { id: 'c2', text: 'Green CI/CD status badge verified', completed: false }, { id: 'c3', text: 'Staging to live promotion demonstrated cleanly', completed: false }]) }
  ];

  for (const issue of initialIssues) {
    await prisma.issue.create({ data: issue });
  }

  console.log(`✅ Database seeded with ${initialIssues.length} active TODO engineering tasks!`);
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
