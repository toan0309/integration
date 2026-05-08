import { useAuth } from '../context/AuthContext';
import TokenStorage from '../utils/tokenStorage';
import { useNavigate } from 'react-router-dom';

const STATS = [
  { icon: '👥', label: 'Total Users', value: '—', trend: null, color: '#EEF0FF', iconColor: '#2D3DC0' },
  { icon: '🛡️', label: 'Active Roles', value: '6', trend: null, color: '#FEF3C7', iconColor: '#D97706' },
  { icon: '✅', label: 'Active Sessions', value: '—', trend: null, color: '#D1FAE5', iconColor: '#059669' },
  { icon: '🔑', label: 'Permissions', value: '24', trend: null, color: '#DBEAFE', iconColor: '#2563EB' },
];

const QUICK_LINKS = [
  { icon: '👥', label: 'Manage Users', desc: 'Add, edit, or deactivate users', to: '/admin/users', roles: ['admin'] },
  { icon: '🛡️', label: 'Manage Roles', desc: 'Configure role permissions', to: '/admin/roles', roles: ['admin'] },
  { icon: '🔑', label: 'Permissions', desc: 'View all available permissions', to: '/admin/permissions', roles: ['admin'] },
  { icon: '👤', label: 'My Profile', desc: 'Update your personal info', to: '/auth/profile', roles: [] },
  { icon: '🔒', label: 'Change Password', desc: 'Update your credentials', to: '/auth/change-password', roles: [] },
];

function DashboardHome() {
  const { user } = useAuth();
  const roles = TokenStorage.getUserRoles();
  const navigate = useNavigate();

  const visibleLinks = QUICK_LINKS.filter(l => !l.roles.length || l.roles.some(r => roles.includes(r)));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg, #2D3DC0 0%, #4A5AE8 100%)', borderRadius: '1.25rem', padding: '2rem', marginBottom: '1.75rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '80px', width: '160px', height: '160px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.375rem' }}>
            {greeting()}, {user?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
            Welcome to HRManager. Here's an overview of your system.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            {roles.map(r => (
              <span key={r} style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card__icon" style={{ background: s.color }}>
              <span style={{ color: s.iconColor }}>{s.icon}</span>
            </div>
            <div>
              <div className="stat-card__value">{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="section-card">
        <div className="section-card__header">
          <h2 className="section-card__title">Quick Access</h2>
        </div>
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {visibleLinks.map(l => (
            <button
              key={l.to}
              onClick={() => navigate(l.to)}
              style={{ padding: '1.25rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '0.875rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EEF0FF'; e.currentTarget.style.borderColor = '#C7D2FE'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{l.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827', marginBottom: '0.25rem' }}>{l.label}</div>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{l.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
