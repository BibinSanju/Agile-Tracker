import React from 'react';
import { GitBranch, CheckCircle2, XCircle, Clock, Terminal, Loader2, HelpCircle, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import {
  useGitHubCI,
  runState,
  timeAgo,
  CI_STATE_LABEL,
  CI_STATE_COLOR,
  GATE_WORKFLOW_PATH,
  DAILY_WORKFLOW_PATH,
  SCRAPER_WORKFLOW_PATH,
  type CIRun,
  type CIState,
} from '../hooks/useGitHubCI';

const mono: React.CSSProperties = {
  background: 'var(--plane-bg-base)',
  padding: '10px',
  borderRadius: 'var(--plane-radius-sm)',
  fontFamily: 'var(--font-mono)',
  fontSize: '11.5px',
  color: 'var(--plane-text-secondary)',
  border: '1px solid var(--plane-border-subtle)',
  lineHeight: 1.6,
};

function StateIcon({ state, size = 13 }: { state: CIState; size?: number }) {
  switch (state) {
    case 'passing': return <CheckCircle2 size={size} />;
    case 'failing': return <XCircle size={size} />;
    case 'running':
    case 'loading': return <Loader2 size={size} className="ci-spin" />;
    default: return <HelpCircle size={size} />;
  }
}

function StatePill({ state, label }: { state: CIState; label?: string }) {
  const c = CI_STATE_COLOR[state];
  return (
    <span data-ci-state={state} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 500, color: c.fg, background: c.bg, padding: '3px 8px', borderRadius: 'var(--plane-radius-sm)', whiteSpace: 'nowrap' }}>
      <StateIcon state={state} />
      <span>{label ?? CI_STATE_LABEL[state]}</span>
    </span>
  );
}

/** One line describing the latest run of a workflow, or why we don't have one. */
function LatestRun({ run, offline }: { run: CIRun | null; offline: boolean }) {
  if (offline) {
    return <div style={{ ...mono, color: 'var(--plane-text-muted)' }}>GitHub Actions status unavailable (offline or rate-limited). Data is fetched from api.github.com.</div>;
  }
  if (!run) {
    return <div style={{ ...mono, color: 'var(--plane-text-muted)' }}>No runs recorded yet for this workflow.</div>;
  }
  const state = runState(run);
  return (
    <div style={mono}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ color: CI_STATE_COLOR[state].fg, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <StateIcon state={state} size={12} /> {CI_STATE_LABEL[state]}
        </span>
        <span>#{run.runNumber}</span>
        <span>{run.event} → <b>{run.headBranch}</b> @ {run.headSha.slice(0, 7)}</span>
        <span style={{ color: 'var(--plane-text-muted)' }}>{timeAgo(run.updatedAt)}</span>
        <a href={run.htmlUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--plane-accent-blue)' }}>
          logs <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}

interface WorkflowCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconFg: string;
  title: string;
  subtitle: string;
  badge: React.ReactNode;
  children: React.ReactNode;
}

function WorkflowCard({ icon, iconBg, iconFg, title, subtitle, badge, children }: WorkflowCardProps) {
  return (
    <div className="plane-box">
      <div className="plane-box-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: 'var(--plane-radius-sm)', background: iconBg, color: iconFg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--plane-text-primary)' }}>{title}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--plane-text-muted)' }}>{subtitle}</div>
          </div>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

export default function PlaneCICDView() {
  const ci = useGitHubCI();
  const offline = ci.state === 'unknown' && Boolean(ci.error);
  const gate = ci.latestByWorkflow[GATE_WORKFLOW_PATH] ?? null;
  const daily = ci.latestByWorkflow[DAILY_WORKFLOW_PATH] ?? null;
  const scraper = ci.latestByWorkflow[SCRAPER_WORKFLOW_PATH] ?? null;

  // The promotion job runs inside ci.yml on pushes to staging. A green gate run
  // on staging therefore means main was fast-forwarded to that commit.
  const lastPromotion = ci.runs.find((r) => r.path === GATE_WORKFLOW_PATH && r.headBranch === 'staging' && r.event === 'push' && r.conclusion === 'success') ?? null;
  const mainState = runState(ci.mainRun);

  return (
    <div className="plane-content-body">
      <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--plane-text-primary)' }}>CI/CD Quality Gates & Automated Workflows</h2>
          <p style={{ fontSize: '12px', color: 'var(--plane-text-muted)' }}>
            Every push to every branch is built and tested by GitHub Actions before anything reaches users. <code>main</code> only ever receives commits that passed the full gate.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatePill state={ci.state} label={`Quality gate: ${CI_STATE_LABEL[ci.state]}`} />
          <button className="plane-btn-secondary" onClick={ci.refresh} title="Refresh from GitHub" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={12} /> Refresh
          </button>
          <a className="plane-btn-secondary" href={ci.actionsUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            Actions <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Policy */}
        <WorkflowCard
          icon={<ShieldCheck size={15} />}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconFg="var(--plane-accent-amber)"
          title="Nothing-Untested Policy: staging → main auto-promotion"
          subtitle={`${ci.repo} · job promote-to-main in ci.yml`}
          badge={<StatePill state={mainState} label={`main${ci.mainSha ? ' @ ' + ci.mainSha.slice(0, 7) : ''}: ${CI_STATE_LABEL[mainState]}`} />}
        >
          <p style={{ fontSize: '12px', color: 'var(--plane-text-secondary)', marginBottom: '8px' }}>
            Work is committed to <code>staging</code> (or any feature branch), never directly to <code>main</code>. Each push triggers the
            frontend build + Playwright E2E suite and the server Prisma + TypeScript check. Only when <em>both</em> succeed for that exact
            commit is it fast-forwarded into <code>main</code> by the workflow. A red build leaves <code>main</code> untouched.
          </p>
          <div style={mono}>
            <div>git checkout staging &amp;&amp; git commit -m "feat: ..."</div>
            <div>git push origin staging &nbsp;&nbsp;# → quality gate → auto fast-forward main</div>
            {lastPromotion && (
              <div style={{ marginTop: '6px', color: 'var(--plane-accent-emerald)' }}>
                ✓ last promotion: {lastPromotion.headSha.slice(0, 7)} → main · {timeAgo(lastPromotion.updatedAt)}
              </div>
            )}
          </div>
        </WorkflowCard>

        {/* Workflow 1 */}
        <WorkflowCard
          icon={<GitBranch size={15} />}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconFg="var(--plane-accent-emerald)"
          title="Portal CI & Quality Gate (.github/workflows/ci.yml)"
          subtitle="Triggered on: push to any branch · pull_request to main/staging · called by daily-build"
          badge={<StatePill state={offline ? 'unknown' : runState(gate)} />}
        >
          <div style={{ ...mono, marginBottom: '8px' }}>
            <div>▸ frontend · npm ci → npm run build (tsc + Vite production bundle) → npx playwright test (7 E2E specs)</div>
            <div>▸ server &nbsp;&nbsp;· npm ci → prisma validate → prisma generate → tsc --noEmit</div>
            <div>▸ promote &nbsp;· needs [frontend, server] · push to staging only · git merge --ff-only → push main</div>
          </div>
          <LatestRun run={gate} offline={offline} />
        </WorkflowCard>

        {/* Workflow 2 */}
        <WorkflowCard
          icon={<Clock size={15} />}
          iconBg="rgba(59, 130, 246, 0.15)"
          iconFg="var(--plane-accent-blue)"
          title="Daily Build & Regression Check (.github/workflows/daily-build.yml)"
          subtitle="Scheduled Cron: Every morning at 6:00 AM IST (00:30 UTC) · re-runs ci.yml via workflow_call"
          badge={<span className="module-badge">Next Run: 06:00 AM IST</span>}
        >
          <p style={{ fontSize: '12px', color: 'var(--plane-text-secondary)', marginBottom: '8px' }}>
            Re-runs the exact same quality gate on a clean runner so upstream drift (dependency releases, browser updates) is caught before standup.
          </p>
          <LatestRun run={daily} offline={offline} />
        </WorkflowCard>

        {/* Workflow 3 */}
        <WorkflowCard
          icon={<Terminal size={15} />}
          iconBg="rgba(139, 92, 246, 0.15)"
          iconFg="var(--plane-accent-purple)"
          title="Nightly Scraper & Ingestion Pipeline (.github/workflows/scheduled-scraper.yml)"
          subtitle="Scheduled Cron: Nightly at 2:00 AM IST (20:30 UTC)"
          badge={<span className="module-badge">Active Cron</span>}
        >
          <p style={{ fontSize: '12px', color: 'var(--plane-text-secondary)', marginBottom: '8px' }}>
            Automatically fetches newly released problems from LeetCode / Codeforces and passes them to the AI deduplication engine.
          </p>
          <LatestRun run={scraper} offline={offline} />
        </WorkflowCard>
      </div>
    </div>
  );
}
