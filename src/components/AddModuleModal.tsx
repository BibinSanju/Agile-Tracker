import React, { useState } from 'react';
import { X, Box, Plus } from 'lucide-react';
import { PlaneModule, PlaneMember } from '../data/planeData';

interface AddModuleModalProps {
  members: PlaneMember[];
  onClose: () => void;
  onAddModule: (module: Omit<PlaneModule, 'id' | 'createdAt'>) => void;
}

export default function AddModuleModal({ members, onClose, onAddModule }: AddModuleModalProps) {
  const [name, setName] = useState('');
  const [layer, setLayer] = useState('Layer 1: Ingestion');
  const [description, setDescription] = useState('');
  const [leadId, setLeadId] = useState(members[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddModule({
      name: name.trim(),
      layer: layer.trim(),
      description: description.trim() || 'Architecture component',
      leadId
    });

    onClose();
  };

  return (
    <div className="plane-modal-overlay" onClick={onClose}>
      <div className="plane-modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="plane-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box size={16} color="var(--plane-accent-blue)" />
            <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--plane-text-primary)' }}>
              Create Architecture Module
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--plane-text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="plane-modal-body">
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>MODULE NAME *</label>
              <input 
                type="text" 
                className="plane-search-input"
                style={{ background: 'var(--plane-bg-base)', border: '1px solid var(--plane-border-medium)', borderRadius: 'var(--plane-radius-sm)', padding: '8px 10px', width: '100%', marginTop: '3px', fontSize: '13px' }}
                placeholder="e.g. 9. AI Plagiarism & Code Fingerprinting"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>ARCHITECTURE LAYER</label>
              <select 
                className="plane-select"
                style={{ width: '100%', marginTop: '3px', padding: '7px' }}
                value={layer}
                onChange={e => setLayer(e.target.value)}
              >
                <option value="Layer 1: Ingestion">Layer 1: Ingestion</option>
                <option value="Layer 2: AI & Compilation">Layer 2: AI & Compilation</option>
                <option value="Layer 3: Staging & Delivery">Layer 3: Staging & Delivery</option>
                <option value="Layer 4: CI/CD Quality Gate">Layer 4: CI/CD Quality Gate</option>
                <option value="Layer 5: Production & LMS">Layer 5: Production & LMS</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>DESCRIPTION</label>
              <textarea 
                rows={3}
                style={{ background: 'var(--plane-bg-base)', border: '1px solid var(--plane-border-medium)', borderRadius: 'var(--plane-radius-sm)', padding: '8px 10px', width: '100%', marginTop: '3px', color: 'var(--plane-text-primary)', fontFamily: 'inherit', fontSize: '12.5px', outline: 'none' }}
                placeholder="Describe module scope and interfaces..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>MODULE LEAD</label>
              <select 
                className="plane-select"
                style={{ width: '100%', marginTop: '3px', padding: '7px' }}
                value={leadId}
                onChange={e => setLeadId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="plane-modal-footer">
            <button type="button" className="plane-btn plane-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="plane-btn plane-btn-primary">
              <Plus size={14} />
              <span>Create Module</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
