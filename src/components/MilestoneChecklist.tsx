import React from 'react';
import { Check, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, Epic } from '../data/initialTasks';

interface MilestoneChecklistProps {
  tasks: Task[];
  epics: Epic[];
  onToggleTask: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
}

export default function MilestoneChecklist({ tasks, epics, onToggleTask, onTaskClick }: MilestoneChecklistProps) {
  const handleToggle = (taskId: string, currentStatus: Task['status'], epicTasks: Task[]) => {
    onToggleTask(taskId);
    
    // Check if toggling this will make the epic 100% complete
    const remaining = epicTasks.filter(t => t.id !== taskId && t.status !== 'done');
    if (currentStatus !== 'done' && remaining.length === 0) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="checklist-view">
      {epics.map(epic => {
        const epicTasks = tasks.filter(t => t.epicId === epic.id);
        const completedCount = epicTasks.filter(t => t.status === 'done').length;
        const totalCount = epicTasks.length;
        const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return (
          <div key={epic.id} className="epic-group-card">
            {/* Epic Header */}
            <div className="epic-group-header">
              <div className="epic-info">
                <span 
                  className="epic-code-badge"
                  style={{ background: epic.color }}
                >
                  {epic.code}
                </span>
                <div>
                  <h3 className="epic-name">{epic.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {epic.description}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: percent === 100 ? 'var(--accent-emerald)' : 'var(--text-secondary)' }}>
                  {completedCount}/{totalCount} Completed ({percent}%)
                </span>
                <div className="epic-progress-bar-container">
                  <div 
                    className="epic-progress-bar"
                    style={{ 
                      width: `${percent}%`,
                      background: percent === 100 ? 'var(--accent-emerald)' : epic.color
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Tasks in Epic */}
            <div className="task-checklist-items">
              {epicTasks.map(task => {
                const isCompleted = task.status === 'done';

                return (
                  <div key={task.id} className="checklist-item">
                    <div className="checklist-left">
                      {/* Interactive Checkbox */}
                      <div 
                        className={`custom-checkbox ${isCompleted ? 'checked' : ''}`}
                        onClick={() => handleToggle(task.id, task.status, epicTasks)}
                        title={isCompleted ? 'Click to mark uncompleted' : 'Click to complete'}
                      >
                        {isCompleted && <Check size={14} strokeWidth={3} />}
                      </div>

                      <div 
                        style={{ cursor: 'pointer', flex: 1 }}
                        onClick={() => onTaskClick(task)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="task-key" style={{ fontSize: '0.75rem' }}>{task.key}</span>
                          <span className={`checklist-title ${isCompleted ? 'completed' : ''}`}>
                            {task.title}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {task.description.substring(0, 100)}...
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={`task-priority priority-${task.priority}`}>
                        {task.priority}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {task.assignee.split(' ')[0]}
                      </span>
                      <span className="points-pill">
                        {task.storyPoints} pts
                      </span>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem' }}
                        onClick={() => onTaskClick(task)}
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {epicTasks.length === 0 && (
                <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                  No tasks assigned to this layer yet.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
