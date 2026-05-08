import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.scss';

function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-left__logo">
          <div className="logo-mark">🏢</div>
          <h1>HRManager</h1>
          <p>Streamline your workforce management</p>
        </div>
      </div>

      {/* Right form */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to access your dashboard.</p>

          {successMessage && <div className="auth-error" style={{ backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}>{successMessage}</div>}
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="auth-form-label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="auth-form-input"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <div className="login-footer-row" style={{ marginBottom: '0.375rem', padding: 0 }}>
                <label className="auth-form-label" htmlFor="password">Password</label>
                <Link to="/auth/forgot-password" className="auth-link" style={{ fontSize: '0.8125rem' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="auth-input-group">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  className="auth-form-input"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button type="button" className="toggle-password" onClick={() => setShowPw(v => !v)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <label className="checkbox-label" style={{ marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
              <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} />
              Remember me
            </label>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : null}
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <div className="login-register-row">
            Don't have an account?
            <Link to="/auth/register">Request access</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
