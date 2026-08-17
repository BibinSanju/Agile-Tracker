import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Layers, 
  Repeat, 
  Box, 
  BarChart2, 
  GitBranch, 
  Inbox, 
  Users, 
  Plus, 
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2
} from 'lucide-react';
import { PlaneIssue } from '../data/planeData';

interface PlaneSidebarProps {
  issues: PlaneIssue[];
  activeView: 'list' | 'board' | 'modules' | 'cycles' | 'analytics' | 'members' | 'cicd';
  setActiveView: (view: 'list' | 'board' | 'modules' | 'cycles' | 'analytics' | 'members' | 'cicd') => void;
  onOpenNewIssue: () => void;
}

export default function PlaneSidebar({ issues, activeView, setActiveView, onOpenNewIssue }: PlaneSidebarProps) {
  const location = useLocation();
  const isStaging = location.pathname === '/staging';

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('plane_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('plane_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Keyboard shortcut '[' or 'Ctrl+B' to toggle collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '[' || (e.ctrlKey && e.key === 'b')) && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalIssues = issues.length;

  return (
    <aside className={`plane-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Workspace Header */}
      <div className="workspace-header">
        <div 
          className="workspace-badge" 
          onClick={isCollapsed ? toggleCollapse : undefined}
          title={isCollapsed ? 'Click to expand sidebar' : 'IntelX Engineering'}
        >
          <div className="workspace-avatar">IX</div>
          <div>
            <div className="workspace-name">IntelX Engineering</div>
            <div className="workspace-subtext" style={{ fontSize: '10.5px', color: 'var(--plane-text-muted)', lineHeight: 1 }}>Placement Portal</div>
          </div>
        </div>

        <div className="workspace-header-right">
          <button 
            className="sidebar-toggle-btn" 
            onClick={toggleCollapse} 
            title={isCollapsed ? 'Expand sidebar ([)' : 'Collapse sidebar ([)'}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </div>

      {/* Quick Action Button */}
      <button 
        className="sidebar-new-issue-btn" 
        onClick={onOpenNewIssue}
        title="Create New Issue (C)"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} color="var(--plane-accent-blue)" />
          <span className="new-issue-text">New Issue</span>
        </div>
        <span className="kbd-shortcut">C</span>
      </button>

      {/* Navigation Sections */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">PROJECT VIEWS</div>

        <button 
          className={`sidebar-link ${!isStaging && (activeView === 'list' || activeView === 'board') ? 'active' : ''}`}
          onClick={() => {
            if (isStaging) window.location.href = '/';
            else if (activeView !== 'list' && activeView !== 'board') setActiveView('list');
          }}
          title="Issues (List & Board)"
        >
          <div className="sidebar-link-left">
            <Layers size={16} />
            <span className="sidebar-link-text">Issues</span>
          </div>
          <span className="sidebar-count-badge">{totalIssues}</span>
        </button>

        <button 
          className={`sidebar-link ${!isStaging && activeView === 'cycles' ? 'active' : ''}`}
          onClick={() => {
            if (isStaging) window.location.href = '/';
            setActiveView('cycles');
          }}
          title="Cycles (Sprints)"
        >
          <div className="sidebar-link-left">
            <Repeat size={16} />
            <span className="sidebar-link-text">Cycles (Sprints)</span>
          </div>
          <span className="sidebar-count-badge" style={{ color: 'var(--plane-accent-amber)' }}>1 Active</span>
        </button>

        <button 
          className={`sidebar-link ${!isStaging && activeView === 'modules' ? 'active' : ''}`}
          onClick={() => {
            if (isStaging) window.location.href = '/';
            setActiveView('modules');
          }}
          title="Architecture Modules"
        >
          <div className="sidebar-link-left">
            <Box size={16} />
            <span className="sidebar-link-text">Modules (8 Layers)</span>
          </div>
          <span className="sidebar-count-badge">8</span>
        </button>

        <button 
          className={`sidebar-link ${!isStaging && activeView === 'analytics' ? 'active' : ''}`}
          onClick={() => {
            if (isStaging) window.location.href = '/';
            setActiveView('analytics');
          }}
          title="Analytics & Progress"
        >
          <div className="sidebar-link-left">
            <BarChart2 size={16} />
            <span className="sidebar-link-text">Analytics & Scope</span>
          </div>
        </button>

        <div className="nav-section-title" style={{ marginTop: '8px' }}>QUALITY & PIPELINE</div>

        <button 
          className={`sidebar-link ${!isStaging && activeView === 'cicd' ? 'active' : ''}`}
          onClick={() => {
            if (isStaging) window.location.href = '/';
            setActiveView('cicd');
          }}
          title="CI/CD Workflows"
        >
          <div className="sidebar-link-left">
            <GitBranch size={16} />
            <span className="sidebar-link-text">CI/CD Workflows</span>
          </div>
          <span className="sidebar-count-badge" style={{ color: 'var(--plane-accent-emerald)', background: 'rgba(16, 185, 129, 0.15)' }}>Passing</span>
        </button>

        <Link 
          to="/staging"
          className={`sidebar-link ${isStaging ? 'active' : ''}`}
          title="Faculty Review Queue & Moodle XML"
        >
          <div className="sidebar-link-left">
            <Inbox size={16} />
            <span className="sidebar-link-text">Staging Review Queue</span>
          </div>
          <span className="sidebar-count-badge" style={{ color: 'var(--plane-accent-cyan)' }}>Faculty UI</span>
        </Link>

        <div className="nav-section-title" style={{ marginTop: '8px' }}>TEAM MEMBERS</div>

        <button 
          className={`sidebar-link ${!isStaging && activeView === 'members' ? 'active' : ''}`}
          onClick={() => {
            if (isStaging) window.location.href = '/';
            setActiveView('members');
          }}
          title="Team & Member Workload"
        >
          <div className="sidebar-link-left">
            <Users size={16} />
            <span className="sidebar-link-text">Team & Allocation</span>
          </div>
          <span className="sidebar-count-badge">6</span>
        </button>
      </nav>

      {/* Footer User Profile */}
      <div className="sidebar-footer">
        <div 
          className="user-profile-summary"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Click to expand sidebar' : 'Bibin (Lead Architect)'}
          style={{ cursor: 'pointer' }}
        >
          <div className="user-avatar" style={{ background: '#3f7bf6' }}>B</div>
          <div className="user-details">
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--plane-text-primary)' }}>Bibin (Lead)</div>
            <div style={{ fontSize: '10.5px', color: 'var(--plane-text-muted)' }}>Lead Architect</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
