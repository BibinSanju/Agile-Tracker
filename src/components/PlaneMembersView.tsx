import React from 'react';
import { Users, UserPlus, CheckCircle2, Trash2, Mail, Briefcase } from 'lucide-react';
import { PlaneMember, PlaneIssue } from '../data/planeData';

interface PlaneMembersViewProps {
  members: PlaneMember[];
  issues: PlaneIssue[];
  onSelectMemberFilter: (memberId: string) => void;
  onOpenAddMember: () => void;
  onDeleteMember?: (memberId: string) => void;
}

export default function PlaneMembersView({
  members,
  issues,
  onSelectMemberFilter,
  onOpenAddMember,
  onDeleteMember
}: PlaneMembersViewProps) {
  return (
    <div className="plane-content-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--plane-text-primary)' }}>Team Members & Workload</h2>
          <p style={{ fontSize: '12px', color: 'var(--plane-text-muted)' }}>Onboard your junior batch developers, assign architectural tracks, and track real delivery progress</p>
        </div>

        <button className="plane-btn plane-btn-primary" onClick={onOpenAddMember}>
          <UserPlus size={14} />
          <span>Add Team Member</span>
        </button>
      </div>

      {members.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--plane-bg-sidebar)', borderRadius: 'var(--plane-radius-lg)', border: '1px solid var(--plane-border-subtle)', maxWidth: '440px', margin: '40px auto' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--plane-radius-md)', background: 'rgba(63, 123, 246, 0.12)', color: 'var(--plane-accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Users size={24} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--plane-text-primary)' }}>No Team Members Added Yet</h3>
          <p style={{ fontSize: '12.5px', color: 'var(--plane-text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
            Add your lead developers and junior developers with their real names, roles, and assigned architecture tracks.
          </p>
          <button className="plane-btn plane-btn-primary" style={{ marginTop: '16px' }} onClick={onOpenAddMember}>
            <UserPlus size={14} />
            <span>Add First Member</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
          {members.map(member => {
            const memberIssues = issues.filter(i => i.assigneeId === member.id);
            const doneIssues = memberIssues.filter(i => i.state === 'done').length;
            const totalPoints = memberIssues.reduce((sum, i) => sum + i.storyPoints, 0);
            const donePoints = memberIssues.filter(i => i.state === 'done').reduce((sum, i) => sum + i.storyPoints, 0);
            const percent = memberIssues.length > 0 ? Math.round((doneIssues / memberIssues.length) * 100) : 0;

            return (
              <div 
                key={member.id} 
                className="plane-box"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectMemberFilter(member.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div 
                      className="user-avatar" 
                      style={{ width: '34px', height: '34px', background: member.avatarColor, fontSize: '13px' }}
                    >
                      {member.avatarText}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--plane-text-primary)' }}>
                        {member.name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--plane-text-muted)' }}>
                        {member.role} • {member.email}
                      </div>
                    </div>
                  </div>

                  {onDeleteMember && (
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--plane-text-muted)', cursor: 'pointer', padding: '4px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Remove member ${member.name}?`)) {
                          onDeleteMember(member.id);
                        }
                      }}
                      title="Remove Member"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--plane-text-secondary)', background: 'var(--plane-bg-base)', padding: '6px 8px', borderRadius: 'var(--plane-radius-sm)', border: '1px solid var(--plane-border-subtle)' }}>
                  <strong>Assigned Track:</strong> {member.assignedTrack}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--plane-text-secondary)' }}>
                      {doneIssues} / {memberIssues.length} issues completed ({percent}%)
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--plane-text-muted)' }}>
                      {donePoints} / {totalPoints} pts
                    </span>
                  </div>
                  <div className="progress-bar-thin">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${percent}%`, background: percent === 100 ? 'var(--plane-accent-emerald)' : member.avatarColor }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
