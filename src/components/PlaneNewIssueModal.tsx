import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { PlaneIssue, PlaneModule, PlaneMember, PlaneCycle, IssueState, IssuePriority } from '../data/planeData';

interface PlaneNewIssueModalProps {
  modules: PlaneModule[];
  members: PlaneMember[];
  cycles: PlaneCycle[];
  onClose: () => void;
  onAddIssue: (newIssue: Omit<PlaneIssue, 'id' | 'sequenceId' | 'key' | 'createdAt' | 'updatedAt'>) => void;
}

export default function PlaneNewIssueModal({ modules, members, cycles, onClose, onAddIssue }: PlaneNewIssueModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleId, setModuleId] = useState(modules[0]?.id || '');
  const [state, setState] = useState<IssueState>('todo');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [assigneeId, setAssigneeId] = useState(members[0]?.id || '');
  const [storyPoints, setStoryPoints] = useState(3);
  const [criteriaText, setCriteriaText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!moduleId) {
      alert("You must create a Module before creating an Issue!");
      return;
    }
    if (!cycles || cycles.length === 0) {
      alert("You must create a Cycle before creating an Issue!");
      return;
    }

    const criteriaList = criteriaText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((text, idx) => ({ id: `c-${Date.now()}-${idx}`, text, completed: false }));

    onAddIssue({
      title: title.trim(),
      description: description.trim(),
      state,
      priority,
      moduleId,
      cycleId: cycles[0]?.id,
      assigneeId,
      storyPoints: Number(storyPoints),
      acceptanceCriteria: criteriaList.length > 0 ? criteriaList : [
        { id: `c-${Date.now()}-1`, text: 'Code implementation tested locally', completed: false },
        { id: `c-${Date.now()}-2`, text: 'Passes automated Playwright / CI quality gate', completed: false }
      ]
    });

    onClose();
  };

  return (
    <div className="plane-modal-overlay" onClick={onClose}>
      <div className="plane-modal" onClick={e => e.stopPropagation()}>
        <div className="plane-modal-header">
          <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--plane-text-primary)' }}>
            Create New Issue
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--plane-text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="plane-modal-body">
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>ISSUE TITLE *</label>
              <input 
                type="text" 
                className="plane-search-input"
                style={{ background: 'var(--plane-bg-base)', border: '1px solid var(--plane-border-medium)', borderRadius: 'var(--plane-radius-sm)', padding: '8px 10px', width: '100%', marginTop: '3px', fontSize: '13px' }}
                placeholder="e.g. Implement Playwright test for Moodle XML download"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>DESCRIPTION</label>
              <textarea 
                rows={3}
                style={{ background: 'var(--plane-bg-base)', border: '1px solid var(--plane-border-medium)', borderRadius: 'var(--plane-radius-sm)', padding: '8px 10px', width: '100%', marginTop: '3px', color: 'var(--plane-text-primary)', fontFamily: 'inherit', fontSize: '12.5px', outline: 'none' }}
                placeholder="Describe scope, inputs, outputs, or error handling..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>MODULE / LAYER</label>
                <select 
                  className="plane-select"
                  style={{ width: '100%', marginTop: '3px', padding: '6px' }}
                  value={moduleId}
                  onChange={e => setModuleId(e.target.value)}
                >
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>ASSIGNEE</label>
                <select 
                  className="plane-select"
                  style={{ width: '100%', marginTop: '3px', padding: '6px' }}
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>STATE</label>
                <select 
                  className="plane-select"
                  style={{ width: '100%', marginTop: '3px', padding: '6px' }}
                  value={state}
                  onChange={e => setState(e.target.value as IssueState)}
                >
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                  <option value="backlog">Backlog</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>PRIORITY</label>
                <select 
                  className="plane-select"
                  style={{ width: '100%', marginTop: '3px', padding: '6px' }}
                  value={priority}
                  onChange={e => setPriority(e.target.value as IssuePriority)}
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>ESTIMATE</label>
                <select 
                  className="plane-select"
                  style={{ width: '100%', marginTop: '3px', padding: '6px' }}
                  value={storyPoints}
                  onChange={e => setStoryPoints(Number(e.target.value))}
                >
                  <option value={1}>1 Point</option>
                  <option value={2}>2 Points</option>
                  <option value={3}>3 Points</option>
                  <option value={5}>5 Points</option>
                  <option value={8}>8 Points</option>
                </select>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>ACCEPTANCE CRITERIA (1 PER LINE)</label>
                <button 
                  type="button" 
                  className="plane-btn plane-btn-secondary" 
                  style={{ padding: '2px 6px', fontSize: '10px', color: 'var(--plane-accent-blue)', borderColor: 'var(--plane-accent-blue)' }}
                  onClick={async () => {
                    if (!title) {
                      alert('Please enter a title first so the AI knows what to generate!');
                      return;
                    }
                    const btn = document.getElementById('ai-btn-text-new');
                    if (btn) btn.innerText = 'Generating...';
                    try {
                      const { api } = await import('../services/api');
                      const criteria = await api.generateIssueCriteria(title, description);
                      if (criteria && criteria.length > 0) {
                        setCriteriaText(prev => {
                          const existing = prev.trim() ? prev + '\n' : '';
                          return existing + criteria.join('\n');
                        });
                      }
                    } catch (e) {
                      console.error('Failed to generate criteria', e);
                      alert('Failed to generate criteria. Make sure the API key is set.');
                    }
                    if (btn) btn.innerText = '✨ AI Auto-Generate';
                  }}
                >
                  <span id="ai-btn-text-new">✨ AI Auto-Generate</span>
                </button>
              </div>
              <textarea 
                rows={2}
                style={{ background: 'var(--plane-bg-base)', border: '1px solid var(--plane-border-medium)', borderRadius: 'var(--plane-radius-sm)', padding: '6px 10px', width: '100%', marginTop: '3px', color: 'var(--plane-text-primary)', fontFamily: 'inherit', fontSize: '12px', outline: 'none' }}
                placeholder="e.g.&#10;Tested with sample payload&#10;Passes TypeScript build"
                value={criteriaText}
                onChange={e => setCriteriaText(e.target.value)}
              />
            </div>
          </div>

          <div className="plane-modal-footer">
            <button type="button" className="plane-btn plane-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="plane-btn plane-btn-primary">
              <Plus size={14} />
              <span>Create Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
