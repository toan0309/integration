import { useState, useEffect } from 'react';
import RoleService from '../../services/roleService';
import TokenStorage from '../../utils/tokenStorage';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/table.scss';

function RoleList() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ role_name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, roleId: null, roleName: '' });
  const [deleting, setDeleting] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getAccessToken();
      const result = await RoleService.listRoles(token);
      if (result.success) setRoles(result.data.roles || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleCreate = async e => {
    e.preventDefault();
    if (!form.role_name.trim()) { setFormError('Role name is required.'); return; }
    setSaving(true);
    try {
      const token = TokenStorage.getAccessToken();
      const result = await RoleService.createRole(form.role_name, form.description, token);
      if (result.success) {
        setShowForm(false);
        setForm({ role_name: '', description: '' });
        fetchRoles();
      } else {
        setFormError(result.error || 'Failed to create role.');
      }
    } catch { setFormError('Network error.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = TokenStorage.getAccessToken();
      await RoleService.deleteRole(deleteModal.roleId, token);
      setDeleteModal({ open: false, roleId: null, roleName: '' });
      fetchRoles();
    } catch (err) { console.error(err); }
    finally { setDeleting(false); }
  };

  const SYSTEM_ROLES = ['admin', 'hr', 'payroll', 'employee', 'manager', 'guest'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Roles</h1>
          <p className="page-subtitle">Manage user roles and their permissions</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setFormError(''); }}>
          + Add Role
        </button>
      </div>

      {/* Add role inline form */}
      {showForm && (
        <div className="form-section" style={{ marginBottom: '1.5rem', maxWidth: 540 }}>
          <div className="form-section__header">
            <h3>New Role</h3>
          </div>
          <div className="form-section__body">
            {formError && <div className="auth-error" style={{ marginBottom: '0.75rem' }}>{formError}</div>}
            <form onSubmit={handleCreate} noValidate>
              <div className="form-group">
                <label className="form-label">Role Name *</label>
                <input className="form-input" placeholder="e.g. supervisor" value={form.role_name} onChange={e => { setForm(f => ({ ...f, role_name: e.target.value })); setFormError(''); }} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="Brief description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? <span className="spinner" style={{ width: '1rem', height: '1rem' }} /> : null} Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <span className="spinner spinner-primary" style={{ width: '2rem', height: '2rem' }} />
          </div>
        ) : roles.map(role => {
          const name = role.role_name || role;
          const isSystem = SYSTEM_ROLES.includes(name.toLowerCase());
          const perms = role.permissions || [];
          return (
            <div key={name} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', background: '#EEF0FF', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                    {name === 'admin' ? '👑' : name === 'hr' ? '🧑‍💼' : name === 'payroll' ? '💰' : name === 'manager' ? '📋' : name === 'employee' ? '👤' : '🛡️'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9375rem' }}>{name}</div>
                    {role.description && <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{role.description}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {isSystem && <span className="badge badge-gray" style={{ fontSize: '0.6rem' }}>System</span>}
                  {!isSystem && (
                    <button className="action-btn danger" onClick={() => setDeleteModal({ open: true, roleId: role.role_id, roleName: name })}>🗑️</button>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {perms.slice(0, 4).map(p => <span key={p} className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{p}</span>)}
                {perms.length > 4 && <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>+{perms.length - 4} more</span>}
                {perms.length === 0 && <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>No permissions defined</span>}
              </div>
              <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid #F3F4F6', fontSize: '0.75rem', color: '#9CA3AF' }}>
                {role.permission_count ?? perms.length} permissions
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Role"
        description={`Are you sure you want to delete the "${deleteModal.roleName}" role? This cannot be undone.`}
        confirmLabel="Delete Role"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, roleId: null, roleName: '' })}
        loading={deleting}
      />
    </div>
  );
}

export default RoleList;
