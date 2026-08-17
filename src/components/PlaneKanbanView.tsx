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
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlaneIssue, PlaneModule, PlaneMember, IssueState, IssuePriority } from '../data/planeData';

interface PlaneKanbanViewProps {
  issues: PlaneIssue[];
  modules: PlaneModule[];
  members: PlaneMember[];
  onIssueClick: (issue: PlaneIssue) => void;
  onUpdateState: (issueId: string, newState: IssueState) => void;
}

const COLUMNS: { id: IssueState; label: string; color: string; icon: any }[] = [
  { id: 'backlog', label: 'Backlog', color: 'var(--plane-text-muted)', icon: HelpCircle },
  { id: 'todo', label: 'Todo', color: 'var(--plane-accent-blue)', icon: Circle },
  { id: 'in_progress', label: 'In Progress', color: 'var(--plane-accent-amber)', icon: Clock },
  { id: 'in_review', label: 'In Review', color: 'var(--plane-accent-purple)', icon: AlertCircle },
  { id: 'done', label: 'Done', color: 'var(--plane-accent-emerald)', icon: CheckCircle2 }
];

export default function PlaneKanbanView({ issues, modules, members, onIssueClick, onUpdateState }: PlaneKanbanViewProps) {
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

  return (
    <div style={{ flex: 1, padding: '16px', overflow: 'hidden' }}>
      <div className="plane-kanban">
        {COLUMNS.map(col => {
          const colIssues = issues.filter(i => i.state === col.id);
          const colPoints = colIssues.reduce((sum, i) => sum + i.storyPoints, 0);
          const IconComponent = col.icon;

          return (
            <div key={col.id} className="plane-kanban-col">
              {/* Header */}
              <div className="kanban-col-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconComponent size={14} color={col.color} />
                  <span>{col.label}</span>
                  <span className="sidebar-count-badge">{colIssues.length}</span>
                </div>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--plane-text-muted)' }}>
                  {colPoints} pts
                </span>
              </div>

              {/* Cards */}
              <div className="kanban-cards-wrap">
                {colIssues.map(issue => {
                  const module = modules.find(m => m.id === issue.moduleId);
                  const assignee = members.find(m => m.id === issue.assigneeId);

                  return (
                    <div 
                      key={issue.id} 
                      className="plane-card"
                      onClick={() => onIssueClick(issue)}
                    >
                      <div className="plane-card-top">
                        <span className="issue-identifier">{issue.key}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {renderPriorityIcon(issue.priority)}
                          <span className="points-badge">{issue.storyPoints} pts</span>
                        </div>
                      </div>

                      <div className="plane-card-title">
                        {issue.title}
                      </div>

                      <div>
                        <span className="module-badge">
                          {module ? module.name.split(':')[0] : 'General'}
                        </span>
                      </div>

                      <div className="plane-card-footer">
                        <div className="assignee-badge">
                          <div 
                            className="assignee-avatar-sm"
                            style={{ background: assignee?.avatarColor || '#374151' }}
                          >
                            {assignee?.avatarText || '?'}
                          </div>
                          <span>{assignee?.name.split(' ')[0] || 'Unassigned'}</span>
                        </div>

                        {/* Quick state progression */}
                        <div onClick={e => e.stopPropagation()}>
                          {col.id === 'backlog' && (
                            <button 
                              className="plane-btn plane-btn-secondary" 
                              style={{ padding: '2px 6px', fontSize: '10.5px' }}
                              onClick={() => onUpdateState(issue.id, 'todo')}
                            >
                              <span>Todo</span>
                              <ArrowRight size={10} />
                            </button>
                          )}
                          {col.id === 'todo' && (
                            <button 
                              className="plane-btn plane-btn-secondary" 
                              style={{ padding: '2px 6px', fontSize: '10.5px' }}
                              onClick={() => onUpdateState(issue.id, 'in_progress')}
                            >
                              <span>Start</span>
                              <ArrowRight size={10} />
                            </button>
                          )}
                          {col.id === 'in_progress' && (
                            <button 
                              className="plane-btn plane-btn-secondary" 
                              style={{ padding: '2px 6px', fontSize: '10.5px' }}
                              onClick={() => onUpdateState(issue.id, 'in_review')}
                            >
                              <span>Review</span>
                              <ArrowRight size={10} />
                            </button>
                          )}
                          {col.id === 'in_review' && (
                            <button 
                              className="plane-btn plane-btn-primary" 
                              style={{ padding: '2px 6px', fontSize: '10.5px' }}
                              onClick={() => {
                                onUpdateState(issue.id, 'done');
                                confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
                              }}
                            >
                              <span>Done</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colIssues.length === 0 && (
                  <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--plane-text-muted)', fontSize: '12px' }}>
                    No issues in {col.label.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
