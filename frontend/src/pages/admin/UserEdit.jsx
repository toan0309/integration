import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserService from '../../services/userService';
import RoleService from '../../services/roleService';
import TokenStorage from '../../utils/tokenStorage';
import '../../styles/form.scss';

function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [user, setUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = TokenStorage.getAccessToken();
        const [userRes, rolesRes] = await Promise.all([
          UserService.getUser(parseInt(id), token),
          RoleService.listRoles(token),
        ]);
        if (userRes.success) {
          setUser(userRes.data);
          setForm({ full_name: userRes.data.full_name || '', phone: userRes.data.phone || '' });
          setUserRoles((userRes.data.roles || []).map(r => r.role_name || r));
        }
        if (rolesRes.success) setAvailableRoles(rolesRes.data.roles || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const toggleRole = roleName => {
    setUserRoles(r => r.includes(roleName) ? r.filter(x => x !== roleName) : [...r, roleName]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.full_name.trim()) { setError('Full name is required.'); return; }
    setSaving(true);
    try {
      const token = TokenStorage.getAccessToken();
      const result = await UserService.updateUser(parseInt(id), form.full_name, form.phone || null, token);
      if (result.success) {
        setSuccess('User updated successfully!');
        setTimeout(() => navigate('/admin/users'), 1500);
      } else {
        setError(result.error || 'Update failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <span className="spinner spinner-primary" style={{ width: '2rem', height: '2rem' }} />
    </div>
  );

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#6B7280' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
      <p>User not found.</p>
      <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigate('/admin/users')}>Back to Users</button>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit User</h1>
          <p className="page-subtitle">Update information for {user.full_name}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>← Back</button>
      </div>

      {success && <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.875rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>✅ {success}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div className="form-section">
          <div className="form-section__header">
            <h3>Account Details</h3>
            <p>Update basic user information</p>
          </div>
          <div className="form-section__body">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={user.email} disabled />
              <span className="form-hint">Email cannot be changed</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input name="full_name" type="text" className="form-input" value={form.full_name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input name="phone" type="tel" className="form-input" placeholder="+84 xxx xxx xxx" value={form.phone} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {availableRoles.length > 0 && (
          <div className="form-section">
            <div className="form-section__header">
              <h3>Roles</h3>
              <p>Current roles assigned to this user</p>
            </div>
            <div className="form-section__body">
              <div className="roles-dropdown">
                {availableRoles.map(role => {
                  const name = role.role_name || role;
                  return (
                    <label key={name} className={`role-option${userRoles.includes(name) ? ' selected' : ''}`}>
                      <input type="checkbox" checked={userRoles.includes(name)} onChange={() => toggleRole(name)} />
                      <span style={{ fontWeight: 600 }}>{name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/users')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : '💾'} Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserEdit;
