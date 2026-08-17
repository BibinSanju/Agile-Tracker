import React from 'react';
import { 
  Circle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  HelpCircle,
  AlertOctagon,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Minus,
  Plus,
  Layers,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlaneIssue, PlaneModule, PlaneMember, IssueState, IssuePriority } from '../data/planeData';

interface PlaneListViewProps {
  issues: PlaneIssue[];
  modules: PlaneModule[];
  members: PlaneMember[];
  onIssueClick: (issue: PlaneIssue) => void;
  onUpdateState: (issueId: string, newState: IssueState) => void;
  onOpenNewIssue: () => void;
  onSeedBlueprint?: () => void;
}

const STATE_CONFIG: { id: IssueState; label: string; color: string; icon: any }[] = [
  { id: 'done', label: 'Done', color: 'var(--plane-accent-emerald)', icon: CheckCircle2 },
  { id: 'in_review', label: 'In Review / Testing', color: 'var(--plane-accent-purple)', icon: AlertCircle },
  { id: 'in_progress', label: 'In Progress', color: 'var(--plane-accent-amber)', icon: Clock },
  { id: 'todo', label: 'Todo', color: 'var(--plane-accent-blue)', icon: Circle },
  { id: 'backlog', label: 'Backlog', color: 'var(--plane-text-muted)', icon: HelpCircle }
];

export default function PlaneListView({
  issues,
  modules,
  members,
  onIssueClick,
  onUpdateState,
  onOpenNewIssue,
  onSeedBlueprint
}: PlaneListViewProps) {
  const handleStateClick = (e: React.MouseEvent, issue: PlaneIssue) => {
    e.stopPropagation();
    const states: IssueState[] = ['backlog', 'todo', 'in_progress', 'in_review', 'done'];
    const currentIndex = states.indexOf(issue.state);
    const nextState = states[(currentIndex + 1) % states.length];
    onUpdateState(issue.id, nextState);

    if (nextState === 'done') {
      confetti({ particleCount: 35, spread: 45, origin: { y: 0.8 } });
    }
  };

  const renderPriorityIcon = (priority: IssuePriority) => {
    switch (priority) {
      case 'urgent':
        return <span title="Urgent Priority" style={{ display: 'inline-flex' }}><AlertOctagon size={13} color="var(--plane-accent-rose)" /></span>;
      case 'high':
        return <span title="High Priority" style={{ display: 'inline-flex' }}><SignalHigh size={13} color="var(--plane-accent-amber)" /></span>;
      case 'medium':
        return <span title="Medium Priority" style={{ display: 'inline-flex' }}><SignalMedium size={13} color="var(--plane-accent-blue)" /></span>;
      case 'low':
        return <span title="Low Priority" style={{ display: 'inline-flex' }}><SignalLow size={13} color="var(--plane-text-muted)" /></span>;
      default:
        return <span title="None" style={{ display: 'inline-flex' }}><Minus size={13} color="var(--plane-text-muted)" /></span>;
    }
  };

  // Clean empty state if project has 0 issues
  if (issues.length === 0) {
    return (
      <div className="plane-content-body" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '440px', background: 'var(--plane-bg-sidebar)', padding: '32px 24px', borderRadius: 'var(--plane-radius-lg)', border: '1px solid var(--plane-border-subtle)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--plane-radius-md)', background: 'rgba(63, 123, 246, 0.12)', color: 'var(--plane-accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Layers size={24} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--plane-text-primary)' }}>No Issues in Project</h3>
          <p style={{ fontSize: '12.5px', color: 'var(--plane-text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
            Your project is ready for real task tracking. Create custom tasks or seed all 20 architectural blueprint tasks directly from the architecture map.
          </p>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
            <button className="plane-btn plane-btn-primary" onClick={onOpenNewIssue}>
              <Plus size={14} />
              <span>Create First Issue (C)</span>
            </button>
            {onSeedBlueprint && (
              <button className="plane-btn plane-btn-secondary" onClick={onSeedBlueprint}>
                <Sparkles size={14} color="var(--plane-accent-cyan)" />
                <span>Load Architecture Map (20 Tasks)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="plane-content-body">
      {STATE_CONFIG.map(group => {
        const groupIssues = issues.filter(i => i.state === group.id);
        const IconComponent = group.icon;

        return (
          <div key={group.id} className="plane-list-group">
            {/* Group Header */}
            <div className="list-group-header">
              <div className="list-group-header-left">
                <IconComponent size={14} color={group.color} />
                <span>{group.label}</span>
                <span className="sidebar-count-badge">{groupIssues.length}</span>
              </div>

              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--plane-text-muted)' }}>
                {groupIssues.reduce((sum, i) => sum + i.storyPoints, 0)} pts
              </div>
            </div>

            {/* Group Issues */}
            <div>
              {groupIssues.map(issue => {
                const module = modules.find(m => m.id === issue.moduleId);
                const assignee = members.find(m => m.id === issue.assigneeId);
                const isDone = issue.state === 'done';

                return (
                  <div 
                    key={issue.id} 
                    className="plane-issue-row"
                    onClick={() => onIssueClick(issue)}
                  >
                    {/* State Toggle */}
                    <div 
                      className="issue-state-icon" 
                      onClick={(e) => handleStateClick(e, issue)}
                      title={`Current state: ${issue.state}. Click to change.`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={15} color="var(--plane-accent-emerald)" />
                      ) : issue.state === 'in_progress' ? (
                        <Clock size={15} color="var(--plane-accent-amber)" />
                      ) : issue.state === 'in_review' ? (
                        <AlertCircle size={15} color="var(--plane-accent-purple)" />
                      ) : issue.state === 'todo' ? (
                        <Circle size={15} color="var(--plane-accent-blue)" />
                      ) : (
                        <HelpCircle size={15} color="var(--plane-text-muted)" />
                      )}
                    </div>

                    {/* Key */}
                    <span className="issue-identifier">{issue.key}</span>

                    {/* Title */}
                    <span className={`issue-title-text ${isDone ? 'completed' : ''}`}>
                      {issue.title}
                    </span>

                    {/* Metadata */}
                    <div className="issue-meta-items">
                      <span className="module-badge">
                        {module ? module.name.split(':')[0] : 'General'}
                      </span>

                      <div className="priority-icon-wrapper">
                        {renderPriorityIcon(issue.priority)}
                      </div>

                      <span className="points-badge">
                        {issue.storyPoints} pts
                      </span>

                      {/* Assignee */}
                      <div className="assignee-badge">
                        {assignee ? (
                          <>
                            <div 
                              className="assignee-avatar-sm"
                              style={{ background: assignee.avatarColor }}
                            >
                              {assignee.avatarText}
                            </div>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {assignee.name.split(' ')[0]}
                            </span>
                          </>
                        ) : (
                          <span style={{ color: 'var(--plane-text-muted)', fontSize: '11px' }}>Unassigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {groupIssues.length === 0 && (
                <div style={{ padding: '12px 16px', color: 'var(--plane-text-muted)', fontSize: '12px' }}>
                  No issues in {group.label.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
