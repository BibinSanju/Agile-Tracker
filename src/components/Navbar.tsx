import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Terminal, 
  Layers, 
  CheckSquare, 
  Users, 
  Inbox, 
  Clock, 
  Activity,
  Sparkles 
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 28,
    minutes: 42,
    seconds: 15
  });

  // Countdown timer for Tuesday Executive Showcase
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <Terminal size={22} />
          </div>
          <div className="brand-info">
            <h1>
              IntelX Cockpit
              <span className="badge-tag">Agile v2.4</span>
            </h1>
            <p>Placement Platform & Ingestion CI/CD</p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="navbar-nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Layers size={16} />
            <span>Agile Board</span>
          </Link>
          <Link 
            to="/staging" 
            className={`nav-link ${location.pathname === '/staging' ? 'active' : ''}`}
          >
            <Inbox size={16} />
            <span>Faculty Staging Queue</span>
          </Link>
        </nav>

        {/* Real-time Status Indicators */}
        <div className="navbar-actions">
          {/* Executive Showcase Countdown */}
          <div className="countdown-box" title="Countdown to Tuesday Executive Company Showcase">
            <Clock size={15} />
            <span>
              Executive Showcase: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
          </div>

          {/* Live CI/CD Health Badge */}
          <div className="ci-status-badge" title="GitHub Actions CI/CD Pipeline Status">
            <div className="pulse-dot"></div>
            <Activity size={15} />
            <span>CI/CD: Passing</span>
          </div>
        </div>
      </div>
    </header>
  );
}
