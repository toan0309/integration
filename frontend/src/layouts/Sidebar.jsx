import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TokenStorage from '../utils/tokenStorage';

const NAV_ITEMS = [
  { section: 'Main', items: [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  ]},
  { section: 'Administration', roles: ['admin'], items: [
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/roles', icon: '🛡️', label: 'Roles' },
    { to: '/admin/permissions', icon: '🔑', label: 'Permissions' },
  ]},
  { section: 'Account', items: [
    { to: '/auth/profile', icon: '👤', label: 'Profile' },
    { to: '/auth/change-password', icon: '🔒', label: 'Change Password' },
  ]},
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const roles = TokenStorage.getUserRoles();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo__mark">🏢</div>
        <div>
          <div className="sidebar-logo__text">HRManager</div>
          <div className="sidebar-logo__sub">HR System</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(section => {
          if (section.roles && !section.roles.some(r => roles.includes(r))) return null;
          return (
            <div key={section.section}>
              <div className="sidebar-section">{section.section}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user__avatar">{initials}</div>
          <div className="sidebar-user__info">
            <div className="name">{user?.full_name || 'User'}</div>
            <div className="role">{roles[0] || 'employee'}</div>
          </div>
          <button className="sidebar-user__logout" onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
