import { useCallback, useEffect, useState } from 'react';

/**
 * Live GitHub Actions status for this repository.
 *
 * Reads from the backend proxy (/api/ci/status, cached + optionally
 * authenticated) and falls back to the public GitHub REST API when the backend
 * is offline (60 req/h per IP unauthenticated, so polling is slow and results
 * are cached in-module).
 * Every failure mode degrades to `state: 'unknown'` – the UI must never break
 * because GitHub is unreachable (offline dev, CI runner, rate-limited).
 */

export type CIState = 'loading' | 'passing' | 'failing' | 'running' | 'unknown';

export interface CIRun {
  id: number;
  runNumber: number;
  name: string;
  /** Workflow file path, e.g. ".github/workflows/ci.yml" */
  path: string;
  headBranch: string;
  headSha: string;
  event: string;
  status: 'queued' | 'in_progress' | 'completed' | string;
  conclusion: 'success' | 'failure' | 'cancelled' | 'timed_out' | 'skipped' | 'startup_failure' | null;
  htmlUrl: string;
  updatedAt: string;
}

export interface GitHubCI {
  state: CIState;
  repo: string;
  repoUrl: string;
  actionsUrl: string;
  /** Most recent run of the quality gate (ci.yml, or daily-build which calls it) on any branch. */
  gateRun: CIRun | null;
  /** Most recent gate run that executed against `main` itself. */
  mainRun: CIRun | null;
  /** Latest run per workflow file path. */
  latestByWorkflow: Record<string, CIRun>;
  runs: CIRun[];
  error: string | null;
  refresh: () => void;
}

export const GATE_WORKFLOW_PATH = '.github/workflows/ci.yml';
export const DAILY_WORKFLOW_PATH = '.github/workflows/daily-build.yml';
export const SCRAPER_WORKFLOW_PATH = '.github/workflows/scheduled-scraper.yml';

const DEFAULT_REPO = 'BibinSanju/Agile-Tracker';
// 3 requests per refresh; keep polling slow to stay well under the
// unauthenticated GitHub API limit of 60 requests/hour per IP.
const CACHE_TTL_MS = 4 * 60 * 1000;
const POLL_MS = 5 * 60 * 1000;

const repo: string = import.meta.env.VITE_GITHUB_REPO || DEFAULT_REPO;
const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

let cache: { at: number; runs: CIRun[] } | null = null;
let inflight: Promise<CIRun[]> | null = null;

function mapRun(r: any): CIRun {
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

async function fetchRuns(force = false): Promise<CIRun[]> {
  if (!force && cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.runs;
  if (inflight) return inflight;

  inflight = (async () => {
    // 1) Prefer the backend proxy: it caches and can authenticate, so it isn't
    //    subject to GitHub's 60 req/h per-IP limit for anonymous callers.
    try {
      const ctrl = new AbortController();
      const t = window.setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(`${API_BASE_URL}/ci/status`, { signal: ctrl.signal });
      window.clearTimeout(t);
      if (res.ok) {
        const json = await res.json();
        const runs = (json.data?.runs ?? []) as CIRun[];
        cache = { at: Date.now(), runs };
        return runs;
      }
    } catch {
      /* backend offline – fall through to GitHub directly */
    }

    // 2) Query GitHub per workflow file: the global /actions/runs feed is
    //    dominated by the two cron workflows, so gate runs fall off the page.
    const get = async (file: string, perPage: number) => {
      const res = await fetch(
        `https://api.github.com/repos/${repo}/actions/workflows/${file}/runs?per_page=${perPage}`,
        { headers: { Accept: 'application/vnd.github+json' } }
      );
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const json = await res.json();
      return ((json.workflow_runs ?? []) as any[]).map(mapRun);
    };
    const [gate, daily, scraper] = await Promise.all([
      get('ci.yml', 30), // enough history to find the latest run on main/staging
      get('daily-build.yml', 1),
      get('scheduled-scraper.yml', 1),
    ]);
    const runs = [...gate, ...daily, ...scraper].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    cache = { at: Date.now(), runs };
    return runs;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function runState(run: CIRun | null | undefined): CIState {
  if (!run) return 'unknown';
  if (run.status !== 'completed') return 'running';
  switch (run.conclusion) {
    case 'success':
      return 'passing';
    case 'failure':
    case 'timed_out':
    case 'startup_failure':
    case 'cancelled':
      return 'failing';
    default:
      return 'unknown';
  }
}

export const CI_STATE_LABEL: Record<CIState, string> = {
  loading: 'Checking…',
  passing: 'Passing',
  failing: 'Failing',
  running: 'Running',
  unknown: 'Unknown',
};

/** CSS colour tokens per state, matching the Plane theme. */
export const CI_STATE_COLOR: Record<CIState, { fg: string; bg: string }> = {
  passing: { fg: 'var(--plane-accent-emerald)', bg: 'rgba(16, 185, 129, 0.15)' },
  failing: { fg: 'var(--plane-accent-rose)', bg: 'rgba(239, 68, 68, 0.15)' },
  running: { fg: 'var(--plane-accent-amber)', bg: 'rgba(245, 158, 11, 0.15)' },
  loading: { fg: 'var(--plane-text-muted)', bg: 'rgba(128, 128, 128, 0.12)' },
  unknown: { fg: 'var(--plane-text-muted)', bg: 'rgba(128, 128, 128, 0.12)' },
};

export function timeAgo(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function useGitHubCI(): GitHubCI {
  const [runs, setRuns] = useState<CIRun[]>(cache?.runs ?? []);
  const [loaded, setLoaded] = useState<boolean>(Boolean(cache));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((force = false) => {
    fetchRuns(force)
      .then((r) => {
        setRuns(r);
        setError(null);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(() => load(true), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const latestByWorkflow: Record<string, CIRun> = {};
  for (const r of runs) {
    // API returns newest first; keep the first one we see per workflow.
    if (!latestByWorkflow[r.path]) latestByWorkflow[r.path] = r;
  }

  // daily-build.yml executes the same gate (via workflow_call), so the most
  // recent run of either workflow is the freshest verdict on the codebase.
  const gateRun =
    [latestByWorkflow[GATE_WORKFLOW_PATH], latestByWorkflow[DAILY_WORKFLOW_PATH]]
      .filter((r): r is CIRun => Boolean(r))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] ?? null;
  const mainRun =
    runs.find((r) => (r.path === GATE_WORKFLOW_PATH || r.path === DAILY_WORKFLOW_PATH) && r.headBranch === 'main') ?? null;

  let state: CIState;
  if (!loaded) state = 'loading';
  else if (error) state = 'unknown';
  else state = runState(gateRun);

  return {
    state,
    repo,
    repoUrl: `https://github.com/${repo}`,
    actionsUrl: `https://github.com/${repo}/actions`,
    gateRun,
    mainRun,
    latestByWorkflow,
    runs,
    error,
    refresh: () => load(true),
  };
}
