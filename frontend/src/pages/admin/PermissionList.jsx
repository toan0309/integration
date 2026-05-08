import { useState, useEffect } from 'react';
import RoleService from '../../services/roleService';
import TokenStorage from '../../utils/tokenStorage';

function PermissionList() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = TokenStorage.getAccessToken();
        const result = await RoleService.getAllPermissions(token);
        if (result.success) setData(result.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const CATEGORY_ICONS = { user: '👥', employee: '🧑‍💼', payroll: '💰', attendance: '📅', reports: '📊', system: '⚙️' };
  const CATEGORY_COLORS = { user: '#EEF0FF', employee: '#D1FAE5', payroll: '#FEF3C7', attendance: '#DBEAFE', reports: '#FCE7F3', system: '#F3F4F6' };

  const allPerms = data?.permissions || [];
  const filtered = search ? allPerms.filter(p => p.toLowerCase().includes(search.toLowerCase())) : allPerms;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Permissions</h1>
          <p className="page-subtitle">All available system permissions ({allPerms.length} total)</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <span className="spinner spinner-primary" style={{ width: '2rem', height: '2rem' }} />
        </div>
      ) : (
        <div>
          {/* Search */}
          <div style={{ marginBottom: '1.5rem', maxWidth: 360 }}>
            <div className="search-bar" style={{ boxShadow: 'none' }}>
              <span className="search-icon">🔍</span>
              <input placeholder="Search permissions…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>

          {search ? (
            /* Flat search results */
            <div className="section-card">
              <div style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {filtered.length === 0 ? (
                  <span style={{ color: '#9CA3AF' }}>No permissions match "{search}"</span>
                ) : filtered.map(p => (
                  <span key={p} className="badge badge-gray" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>{p}</span>
                ))}
              </div>
            </div>
          ) : (
            /* Category cards */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {Object.entries(data?.categories || {}).map(([category, perms]) => (
                <div key={category} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', background: CATEGORY_COLORS[category] || '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                      {CATEGORY_ICONS[category] || '🔑'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#111827', textTransform: 'capitalize' }}>{category}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{perms.length} permissions</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {perms.map(p => (
                      <span key={p} style={{ display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.625rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '9999px', fontSize: '0.7rem', color: '#374151', fontWeight: 500 }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PermissionList;
