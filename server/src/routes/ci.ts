import { Router, Request, Response } from 'express';

/**
 * GET /api/ci/status
 *
 * Server-side proxy for the GitHub Actions run status shown in the tracker
 * (sidebar badge + CI/CD panel). The browser can call api.github.com directly,
 * but the unauthenticated limit is 60 req/h *per IP*, which a shared campus
 * network exhausts in minutes. This route
 *   - authenticates with GITHUB_TOKEN when present (5,000 req/h), and
 *   - caches the result for CACHE_TTL_MS so many clients cost one upstream call.
 * The response shape mirrors what the frontend derives from the raw API so
 * the hook can use either source interchangeably.
 */
export const ciRouter = Router();

const REPO = process.env.GITHUB_REPO || 'BibinSanju/Agile-Tracker';
const CACHE_TTL_MS = 60 * 1000;

const WORKFLOWS: Array<{ file: string; perPage: number }> = [
  { file: 'ci.yml', perPage: 30 },
  { file: 'daily-build.yml', perPage: 1 },
  { file: 'scheduled-scraper.yml', perPage: 1 },
];

interface RunDTO {
  id: number;
  runNumber: number;
  name: string;
  path: string;
  headBranch: string;
  headSha: string;
  event: string;
  status: string;
  conclusion: string | null;
  htmlUrl: string;
  updatedAt: string;
}

interface Snapshot { runs: RunDTO[]; mainSha: string | null }

let cache: { at: number; snap: Snapshot } | null = null;
let inflight: Promise<Snapshot> | null = null;

function mapRun(r: any): RunDTO {
  return {
    id: r.id,
    runNumber: r.run_number,
    name: r.name,
    path: r.path,
    headBranch: r.head_branch,
    headSha: r.head_sha,
    event: r.event,
    status: r.status,
    conclusion: r.conclusion,
    htmlUrl: r.html_url,
    updatedAt: r.updated_at,
  };
}

async function fetchSnapshot(): Promise<Snapshot> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.snap;
  if (inflight) return inflight;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'intelx-agile-tracker',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  inflight = (async () => {
    const lists = await Promise.all(
      WORKFLOWS.map(async ({ file, perPage }) => {
        const url = `https://api.github.com/repos/${REPO}/actions/workflows/${file}/runs?per_page=${perPage}`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`GitHub API ${res.status} for ${file}`);
        const json: any = await res.json();
        return ((json.workflow_runs ?? []) as any[]).map(mapRun);
      })
    );
    const runs = lists
      .flat()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Promoted commits are tested on `staging`, and the bot's push to `main`
    // does not trigger a new run, so "is main green?" must be answered by
    // matching main's SHA against the run that tested it - not by branch.
    let mainSha: string | null = null;
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/branches/main`, { headers });
      if (res.ok) mainSha = ((await res.json()) as any).commit?.sha ?? null;
    } catch {
      /* non-fatal */
    }

    const snap: Snapshot = { runs, mainSha };
    cache = { at: Date.now(), snap };
    return snap;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

ciRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const snap = await fetchSnapshot();
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json({ success: true, data: { repo: REPO, fetchedAt: new Date(cache?.at ?? Date.now()).toISOString(), ...snap } });
  } catch (error: any) {
    // Serve stale data rather than nothing if GitHub is briefly unavailable.
    if (cache) {
      res.json({ success: true, data: { repo: REPO, fetchedAt: new Date(cache.at).toISOString(), ...cache.snap, stale: true } });
      return;
    }
    res.status(502).json({ success: false, error: error.message });
  }
});
