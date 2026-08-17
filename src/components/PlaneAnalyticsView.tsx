import React from 'react';
import { BarChart2, CheckCircle2, Clock, AlertOctagon, Users, ShieldCheck, TrendingUp, Layers } from 'lucide-react';
import { PlaneIssue, PlaneModule, PlaneMember, PlaneCycle } from '../data/planeData';

interface PlaneAnalyticsViewProps {
  issues: PlaneIssue[];
  modules: PlaneModule[];
  members: PlaneMember[];
  cycle: PlaneCycle;
}

export default function PlaneAnalyticsView({ issues, modules, members, cycle }: PlaneAnalyticsViewProps) {
  const totalIssues = issues.length;
  const doneIssues = issues.filter(i => i.state === 'done').length;
  const inProgressIssues = issues.filter(i => i.state === 'in_progress').length;
  const inReviewIssues = issues.filter(i => i.state === 'in_review').length;
  const todoIssues = issues.filter(i => i.state === 'todo').length;
  const backlogIssues = issues.filter(i => i.state === 'backlog').length;

  const totalPoints = issues.reduce((sum, i) => sum + i.storyPoints, 0);
  const donePoints = issues.filter(i => i.state === 'done').reduce((sum, i) => sum + i.storyPoints, 0);
  const progressPercent = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;

  const urgentIssues = issues.filter(i => i.priority === 'urgent');

  return (
    <div className="plane-content-body">
      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--plane-text-primary)' }}>Project Analytics & Execution Scope</h2>
        <p style={{ fontSize: '12px', color: 'var(--plane-text-muted)' }}>Real-time telemetry on story points burned, issue velocity, and layer health</p>
      </div>

      {/* Top 4 Metric Boxes */}
      <div className="plane-analytics-grid">
        <div className="plane-box">
          <div className="plane-box-header">
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>COMPLETION RATE</span>
            <CheckCircle2 size={15} color="var(--plane-accent-emerald)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--plane-text-primary)' }}>
            {progressPercent}%
          </div>
          <div className="progress-bar-thin">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, background: 'var(--plane-accent-emerald)' }} />
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--plane-text-muted)' }}>
            {doneIssues} of {totalIssues} verified engineering stories completed
          </div>
        </div>

        <div className="plane-box">
          <div className="plane-box-header">
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>STORY POINTS VELOCITY</span>
            <TrendingUp size={15} color="var(--plane-accent-blue)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--plane-text-primary)' }}>
            {donePoints} / {totalPoints} pts
          </div>
          <div className="progress-bar-thin">
            <div className="progress-bar-fill" style={{ width: `${Math.round((donePoints/totalPoints)*100)}%`, background: 'var(--plane-accent-blue)' }} />
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--plane-text-muted)' }}>
            Estimated remaining workload: {(totalPoints - donePoints) * 2} engineering hours
          </div>
        </div>

        <div className="plane-box">
          <div className="plane-box-header">
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>CRITICAL PATH (URGENT)</span>
            <AlertOctagon size={15} color="var(--plane-accent-rose)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--plane-text-primary)' }}>
            {urgentIssues.filter(i => i.state === 'done').length} / {urgentIssues.length}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--plane-text-muted)' }}>
            Urgent items include Sandbox limits, Deduplication, and XML export
          </div>
        </div>

        <div className="plane-box">
          <div className="plane-box-header">
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>ZERO-REGRESSION STATUS</span>
            <ShieldCheck size={15} color="var(--plane-accent-emerald)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--plane-accent-emerald)' }}>
            Protected
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--plane-text-muted)' }}>
            5,000 live placement students isolated from staging queue
          </div>
        </div>
      </div>

      {/* Module breakdown */}
      <div className="plane-box" style={{ marginTop: '8px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--plane-text-primary)' }}>Architecture Module Progress Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          {modules.map(m => {
            const mIssues = issues.filter(i => i.moduleId === m.id);
            const mDone = mIssues.filter(i => i.state === 'done').length;
            const pct = mIssues.length > 0 ? Math.round((mDone / mIssues.length) * 100) : 0;

            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--plane-text-secondary)', width: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.name}
                </span>
                <div style={{ flex: 1, margin: '0 16px' }}>
                  <div className="progress-bar-thin">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--plane-accent-emerald)' : 'var(--plane-accent-blue)' }} />
                  </div>
                </div>
                <span style={{ width: '80px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--plane-text-muted)' }}>
                  {mDone}/{mIssues.length} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
