import React, { useState } from 'react';
import { Repeat, Clock, CheckCircle2, Target, Plus, Trash2 } from 'lucide-react';
import { PlaneCycle, PlaneIssue, PlaneMember } from '../data/planeData';

interface PlaneCyclesViewProps {
  cycles: PlaneCycle[];
  issues: PlaneIssue[];
  members: PlaneMember[];
  onOpenAddCycle: () => void;
  onDeleteCycle?: (cycleId: string) => void;
}

export default function PlaneCyclesView({
  cycles,
  issues,
  members,
  onOpenAddCycle,
  onDeleteCycle
}: PlaneCyclesViewProps) {
  const [selectedCycleId, setSelectedCycleId] = useState(cycles[0]?.id || 'cycle-1');
  const activeCycle = cycles.find(c => c.id === selectedCycleId) || cycles[0];

  if (!activeCycle) {
    return (
      <div className="plane-content-body" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--plane-text-muted)' }}>No cycles created yet.</p>
        <button className="plane-btn plane-btn-primary" style={{ marginTop: '10px' }} onClick={onOpenAddCycle}>
          <Plus size={14} />
          <span>Create Sprint Cycle</span>
        </button>
      </div>
    );
  }

  const cycleIssues = issues.filter(i => i.cycleId === activeCycle.id);
  const doneIssues = cycleIssues.filter(i => i.state === 'done').length;
  const inProgressIssues = cycleIssues.filter(i => i.state === 'in_progress').length;
  const inReviewIssues = cycleIssues.filter(i => i.state === 'in_review').length;
  const todoIssues = cycleIssues.filter(i => i.state === 'todo').length;
  const backlogIssues = cycleIssues.filter(i => i.state === 'backlog').length;

  const totalPoints = cycleIssues.reduce((sum, i) => sum + i.storyPoints, 0);
  const donePoints = cycleIssues.filter(i => i.state === 'done').reduce((sum, i) => sum + i.storyPoints, 0);
  const percent = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  return (
    <div className="plane-content-body">
      {/* Cycles Selector Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {cycles.map(c => (
            <button 
              key={c.id}
              className={`view-mode-btn ${selectedCycleId === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCycleId(c.id)}
            >
              <Repeat size={13} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        <button className="plane-btn plane-btn-primary" onClick={onOpenAddCycle}>
          <Plus size={14} />
          <span>New Cycle</span>
        </button>
      </div>

      <div className="plane-box" style={{ background: 'var(--plane-bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="module-badge" style={{ textTransform: 'capitalize' }}>{activeCycle.status}</span>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--plane-text-primary)' }}>{activeCycle.name}</h2>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--plane-text-secondary)', marginTop: '4px', maxWidth: '720px' }}>
              {activeCycle.description}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--plane-text-muted)' }}>Sprint Duration</div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--plane-text-primary)', marginTop: '2px' }}>
              {activeCycle.startDate} ➔ {activeCycle.endDate}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span style={{ fontWeight: 600, color: 'var(--plane-text-primary)' }}>
              Overall Velocity: {donePoints} / {totalPoints} story points burned ({percent}%)
            </span>
            <span style={{ color: 'var(--plane-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {doneIssues} of {cycleIssues.length} issues completed
            </span>
          </div>
          <div className="progress-bar-thin" style={{ height: '8px' }}>
            <div className="progress-bar-fill" style={{ width: `${percent}%`, background: 'var(--plane-accent-emerald)' }} />
          </div>
        </div>
      </div>

      {/* State breakdown cards */}
      <div className="plane-analytics-grid">
        <div className="plane-box">
          <div className="plane-box-title">
            <CheckCircle2 size={15} color="var(--plane-accent-emerald)" />
            <span>Completed Scope (Done)</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--plane-text-primary)' }}>
            {doneIssues} issues
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--plane-text-muted)' }}>
            {donePoints} story points delivered & verified
          </div>
        </div>

        <div className="plane-box">
          <div className="plane-box-title">
            <Clock size={15} color="var(--plane-accent-amber)" />
            <span>In Active Flight</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--plane-text-primary)' }}>
            {inProgressIssues + inReviewIssues} issues
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--plane-text-muted)' }}>
            {inProgressIssues} in progress, {inReviewIssues} under review
          </div>
        </div>

        <div className="plane-box">
          <div className="plane-box-title">
            <Target size={15} color="var(--plane-accent-blue)" />
            <span>Pending Allocation</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--plane-text-primary)' }}>
            {todoIssues + backlogIssues} issues
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--plane-text-muted)' }}>
            Scheduled for development in this sprint
          </div>
        </div>
      </div>
    </div>
  );
}
