import React, { useState } from 'react';
import { X, UserPlus, Mail, Shield, Briefcase } from 'lucide-react';
import { PlaneMember } from '../data/planeData';

interface AddMemberModalProps {
  onClose: () => void;
  onAddMember: (member: Omit<PlaneMember, 'id' | 'avatarText' | 'createdAt'>) => void;
}

const AVATAR_COLORS = [
  '#3f7bf6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'
];

export default function AddMemberModal({ onClose, onAddMember }: AddMemberModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Junior Developer');
  const [assignedTrack, setAssignedTrack] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMember({
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@intelx.college.edu`,
      role: role.trim(),
      avatarColor,
      assignedTrack: assignedTrack.trim() || 'General Development & Testing'
    });

    onClose();
  };

  return (
    <div className="plane-modal-overlay" onClick={onClose}>
      <div className="plane-modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="plane-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={16} color="var(--plane-accent-blue)" />
            <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--plane-text-primary)' }}>
              Add Team Member
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--plane-text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="plane-modal-body">
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>FULL NAME *</label>
              <input 
                type="text" 
                className="plane-search-input"
                style={{ background: 'var(--plane-bg-base)', border: '1px solid var(--plane-border-medium)', borderRadius: 'var(--plane-radius-sm)', padding: '8px 10px', width: '100%', marginTop: '3px', fontSize: '13px' }}
                placeholder="e.g. Arun Kumar"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>COLLEGE / WORK EMAIL</label>
              <input 
                type="email" 
                className="plane-search-input"
                style={{ background: 'var(--plane-bg-base)', border: '1px solid var(--plane-border-medium)', borderRadius: 'var(--plane-radius-sm)', padding: '8px 10px', width: '100%', marginTop: '3px', fontSize: '13px' }}
                placeholder="e.g. arun@college.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>ROLE / TITLE</label>
                <select 
                  className="plane-select"
                  style={{ width: '100%', marginTop: '3px', padding: '7px' }}
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="Lead Architect">Lead Architect</option>
                  <option value="Senior Developer">Senior Developer</option>
                  <option value="Junior Developer">Junior Developer</option>
                  <option value="Scraper Specialist">Scraper Specialist</option>
                  <option value="AI/ML Engineer">AI/ML Engineer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Frontend & QA">Frontend & QA</option>
                  <option value="Mentor / Faculty">Mentor / Faculty</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>AVATAR COLOR</label>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
                  {AVATAR_COLORS.map(c => (
                    <div 
                      key={c}
                      onClick={() => setAvatarColor(c)}
                      style={{ 
                        width: '18px', 
                        height: '18px', 
                        borderRadius: '50%', 
                        background: c, 
                        cursor: 'pointer',
                        border: avatarColor === c ? '2px solid #fff' : 'none'
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>ASSIGNED SCOPE / ARCHITECTURE TRACK</label>
              <input 
                type="text" 
                className="plane-search-input"
                style={{ background: 'var(--plane-bg-base)', border: '1px solid var(--plane-border-medium)', borderRadius: 'var(--plane-radius-sm)', padding: '8px 10px', width: '100%', marginTop: '3px', fontSize: '13px' }}
                placeholder="e.g. Layer 2: Local RTX 5070 Embeddings & Deduplication"
                value={assignedTrack}
                onChange={e => setAssignedTrack(e.target.value)}
              />
            </div>
          </div>

          <div className="plane-modal-footer">
            <button type="button" className="plane-btn plane-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="plane-btn plane-btn-primary">
              <UserPlus size={14} />
              <span>Add Member</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
