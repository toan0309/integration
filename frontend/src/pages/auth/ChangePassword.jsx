import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/form.scss';

function ChangePassword() {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [showPw, setShowPw] = useState({ old: false, new: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { changePassword, showNotification } = useAuth();
  const navigate = useNavigate();

  const getStrength = pw => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strengthLabel = { 1: 'Weak', 2: 'Fair', 3: 'Good', 4: 'Strong' };
  const strengthClass = { 1: 'weak', 2: 'weak', 3: 'medium', 4: 'strong' };
  const strength = getStrength(form.new_password);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.old_password || !form.new_password || !form.confirm_password) {
      setError('All fields are required.'); return;
    }
    if (form.new_password !== form.confirm_password) {
      setError('New passwords do not match.'); return;
    }
    if (strength < 3) {
      setError('Password is too weak. Add uppercase, numbers, and special characters.'); return;
    }
    setLoading(true);
    const result = await changePassword(form.old_password, form.new_password, form.confirm_password);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      showNotification?.('success', 'Password Changed', 'Your password has been updated successfully.');
    } else {
      setError(result.error || 'Failed to change password.');
    }
  };

  if (success) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Change Password</h1>
        </div>
        <div className="card" style={{ maxWidth: 500, textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Password Updated!</h2>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Your password has been changed successfully.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Keep your account secure with a strong password</p>
        </div>
      </div>

      <div className="form-section" style={{ maxWidth: 520 }}>
        <div className="form-section__header">
          <h3>Update Password</h3>
          <p>Enter your current password, then choose a new one</p>
        </div>
        <div className="form-section__body">
          {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input name="old_password" type={showPw.old ? 'text' : 'password'} className="form-input" style={{ paddingRight: '2.5rem' }} placeholder="Enter current password" value={form.old_password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPw(s => ({ ...s, old: !s.old }))} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>{showPw.old ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input name="new_password" type={showPw.new ? 'text' : 'password'} className="form-input" style={{ paddingRight: '2.5rem' }} placeholder="Enter new password" value={form.new_password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPw(s => ({ ...s, new: !s.new }))} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>{showPw.new ? '🙈' : '👁️'}</button>
              </div>
              {form.new_password && (
                <div className={`password-strength ${strengthClass[strength]}`} style={{ marginTop: '0.5rem' }}>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${strength * 25}%` }} /></div>
                  <span className="strength-text" style={{ fontSize: '0.75rem' }}>{strengthLabel[strength]}</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input name="confirm_password" type="password" className="form-input" placeholder="Repeat new password" value={form.confirm_password} onChange={handleChange} />
            </div>
            <div className="form-footer" style={{ margin: '1rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : '🔒'} Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
