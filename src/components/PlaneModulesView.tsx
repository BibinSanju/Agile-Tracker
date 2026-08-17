import React from 'react';
import { Box, Plus, ChevronRight, Trash2 } from 'lucide-react';
import { PlaneModule, PlaneIssue, PlaneMember } from '../data/planeData';

interface PlaneModulesViewProps {
  modules: PlaneModule[];
  issues: PlaneIssue[];
  members: PlaneMember[];
  onSelectModuleFilter: (moduleId: string) => void;
  onOpenAddModule: () => void;
  onDeleteModule?: (moduleId: string) => void;
}

export default function PlaneModulesView({
  modules,
  issues,
  members,
  onSelectModuleFilter,
  onOpenAddModule,
  onDeleteModule
}: PlaneModulesViewProps) {
  return (
    <div className="plane-content-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--plane-text-primary)' }}>Architecture Modules & Scope</h2>
          <p style={{ fontSize: '12px', color: 'var(--plane-text-muted)' }}>The core architectural components powering the ingestion, deduplication, compilation, and delivery engine</p>
        </div>

        <button className="plane-btn plane-btn-primary" onClick={onOpenAddModule}>
          <Plus size={14} />
          <span>New Module</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {modules.map(module => {
          const modIssues = issues.filter(i => i.moduleId === module.id);
          const doneIssues = modIssues.filter(i => i.state === 'done').length;
          const totalIssues = modIssues.length;
          const percent = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;
          
          const totalPoints = modIssues.reduce((sum, i) => sum + i.storyPoints, 0);
          const donePoints = modIssues.filter(i => i.state === 'done').reduce((sum, i) => sum + i.storyPoints, 0);

          const lead = members.find(m => m.id === module.leadId);

          return (
            <div 
              key={module.id} 
              className="plane-box"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectModuleFilter(module.id)}
            >
              <div className="plane-box-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: 'var(--plane-radius-sm)', background: 'rgba(63, 123, 246, 0.15)', color: 'var(--plane-accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--plane-text-primary)' }}>{module.name}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--plane-text-muted)', marginTop: '2px' }}>{module.description}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: percent === 100 ? 'var(--plane-accent-emerald)' : 'var(--plane-text-primary)' }}>
                      {doneIssues} / {totalIssues} issues ({percent}%)
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--plane-text-muted)' }}>
                      {donePoints} / {totalPoints} pts
                    </div>
                  </div>

                  {onDeleteModule && (
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--plane-text-muted)', cursor: 'pointer', padding: '4px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete module ${module.name}?`)) {
                          onDeleteModule(module.id);
                        }
                      }}
                      title="Delete Module"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  <ChevronRight size={16} color="var(--plane-text-muted)" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="progress-bar-thin">
                <div 
                  className="progress-bar-fill"
                  style={{ 
                    width: `${percent}%`, 
                    background: percent === 100 ? 'var(--plane-accent-emerald)' : 'var(--plane-accent-blue)' 
                  }}
                />
              </div>

              {/* Footer Lead info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--plane-text-muted)', paddingTop: '4px' }}>
                <span className="module-badge">{module.layer}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>Lead:</span>
                  <span style={{ color: 'var(--plane-text-secondary)', fontWeight: 500 }}>{lead?.name || 'Unassigned'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
