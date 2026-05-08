import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import '../../styles/auth.scss';

function ResetPassword() {
  const [form, setForm] = useState({ password: '', confirm_password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = state?.token || '';

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.password || !form.confirm_password) { setError('All fields are required.'); return; }
    if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return; }
    if (!token) { setError('Invalid reset session. Please start again.'); return; }

    setLoading(true);
    try {
      const result = await AuthService.resetPassword(token, form.password, form.confirm_password);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Reset failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-bg">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-success-icon">✓</div>
          <h1 className="auth-card__title">Password Reset Successful</h1>
          <p className="auth-card__subtitle">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <button className="auth-btn" onClick={() => navigate('/auth/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h1 className="auth-card__title">Reset Password</h1>
        <p className="auth-card__subtitle">Create a strong password to secure your account.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="auth-form-label">New Password</label>
            <div className="auth-input-group">
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                className="auth-form-input"
                placeholder="Enter new password"
                value={form.password}
                onChange={handleChange}
                autoFocus
              />
              <button type="button" className="toggle-password" onClick={() => setShowPw(v => !v)}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            <span className="auth-hint">Password format: Abc@</span>
          </div>

          <div className="form-group">
            <label className="auth-form-label">Confirm Password</label>
            <input
              name="confirm_password"
              type="password"
              className="auth-form-input"
              placeholder="Confirm your password"
              value={form.confirm_password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : null}
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link to="/auth/login" className="auth-back-link" style={{ justifyContent: 'center' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
