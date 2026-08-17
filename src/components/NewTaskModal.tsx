import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Task, Epic } from '../data/initialTasks';

interface NewTaskModalProps {
  epics: Epic[];
  onClose: () => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'key' | 'createdAt'>) => void;
}

export default function NewTaskModal({ epics, onClose, onAddTask }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [epicId, setEpicId] = useState(epics[0]?.id || 'epic-1');
  const [status, setStatus] = useState<Task['status']>('backlog');
  const [assignee, setAssignee] = useState('Lead Dev (Bibin)');
  const [storyPoints, setStoryPoints] = useState(3);
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [criteriaText, setCriteriaText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedEpic = epics.find(e => e.id === epicId);
    const criteriaList = criteriaText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      epicId,
      epicName: selectedEpic?.name || 'General',
      status,
      assignee,
      assigneeRole: assignee.includes('Bibin') ? 'Lead Architect' : 'Developer',
      storyPoints: Number(storyPoints),
      priority,
      architectureLayer: selectedEpic?.layer || 'General',
      acceptanceCriteria: criteriaList.length > 0 ? criteriaList : ['Code written and unit tested', 'Passes CI/CD verification']
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Add New Engineering Task</h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Build Playwright E2E test for Moodle XML download" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description & Architecture Context</label>
              <textarea 
                className="form-textarea" 
                rows={3}
                placeholder="Describe what needs to be implemented and how it connects to the architecture..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Associated Epic / Layer</label>
                <select 
                  className="form-select"
                  value={epicId}
                  onChange={e => setEpicId(e.target.value)}
                >
                  {epics.map(epic => (
                    <option key={epic.id} value={epic.id}>
                      {epic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select 
                  className="form-select"
                  value={assignee}
                  onChange={e => setAssignee(e.target.value)}
                >
                  <option value="Lead Dev (Bibin)">Lead Dev (Bibin)</option>
                  <option value="Junior 1 (Arun)">Junior 1 (Arun - Scrapers)</option>
                  <option value="Junior 2 (Dinesh)">Junior 2 (Dinesh - Ingestion)</option>
                  <option value="Junior 3 (Harish)">Junior 3 (Harish - AI / Embeddings)</option>
                  <option value="Junior 4 (Karthik)">Junior 4 (Karthik - Sandbox)</option>
                  <option value="Junior 5 (Sanjay)">Junior 5 (Sanjay - UI / Playwright)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select 
                  className="form-select"
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                >
                  <option value="backlog">Backlog</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Story Points</label>
                <select 
                  className="form-select"
                  value={storyPoints}
                  onChange={e => setStoryPoints(Number(e.target.value))}
                >
                  <option value={1}>1 pt (Small)</option>
                  <option value={2}>2 pts (Quick)</option>
                  <option value={3}>3 pts (Standard)</option>
                  <option value={5}>5 pts (Complex)</option>
                  <option value={8}>8 pts (Epic Scope)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select 
                  className="form-select"
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Acceptance Criteria (1 per line)</label>
              <textarea 
                className="form-textarea" 
                rows={2}
                placeholder="e.g.&#10;Tested on local runner&#10;Passes CI check"
                value={criteriaText}
                onChange={e => setCriteriaText(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
