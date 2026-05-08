import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.scss';

function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { full_name, email, password, confirm_password, phone } = form;
    if (!full_name || !email || !password) { setError('Please fill in all required fields.'); return; }
    if (password !== confirm_password) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    const result = await register(email, password, full_name, phone || null);
    setLoading(false);
    console.log('Registration result:', result);
    if (result.success) {
      navigate('/auth/login', { state: { message: 'Account created! Please log in.' } });
    } else {
      const msg = result.error || 'Registration failed.';
      setError(msg);
      alert('Registration Error: ' + msg); // Force visibility
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ maxWidth: 420 }}>
        <h1 className="auth-card__title">Create Account</h1>
        <p className="auth-card__subtitle">Fill in your details to request access.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="auth-form-label">Full Name *</label>
            <input name="full_name" type="text" className="auth-form-input" placeholder="John Doe" value={form.full_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="auth-form-label">Email *</label>
            <input name="email" type="email" className="auth-form-input" placeholder="john@company.com" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="auth-form-label">Phone (optional)</label>
            <input name="phone" type="tel" className="auth-form-input" placeholder="+84 xxx xxx xxx" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="auth-form-label">Password *</label>
            <div className="auth-input-group">
              <input name="password" type={showPw ? 'text' : 'password'} className="auth-form-input" placeholder="Min 8 characters" value={form.password} onChange={handleChange} />
              <button type="button" className="toggle-password" onClick={() => setShowPw(v => !v)}>{showPw ? '🙈' : '👁️'}</button>
            </div>
            <span className="auth-hint">Must include uppercase, lowercase, number & special char</span>
          </div>
          <div className="form-group">
            <label className="auth-form-label">Confirm Password *</label>
            <input name="confirm_password" type="password" className="auth-form-input" placeholder="Repeat password" value={form.confirm_password} onChange={handleChange} />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : null}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8125rem', color: '#6B7280' }}>
          Already have an account? <Link to="/auth/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
