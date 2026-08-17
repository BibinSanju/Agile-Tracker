import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  User, 
  Tag, 
  Flame, 
  Layers, 
  ArrowRight,
  Trash2
} from 'lucide-react';
import { Task, Epic } from '../data/initialTasks';

interface TaskModalProps {
  task: Task | null;
  epics: Epic[];
  onClose: () => void;
  onUpdateStatus: (taskId: string, newStatus: Task['status']) => void;
  onDeleteTask?: (taskId: string) => void;
}

export default function TaskModal({ task, epics, onClose, onUpdateStatus, onDeleteTask }: TaskModalProps) {
  if (!task) return null;

  const epic = epics.find(e => e.id === task.epicId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="task-key" style={{ fontSize: '0.9rem' }}>{task.key}</span>
            <span className={`task-priority priority-${task.priority}`}>
              {task.priority} Priority
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3 }}>{task.title}</h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '0.5rem 0' }}>
            <span className="task-epic-pill" style={{ background: epic ? `${epic.color}20` : undefined, color: epic?.color }}>
              {task.epicName}
            </span>
            <span className="badge-tag">
              {task.architectureLayer}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Architecture Context</label>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', lineHeight: 1.6 }}>
              {task.description}
            </p>
          </div>

          {/* Acceptance Criteria */}
          {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
            <div className="form-group">
              <label className="form-label">Acceptance Criteria (Definition of Done)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {task.acceptanceCriteria.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={15} color="var(--accent-emerald)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '0.5rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Lead</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                {task.assignee} ({task.assigneeRole})
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Story Points</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '0.15rem' }}>
                {task.storyPoints} Points (Est: {task.storyPoints * 2} hrs)
              </div>
            </div>
          </div>
        </div>

        {/* Footer & Quick State Actions */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {onDeleteTask && (
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                onClick={() => {
                  onDeleteTask(task.id);
                  onClose();
                }}
              >
                <Trash2 size={14} />
                <span>Delete Task</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {task.status !== 'in_progress' && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onUpdateStatus(task.id, 'in_progress')}
              >
                <span>Move to In Progress</span>
              </button>
            )}
            {task.status !== 'in_review' && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onUpdateStatus(task.id, 'in_review')}
              >
                <span>Move to In Review</span>
              </button>
            )}
            {task.status !== 'done' && (
              <button 
                className="btn btn-success btn-sm"
                onClick={() => onUpdateStatus(task.id, 'done')}
              >
                <CheckCircle2 size={14} />
                <span>Mark as Done</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
