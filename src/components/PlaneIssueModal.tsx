import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Circle, 
  HelpCircle,
  AlertOctagon,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Minus,
  Trash2,
  Calendar,
  Box,
  User,
  Check,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlaneIssue, PlaneModule, PlaneMember, IssueState, IssuePriority } from '../data/planeData';

interface PlaneIssueModalProps {
  issue: PlaneIssue | null;
  modules: PlaneModule[];
  members: PlaneMember[];
  onClose: () => void;
  onUpdateState: (issueId: string, newState: IssueState) => void;
  onUpdatePriority: (issueId: string, newPriority: IssuePriority) => void;
  onUpdateAssignee: (issueId: string, newAssigneeId: string) => void;
  onToggleCriteria?: (issueId: string, criteriaId: string) => void;
  onAddCriteria?: (issueId: string, text: string) => void;
  onDeleteIssue?: (issueId: string) => void;
}

export default function PlaneIssueModal({
  issue,
  modules,
  members,
  onClose,
  onUpdateState,
  onUpdatePriority,
  onUpdateAssignee,
  onToggleCriteria,
  onAddCriteria,
  onDeleteIssue
}: PlaneIssueModalProps) {
  if (!issue) return null;

  const [newCriteriaText, setNewCriteriaText] = useState('');
  const module = modules.find(m => m.id === issue.moduleId);
  const assignee = members.find(m => m.id === issue.assigneeId);

  const handleAddCriteriaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCriteriaText.trim() || !onAddCriteria) return;
    onAddCriteria(issue.id, newCriteriaText.trim());
    setNewCriteriaText('');
  };

  return (
    <div className="plane-modal-overlay" onClick={onClose}>
      <div className="plane-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="plane-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="issue-identifier" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--plane-accent-blue)' }}>
              {issue.key}
            </span>
            <span className="module-badge">{module?.layer || 'General Layer'}</span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--plane-text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="plane-modal-body">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--plane-text-primary)', lineHeight: 1.4 }}>
            {issue.title}
          </h2>

          {/* Quick Properties Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: 'var(--plane-bg-base)', padding: '10px', borderRadius: 'var(--plane-radius-sm)', border: '1px solid var(--plane-border-subtle)' }}>
            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--plane-text-muted)' }}>STATE</div>
              <select 
                className="plane-select" 
                style={{ width: '100%', marginTop: '3px' }}
                value={issue.state}
                onChange={e => {
                  const s = e.target.value as IssueState;
                  onUpdateState(issue.id, s);
                  if (s === 'done') confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
                }}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--plane-text-muted)' }}>PRIORITY</div>
              <select 
                className="plane-select" 
                style={{ width: '100%', marginTop: '3px' }}
                value={issue.priority}
                onChange={e => onUpdatePriority(issue.id, e.target.value as IssuePriority)}
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--plane-text-muted)' }}>ASSIGNEE</div>
              <select 
                className="plane-select" 
                style={{ width: '100%', marginTop: '3px' }}
                value={issue.assigneeId}
                onChange={e => onUpdateAssignee(issue.id, e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--plane-text-muted)' }}>ESTIMATE</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--plane-text-primary)', marginTop: '5px' }}>
                {issue.storyPoints} Story Points
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--plane-text-muted)', textTransform: 'uppercase' }}>Description & Scope</label>
            <p style={{ fontSize: '13px', color: 'var(--plane-text-secondary)', background: 'var(--plane-bg-base)', padding: '10px 12px', borderRadius: 'var(--plane-radius-sm)', border: '1px solid var(--plane-border-subtle)', lineHeight: 1.6, marginTop: '4px' }}>
              {issue.description || 'No description provided.'}
            </p>
          </div>

          {/* Acceptance Criteria Checklist */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--plane-text-muted)', textTransform: 'uppercase' }}>
                Acceptance Criteria / Definition of Done ({issue.acceptanceCriteria?.filter(c => c.completed).length || 0}/{issue.acceptanceCriteria?.length || 0})
              </label>
              {onAddCriteria && (
                <button 
                  type="button" 
                  className="plane-btn plane-btn-secondary" 
                  style={{ padding: '4px 8px', fontSize: '10px', color: 'var(--plane-accent-blue)', borderColor: 'var(--plane-accent-blue)' }}
                  onClick={async () => {
                    const btn = document.getElementById('ai-btn-text');
                    if (btn) btn.innerText = 'Generating...';
                    try {
                      const { api } = await import('../services/api');
                      const criteria = await api.generateIssueCriteria(issue.title, issue.description);
                      if (criteria && criteria.length > 0) {
                        criteria.forEach(c => onAddCriteria(issue.id, c));
                      }
                    } catch (e) {
                      console.error('Failed to generate criteria', e);
                      alert('Failed to generate criteria. Make sure GROQ_API_KEY is set on the backend.');
                    }
                    if (btn) btn.innerText = '✨ AI Auto-Generate';
                  }}
                >
                  <span id="ai-btn-text">✨ AI Auto-Generate</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '6px' }}>
              {issue.acceptanceCriteria && issue.acceptanceCriteria.map((item) => (
                <div 
                  key={item.id} 
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: item.completed ? 'var(--plane-text-muted)' : 'var(--plane-text-secondary)', background: 'var(--plane-bg-base)', padding: '8px 10px', borderRadius: 'var(--plane-radius-sm)', border: '1px solid var(--plane-border-subtle)', cursor: 'pointer' }}
                  onClick={() => onToggleCriteria && onToggleCriteria(issue.id, item.id)}
                >
                  <input 
                    type="checkbox" 
                    checked={item.completed} 
                    onChange={() => onToggleCriteria && onToggleCriteria(issue.id, item.id)}
                    style={{ cursor: 'pointer', accentColor: 'var(--plane-accent-emerald)', marginTop: '2px', flexShrink: 0 }} 
                  />
                  <span style={{ textDecoration: item.completed ? 'line-through' : 'none', lineHeight: 1.4, wordBreak: 'break-word' }}>{item.text}</span>
                </div>
              ))}

              {/* Add criteria form */}
              {onAddCriteria && (
                <form onSubmit={handleAddCriteriaSubmit} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input 
                    type="text"
                    className="plane-search-input"
                    style={{ background: 'var(--plane-bg-base)', border: '1px solid var(--plane-border-medium)', borderRadius: 'var(--plane-radius-sm)', padding: '5px 8px', fontSize: '12px', flex: 1 }}
                    placeholder="Add checklist item..."
                    value={newCriteriaText}
                    onChange={e => setNewCriteriaText(e.target.value)}
                  />
                  <button type="submit" className="plane-btn plane-btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                    <Plus size={12} />
                    <span>Add</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Technical Notes if any */}
          {issue.technicalNotes && (
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--plane-text-muted)', textTransform: 'uppercase' }}>Technical & Architecture Notes</label>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--plane-text-secondary)', background: 'var(--plane-bg-base)', padding: '8px 10px', borderRadius: 'var(--plane-radius-sm)', border: '1px solid var(--plane-border-subtle)', marginTop: '4px' }}>
                {issue.technicalNotes}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="plane-modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {onDeleteIssue && (
              <button 
                className="plane-btn plane-btn-secondary" 
                style={{ color: 'var(--plane-accent-rose)' }}
                onClick={() => {
                  if (window.confirm(`Delete issue ${issue.key}?`)) {
                    onDeleteIssue(issue.id);
                    onClose();
                  }
                }}
              >
                <Trash2 size={13} />
                <span>Delete Issue</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="plane-btn plane-btn-secondary" onClick={onClose}>
              Close
            </button>
            {issue.state !== 'done' && (
              <button 
                className="plane-btn plane-btn-primary"
                onClick={() => {
                  onUpdateState(issue.id, 'done');
                  confetti({ particleCount: 35, spread: 45, origin: { y: 0.7 } });
                  onClose();
                }}
              >
                <Check size={14} />
                <span>Mark as Done</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
