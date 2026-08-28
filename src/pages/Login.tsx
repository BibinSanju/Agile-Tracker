import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--plane-bg-base)',
      color: 'var(--plane-text-primary)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        padding: '32px',
        background: 'var(--plane-bg-sidebar)',
        border: '1px solid var(--plane-border-subtle)',
        borderRadius: 'var(--plane-radius-lg)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '40px', height: '40px', background: 'var(--plane-accent-blue)', 
            borderRadius: '6px', margin: '0 auto 16px', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', color: 'white',
            fontWeight: 'bold', fontSize: '18px'
          }}>
            IX
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 6px 0' }}>Log in to IntelX</h1>
          <p style={{ fontSize: '13px', color: 'var(--plane-text-muted)', margin: 0 }}>
            Enter your details below to continue
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{
              padding: '10px 12px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--plane-accent-rose)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--plane-text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
              Email
            </label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--plane-bg-base)',
                border: '1px solid var(--plane-border-medium)',
                borderRadius: '6px',
                color: 'white',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--plane-text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
              Password
            </label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--plane-bg-base)',
                border: '1px solid var(--plane-border-medium)',
                borderRadius: '6px',
                color: 'white',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '10px',
              background: 'var(--plane-accent-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}
