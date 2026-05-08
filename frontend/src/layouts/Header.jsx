import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BREADCRUMB_MAP = {
  '/dashboard': [{ label: 'Dashboard' }],
  '/auth/profile': [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Profile' }],
  '/auth/change-password': [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Change Password' }],
  '/admin/users': [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Users' }],
  '/admin/users/add': [{ label: 'Users', to: '/admin/users' }, { label: 'Add User' }],
  '/admin/roles': [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Roles' }],
  '/admin/permissions': [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Permissions' }],
};

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const crumbs = BREADCRUMB_MAP[location.pathname] ||
    [{ label: location.pathname.split('/').filter(Boolean).pop() || 'Home' }];

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="header">
      <div className="header-left">
        <nav className="breadcrumb">
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {i > 0 && <span className="sep">›</span>}
              {c.to
                ? <span className="crumb" style={{ cursor: 'pointer', color: '#2D3DC0' }} onClick={() => navigate(c.to)}>{c.label}</span>
                : <span className={`crumb ${i === crumbs.length - 1 ? 'active' : ''}`}>{c.label}</span>
              }
            </span>
          ))}
        </nav>
      </div>

      <div className="header-right">
        <button className="header-icon-btn" title="Notifications">
          🔔
          <span className="notif-dot" />
        </button>

        <button className="header-user" onClick={() => navigate('/auth/profile')}>
          <div className="header-avatar">{initials}</div>
          <div>
            <div className="header-user-name">{user?.full_name || 'User'}</div>
            <div className="header-user-role">{user?.roles?.[0] || 'employee'}</div>
          </div>
        </button>
      </div>
    </header>
  );
}

export default Header;
