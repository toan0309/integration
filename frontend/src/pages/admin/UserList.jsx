import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../../services/userService';
import TokenStorage from '../../utils/tokenStorage';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/table.scss';

function UserList() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, userId: null, name: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const PER_PAGE = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getAccessToken();
      const result = await UserService.listUsers(page, PER_PAGE, search, token);
      if (result.success) {
        setUsers(result.data.users || []);
        setTotal(result.data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = e => { setSearch(e.target.value); setPage(1); };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const token = TokenStorage.getAccessToken();
      await UserService.deleteUser(deleteModal.userId, token);
      setDeleteModal({ open: false, userId: null, name: '' });
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnable = async (userId) => {
    try {
      const token = TokenStorage.getAccessToken();
      await UserService.enableUser(userId, token);
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const initials = name => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage system users and their roles</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/users/add')}>
          + Add User
        </button>
      </div>

      <div className="section-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input placeholder="Search users…" value={search} onChange={handleSearch} />
            </div>
          </div>
          <div className="table-toolbar-right">
            <span style={{ fontSize: '0.8125rem', color: '#6B7280' }}>{total} users total</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                  <span className="spinner spinner-primary" />
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <div className="empty-title">No users found</div>
                    <div className="empty-text">{search ? 'Try a different search term' : 'Add your first user to get started'}</div>
                  </div>
                </td></tr>
              ) : users.map(u => (
                <tr key={u.user_id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-cell__avatar">{initials(u.full_name)}</div>
                      <div>
                        <div className="user-cell__name">{u.full_name}</div>
                        <div className="user-cell__email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {(u.roles || []).map(r => (
                        <span key={r.role_id || r} className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                          {r.role_name || r}
                        </span>
                      ))}
                      {(!u.roles || u.roles.length === 0) && <span className="badge badge-gray">No role</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                    {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn" title="Edit" onClick={() => navigate(`/admin/users/${u.user_id}/edit`)}>✏️</button>
                      {u.is_active
                        ? <button className="action-btn danger" title="Deactivate" onClick={() => setDeleteModal({ open: true, userId: u.user_id, name: u.full_name })}>🚫</button>
                        : <button className="action-btn" title="Activate" onClick={() => handleEnable(u.user_id)}>✅</button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="table-footer">
            <span className="table-info">Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total}</span>
            <div className="pagination">
              <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`pagination-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="pagination-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Deactivate User"
        description={`Are you sure you want to deactivate "${deleteModal.name}"? They will no longer be able to log in.`}
        confirmLabel="Deactivate"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, userId: null, name: '' })}
        loading={actionLoading}
      />
    </div>
  );
}

export default UserList;
