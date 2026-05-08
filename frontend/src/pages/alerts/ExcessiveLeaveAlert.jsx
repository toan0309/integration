import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { getInitials } from '../../utils/helpers';

const ExcessiveLeaveAlert = ({ onBack, departmentOptions = [] }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    department: 'ALL',
    severity: 'ALL',
    status: 'ALL'
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  const handleDownload = () => {
    // Lấy trực tiếp từ state để tránh lỗi reference-before-declaration
    const _alerts = data?.data || [];
    const _stats = data?.stats || { total: 0, unprocessed: 0, pending: 0, resolved: 0 };

    if (exportFormat === 'PDF') {
      const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const deptLabel = filters.department === 'ALL' ? 'Toàn công ty' : filters.department;

      const tableRows = _alerts.map((row, idx) => {
        const sevLabel = row.Severity === 'High' ? 'Nghiêm trọng' : row.Severity === 'Medium' ? 'Trung bình' : 'Nhẹ';
        const sevColor = row.Severity === 'High' ? '#b91c1c' : row.Severity === 'Medium' ? '#92400e' : '#15803d';
        const sevBg    = row.Severity === 'High' ? '#fee2e2' : row.Severity === 'Medium' ? '#fef3c7' : '#dcfce7';
        return `
          <tr style="background:${idx % 2 === 0 ? '#fff' : '#f8fafc'}">
            <td>EMP-${String(row.EmployeeID).padStart(5,'0')}</td>
            <td style="font-weight:600;color:#1e293b">${row.FullName}</td>
            <td>${row.DepartmentName}</td>
            <td style="text-align:center;font-weight:700">${row.TotalDays}</td>
            <td style="text-align:center;color:#ef4444;font-weight:800">+${row.Exceeded}</td>
            <td style="text-align:center">
              <span style="background:${sevBg};color:${sevColor};padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700">${sevLabel}</span>
            </td>
          </tr>`;
      }).join('');

      const printContent = `<!DOCTYPE html>
        <html lang="vi"><head>
          <meta charset="UTF-8"/>
          <title>Báo cáo Cảnh báo Nghỉ phép - ${filters.year}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            * { margin:0;padding:0;box-sizing:border-box; }
            body { font-family:'Inter',sans-serif;background:#fff;color:#1e293b;padding:24px 32px;font-size:13px; }
            .report-header { display:flex;align-items:center;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #1d4ed8;margin-bottom:24px; }
            .company-logo { display:flex;align-items:center;gap:12px; }
            .logo-icon { width:48px;height:48px;background:linear-gradient(135deg,#1d4ed8,#7c3aed);border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:800; }
            .company-name { font-size:18px;font-weight:800;color:#1e293b; }
            .company-sub { font-size:11px;color:#64748b;margin-top:2px; }
            .report-date { text-align:right; }
            .report-date p { font-size:11px;color:#64748b;margin-bottom:2px; }
            .report-date strong { font-size:13px;color:#1e293b; }
            .report-title-section { text-align:center;margin-bottom:24px; }
            .report-title { font-size:22px;font-weight:800;color:#1d4ed8;margin-bottom:6px; }
            .report-subtitle { font-size:13px;color:#64748b; }
            .meta-cards { display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px; }
            .meta-card { border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px; }
            .meta-label { font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px; }
            .meta-value { font-size:18px;font-weight:800;color:#1e293b; }
            .meta-value.blue{color:#1d4ed8}.meta-value.red{color:#ef4444}.meta-value.green{color:#10b981}.meta-value.amber{color:#f59e0b}
            table { width:100%;border-collapse:collapse; }
            thead { background:linear-gradient(135deg,#1d4ed8,#4f46e5); }
            thead th { padding:11px 12px;color:#fff;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;text-align:left; }
            tbody td { padding:11px 12px;border-bottom:1px solid #f1f5f9;font-size:12px; }
            tbody tr:last-child td { border-bottom:none; }
            .report-footer { margin-top:28px;padding-top:14px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:flex-start; }
            .footer-note { font-size:10px;color:#94a3b8;line-height:1.6; }
            .footer-signature { text-align:right; }
            .footer-signature p { font-size:11px;color:#64748b; }
            .sig-line { margin-top:36px;border-top:1px solid #1e293b;width:160px;margin-left:auto;padding-top:6px;font-size:11px;font-weight:600;color:#1e293b; }
          </style>
        </head><body>
          <div class="report-header">
            <div class="company-logo">
              <div class="logo-icon">HR</div>
              <div>
                <div class="company-name">HỆ THỐNG QUẢN LÝ NHÂN SỰ</div>
                <div class="company-sub">Bộ phận Nhân sự &amp; Đào tạo</div>
              </div>
            </div>
            <div class="report-date"><p>Ngày xuất báo cáo</p><strong>${today}</strong></div>
          </div>
          <div class="report-title-section">
            <div class="report-title">BÁO CÁO CẢNH BÁO NGHỈ PHÉP QUÁ MỨC</div>
            <div class="report-subtitle">Năm ${filters.year} &mdash; Phòng ban: ${deptLabel} &mdash; Tổng vi phạm: ${_alerts.length} nhân viên</div>
          </div>
          <div class="meta-cards">
            <div class="meta-card"><div class="meta-label">Tổng cảnh báo</div><div class="meta-value blue">${_stats.total}</div></div>
            <div class="meta-card"><div class="meta-label">Chưa xử lý</div><div class="meta-value red">${_stats.unprocessed}</div></div>
            <div class="meta-card"><div class="meta-label">Đang xem xét</div><div class="meta-value amber">${_stats.pending}</div></div>
            <div class="meta-card"><div class="meta-label">Đã hoàn thành</div><div class="meta-value green">${_stats.resolved}</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Mã NV</th><th>Họ và Tên</th><th>Phòng ban</th>
                <th style="text-align:center">Tổng ngày nghỉ</th>
                <th style="text-align:center">Vượt mức</th>
                <th style="text-align:center">Mức độ</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="report-footer">
            <div class="footer-note">
              Báo cáo được tạo tự động bởi Hệ thống Quản lý Nhân sự.<br/>
              Thời điểm xuất: ${new Date().toLocaleString('vi-VN')}
            </div>
            <div class="footer-signature">
              <p>Phê duyệt bởi Trưởng phòng Nhân sự</p>
              <div class="sig-line">Ký tên</div>
            </div>
          </div>
          <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script>
        </body></html>`;

      const pw = window.open('', '_blank', 'width=960,height=700');
      pw.document.write(printContent);
      pw.document.close();
    } else {
      // Simple CSV export for Excel format
      const headers = ['Mã NV', 'Họ và Tên', 'Phòng Ban', 'Tổng Ngày Nghỉ', 'Vượt Mức', 'Mức Độ'];
      const rows = _alerts.map(row => [
        `EMP-${String(row.EmployeeID).padStart(5, '0')}`,
        row.FullName,
        row.DepartmentName,
        row.TotalDays,
        `+${row.Exceeded}`,
        row.Severity === 'High' ? 'Nghiêm trọng' : row.Severity === 'Medium' ? 'Trung bình' : 'Nhẹ'
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `canh-bao-nghi-phep-qua-muc-${filters.year}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    setShowExportModal(false);
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const result = await attendanceService.getExcessiveLeave(filters.year, filters);
        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch leave alerts", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [filters]);

  if (loading && !data) {
    return (
      <div style={{ padding: '100px', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '24px', marginBottom: '16px' }}>⌛</div>
        <p>Đang tải phân tích dữ liệu chuyên sâu...</p>
      </div>
    );
  }

  const stats = data?.stats || { total: 0, unprocessed: 0, pending: 0, resolved: 0 };
  const alerts = data?.data || [];
  const deptStats = data?.dept_stats || {};
  const severityStats = data?.severity_stats || { High: 0, Medium: 0, Low: 0 };

  // Sort departments by alert count
  const sortedDepts = Object.entries(deptStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const totalSeverity = severityStats.High + severityStats.Medium + severityStats.Low || 1;

  // Pagination Logic
  const totalPages = Math.max(Math.ceil(alerts.length / PAGE_SIZE), 1);
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pagedAlerts = alerts.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <div style={{ 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh', 
      padding: '24px', 
      fontFamily: "'Inter', sans-serif",
      color: '#1e293b'
    }}>
      {/* ── Header ── */}
      <header style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span onClick={onBack} className="breadcrumb-link" style={{ cursor: 'pointer' }}>Trang chủ</span> 
          <span>›</span> 
          <span>Báo cáo lịch trình</span> 
          <span>›</span> 
          <span style={{ color: '#2563eb', fontWeight: '500' }}>Cảnh báo nghỉ phép quá mức</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0', color: '#0f172a' }}>Excessive Leave Alerts</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>Danh sách nhân viên nghỉ phép vượt mức quy định</p>
          </div>
          <button style={{ 
            backgroundColor: '#0f6cbd', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '8px', 
            fontWeight: '600', 
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
            <span>⊕</span> Tạo cảnh báo
          </button>
        </div>
      </header>

      {/* ── Filters ── */}
      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr) 40px', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div className="filter-item">
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Năm</label>
          <select 
            value={filters.year}
            onChange={(e) => setFilters({...filters, year: e.target.value})}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', fontSize: '14px' }}
          >
            <option value="2024">2024-Hiện tại</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <div className="filter-item">
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Phòng ban</label>
          <select 
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', fontSize: '14px' }}
          >
            <option value="ALL">Tất cả phòng ban</option>
            {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="filter-item">
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Mức độ</label>
          <select 
            value={filters.severity}
            onChange={(e) => setFilters({...filters, severity: e.target.value})}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', fontSize: '14px' }}
          >
            <option value="ALL">Nhẹ/Trung bình/Nghiêm trọng</option>
            <option value="High">Nghiêm trọng</option>
            <option value="Medium">Trung bình</option>
            <option value="Low">Nhẹ</option>
          </select>
        </div>
        <div className="filter-item">
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Trạng thái</label>
          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', fontSize: '14px' }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Unprocessed">Chưa xử lý</option>
            <option value="Resolved">Đã xử lý</option>
          </select>
        </div>
        <button style={{ alignSelf: 'end', height: '40px', width: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>⚙</button>
      </section>

      {/* ── Stats Cards ── */}
      <section className="stats-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Tổng cảnh báo', value: stats.total, icon: '⚠️', color: '#3b82f6', trend: '+12%' },
          { label: 'Chưa xử lý', value: stats.unprocessed, icon: '📅', color: '#ef4444', badge: 'Cao' },
          { label: 'Đang xem xét', value: stats.pending, icon: '👁️', color: '#f59e0b' },
          { label: 'Đã xử lý', value: stats.resolved, icon: '✅', color: '#10b981' },
        ].map((card, i) => (
          <article key={i} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${card.color}10`, color: card.color, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '20px' }}>
                {card.icon}
              </div>
              {card.trend && <span style={{ fontSize: '11px', fontWeight: '700', color: card.color }}>{card.trend}</span>}
              {card.badge && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: '700' }}>{card.badge}</span>}
            </div>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{card.label}</p>
            <strong style={{ fontSize: '28px', fontWeight: '800' }}>{card.value}</strong>
          </article>
        ))}
      </section>

      <div className="main-content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        {/* ── Main Table ── */}
        <section style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Danh sách nhân viên vi phạm</h3>
            <button 
              onClick={() => setShowExportModal(true)}
              style={{ color: '#2563eb', background: 'none', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Xuất báo cáo
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Mã NV</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Họ và Tên</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Phòng Ban</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Nghỉ Phép</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Vượt Mức</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Mức Độ</th>
                  <th className="hide-print" style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {pagedAlerts.length > 0 ? pagedAlerts.map((row) => (
                  <tr key={row.EmployeeID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>EMP-{String(row.EmployeeID).padStart(5, '0')}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                          {getInitials(row.FullName)}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{row.FullName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>{row.DepartmentName}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center', fontSize: '14px', fontWeight: '700' }}>{row.TotalDays}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#ef4444' }}>+{row.Exceeded}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '6px', 
                        fontSize: '10px', 
                        fontWeight: '800', 
                        textTransform: 'uppercase',
                        backgroundColor: row.Severity === 'High' ? '#fee2e2' : row.Severity === 'Medium' ? '#fef3c7' : '#dcfce7',
                        color: row.Severity === 'High' ? '#b91c1c' : row.Severity === 'Medium' ? '#92400e' : '#15803d'
                      }}>
                        {row.Severity === 'High' ? 'Nghiêm trọng' : row.Severity === 'Medium' ? 'Trung bình' : 'Nhẹ'}
                      </span>
                    </td>
                    <td className="hide-print" style={{ padding: '16px 24px', textAlign: 'center', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>⋮</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                      Không có nhân viên nào khớp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Hiển thị {pagedAlerts.length} / {alerts.length} nhân viên vi phạm</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={safePage === 1}
                style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: safePage === 1 ? 'default' : 'pointer', opacity: safePage === 1 ? 0.5 : 1 }}
              >
                ‹
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{ 
                    width: '32px', height: '32px', borderRadius: '6px', border: safePage === i + 1 ? 'none' : '1px solid #e2e8f0', 
                    background: safePage === i + 1 ? '#2563eb' : '#fff', 
                    color: safePage === i + 1 ? '#fff' : '#475569', 
                    fontWeight: '700', cursor: 'pointer' 
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={safePage === totalPages}
                style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: safePage === totalPages ? 'default' : 'pointer', opacity: safePage === totalPages ? 0.5 : 1 }}
              >
                ›
              </button>
            </div>
          </div>
        </section>

        {/* ── Sidebar ── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <article style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Top phòng ban có cảnh báo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sortedDepts.map(([name, count]) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500' }}>{name}</span>
                    <span style={{ color: '#2563eb', fontWeight: '700' }}>{count} Cảnh báo</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / stats.total) * 100}%`, backgroundColor: '#2563eb' }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Phân bổ mức độ vi phạm</h3>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', position: 'relative' }}>
              {/* Fake Donut Chart with SVG */}
              <svg width="150" height="150" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#ef4444" strokeWidth="4" strokeDasharray={`${(severityStats.High / totalSeverity) * 100} 100`} strokeDashoffset="25" />
                <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray={`${(severityStats.Medium / totalSeverity) * 100} 100`} strokeDashoffset={25 - (severityStats.High / totalSeverity) * 100} />
                <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray={`${(severityStats.Low / totalSeverity) * 100} 100`} strokeDashoffset={25 - ((severityStats.High + severityStats.Medium) / totalSeverity) * 100} />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <strong style={{ fontSize: '24px', display: 'block' }}>{stats.total}</strong>
                <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Tổng</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Nghiêm trọng', value: `${Math.round((severityStats.High / totalSeverity) * 100)}%`, color: '#ef4444' },
                { label: 'Trung bình', value: `${Math.round((severityStats.Medium / totalSeverity) * 100)}%`, color: '#f59e0b' },
                { label: 'Nhẹ', value: `${Math.round((severityStats.Low / totalSeverity) * 100)}%`, color: '#10b981' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ color: '#64748b' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </div>

      {/* ── Footer Bar ── */}
      <footer style={{ 
        marginTop: '32px', 
        backgroundColor: '#005fa3', 
        borderRadius: '12px', 
        padding: '16px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        color: '#fff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📊</div>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Tóm tắt cảnh báo nghỉ phép</h4>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '48px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '4px' }}>Tổng cộng</p>
            <strong style={{ fontSize: '18px' }}>{stats.total}</strong>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '4px' }}>Chưa xử lý</p>
            <strong style={{ fontSize: '18px' }}>{stats.unprocessed}</strong>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '4px' }}>Đã hoàn thành</p>
            <strong style={{ fontSize: '18px' }}>{stats.resolved}</strong>
          </div>
        </div>
        <button style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 24px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>XEM CHI TIẾT</button>
      </footer>

      {/* ── Export Modal ── */}
      {showExportModal && (
        <div className="export-modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', width: '500px', borderRadius: '20px', padding: '30px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            animation: 'modalFadeIn 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
              <div>
                <h3 style={{ fontSize: '20px', color: '#1a202c', margin: '0 0 5px 0' }}>Xuất file báo cáo</h3>
                <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>Mời chọn định dạng để tải file về</p>
              </div>
              <button style={{ background: '#f7fafc', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px' }} onClick={() => setShowExportModal(false)}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
              <div
                style={{
                  border: `2px solid ${exportFormat === 'PDF' ? '#3182ce' : '#edf2f7'}`,
                  borderRadius: '12px', padding: '15px', textAlign: 'center', cursor: 'pointer',
                  backgroundColor: exportFormat === 'PDF' ? '#ebf8ff' : 'transparent'
                }}
                onClick={() => setExportFormat('PDF')}
              >
                <div style={{ fontWeight: '700', fontSize: '18px', color: '#e53e3e', marginBottom: '4px' }}>PDF</div>
                <div style={{ fontSize: '11px', color: '#718096' }}>Thích hợp để in</div>
              </div>

              <div
                style={{
                  border: `2px solid ${exportFormat === 'Excel' ? '#3182ce' : '#edf2f7'}`,
                  borderRadius: '12px', padding: '15px', textAlign: 'center', cursor: 'pointer',
                  backgroundColor: exportFormat === 'Excel' ? '#ebf8ff' : 'transparent'
                }}
                onClick={() => setExportFormat('Excel')}
              >
                <div style={{ fontWeight: '700', fontSize: '18px', color: '#38a169', marginBottom: '4px' }}>Excel</div>
                <div style={{ fontSize: '11px', color: '#718096' }}>Dữ liệu bảng tính</div>
              </div>
            </div>

            <div style={{ background: '#f7fafc', borderRadius: '12px', padding: '15px', marginBottom: '25px' }}>
              <div style={{ display: 'flex', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: '#718096', width: '80px' }}>Tên file:</span>
                <span style={{ color: '#2d3748', fontWeight: '500' }}>canh-bao-nghi-phep-{filters.year}</span>
              </div>
              <div style={{ display: 'flex', fontSize: '13px' }}>
                <span style={{ color: '#718096', width: '80px' }}>Nội dung:</span>
                <span style={{ color: '#2d3748', fontWeight: '500' }}>Cảnh báo vi phạm ({alerts.length} nhân viên)</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button style={{ padding: '10px 25px', borderRadius: '10px', border: 'none', background: '#2d3748', color: 'white', fontWeight: '600', cursor: 'pointer' }} onClick={() => setShowExportModal(false)}>Hủy</button>
              <button style={{ padding: '10px 25px', borderRadius: '10px', border: 'none', background: '#3182ce', color: 'white', fontWeight: '600', cursor: 'pointer' }} onClick={handleDownload}>Tải file</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .breadcrumb-link:hover { color: #2563eb; }
        @media print {
          @page { size: auto; margin: 10mm; }
          nav, aside, .filter-item, header, footer, button, .page-btn, .export-modal-overlay, .stats-cards, .hide-print { display: none !important; }
          .alert-page { background: white !important; padding: 0 !important; width: 100% !important; display: block !important; }
          .main-content-grid { display: block !important; width: 100% !important; overflow: visible !important; }
          section, div { overflow: visible !important; box-shadow: none !important; border: none !important; width: 100% !important; margin: 0 !important; }
          table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #e2e8f0 !important; }
          th, td { border: 1px solid #e2e8f0 !important; padding: 10px 6px !important; fontSize: 12px !important; }
          .employee-cell span { fontSize: 12px !important; }
          tr { page-break-inside: avoid !important; }
        }
      ` }} />
    </div>
  );
};

export default ExcessiveLeaveAlert;
