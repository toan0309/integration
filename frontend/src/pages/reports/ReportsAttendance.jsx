import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 5;

function ReportsAttendance({
  onBack,
  selectedDepartment = 'ALL',
  setSelectedDepartment = () => {},
  departmentOptions = [],
  reportRows = [],
  todayRows = [],
  summary = {},
  reportMeta = {},
  statusClass = () => '',
  selectedMonth = '',
  availableMonths = [],
  onMonthChange = () => {},
  onWorkAnniversaryClick = () => {},
  onExcessiveLeaveClick = () => {},
}) {
  const [tablePage, setTablePage] = useState(1);
  const [sortBy, setSortBy] = useState('lateDays'); // 'name' | 'lateDays'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('PDF');

  const handleDownload = () => {
    if (exportFormat === 'PDF') {
      const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const deptLabel = selectedDepartment === 'ALL' ? 'Toàn công ty' : selectedDepartment;

      const tableRows = filteredReportRows.map((row, idx) => {
        const totalAbsence = (Number(row.LeaveDays)||0) + (Number(row.AbsentDays)||0) + (Number(row.SickDays)||0);
        const statusLabel = totalAbsence > 10 ? 'Vắng mặt' : 'Đi làm';
        const statusColor = totalAbsence > 10 ? '#ef4444' : '#10b981';
        const statusBg = totalAbsence > 10 ? '#fee2e2' : '#dcfce7';
        return `
          <tr style="background:${idx % 2 === 0 ? '#fff' : '#f8fafc'}">
            <td>EMP-${String(row.EmployeeID).padStart(5,'0')}</td>
            <td style="font-weight:600;color:#1e293b">${row.FullName || '-'}</td>
            <td>${row.DepartmentName || '-'}</td>
            <td style="text-align:center">${Number(row.WorkDays)||0}</td>
            <td style="text-align:center">${Number(row.LeaveDays)||0}</td>
            <td style="text-align:center">${Number(row.AbsentDays)||0}</td>
            <td style="text-align:center">${Number(row.SickDays)||0}</td>
            <td style="text-align:center">
              <span style="background:${statusBg};color:${statusColor};padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700">${statusLabel}</span>
            </td>
          </tr>`;
      }).join('');

      const printContent = `<!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8"/>
          <title>Báo cáo Chấm công - Tháng ${displayMonth}/${displayYear}</title>
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
            .meta-cards { display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:24px; }
            .meta-card { border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px; }
            .meta-label { font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px; }
            .meta-value { font-size:18px;font-weight:800;color:#1e293b; }
            .meta-value.blue { color:#1d4ed8; } .meta-value.red { color:#ef4444; } .meta-value.green { color:#10b981; } .meta-value.amber { color:#f59e0b; }
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
        </head>
        <body>
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
            <div class="report-title">BÁO CÁO TỔNG HỢP CHẤM CÔNG</div>
            <div class="report-subtitle">Tháng ${displayMonth}/${displayYear} &mdash; Phòng ban: ${deptLabel} &mdash; Tổng: ${filteredReportRows.length} nhân viên</div>
          </div>
          <div class="meta-cards">
            <div class="meta-card"><div class="meta-label">Nhân viên</div><div class="meta-value blue">${filteredReportRows.length}</div></div>
            <div class="meta-card"><div class="meta-label">Tổng ngày nghỉ phép</div><div class="meta-value amber">${leaveDays}</div></div>
            <div class="meta-card"><div class="meta-label">Tổng ngày vắng</div><div class="meta-value red">${absentDays}</div></div>
            <div class="meta-card"><div class="meta-label">Tổng ngày ốm</div><div class="meta-value">${sickDays}</div></div>
            <div class="meta-card"><div class="meta-label">Tỷ lệ vắng mặt</div><div class="meta-value ${parseFloat(absenceRate) > 10 ? 'red' : 'green'}">${absenceRate}%</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Mã NV</th><th>Họ và Tên</th><th>Phòng ban</th>
                <th style="text-align:center">Ngày làm</th>
                <th style="text-align:center">Nghỉ phép</th>
                <th style="text-align:center">Vắng</th>
                <th style="text-align:center">Ốm</th>
                <th style="text-align:center">Trạng thái</th>
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
      const headers = ['Họ và tên', 'Mã nhân viên', 'Tổng số ngày nghỉ/vắng', 'Tần số', 'Trạng thái'];
      const rows = filteredReportRows.map(row => [
        row.FullName,
        `EMP-${String(row.EmployeeID).padStart(5, '0')}`,
        (Number(row.LeaveDays) || 0) + (Number(row.AbsentDays) || 0) + (Number(row.SickDays) || 0),
        row.LateDays || 0,
        ((Number(row.LeaveDays) || 0) + (Number(row.AbsentDays) || 0) + (Number(row.SickDays) || 0)) > 10 ? 'Vắng mặt' : 'Đi làm'
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `bao-cao-tong-hop-${displayMonth}-${displayYear}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setShowExportModal(false);
  };

  const filteredReportRows = useMemo(() => {
    let rows = selectedDepartment === 'ALL'
      ? reportRows
      : reportRows.filter((row) => row.DepartmentName === selectedDepartment);

    if (sortBy === 'lateDays') {
      rows = [...rows].sort((a, b) => {
        const valA = Number(a.LateDays) || 0;
        const valB = Number(b.LateDays) || 0;
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      });
    }
    return rows;
  }, [reportRows, selectedDepartment, sortBy, sortOrder]);

  // Reset trang khi filter thay doi
  useEffect(() => { setTablePage(1); }, [filteredReportRows]);

  const totalRows = filteredReportRows.length;
  const totalPages = Math.max(Math.ceil(totalRows / PAGE_SIZE), 1);
  const safePage = Math.min(tablePage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, totalRows);
  const pagedRows = filteredReportRows.slice(startIdx, endIdx);

  // Tinh toan thong ke toan bo (khong phan trang)
  const leaveDays = filteredReportRows.reduce((sum, row) => sum + (Number(row.LeaveDays) || 0), 0);
  const absentDays = filteredReportRows.reduce((sum, row) => sum + (Number(row.AbsentDays) || 0), 0);
  const sickDays = filteredReportRows.reduce((sum, row) => sum + (Number(row.SickDays) || 0), 0);
  const earlyLeaveDays = filteredReportRows.reduce((sum, row) => sum + (Number(row.EarlyLeaveDays) || 0), 0);
  const holidayDays = filteredReportRows.reduce((sum, row) => sum + (Number(row.HolidayDays) || 0), 0);
  const totalLateMinutes = filteredReportRows.reduce((sum, row) => sum + (Number(row.TotalLateMinutes) || 0), 0);
  const totalEarlyLeaveMinutes = filteredReportRows.reduce((sum, row) => sum + (Number(row.TotalEarlyLeaveMinutes) || 0), 0);
  const totalWorkDays = Math.max(
    filteredReportRows.reduce((sum, row) => sum + (Number(row.TotalWorkDays) || 0), 0),
    1
  );
  const absenceRate = (((absentDays + sickDays) / totalWorkDays) * 100).toFixed(1);
  const totalRequests = leaveDays + absentDays + sickDays + earlyLeaveDays;
  const topReason = sickDays >= leaveDays && sickDays >= absentDays
    ? 'Nghỉ ốm'
    : leaveDays >= absentDays
      ? 'Nghỉ phép'
      : 'Vắng mặt';

  const weekdayBars = useMemo(() => {
    const labels = ['THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7', 'CN'];
    const counts = reportMeta?.weekdayStats || [0, 0, 0, 0, 0, 0, 0];

    const totalEmployees = reportRows.length || 30;
    return labels.map((label, index) => ({
      label,
      value: counts[index],
      height: `${Math.max((counts[index] / totalEmployees) * 100, 2)}%`,
    }));
  }, [reportMeta]);

  const titleMonth = reportMeta?.yearMonth || '';
  const topStats = reportMeta?.totalStats || {};
  const displayMonth = titleMonth ? titleMonth.split('-')[1] : 'N/A';
  const displayYear = titleMonth ? titleMonth.split('-')[0] : new Date().getFullYear();

  // Tao danh sach so trang hien thi
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3) return [1, 2, 3, 4, totalPages];
    if (safePage >= totalPages - 2) return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, safePage - 1, safePage, safePage + 1, totalPages];
  }, [safePage, totalPages]);

  return (
    <section className="report-page">

      <div className="report-top" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <button 
            onClick={onBack}
            style={{ 
              background: '#fff', 
              border: '1px solid #e2e8f0', 
              padding: '8px 16px', 
              borderRadius: '10px', 
              cursor: 'pointer', 
              color: '#64748b', 
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
            ‹ Quay lại
          </button>
          <div>
            <p className="report-kicker" style={{ margin: 0, fontSize: '11px', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase' }}>Phân tích dữ liệu</p>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Tóm tắt tháng {displayMonth} năm {displayYear}</h2>
          </div>
        </div>
        
        <div className="report-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button type="button" className="chip-btn" style={{ borderRadius: '10px', height: '40px' }}>30 ngày cuối cùng</button>
          <div style={{ position: 'relative' }}>
            <select
              className="chip-btn active"
              style={{ 
                appearance: 'none', 
                background: '#2563eb', 
                color: '#fff', 
                border: 'none', 
                cursor: 'pointer', 
                padding: '0 32px 0 16px',
                borderRadius: '10px',
                height: '40px',
                fontWeight: '500'
              }}
              value={selectedMonth || ''}
              onChange={(e) => onMonthChange && onMonthChange(e.target.value)}
            >
              {availableMonths?.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#fff', fontSize: '10px' }}>▼</span>
          </div>
          <button type="button" className="chip-btn" style={{ borderRadius: '10px', height: '40px' }}>Phạm vi tùy chỉnh</button>
          <button type="button" className="primary" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', height: '40px', padding: '0 20px', fontWeight: '500' }}>
             Lọc theo ngày
          </button>
        </div>
      </div>

      <div className="report-cards">
        <article className="report-card">
          <div className="report-card-head"><span className="metric-icon">🗓</span><span className="metric-up">+2%</span></div>
          <p>Tổng số ngày nghỉ/vắng</p>
          <strong>{(leaveDays + absentDays + sickDays).toLocaleString('vi-VN')}</strong>
          <small>{(topStats.total_work_days || totalWorkDays).toLocaleString('vi-VN')} ngày làm việc</small>
        </article>
        <article className="report-card">
          <div className="report-card-head"><span className="metric-icon">✅</span><span className="metric-down">-0.4%</span></div>
          <p>Tỷ lệ vắng mặt trung bình</p>
          <strong>{absenceRate}%</strong>
          <small>Mục tiêu dưới 3.5%</small>
        </article>
        <article className="report-card">
          <div className="report-card-head"><span className="metric-icon">📁</span></div>
          <p>Loại phổ biến nhất</p>
          <strong>{topReason}</strong>
          <small>{Math.max(sickDays, leaveDays, absentDays)} lần tổng yêu cầu</small>
        </article>
        <article className="report-card">
          <div className="report-card-head"><span className="metric-icon">📋</span></div>
          <p>Yêu cầu đang xử lý</p>
          <strong>{totalRequests.toLocaleString('vi-VN')}</strong>
          <small>Đi trễ: {totalLateMinutes} phút • Về sớm: {totalEarlyLeaveMinutes} phút</small>
        </article>
      </div>

      <div className="report-visuals">
        <article className="panel report-bars">
          <div className="panel-head">
            <h3>Tỷ lệ nghỉ phép/vắng mặt</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="dot" style={{ background: 'linear-gradient(180deg, #1f7de8, #0f61c1)' }} /> Đi làm
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="dot" style={{ background: '#dce3ef' }} /> Vắng mặt
              </span>
            </div>
          </div>
          <div className="bar-grid">
            {weekdayBars.map((bar) => (
              <div key={bar.label} className="bar-item">
                <div className="bar-track">
                  <div className="bar-fill bar-bg" style={{ height: '100%' }} />
                  <div className="bar-fill" style={{ height: bar.height }} />
                </div>
                <span>{bar.label}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="panel report-donut">
          <h3>Phân bố theo loại nghỉ phép</h3>
          <div className="donut-ring">
            <div className="donut-value">
              <strong>{totalRequests.toLocaleString('vi-VN')}</strong>
              <span>Tổng số yêu cầu</span>
            </div>
          </div>
          <div className="donut-legend">
            <span><i className="dot dot-green" />Nghỉ phép: {leaveDays}</span>
            <span><i className="dot dot-red" />Vắng mặt: {absentDays}</span>
            <span><i className="dot dot-blue" />Nghỉ ốm: {sickDays}</span>
            <span><i className="dot dot-yellow" />Về sớm: {earlyLeaveDays}</span>
            <span><i className="dot dot-gray" />Nghỉ lễ: {holidayDays}</span>
          </div>
        </article>
      </div>

      <article className="panel report-table">
        {/* Header bảng với nút filter */}
        <div className="panel-head">
          <h3>Phân tích tình trạng vắng mặt của nhân viên</h3>
          <div className="report-table-filters">
            <select
              className="filter-chip-btn"
              style={{ padding: '6px 12px', border: '1px solid #dce1ec', borderRadius: '20px', background: '#fff', color: '#5f677b', fontSize: '13px', cursor: 'pointer', outline: 'none' }}
              value={selectedDepartment}
              onChange={(event) => { setSelectedDepartment(event.target.value); setTablePage(1); }}
              aria-label="Lọc theo phòng ban ở báo cáo"
            >
              <option value="ALL">Tất cả phòng ban</option>
              {departmentOptions.map((departmentName) => (
                <option key={departmentName} value={departmentName}>
                  {departmentName}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={`filter-chip-btn ${sortBy === 'lateDays' ? 'active' : ''}`}
              onClick={() => {
                if (sortBy === 'lateDays') {
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                } else {
                  setSortBy('lateDays');
                  setSortOrder('desc');
                }
                setTablePage(1);
              }}
            >
              ☰ Tần Số {sortBy === 'lateDays' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Mã nhân viên</th>
                <th>Tổng số ngày nghỉ/vắng</th>
                <th>Tần số</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#8b95ac' }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : pagedRows.map((row) => {
                const totalLeave = (Number(row.LeaveDays) || 0) + (Number(row.AbsentDays) || 0) + (Number(row.SickDays) || 0);
                const rowStatus = totalLeave > 10 ? 'Vắng mặt' : totalLeave > 4 ? 'Trễ' : 'Đi làm';
                const requestCount = Number(row.LateDays) || 0;
                const progress = Math.min((totalLeave / 30) * 100, 100);
                // Màu progress bar theo mức độ
                const barColor = totalLeave > 10 ? '#ef4444' : totalLeave > 4 ? '#f59e0b' : '#3b82f6';
                return (
                  <tr key={`${row.EmployeeID}-${row.AttendanceMonth}`}>
                    <td>
                      <div className="employee-cell">
                        <div className="employee-avatar">
                          {String(row.FullName || 'NV').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div className="employee-info">
                          <strong>{row.FullName}</strong>
                          <small>{row.DepartmentName || row.PositionName || 'Nhân viên'}</small>
                        </div>
                      </div>
                    </td>
                    <td>{`EMP-${String(row.EmployeeID).padStart(5, '0')}`}</td>
                    <td>
                      <div className="leave-meter">
                        <span className="leave-count">{totalLeave} Ngày</span>
                        <div className="leave-track">
                          <div
                            className="leave-progress"
                            style={{ width: `${progress}%`, background: barColor }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`request-badge ${requestCount > 5 ? 'badge-red' : requestCount > 2 ? 'badge-orange' : 'badge-blue'}`}>
                        {requestCount} Requests
                      </span>
                    </td>
                    <td><span className={`status-pill ${statusClass(rowStatus)}`}>{rowStatus}</span></td>
                    <td><button type="button" className="link-btn">Xem chi tiết</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="table-footer">
          <span>
            Hiển thị {totalRows === 0 ? 0 : startIdx + 1}-{endIdx} trong số {totalRows} nhân viên
          </span>
          <div className="pagination">
            <button
              type="button"
              className="page-btn"
              onClick={() => setTablePage((p) => Math.max(p - 1, 1))}
              disabled={safePage === 1}
              aria-label="Trang trước"
            >
              ‹
            </button>
            {pageNumbers.map((pageNum, idx) => {
              const showDots = idx > 0 && pageNum - pageNumbers[idx - 1] > 1;
              return (
                <span key={pageNum} className="page-slot">
                  {showDots && <span className="page-dots">…</span>}
                  <button
                    type="button"
                    className={`page-btn ${safePage === pageNum ? 'active' : ''}`}
                    onClick={() => setTablePage(pageNum)}
                  >
                    {pageNum}
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              className="page-btn"
              onClick={() => setTablePage((p) => Math.min(p + 1, totalPages))}
              disabled={safePage === totalPages}
              aria-label="Trang sau"
            >
              ›
            </button>
          </div>
        </div>
      </article>

      <div className="report-footer-actions">
        <button type="button" className="footer-btn footer-btn-back" onClick={onBack}>Quay lại</button>
        <div className="report-footer-right">
          <button type="button" className="footer-btn footer-btn-primary" onClick={onWorkAnniversaryClick}> Thông báo kỷ niệm ngày làm việc</button>
          <button type="button" className="footer-btn footer-btn-outline" onClick={() => setShowExportModal(true)}> Xuất File</button>
          <button type="button" className="footer-btn footer-btn-primary" onClick={onExcessiveLeaveClick}> Báo cáo lịch trình</button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="export-modal">
            <div className="modal-header">
              <div>
                <h3>Xuất file báo cáo</h3>
                <p>Mời chọn định dạng để tải file về</p>
              </div>
              <button className="close-modal-btn" onClick={() => setShowExportModal(false)}>&times;</button>
            </div>

            <div className="format-options">
              <div
                className={`format-card ${exportFormat === 'PDF' ? 'active' : ''}`}
                onClick={() => setExportFormat('PDF')}
              >
                <div className="format-icon pdf">PDF</div>
              </div>

              <div
                className={`format-card ${exportFormat === 'Excel' ? 'active' : ''}`}
                onClick={() => setExportFormat('Excel')}
              >
                <div className="format-icon excel">Excel</div>
              </div>
            </div>

            <div className="file-preview-box">
              <div className="preview-row">
                <span className="label">Tên file:</span>
                <span className="value">bao-cao-tong-hop-thang-{displayMonth}-{displayYear}</span>
              </div>
              <div className="preview-row">
                <span className="label">Định dạng:</span>
                <span className="value">{exportFormat}</span>
              </div>
              <div className="preview-row">
                <span className="label">Nội dung:</span>
                <span className="value">Báo cáo phân tích vắng mặt ({totalRows} nhân viên)</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowExportModal(false)}>Hủy</button>
              <button className="btn-download" onClick={handleDownload}>Tải file</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .export-modal {
          background: white; width: 500px; border-radius: 20px; padding: 30px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: modalFadeIn 0.3s ease-out;
          font-family: 'Inter', sans-serif;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
        .modal-header h3 { font-size: 20px; color: #1a202c; margin: 0 0 5px 0; text-align: left; width: 100%; }
        .modal-header p { font-size: 14px; color: #718096; margin: 0; text-align: left; }
        .close-modal-btn { background: #f7fafc; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #718096; font-size: 20px; }

        .format-options { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
        .format-card {
          border: 2px solid #edf2f7; border-radius: 12px; padding: 15px;
          display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer;
          transition: all 0.2s; position: relative; text-align: center;
        }
        .format-card:hover { border-color: #bee3f8; background: #ebf8ff; }
        .format-card.active { border-color: #3182ce; background: #ebf8ff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        
        .format-icon {
          font-weight: 700; font-size: 18px;
          display: flex; align-items: center; justify-content: center;
          padding: 10px;
        }
        .format-icon.pdf { color: #e53e3e; }
        .format-icon.excel { color: #38a169; }

        .file-preview-box {
          background: #f7fafc; border-radius: 12px; padding: 15px; margin-bottom: 25px; text-align: left;
        }
        .preview-row { display: flex; margin-bottom: 8px; font-size: 13px; }
        .preview-row:last-child { margin-bottom: 0; }
        .preview-row .label { color: #718096; width: 80px; }
        .preview-row .value { color: #2d3748; font-weight: 500; }

        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; }
        .btn-cancel {
          padding: 10px 25px; border-radius: 10px; border: none; background: #2d3748;
          color: white; font-weight: 600; cursor: pointer; transition: background 0.2s;
        }
        .btn-cancel:hover { background: #1a202c; }
        .btn-download {
          padding: 10px 25px; border-radius: 10px; border: none; background: #3182ce;
          color: white; font-weight: 600; cursor: pointer; transition: background 0.2s;
        }
        .btn-download:hover { background: #2b6cb0; }

        @media print {
          @page { size: A4 landscape; margin: 1cm; }
          body { background: white !important; margin: 0; padding: 0; }
          /* Hide all UI elements */
          nav, aside, .modal-overlay, .report-footer-actions, .report-header-row, .chip-btn, .footer-btn, button { 
            display: none !important; 
          }
          /* Ensure report page is visible and fills screen */
          .report-page { 
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .panel { 
            box-shadow: none !important; 
            border: 1px solid #ddd !important; 
            margin-bottom: 20px !important;
            break-inside: avoid;
          }
          .report-cards { 
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 10px !important;
          }
          .report-visuals {
            grid-template-columns: 1fr 1fr !important;
          }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #eee !important; }
        }
      ` }} />
    </section>
  );
}

export default ReportsAttendance;
