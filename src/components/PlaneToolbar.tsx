import React from 'react';
import { 
  List, 
  Kanban, 
  Box, 
  Repeat, 
  BarChart2, 
  Search, 
  Users,
  Plus
} from 'lucide-react';
import { PlaneMember, PlaneModule } from '../data/planeData';

interface PlaneToolbarProps {
  activeView: 'list' | 'board' | 'modules' | 'cycles' | 'analytics' | 'members' | 'cicd';
  setActiveView: (view: 'list' | 'board' | 'modules' | 'cycles' | 'analytics' | 'members' | 'cicd') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedAssignee: string;
  setSelectedAssignee: (a: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;
  selectedModule: string;
  setSelectedModule: (m: string) => void;
  onOpenNewIssue: () => void;
  members?: PlaneMember[];
  modules?: PlaneModule[];
}

export default function PlaneToolbar({
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  selectedAssignee,
  setSelectedAssignee,
  selectedPriority,
  setSelectedPriority,
  selectedModule,
  setSelectedModule,
  onOpenNewIssue,
  members = [],
  modules = []
}: PlaneToolbarProps) {
  return (
    <div className="plane-toolbar">
      {/* View Switchers */}
      <div className="view-mode-tabs">
        <button 
          className={`view-mode-btn ${activeView === 'list' ? 'active' : ''}`}
          onClick={() => setActiveView('list')}
        >
          <List size={14} />
          <span>List</span>
        </button>

        <button 
          className={`view-mode-btn ${activeView === 'board' ? 'active' : ''}`}
          onClick={() => setActiveView('board')}
        >
          <Kanban size={14} />
          <span>Board</span>
        </button>

        <button 
          className={`view-mode-btn ${activeView === 'modules' ? 'active' : ''}`}
          onClick={() => setActiveView('modules')}
        >
          <Box size={14} />
          <span>Modules</span>
        </button>

        <button 
          className={`view-mode-btn ${activeView === 'cycles' ? 'active' : ''}`}
          onClick={() => setActiveView('cycles')}
        >
          <Repeat size={14} />
          <span>Cycles</span>
        </button>

        <button 
          className={`view-mode-btn ${activeView === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveView('analytics')}
        >
          <BarChart2 size={14} />
          <span>Analytics</span>
        </button>

        <button 
          className={`view-mode-btn ${activeView === 'members' ? 'active' : ''}`}
          onClick={() => setActiveView('members')}
        >
          <Users size={14} />
          <span>Team ({members.length})</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="toolbar-filters">
        {/* Search */}
        <div className="plane-search-box">
          <Search size={12} color="var(--plane-text-muted)" />
          <input 
            type="text"
            className="plane-search-input"
            placeholder="Search issues, keys..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Assignee Filter */}
        <select 
          className="plane-select"
          value={selectedAssignee}
          onChange={e => setSelectedAssignee(e.target.value)}
        >
          <option value="ALL">All Assignees</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {/* Priority Filter */}
        <select 
          className="plane-select"
          value={selectedPriority}
          onChange={e => setSelectedPriority(e.target.value)}
        >
          <option value="ALL">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Module Filter */}
        <select 
          className="plane-select"
          value={selectedModule}
          onChange={e => setSelectedModule(e.target.value)}
        >
          <option value="ALL">All Modules</option>
          {modules.map(m => (
            <option key={m.id} value={m.id}>{m.name.split(':')[0]}</option>
          ))}
        </select>

        <button 
          className="plane-btn plane-btn-primary" 
          onClick={onOpenNewIssue}
          style={{ padding: '3px 8px', fontSize: '12px' }}
        >
          <Plus size={13} />
          <span>New Issue</span>
        </button>
      </div>
    </div>
  );
}
