import React, { useState } from 'react';
import { X, Repeat, Plus } from 'lucide-react';
import { PlaneCycle } from '../data/planeData';

interface AddCycleModalProps {
  onClose: () => void;
  onAddCycle: (cycle: Omit<PlaneCycle, 'id' | 'createdAt'>) => void;
}

export default function AddCycleModal({ onClose, onAddCycle }: AddCycleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [status, setStatus] = useState<PlaneCycle['status']>('active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCycle({
      name: name.trim(),
      description: description.trim() || 'Sprint milestone',
      startDate,
      endDate,
      status
    });

    onClose();
  };

  return (
    <div className="plane-modal-overlay" onClick={onClose}>
      <div className="plane-modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="plane-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Repeat size={16} color="var(--plane-accent-blue)" />
            <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--plane-text-primary)' }}>
              Create Sprint / Cycle
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--plane-text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="plane-modal-body">
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>CYCLE NAME *</label>
              <input 
                type="text" 
                className="plane-search-input"
                style={{ background: 'var(--plane-bg-base)', border: '1px solid var(--plane-border-medium)', borderRadius: 'var(--plane-radius-sm)', padding: '8px 10px', width: '100%', marginTop: '3px', fontSize: '13px' }}
                placeholder="e.g. Cycle 2: Final Placement Integration"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>DESCRIPTION & OBJECTIVES</label>
              <textarea 
                rows={3}
                style={{ background: 'var(--plane-bg-base)', border: '1px solid var(--plane-border-medium)', borderRadius: 'var(--plane-radius-sm)', padding: '8px 10px', width: '100%', marginTop: '3px', color: 'var(--plane-text-primary)', fontFamily: 'inherit', fontSize: '12.5px', outline: 'none' }}
                placeholder="Describe key sprint deliverables and targets..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>START DATE</label>
                <input 
                  type="date"
                  className="plane-search-input"
                  style={{ background: 'var(--plane-bg-base)', border: '1px solid var(--plane-border-medium)', borderRadius: 'var(--plane-radius-sm)', padding: '6px 10px', width: '100%', marginTop: '3px', fontSize: '12.5px' }}
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>END DATE</label>
                <input 
                  type="date"
                  className="plane-search-input"
                  style={{ background: 'var(--plane-bg-base)', border: '1px solid var(--plane-border-medium)', borderRadius: 'var(--plane-radius-sm)', padding: '6px 10px', width: '100%', marginTop: '3px', fontSize: '12.5px' }}
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--plane-text-muted)' }}>STATUS</label>
              <select 
                className="plane-select"
                style={{ width: '100%', marginTop: '3px', padding: '7px' }}
                value={status}
                onChange={e => setStatus(e.target.value as any)}
              >
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="plane-modal-footer">
            <button type="button" className="plane-btn plane-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="plane-btn plane-btn-primary">
              <Plus size={14} />
              <span>Create Cycle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
