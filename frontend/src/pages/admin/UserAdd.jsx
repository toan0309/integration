import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../../services/userService';
import RoleService from '../../services/roleService';
import TokenStorage from '../../utils/tokenStorage';
import '../../styles/form.scss';

function UserAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', full_name: '', password: '', phone: '' });
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = TokenStorage.getAccessToken();
        const result = await RoleService.listRoles(token);
        if (result.success) {
          setAvailableRoles(result.data.roles || []);
        }
      } catch (err) { console.error(err); }
    };
    fetchRoles();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (form.password && form.password.length < 8) e.password = 'Password must be at least 8 characters';
    return e;
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(err => ({ ...err, [e.target.name]: '' }));
    setApiError('');
  };

  const toggleRole = roleName => {
    setSelectedRoles(r => r.includes(roleName) ? r.filter(x => x !== roleName) : [...r, roleName]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const token = TokenStorage.getAccessToken();
      const result = await UserService.createUser(
        form.email, form.full_name, form.password || undefined, form.phone || undefined, token
      );
      if (result.success) {
        navigate('/admin/users', { state: { message: 'User created successfully!' } });
      } else {
        setApiError(result.error || 'Failed to create user.');
      }
    } catch (err) {
      setApiError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Add User</h1>
          <p className="page-subtitle">Create a new system user account</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>← Back</button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {apiError && <div className="auth-error" style={{ marginBottom: '1rem' }}>{apiError}</div>}

        <div className="form-section">
          <div className="form-section__header">
            <h3>Account Information</h3>
            <p>Required details for the new user account</p>
          </div>
          <div className="form-section__body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input name="full_name" type="text" className={`form-input${errors.full_name ? ' error' : ''}`} placeholder="John Doe" value={form.full_name} onChange={handleChange} />
                {errors.full_name && <span className="form-error">{errors.full_name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input name="email" type="email" className={`form-input${errors.email ? ' error' : ''}`} placeholder="john@company.com" value={form.email} onChange={handleChange} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input name="password" type={showPw ? 'text' : 'password'} className={`form-input${errors.password ? ' error' : ''}`} style={{ paddingRight: '2.5rem' }} placeholder="Leave blank to auto-generate" value={form.password} onChange={handleChange} />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>{showPw ? '🙈' : '👁️'}</button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
                <span className="form-hint">If left blank, a random password will be generated</span>
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
              <h3>Assign Roles</h3>
              <p>Select one or more roles for this user</p>
            </div>
            <div className="form-section__body">
              <div className="roles-dropdown">
                {availableRoles.map(role => {
                  const name = role.role_name || role;
                  return (
                    <label key={name} className={`role-option${selectedRoles.includes(name) ? ' selected' : ''}`}>
                      <input type="checkbox" checked={selectedRoles.includes(name)} onChange={() => toggleRole(name)} />
                      <span style={{ fontWeight: 600 }}>{name}</span>
                      {role.permissions && <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>({role.permission_count} permissions)</span>}
                    </label>
                  );
                })}
              </div>
              {selectedRoles.length > 0 && (
                <div className="role-chips" style={{ marginTop: '0.75rem' }}>
                  {selectedRoles.map(r => (
                    <span key={r} className="role-chip">
                      {r}
                      <button className="remove" onClick={() => toggleRole(r)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/users')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : '+'} Create User
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserAdd;
