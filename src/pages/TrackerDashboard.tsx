import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_MODULES, 
  DEFAULT_CYCLES, 
  SEED_ARCHITECTURE_ISSUES, 
  PlaneIssue, 
  PlaneMember, 
  PlaneModule, 
  PlaneCycle, 
  IssueState, 
  IssuePriority 
} from '../data/planeData';
import PlaneSidebar from '../components/PlaneSidebar';
import PlaneHeader from '../components/PlaneHeader';
import PlaneToolbar from '../components/PlaneToolbar';
import PlaneListView from '../components/PlaneListView';
import PlaneKanbanView from '../components/PlaneKanbanView';
import PlaneModulesView from '../components/PlaneModulesView';
import PlaneCyclesView from '../components/PlaneCyclesView';
import PlaneAnalyticsView from '../components/PlaneAnalyticsView';
import PlaneMembersView from '../components/PlaneMembersView';
import PlaneCICDView from '../components/PlaneCICDView';
import PlaneIssueModal from '../components/PlaneIssueModal';
import PlaneNewIssueModal from '../components/PlaneNewIssueModal';
import AddMemberModal from '../components/AddMemberModal';
import AddModuleModal from '../components/AddModuleModal';
import AddCycleModal from '../components/AddCycleModal';
import { api } from '../services/api';

const STORAGE_ISSUES_KEY = 'plane_real_issues_v4';
const STORAGE_MEMBERS_KEY = 'plane_real_members_v4';
const STORAGE_MODULES_KEY = 'plane_real_modules_v4';
const STORAGE_CYCLES_KEY = 'plane_real_cycles_v4';

export default function TrackerDashboard() {
  // Real Project Issues
  const [issues, setIssues] = useState<PlaneIssue[]>(() => {
    const saved = localStorage.getItem(STORAGE_ISSUES_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return SEED_ARCHITECTURE_ISSUES;
  });

  // Real Team Members (Initially 0 or user-configured)
  const [members, setMembers] = useState<PlaneMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_MEMBERS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  // Load from Backend API on mount if available
  useEffect(() => {
    async function syncBackend() {
      try {
        const [serverIssues, serverMembers, serverModules, serverCycles] = await Promise.all([
          api.getIssues(),
          api.getMembers(),
          api.getModules(),
          api.getCycles()
        ]);
        if (serverIssues !== null) setIssues(serverIssues);
        if (serverMembers !== null) setMembers(serverMembers);
        if (serverModules !== null) setModules(serverModules);
        if (serverCycles !== null) setCycles(serverCycles);
      } catch (e) {
        console.warn('Backend offline, using local storage.');
      }
    }
    syncBackend();
  }, []);

  // Real Modules
  const [modules, setModules] = useState<PlaneModule[]>(() => {
    const saved = localStorage.getItem(STORAGE_MODULES_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_MODULES;
  });

  // Real Cycles
  const [cycles, setCycles] = useState<PlaneCycle[]>(() => {
    const saved = localStorage.getItem(STORAGE_CYCLES_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_CYCLES;
  });

  const [activeView, setActiveView] = useState<'list' | 'board' | 'modules' | 'cycles' | 'analytics' | 'members' | 'cicd'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedModule, setSelectedModule] = useState('ALL');

  // Modals state
  const [selectedIssue, setSelectedIssue] = useState<PlaneIssue | null>(null);
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddCycleOpen, setIsAddCycleOpen] = useState(false);

  // Keyboard shortcut 'C' for new issue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'c' || e.key === 'C') && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsNewIssueOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_ISSUES_KEY, JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_MODULES_KEY, JSON.stringify(modules));
  }, [modules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_CYCLES_KEY, JSON.stringify(cycles));
  }, [cycles]);

  // Filtered issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssignee = selectedAssignee === 'ALL' || issue.assigneeId === selectedAssignee;
    const matchesPriority = selectedPriority === 'ALL' || issue.priority === selectedPriority;
    const matchesModule = selectedModule === 'ALL' || issue.moduleId === selectedModule;
    return matchesSearch && matchesAssignee && matchesPriority && matchesModule;
  });

  // Issue Handlers
  const handleUpdateState = (issueId: string, newState: IssueState) => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, state: newState, updatedAt: new Date().toISOString().split('T')[0] } : i));
    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue(prev => prev ? { ...prev, state: newState } : null);
    }
    api.updateIssue(issueId, { state: newState });
  };

  const handleUpdatePriority = (issueId: string, newPriority: IssuePriority) => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, priority: newPriority } : i));
    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue(prev => prev ? { ...prev, priority: newPriority } : null);
    }
    api.updateIssue(issueId, { priority: newPriority });
  };

  const handleUpdateAssignee = (issueId: string, newAssigneeId: string) => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, assigneeId: newAssigneeId } : i));
    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue(prev => prev ? { ...prev, assigneeId: newAssigneeId } : null);
    }
    api.updateIssue(issueId, { assigneeId: newAssigneeId });
  };

  const handleToggleCriteria = (issueId: string, criteriaId: string) => {
    setIssues(prev => prev.map(i => {
      if (i.id === issueId) {
        const updatedCriteria = i.acceptanceCriteria.map(c => c.id === criteriaId ? { ...c, completed: !c.completed } : c);
        api.updateIssue(issueId, { acceptanceCriteria: updatedCriteria });
        return {
          ...i,
          acceptanceCriteria: updatedCriteria
        };
      }
      return i;
    }));

    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue(prev => prev ? {
        ...prev,
        acceptanceCriteria: prev.acceptanceCriteria.map(c => c.id === criteriaId ? { ...c, completed: !c.completed } : c)
      } : null);
    }
  };

  const handleAddCriteria = (issueId: string, text: string) => {
    const newCriteria = { id: `c-${Date.now()}`, text, completed: false };
    setIssues(prev => prev.map(i => {
      if (i.id === issueId) {
        const updated = [...i.acceptanceCriteria, newCriteria];
        api.updateIssue(issueId, { acceptanceCriteria: updated });
        return { ...i, acceptanceCriteria: updated };
      }
      return i;
    }));
    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue(prev => prev ? { ...prev, acceptanceCriteria: [...prev.acceptanceCriteria, newCriteria] } : null);
    }
  };

  const handleAddIssue = (newIssueData: Omit<PlaneIssue, 'id' | 'sequenceId' | 'key' | 'createdAt' | 'updatedAt'>) => {
    const nextSeq = issues.length + 1;
    const newIssue: PlaneIssue = {
      ...newIssueData,
      id: `iss-${Date.now()}`,
      sequenceId: nextSeq,
      key: `PRTL-${nextSeq}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setIssues(prev => [newIssue, ...prev]);
    api.createIssue(newIssue).then(realIssue => {
      if (realIssue) {
        setIssues(prev => prev.map(i => i.id === newIssue.id ? realIssue : i));
      }
    });
  };

  const handleDeleteIssue = (issueId: string) => {
    setIssues(prev => prev.filter(i => i.id !== issueId));
    setSelectedIssue(null);
    api.deleteIssue(issueId);
  };

  // Member Handlers
  const handleAddMember = (newMemberData: Omit<PlaneMember, 'id' | 'avatarText' | 'createdAt'>) => {
    const newMember: PlaneMember = {
      ...newMemberData,
      id: `usr-${Date.now()}`,
      avatarText: newMemberData.name.charAt(0).toUpperCase(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setMembers(prev => [...prev, newMember]);
    api.createMember(newMember).then(realMember => {
      if (realMember) {
        setMembers(prev => prev.map(m => m.id === newMember.id ? realMember : m));
      }
    });
  };

  const handleDeleteMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
    // Unassign issues assigned to this member
    setIssues(prev => prev.map(i => i.assigneeId === memberId ? { ...i, assigneeId: '' } : i));
    api.deleteMember(memberId);
  };

  // Module Handlers
  const handleAddModule = (newModuleData: Omit<PlaneModule, 'id' | 'createdAt'>) => {
    const newModule: PlaneModule = {
      ...newModuleData,
      id: `mod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setModules(prev => [...prev, newModule]);
    api.createModule(newModule).then(realModule => {
      if (realModule) {
        setModules(prev => prev.map(m => m.id === newModule.id ? realModule : m));
      }
    });
  };

  const handleDeleteModule = (moduleId: string) => {
    setModules(prev => prev.filter(m => m.id !== moduleId));
  };

  // Cycle Handlers
  const handleAddCycle = (newCycleData: Omit<PlaneCycle, 'id' | 'createdAt'>) => {
    const newCycle: PlaneCycle = {
      ...newCycleData,
      id: `cycle-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCycles(prev => [...prev, newCycle]);
    api.createCycle(newCycle).then(realCycle => {
      if (realCycle) {
        setCycles(prev => prev.map(c => c.id === newCycle.id ? realCycle : c));
      }
    });
  };

  // 1-Click Load Blueprint
  const handleSeedBlueprint = () => {
    setIssues(SEED_ARCHITECTURE_ISSUES);
  };

  // Export JSON
  const handleExportJSON = () => {
    const projectData = {
      workspace: 'IntelX Engineering',
      project: 'Placement Ingestion & CI/CD Platform',
      exportedAt: new Date().toISOString(),
      issues,
      members,
      modules,
      cycles
    };
    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plane_intelx_project_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'list': return `Issues (${issues.length})`;
      case 'board': return 'Sprint Board';
      case 'modules': return `Modules (${modules.length})`;
      case 'cycles': return `Cycles (${cycles.length})`;
      case 'analytics': return 'Project Scope & Analytics';
      case 'members': return `Team Members (${members.length})`;
      case 'cicd': return 'CI/CD Quality Gate Workflows';
      default: return 'Issues';
    }
  };

  return (
    <div className="plane-app">
      {/* Plane Sidebar */}
      <PlaneSidebar 
        issues={issues}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenNewIssue={() => setIsNewIssueOpen(true)}
      />

      {/* Main Container */}
      <div className="plane-main">
        {/* Header */}
        <PlaneHeader 
          currentViewTitle={getViewTitle()}
          onExportJSON={handleExportJSON}
        />

        {/* Toolbar */}
        <PlaneToolbar 
          activeView={activeView}
          setActiveView={setActiveView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedAssignee={selectedAssignee}
          setSelectedAssignee={setSelectedAssignee}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          selectedModule={selectedModule}
          setSelectedModule={setSelectedModule}
          onOpenNewIssue={() => setIsNewIssueOpen(true)}
          members={members}
          modules={modules}
        />

        {/* Views */}
        {activeView === 'list' && (
          <PlaneListView 
            issues={filteredIssues}
            modules={modules}
            members={members}
            onIssueClick={issue => setSelectedIssue(issue)}
            onUpdateState={handleUpdateState}
            onOpenNewIssue={() => setIsNewIssueOpen(true)}
            onSeedBlueprint={issues.length === 0 ? handleSeedBlueprint : undefined}
          />
        )}

        {activeView === 'board' && (
          <PlaneKanbanView 
            issues={filteredIssues}
            modules={modules}
            members={members}
            onIssueClick={issue => setSelectedIssue(issue)}
            onUpdateState={handleUpdateState}
          />
        )}

        {activeView === 'modules' && (
          <PlaneModulesView 
            modules={modules}
            issues={issues}
            members={members}
            onSelectModuleFilter={(modId) => {
              setSelectedModule(modId);
              setActiveView('list');
            }}
            onOpenAddModule={() => setIsAddModuleOpen(true)}
            onDeleteModule={handleDeleteModule}
          />
        )}

        {activeView === 'cycles' && (
          <PlaneCyclesView 
            cycles={cycles}
            issues={issues}
            members={members}
            onOpenAddCycle={() => setIsAddCycleOpen(true)}
          />
        )}

        {activeView === 'analytics' && (
          <PlaneAnalyticsView 
            issues={issues}
            modules={modules}
            members={members}
            cycle={cycles[0] || DEFAULT_CYCLES[0]}
          />
        )}

        {activeView === 'members' && (
          <PlaneMembersView 
            members={members}
            issues={issues}
            onSelectMemberFilter={(memberId) => {
              setSelectedAssignee(memberId);
              setActiveView('list');
            }}
            onOpenAddMember={() => setIsAddMemberOpen(true)}
            onDeleteMember={handleDeleteMember}
          />
        )}

        {activeView === 'cicd' && (
          <PlaneCICDView />
        )}
      </div>

      {/* Modals */}
      {selectedIssue && (
        <PlaneIssueModal 
          issue={selectedIssue}
          modules={modules}
          members={members}
          onClose={() => setSelectedIssue(null)}
          onUpdateState={handleUpdateState}
          onUpdatePriority={handleUpdatePriority}
          onUpdateAssignee={handleUpdateAssignee}
          onToggleCriteria={handleToggleCriteria}
          onAddCriteria={handleAddCriteria}
          onDeleteIssue={handleDeleteIssue}
        />
      )}

      {isNewIssueOpen && (
        <PlaneNewIssueModal 
          modules={modules}
          members={members}
          cycles={cycles}
          onClose={() => setIsNewIssueOpen(false)}
          onAddIssue={handleAddIssue}
        />
      )}

      {isAddMemberOpen && (
        <AddMemberModal 
          onClose={() => setIsAddMemberOpen(false)}
          onAddMember={handleAddMember}
        />
      )}

      {isAddModuleOpen && (
        <AddModuleModal 
          members={members}
          onClose={() => setIsAddModuleOpen(false)}
          onAddModule={handleAddModule}
        />
      )}

      {isAddCycleOpen && (
        <AddCycleModal 
          onClose={() => setIsAddCycleOpen(false)}
          onAddCycle={handleAddCycle}
        />
      )}
    </div>
  );
}
