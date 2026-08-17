import React, { useState, useEffect } from 'react';
import { 
  Terminal,
  Download,
  Sun,
  Moon
} from 'lucide-react';

interface PlaneHeaderProps {
  currentViewTitle: string;
  onExportJSON: () => void;
}

export default function PlaneHeader({ currentViewTitle, onExportJSON }: PlaneHeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('plane_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('plane_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="plane-header">
      {/* Breadcrumb Area */}
      <div className="breadcrumb-area">
        <div className="breadcrumb-project">
          <Terminal size={14} color="var(--plane-accent-blue)" />
          <span>IntelX Portal</span>
        </div>
        <span className="breadcrumb-divider">/</span>
        <span className="breadcrumb-current">{currentViewTitle}</span>
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Theme Toggle (Light / Dark) */}
        <button 
          className="plane-btn plane-btn-secondary"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          style={{ padding: '4px 9px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={13} />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon size={13} />
              <span>Dark</span>
            </>
          )}
        </button>

        {/* Export Sprint State */}
        <button 
          className="plane-btn plane-btn-secondary" 
          onClick={onExportJSON}
          title="Export sprint data as JSON"
          style={{ padding: '4px 9px', fontSize: '12px' }}
        >
          <Download size={13} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
