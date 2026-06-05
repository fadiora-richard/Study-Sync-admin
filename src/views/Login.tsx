import React, { useState } from 'react';
import { login } from '../utils/api';
import { Shield, Key, Mail, AlertTriangle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all credentials.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.toLowerCase().trim(), password);
      
      if (res.data.role !== 'admin') {
        setError('Access denied. Administrator privileges required.');
        return;
      }

      onLoginSuccess(res.data.token);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBox}>
            <Shield size={36} color="#3b82f6" />
          </div>
          <h1 style={styles.title}>StudySync Admin</h1>
          <p style={styles.subtitle}>Superadmin Configuration Portal</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <AlertTriangle size={18} style={{ marginRight: 8, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                className="form-input"
                style={styles.input}
                placeholder="admin@studysync.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Key size={18} style={styles.inputIcon} />
              <input
                type="password"
                className="form-input"
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    background: 'radial-gradient(circle at top, #1e293b 0%, #0b0f19 100%)',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px 30px',
    textAlign: 'center' as const,
  },
  header: {
    marginBottom: '30px',
  },
  logoBox: {
    display: 'inline-flex',
    padding: '16px',
    borderRadius: '16px',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.15)',
    marginBottom: '16px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#fff',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#9ca3af',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#f87171',
    fontSize: '14px',
    textAlign: 'left' as const,
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    textAlign: 'left' as const,
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#d1d5db',
  },
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute' as const,
    left: '14px',
    color: '#6b7280',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: '10px',
    fontSize: '15px',
  },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '16px',
    marginTop: '10px',
  },
};
