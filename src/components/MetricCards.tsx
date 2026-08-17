import React from 'react';
import { 
  CheckCircle2, 
  Flame, 
  GitBranch, 
  Server,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { Task, Epic } from '../data/initialTasks';

interface MetricCardsProps {
  tasks: Task[];
  epics: Epic[];
}

export default function MetricCards({ tasks, epics }: MetricCardsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'in_review').length;
  
  const totalPoints = tasks.reduce((acc, t) => acc + t.storyPoints, 0);
  const completedPoints = tasks.filter(t => t.status === 'done').reduce((acc, t) => acc + t.storyPoints, 0);
  
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pointsPercentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  // SVG Circular progress radius
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="metrics-grid">
      {/* 1. Overall Completion Card with Circular Ring */}
      <div className="metric-card" style={{ '--metric-color': 'var(--accent-cyan)' } as React.CSSProperties}>
        <div className="metric-icon-wrap">
          <div className="progress-ring-container">
            <svg width="56" height="56">
              <circle
                stroke="#1e293b"
                strokeWidth="4"
                fill="transparent"
                r={radius}
                cx="28"
                cy="28"
              />
              <circle
                stroke="var(--accent-cyan)"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx="28"
                cy="28"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <span className="progress-ring-text">{progressPercentage}%</span>
          </div>
        </div>
        <div className="metric-details">
          <div className="metric-label">Project Completion</div>
          <div className="metric-value">{completedTasks} / {totalTasks} Tasks</div>
          <div className="metric-subtext">
            <TrendingUp size={13} color="var(--accent-emerald)" />
            <span>{inProgressTasks} tasks active in sprint</span>
          </div>
        </div>
      </div>

      {/* 2. Story Points Burned */}
      <div className="metric-card" style={{ '--metric-color': 'var(--accent-primary)' } as React.CSSProperties}>
        <div className="metric-icon-wrap">
          <Flame size={26} />
        </div>
        <div className="metric-details">
          <div className="metric-label">Velocity & Story Points</div>
          <div className="metric-value">{completedPoints} / {totalPoints} pts</div>
          <div className="metric-subtext">
            <span>{pointsPercentage}% of total sprint scope delivered</span>
          </div>
        </div>
      </div>

      {/* 3. Epic Milestone Health */}
      <div className="metric-card" style={{ '--metric-color': 'var(--accent-amber)' } as React.CSSProperties}>
        <div className="metric-icon-wrap">
          <GitBranch size={26} />
        </div>
        <div className="metric-details">
          <div className="metric-label">Architecture Layers</div>
          <div className="metric-value">8 / 8 Active</div>
          <div className="metric-subtext">
            <CheckCircle2 size={13} color="var(--accent-emerald)" />
            <span>Ingestion, AI Sandbox & CI/CD on track</span>
          </div>
        </div>
      </div>

      {/* 4. CI/CD & Security Gate */}
      <div className="metric-card" style={{ '--metric-color': 'var(--accent-emerald)' } as React.CSSProperties}>
        <div className="metric-icon-wrap">
          <ShieldCheck size={26} />
        </div>
        <div className="metric-details">
          <div className="metric-label">Zero-Regression Gate</div>
          <div className="metric-value">Protected</div>
          <div className="metric-subtext">
            <span>Staging DB isolated from 5,000 students</span>
          </div>
        </div>
      </div>
    </div>
  );
}
