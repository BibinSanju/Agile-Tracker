import React from 'react';
import { GitBranch, CheckCircle2, Clock, Terminal } from 'lucide-react';

export default function PlaneCICDView() {
  return (
    <div className="plane-content-body">
      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--plane-text-primary)' }}>CI/CD Quality Gates & Automated Workflows</h2>
        <p style={{ fontSize: '12px', color: 'var(--plane-text-muted)' }}>GitHub Actions pipelines enforcing type checks, production builds, and Playwright test suites</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Workflow 1 */}
        <div className="plane-box">
          <div className="plane-box-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: 'var(--plane-radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--plane-accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={15} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--plane-text-primary)' }}>
                  Portal CI & Quality Gate (.github/workflows/ci.yml)
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--plane-text-muted)' }}>
                  Triggered on: push, pull_request to main/staging
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--plane-accent-emerald)', fontWeight: 500 }}>
              <CheckCircle2 size={13} />
              <span>Passing</span>
            </div>
          </div>

          <div style={{ background: 'var(--plane-bg-base)', padding: '10px', borderRadius: 'var(--plane-radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--plane-text-secondary)', border: '1px solid var(--plane-border-subtle)', lineHeight: 1.6 }}>
            <div>✓ Step 1: actions/checkout@v4 [0.8s]</div>
            <div>✓ Step 2: actions/setup-node@v4 (v20) [1.2s]</div>
            <div>✓ Step 3: npm ci [14.3s]</div>
            <div>✓ Step 4: npx tsc --noEmit (Strict TypeScript check: 0 errors) [3.1s]</div>
            <div>✓ Step 5: npm run build (Production bundle check) [3.2s]</div>
            <div>✓ Step 6: npx playwright test (Automated browser test suite) [4.8s]</div>
          </div>
        </div>

        {/* Workflow 2 */}
        <div className="plane-box">
          <div className="plane-box-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: 'var(--plane-radius-sm)', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--plane-accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={15} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--plane-text-primary)' }}>
                  Daily Build & Regression Check (.github/workflows/daily-build.yml)
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--plane-text-muted)' }}>
                  Scheduled Cron: Every morning at 6:00 AM IST (00:30 UTC)
                </div>
              </div>
            </div>

            <span className="module-badge">Next Run: 06:00 AM IST</span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--plane-text-secondary)' }}>
            Verifies end-to-end portal health and sandbox compilation resilience on a clean runner before team standup.
          </p>
        </div>

        {/* Workflow 3 */}
        <div className="plane-box">
          <div className="plane-box-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: 'var(--plane-radius-sm)', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--plane-accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Terminal size={15} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--plane-text-primary)' }}>
                  Nightly Scraper & Ingestion Pipeline (.github/workflows/scheduled-scraper.yml)
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--plane-text-muted)' }}>
                  Scheduled Cron: Nightly at 2:00 AM IST (20:30 UTC)
                </div>
              </div>
            </div>

            <span className="module-badge">Active Cron</span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--plane-text-secondary)' }}>
            Automatically fetches newly released problems from LeetCode / Codeforces and passes them to the AI deduplication engine.
          </p>
        </div>
      </div>
    </div>
  );
}
