import React from 'react';
import { User, CheckCircle2, Clock, Award, Shield } from 'lucide-react';
import { Task } from '../data/initialTasks';

interface JuniorDelegationTableProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

interface Member {
  name: string;
  role: string;
  track: string;
  badgeColor: string;
}

const MEMBERS: Member[] = [
  { name: 'Lead Dev (Bibin)', role: 'Lead Architect & Systems', track: 'Architecture, Moodle XML & CI/CD Gate', badgeColor: 'var(--accent-cyan)' },
  { name: 'Junior 1 (Arun)', role: 'Scraper Specialist', track: 'LeetCode & API Ingestion Adapters', badgeColor: 'var(--accent-primary)' },
  { name: 'Junior 2 (Dinesh)', role: 'Data Ingestion Dev', track: 'Codeforces, CSES & Archives', badgeColor: '#38bdf8' },
  { name: 'Junior 3 (Harish)', role: 'AI/ML Engineer', track: 'RTX 5070 Local Embeddings & Taxonomy', badgeColor: '#c084fc' },
  { name: 'Junior 4 (Karthik)', role: 'DevOps & Sandbox', track: 'Docker Isolated Sandbox & 10/10 Verification', badgeColor: '#f43f5e' },
  { name: 'Junior 5 (Sanjay)', role: 'Frontend & QA', track: 'Faculty Staging UI & Playwright E2E Tests', badgeColor: '#10b981' }
];

export default function JuniorDelegationTable({ tasks, onTaskClick }: JuniorDelegationTableProps) {
  return (
    <div className="delegation-table-container">
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Team Ownership & Junior Delegation Matrix</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Track allocations for Sunday/Monday sprint leading into Tuesday Kovion showcase
          </p>
        </div>
        <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
          6 Team Leads Active
        </span>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Member / Lead</th>
              <th>Assigned Track & Scope</th>
              <th>Task Count</th>
              <th>Story Points</th>
              <th>Status & Progress</th>
            </tr>
          </thead>
          <tbody>
            {MEMBERS.map(member => {
              const memberTasks = tasks.filter(t => t.assignee.includes(member.name.split(' ')[0]) || t.assignee === member.name);
              const doneCount = memberTasks.filter(t => t.status === 'done').length;
              const totalPoints = memberTasks.reduce((acc, t) => acc + t.storyPoints, 0);
              const donePoints = memberTasks.filter(t => t.status === 'done').reduce((acc, t) => acc + t.storyPoints, 0);
              const percent = memberTasks.length > 0 ? Math.round((doneCount / memberTasks.length) * 100) : 0;

              return (
                <tr key={member.name}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div 
                        style={{ 
                          width: '34px', 
                          height: '34px', 
                          borderRadius: 'var(--radius-full)', 
                          background: `${member.badgeColor}20`, 
                          color: member.badgeColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.role}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {member.track}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {doneCount} / {memberTasks.length}
                    </span>
                  </td>

                  <td>
                    <span className="points-pill">
                      {donePoints} / {totalPoints} pts
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '100px', height: '6px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${percent}%`, 
                            height: '100%', 
                            background: percent === 100 ? 'var(--accent-emerald)' : member.badgeColor,
                            borderRadius: 'var(--radius-full)'
                          }} 
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: percent === 100 ? 'var(--accent-emerald)' : 'var(--text-secondary)' }}>
                        {percent}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
