import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import '../../styles/auth.scss';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      const result = await AuthService.requestPasswordReset(email.trim());
      if (result.success) {
        // Redirect to verify code page
        navigate('/auth/verify-code', { state: { email } });
      } else {
        setError(result.error || 'Request failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div style={{ textAlign: 'center' }}>
          <div className="auth-card__icon primary" style={{ margin: '0 auto 1.25rem' }}>🔑</div>
          <h1 className="auth-card__title">Forgot Password?</h1>
          <p className="auth-card__subtitle">
            No worries! Enter your email address and we will send you instructions to reset your password.
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="auth-form-label">Email Address</label>
            <input
              type="email"
              className="auth-form-input"
              placeholder="Enter your work email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoFocus
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : null}
            {loading ? 'Sending…' : 'Reset Password →'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link to="/auth/login" className="auth-back-link">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
