import React from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  HelpCircle,
  MoreHorizontal,
  ArrowRight,
  User
} from 'lucide-react';
import { Task, Epic } from '../data/initialTasks';

interface KanbanBoardProps {
  tasks: Task[];
  epics: Epic[];
  onTaskClick: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: Task['status']) => void;
  onOpenNewTask: () => void;
}

const COLUMNS: { id: Task['status']; label: string; color: string; icon: any }[] = [
  { id: 'backlog', label: 'Backlog', color: 'var(--text-muted)', icon: HelpCircle },
  { id: 'in_progress', label: 'In Development', color: 'var(--accent-primary)', icon: Clock },
  { id: 'in_review', label: 'In Testing / Review', color: 'var(--accent-amber)', icon: AlertCircle },
  { id: 'done', label: 'Completed & Verified', color: 'var(--accent-emerald)', icon: CheckCircle2 }
];

export default function KanbanBoard({ tasks, epics, onTaskClick, onUpdateStatus, onOpenNewTask }: KanbanBoardProps) {
  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        const colPoints = colTasks.reduce((sum, t) => sum + t.storyPoints, 0);
        const IconComponent = col.icon;

        return (
          <div key={col.id} className="kanban-column">
            {/* Column Header */}
            <div className="column-header">
              <div className="column-title-wrap">
                <IconComponent size={17} color={col.color} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{col.label}</span>
                <span className="column-badge">{colTasks.length}</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {colPoints} pts
              </span>
            </div>

            {/* Column Cards */}
            <div className="cards-container">
              {colTasks.map(task => {
                const epic = epics.find(e => e.id === task.epicId);

                return (
                  <div 
                    key={task.id} 
                    className="task-card"
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="task-card-header">
                      <span className="task-key">{task.key}</span>
                      <span className={`task-priority priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="task-title">
                      {task.title}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                      <span 
                        className="task-epic-pill"
                        style={{ 
                          background: epic ? `${epic.color}15` : undefined,
                          color: epic?.color || 'var(--accent-primary)',
                          border: epic ? `1px solid ${epic.color}30` : undefined
                        }}
                      >
                        {task.epicName.split('.')[1]?.trim() || task.epicName}
                      </span>
                      <span className="points-pill">{task.storyPoints} pts</span>
                    </div>

                    <div className="task-footer">
                      <div className="assignee-avatar">
                        <User size={13} color="var(--text-muted)" />
                        <span>{task.assignee.split(' ')[0]}</span>
                      </div>

                      {/* Quick Move Button */}
                      <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                        {col.id === 'backlog' && (
                          <button 
                            className="btn btn-secondary btn-sm"
                            title="Start Development"
                            onClick={() => onUpdateStatus(task.id, 'in_progress')}
                          >
                            <span>Start</span>
                            <ArrowRight size={11} />
                          </button>
                        )}
                        {col.id === 'in_progress' && (
                          <button 
                            className="btn btn-secondary btn-sm"
                            title="Move to Review"
                            onClick={() => onUpdateStatus(task.id, 'in_review')}
                          >
                            <span>Review</span>
                            <ArrowRight size={11} />
                          </button>
                        )}
                        {col.id === 'in_review' && (
                          <button 
                            className="btn btn-success btn-sm"
                            title="Verify and Complete"
                            onClick={() => onUpdateStatus(task.id, 'done')}
                          >
                            <CheckCircle2 size={11} />
                            <span>Done</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No tasks in {col.label.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
