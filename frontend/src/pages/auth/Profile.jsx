import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TokenStorage from '../../utils/tokenStorage';
import AuthService from '../../services/authService';
import '../../styles/form.scss';

function Profile() {
  const { user, updateProfile, showNotification } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || '', phone: user.phone || '' });
  }, [user]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.full_name.trim()) { setError('Full name is required.'); return; }
    setLoading(true);
    const result = await updateProfile(form.full_name, form.phone || null);
    setLoading(false);
    if (result.success) {
      showNotification?.('success', 'Profile Updated', 'Your profile has been saved.');
    } else {
      setError(result.error || 'Update failed.');
    }
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">View and update your personal information</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', maxWidth: 860 }}>
        {/* Avatar card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.5rem', height: 'fit-content' }}>
          <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: '#2D3DC0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            {initials}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', textAlign: 'center' }}>{user?.full_name}</div>
          <div style={{ fontSize: '0.8125rem', color: '#9CA3AF', marginTop: '0.25rem' }}>{user?.email}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', justifyContent: 'center', marginTop: '1rem' }}>
            {(user?.roles || []).map(r => (
              <span key={r} className="badge badge-info">{r}</span>
            ))}
          </div>
          <div style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', background: '#F9FAFB', borderRadius: '0.75rem', fontSize: '0.75rem', color: '#6B7280' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Status</span>
              <span className="badge badge-success">{user?.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Last login</span>
              <span style={{ fontWeight: 500, color: '#374151' }}>
                {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
          <button className="btn btn-secondary btn-full" style={{ marginTop: '1rem' }} onClick={() => navigate('/auth/change-password')}>
            🔒 Change Password
          </button>
        </div>

        {/* Form card */}
        <div>
          <div className="form-section">
            <div className="form-section__header">
              <h3>Personal Information</h3>
              <p>Update your name and contact details</p>
            </div>
            <div className="form-section__body">
              {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="full_name" type="text" className="form-input" value={form.full_name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={user?.email || ''} disabled />
                  <span className="form-hint">Email cannot be changed</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input name="phone" type="tel" className="form-input" placeholder="+84 xxx xxx xxx" value={form.phone} onChange={handleChange} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #F3F4F6', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setForm({ full_name: user?.full_name || '', phone: user?.phone || '' })}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <span className="spinner" /> : '💾'} Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
