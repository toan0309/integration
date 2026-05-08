import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const WorkAnniversaryAlert = ({ onBack, employees: propsEmployees, departmentOptions }) => {
  // const navigate = useNavigate(); // Removed router dependency
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [giftModal, setGiftModal] = useState(null); // { emp } - employee being gifted
  const [selectedGift, setSelectedGift] = useState(null);
  const [giftConfirmed, setGiftConfirmed] = useState(false);

  const GIFTS = [
    { id: 1, icon: '🎁', label: 'Quà tặng kỷ niệm', desc: 'Hộp quà cao cấp được đóng gói tinh tế', tag: 'Phổ biến', tagColor: '#3b82f6', price: '500.000₫', bg: '#eff6ff' },
    { id: 2, icon: '💳', label: 'Thẻ quà tặng', desc: 'Voucher mua sắm linh hoạt toàn quốc', tag: 'Nhanh nhất', tagColor: '#10b981', price: '1.000.000₫', bg: '#ecfdf5' },
    { id: 3, icon: '🏆', label: 'Thưởng thành tích', desc: 'Tiền thưởng gửi thẳng vào tài khoản lương', tag: 'Cao nhất', tagColor: '#f59e0b', price: '2.000.000₫', bg: '#fffbeb' },
    { id: 4, icon: '🌸', label: 'Hoa & Thiệp', desc: 'Bó hoa tươi kèm thiệp chúc tay viết', tag: 'Ý nghĩa', tagColor: '#ec4899', price: '300.000₫', bg: '#fdf2f8' },
    { id: 5, icon: '🍽️', label: 'Voucher ăn uống', desc: 'Bữa tối cho 2 người tại nhà hàng 5 sao', tag: 'Trải nghiệm', tagColor: '#8b5cf6', price: '800.000₫', bg: '#f5f3ff' },
    { id: 6, icon: '📦', label: 'Gói chăm sóc sức khỏe', desc: 'Gói spa & wellness cao cấp 1 năm', tag: 'Mới', tagColor: '#ef4444', price: '1.500.000₫', bg: '#fef2f2' },
  ];
  
  // Alert Form State
  const [alertType, setAlertType] = useState('Kỷ niệm 1 năm');
  const [targetAudience, setTargetAudience] = useState('Tất cả nhân viên');
  const [sendTime, setSendTime] = useState('Đúng ngày');
  const [channels, setChannels] = useState({ email: true, sms: false, inapp: true });
  const [alertMessage, setAlertMessage] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedDept, setSelectedDept] = useState('Tất cả các phòng ban');
  const [selectedMilestone, setSelectedMilestone] = useState('Tất cả các cột mốc');

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        // Luôn fetch danh sách nhân viên mới nhất từ DB để tính kỷ niệm
        const response = await axios.get('http://localhost:5000/api/attendance/employees');
        if (response.data && response.data.success) {
          const currentYear = new Date().getFullYear();
          
          const processed = response.data.data.map(emp => {
            const hireYear = emp.HireDate ? new Date(emp.HireDate).getFullYear() : currentYear;
            const years = currentYear - hireYear;
            return {
              id: `EMP-${String(emp.EmployeeID).padStart(5, '0')}`,
              name: emp.FullName,
              email: emp.Email || '',
              hireDate: emp.HireDate || '-',
              department: emp.DepartmentName || 'Chưa có',
              years: years > 0 ? years : 0
            };
          });
          
          setEmployees(processed);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);

  // Extract unique departments
  const departments = useMemo(() => {
    const deps = new Set(employees.map(e => e.department));
    return ['Tất cả các phòng ban', ...Array.from(deps)];
  }, [employees]);

  // Apply filters
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // 1. Department filter
      if (selectedDept !== 'Tất cả các phòng ban' && emp.department !== selectedDept) {
        return false;
      }
      
      // 2. Milestone range filter
      if (selectedMilestone !== 'Tất cả các cột mốc') {
        const y = emp.years;
        if (selectedMilestone === '1-3 năm' && (y < 1 || y > 3)) return false;
        if (selectedMilestone === '3-7 năm' && (y <= 3 || y > 7)) return false;
        if (selectedMilestone === '7-15 năm' && (y <= 7 || y > 15)) return false;
        if (selectedMilestone === 'Trên 15 năm' && y <= 15) return false;
      }
      
      // 3. Only show people with actual anniversaries > 0 (optional, but good for "kỷ niệm")
      if (emp.years === 0) return false;

      return true;
    }).sort((a, b) => b.years - a.years); // sort by highest years first
  }, [employees, selectedDept, selectedMilestone]);

  const handleDownload = () => {
    if (exportFormat === 'PDF') {
      const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const milestoneLabel = selectedMilestone === 'Tất cả các cột mốc' ? 'Tất cả các cột mốc' : selectedMilestone;
      const deptLabel = selectedDept === 'Tất cả các phòng ban' ? 'Toàn công ty' : selectedDept;

      const tableRows = filteredEmployees.map((emp, idx) => `
        <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}">
          <td>${emp.id}</td>
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:32px;height:32px;border-radius:50%;background:#fee2e2;color:#ef4444;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">
                ${emp.name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()}
              </div>
              <div>
                <div style="font-weight:600;color:#1e293b">${emp.name}</div>
                <div style="font-size:11px;color:#94a3b8">${emp.email}</div>
              </div>
            </div>
          </td>
          <td>${emp.department}</td>
          <td>${emp.hireDate}</td>
          <td style="text-align:center">
            <span style="background:#fee2e2;color:#ef4444;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700">${emp.years} năm</span>
          </td>
        </tr>
      `).join('');

      const printContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <title>Báo cáo Lễ Kỷ niệm - ${new Date().getFullYear()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background: #fff; color: #1e293b; padding: 24px 32px; font-size: 13px; }

            /* ── Header ── */
            .report-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 20px; border-bottom: 3px solid #1d4ed8; margin-bottom: 24px; }
            .company-logo { display: flex; align-items: center; gap: 12px; }
            .logo-icon { width: 48px; height: 48px; background: linear-gradient(135deg,#1d4ed8,#7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px; font-weight: 800; }
            .company-name { font-size: 18px; font-weight: 800; color: #1e293b; }
            .company-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
            .report-date { text-align: right; }
            .report-date p { font-size: 11px; color: #64748b; margin-bottom: 2px; }
            .report-date strong { font-size: 13px; color: #1e293b; }

            /* ── Title ── */
            .report-title-section { text-align: center; margin-bottom: 24px; }
            .report-title { font-size: 22px; font-weight: 800; color: #1d4ed8; margin-bottom: 6px; }
            .report-subtitle { font-size: 13px; color: #64748b; }

            /* ── Meta cards ── */
            .meta-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
            .meta-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
            .meta-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .meta-value { font-size: 16px; font-weight: 800; color: #1e293b; }
            .meta-value.blue { color: #1d4ed8; }
            .meta-value.red { color: #ef4444; }

            /* ── Table ── */
            table { width: 100%; border-collapse: collapse; }
            thead { background: linear-gradient(135deg,#1d4ed8,#4f46e5); }
            thead th { padding: 12px 14px; color: #fff; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
            tbody td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
            tbody tr:last-child td { border-bottom: none; }

            /* ── Footer ── */
            .report-footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
            .footer-note { font-size: 10px; color: #94a3b8; }
            .footer-signature { text-align: right; }
            .footer-signature p { font-size: 11px; color: #64748b; }
            .footer-signature .sig-line { margin-top: 32px; border-top: 1px solid #1e293b; width: 160px; margin-left: auto; padding-top: 6px; font-size: 11px; font-weight: 600; color: #1e293b; }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="report-header">
            <div class="company-logo">
              <div class="logo-icon">HR</div>
              <div>
                <div class="company-name">HỆ THỐNG QUẢN LÝ NHÂN SỰ</div>
                <div class="company-sub">Bộ phận Nhân sự &amp; Đào tạo</div>
              </div>
            </div>
            <div class="report-date">
              <p>Ngày xuất báo cáo</p>
              <strong>${today}</strong>
            </div>
          </div>

          <!-- Title -->
          <div class="report-title-section">
            <div class="report-title">BÁO CÁO LỄ KỸ NIỆM LÀM VIỆC</div>
            <div class="report-subtitle">Năm ${new Date().getFullYear()} &mdash; Phòng ban: ${deptLabel} &mdash; Cột mốc: ${milestoneLabel}</div>
          </div>

          <!-- Meta Cards -->
          <div class="meta-cards">
            <div class="meta-card">
              <div class="meta-label">Tổng nhân viên</div>
              <div class="meta-value blue">${filteredEmployees.length} người</div>
            </div>
            <div class="meta-card">
              <div class="meta-label">Số năm trung bình</div>
              <div class="meta-value">${filteredEmployees.length > 0 ? (filteredEmployees.reduce((s,e)=>s+e.years,0)/filteredEmployees.length).toFixed(1) : 0} năm</div>
            </div>
            <div class="meta-card">
              <div class="meta-label">Cao nhất</div>
              <div class="meta-value red">${filteredEmployees.length > 0 ? Math.max(...filteredEmployees.map(e=>e.years)) : 0} năm</div>
            </div>
          </div>

          <!-- Table -->
          <table>
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ và Tên</th>
                <th>Phòng ban</th>
                <th>Ngày vào làm</th>
                <th>Số năm</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>

          <!-- Footer -->
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

          <script>window.onload = function(){ window.print(); window.onafterprint = function(){ window.close(); }; }</script>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank', 'width=900,height=700');
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      const headers = ['Mã NV', 'Họ tên', 'Phòng ban', 'Ngày vào làm', 'Số năm làm việc'];
      const rows = filteredEmployees.map(emp => [
        emp.id,
        emp.name,
        emp.department,
        emp.hireDate,
        `${emp.years} năm`
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `danh-sach-ky-niem-${new Date().getFullYear()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setShowExportModal(false);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button 
          onClick={onBack}
          style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#64748b', fontSize: '13px', marginRight: '16px' }}
        >
          ‹ Quay lại
        </button>
        <span style={{ color: '#64748b', fontSize: '14px' }}>
          Ghi nhận những cột mốc quan trọng và cùng ăn mừng hành trình của đội nhóm.
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <button 
            onClick={() => setShowExportModal(true)}
            style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Xuất File
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '600' }}>NĂM LỌC</label>
          <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff', color: '#334155' }}>
            <option>2026 (Hiện tại)</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '600' }}>PHÒNG</label>
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff', color: '#334155' }}
          >
            {departments.map((dep, idx) => (
              <option key={idx} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '600' }}>LOẠI MỐC QUAN TRỌNG</label>
          <select 
            value={selectedMilestone}
            onChange={(e) => setSelectedMilestone(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff', color: '#334155' }}
          >
            <option>Tất cả các cột mốc</option>
            <option>1-3 năm</option>
            <option>3-7 năm</option>
            <option>7-15 năm</option>
            <option>Trên 15 năm</option>
          </select>
        </div>
        <div>
          <button 
            onClick={() => setShowModal(true)}
            style={{ backgroundColor: '#1d4ed8', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            + Tạo cảnh báo
          </button>
        </div>
      </div>

      {/* Main Content Two Columns */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Column - Table */}
        <div style={{ flex: '2', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#334155', fontWeight: '600' }}>DANH SÁCH NHÂN VIÊN KỶ NIỆM</h3>
            <span style={{ color: '#3b82f6', fontSize: '13px', fontWeight: '500' }}>{filteredEmployees.length} Thông báo mới</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '12px 8px', color: '#64748b', fontSize: '12px', fontWeight: '600' }}>MÃ SỐ NHÂN VIÊN</th>
                <th style={{ padding: '12px 8px', color: '#64748b', fontSize: '12px', fontWeight: '600' }}>HỌ VÀ TÊN</th>
                <th style={{ padding: '12px 8px', color: '#64748b', fontSize: '12px', fontWeight: '600' }}>PHÒNG BAN</th>
                <th style={{ padding: '12px 8px', color: '#64748b', fontSize: '12px', fontWeight: '600' }}>NĂM VÀO LÀM</th>
                <th style={{ padding: '12px 8px', color: '#64748b', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>SỐ NĂM LÀM</th>
                <th style={{ padding: '12px 8px', color: '#64748b', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>HOẠT ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</td></tr>
              ) : filteredEmployees.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Không có nhân viên nào phù hợp</td></tr>
              ) : filteredEmployees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '16px 8px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>{emp.id}</td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600' }}>
                        {emp.name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>{emp.name}</div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px', color: '#64748b', fontSize: '14px' }}>{emp.department}</td>
                  <td style={{ padding: '16px 8px', color: '#64748b', fontSize: '14px' }}>{emp.hireDate}</td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                      {emp.years} năm
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center', color: '#3b82f6', cursor: 'pointer' }}>
                    ✎
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', color: '#64748b', fontSize: '13px' }}>
            <span>Hiển thị 1-{filteredEmployees.length} trên {filteredEmployees.length} thông báo</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Trang 1/1
              <button style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '4px', padding: '2px 6px', color: '#cbd5e1' }}>‹</button>
              <button style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '4px', padding: '2px 6px', color: '#cbd5e1' }}>›</button>
            </div>
          </div>
        </div>

        {/* Right Column - Cards */}
        <div style={{ flex: '1', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#334155', fontWeight: '600' }}>DANH SÁCH LỄ KỶ NIỆM</h3>
            <span style={{ color: '#3b82f6', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>View All</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredEmployees.slice(0, 3).map(emp => (
              <div key={emp.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600' }}>
                      {emp.name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>{emp.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>{emp.email}</div>
                    </div>
                  </div>
                  <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: '700' }}>{emp.years} NĂM</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => { setGiftModal({ emp }); setSelectedGift(null); setGiftConfirmed(false); }}
                    style={{ flex: 1, backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 0', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Lựa chọn quà tặng
                  </button>
                  <button style={{ width: '36px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                    📅
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Summary Bar */}
      <div style={{ marginTop: '24px', backgroundColor: '#1d4ed8', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            🎗️
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Tóm tắt tháng kỷ niệm</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#bfdbfe' }}>Bạn có 8 ngày kỷ niệm sắp tới trong vòng 30 ngày.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '48px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>8</div>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>TỔNG SỐ CẢNH BÁO</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>4</div>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>THỜI HẠN CAO</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>2</div>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>THỜI GIAN HỌC VIỆC 1 NĂM</div>
          </div>
        </div>
      </div>

      {/* Gift Modal */}
      {giftModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '640px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 64px -12px rgba(0,0,0,0.3)', fontFamily: 'Inter,sans-serif' }}>
            
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', borderRadius: '24px 24px 0 0', padding: '28px 28px 24px', color: '#fff', position: 'relative' }}>
              <button onClick={() => setGiftModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', flexShrink: 0 }}>
                  {giftModal.emp.name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chọn quà tặng cho</p>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>{giftModal.emp.name}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{giftModal.emp.department} · {giftModal.emp.years} năm làm việc 🎉</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '28px' }}>
              {giftConfirmed ? (
                // Success state
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: '72px', height: '72px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>✅</div>
                  <h3 style={{ fontSize: '20px', color: '#15803d', margin: '0 0 8px' }}>Đã gửi quà thành công!</h3>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px' }}>Quà <strong>{GIFTS.find(g => g.id === selectedGift)?.label}</strong> đã được ghi nhận cho <strong>{giftModal.emp.name}</strong>.</p>
                  <button onClick={() => setGiftModal(null)} style={{ background: '#1d4ed8', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Hoàn tất</button>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px', fontWeight: '500' }}>CHỌN LOẠI QUÀ TẶNG</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
                    {GIFTS.map(gift => (
                      <div
                        key={gift.id}
                        onClick={() => setSelectedGift(gift.id)}
                        style={{
                          border: selectedGift === gift.id ? '2px solid #1d4ed8' : '2px solid #f1f5f9',
                          borderRadius: '16px',
                          padding: '16px',
                          cursor: 'pointer',
                          background: selectedGift === gift.id ? '#eff6ff' : '#fff',
                          transition: 'all 0.18s',
                          position: 'relative',
                        }}
                      >
                        <span style={{ position: 'absolute', top: '10px', right: '10px', background: gift.tagColor, color: '#fff', fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>{gift.tag}</span>
                        <div style={{ width: '44px', height: '44px', background: gift.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '12px' }}>{gift.icon}</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{gift.label}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', lineHeight: 1.5 }}>{gift.desc}</div>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#1d4ed8' }}>{gift.price}</div>
                        {selectedGift === gift.id && (
                          <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', height: '20px', background: '#1d4ed8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px' }}>✓</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedGift && (
                    <div style={{ background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', border: '1px solid #ddd6fe', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#7c3aed', fontWeight: '600', textTransform: 'uppercase' }}>Đã chọn</p>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{GIFTS.find(g => g.id === selectedGift)?.icon} {GIFTS.find(g => g.id === selectedGift)?.label}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#64748b' }}>Trị giá</p>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1d4ed8' }}>{GIFTS.find(g => g.id === selectedGift)?.price}</p>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setGiftModal(null)} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer', color: '#475569' }}>Hủy</button>
                    <button
                      onClick={() => selectedGift && setGiftConfirmed(true)}
                      style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: selectedGift ? 'linear-gradient(135deg,#1d4ed8,#7c3aed)' : '#e2e8f0', color: selectedGift ? '#fff' : '#94a3b8', fontWeight: '700', fontSize: '14px', cursor: selectedGift ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                    >
                      🎁 Xác nhận gửi quà
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '560px', maxWidth: '90%', padding: '0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>🔔</span>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Tạo cảnh báo kỷ niệm ngày làm việc</h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '20px' }}>×</button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>LOẠI CẢNH BÁO</label>
                <select 
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', outline: 'none' }}
                >
                  <option>Kỷ niệm 1 năm</option>
                  <option>Kỷ niệm 3 năm</option>
                  <option>Kỷ niệm 5 năm</option>
                  <option>Kỷ niệm 10 năm</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>ĐỐI TƯỢNG ÁP DỤNG</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#6b21a8' }}>👥</span>
                  <select 
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', outline: 'none' }}
                  >
                    <option>Tất cả nhân viên</option>
                    {departments.filter(d => d !== 'Tất cả các phòng ban').map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>THỜI ĐIỂM GỬI</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={sendTime}
                    onChange={(e) => setSendTime(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', outline: 'none' }}
                  >
                    <option>Đúng ngày</option>
                    <option>Trước 1 ngày</option>
                    <option>Trước 3 ngày</option>
                  </select>
                  <span style={{ position: 'absolute', right: '12px', top: '10px', color: '#94a3b8' }}>⏱️</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>KÊNH THÔNG BÁO</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={channels.email}
                      onChange={(e) => setChannels({...channels, email: e.target.checked})}
                      style={{ accentColor: '#a855f7' }} 
                    />
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>📧 EMAIL</span>
                  </label>
                  <label style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={channels.sms}
                      onChange={(e) => setChannels({...channels, sms: e.target.checked})}
                      style={{ accentColor: '#a855f7' }} 
                    />
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8' }}>💬 SMS</span>
                  </label>
                  <label style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={channels.inapp}
                      onChange={(e) => setChannels({...channels, inapp: e.target.checked})}
                      style={{ accentColor: '#a855f7' }} 
                    />
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>🔔 IN-APP</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>NỘI DUNG THÔNG BÁO</label>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{alertMessage.length}/500</span>
                </div>
                <textarea 
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  maxLength={500}
                  placeholder="Nhập nội dung thông báo tùy chỉnh..." 
                  style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', resize: 'none', color: '#334155', outline: 'none' }}
                />
              </div>

              <div style={{ backgroundColor: '#eff6ff', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>⚡</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>Kích hoạt ngay</div>
                    <div style={{ fontSize: '12px', color: '#3b82f6' }}>Hệ thống sẽ bắt đầu quét dữ liệu ngay lập tức</div>
                  </div>
                </div>
                <div 
                  onClick={() => setIsActive(!isActive)}
                  style={{ width: '40px', height: '24px', backgroundColor: isActive ? '#3b82f6' : '#cbd5e1', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s' }}
                >
                  <div style={{ width: '18px', height: '18px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: isActive ? '19px' : '3px', transition: 'left 0.2s' }}></div>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', backgroundColor: '#fff' }}>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                Hủy
              </button>
              <button 
                onClick={() => { setShowModal(false); setShowSuccessModal(true); }}
                style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                Tạo cảnh báo
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '480px', maxWidth: '90%', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            
            <div style={{ width: '64px', height: '64px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>Tạo cảnh báo thành công!</h2>
            <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}>Hệ thống đã ghi nhận thiết lập cảnh báo kỷ niệm của bạn.</p>
            
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '13px', marginBottom: '16px' }}>
                <div style={{ color: '#64748b', fontWeight: '600' }}>Loại cảnh báo:</div>
                <div style={{ color: '#334155', fontWeight: '500' }}>{alertType}</div>
                
                <div style={{ color: '#64748b', fontWeight: '600' }}>Đối tượng:</div>
                <div style={{ color: '#334155', fontWeight: '500' }}>{targetAudience}</div>
                
                <div style={{ color: '#64748b', fontWeight: '600' }}>Thời điểm:</div>
                <div style={{ color: '#334155', fontWeight: '500' }}>{sendTime}</div>
                
                <div style={{ color: '#64748b', fontWeight: '600' }}>Kênh gửi:</div>
                <div style={{ color: '#334155', fontWeight: '500' }}>
                </div>
              </div>
              
              {alertMessage && (
                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
                  <div style={{ color: '#64748b', fontWeight: '600', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>Nội dung thông báo:</div>
                  <div style={{ color: '#334155', fontSize: '14px', fontStyle: 'italic', backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>
                    "{alertMessage}"
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => {
                setShowSuccessModal(false);
                setAlertMessage('');
              }}
              style={{ width: '100%', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              Hoàn tất
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="export-modal">
            <div className="modal-header">
              <div>
                <h3>Xuất file danh sách</h3>
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
                <span className="value">danh-sach-ky-niem-{new Date().getFullYear()}</span>
              </div>
              <div className="preview-row">
                <span className="label">Định dạng:</span>
                <span className="value">{exportFormat}</span>
              </div>
              <div className="preview-row">
                <span className="label">Nội dung:</span>
                <span className="value">Danh sách kỷ niệm ({filteredEmployees.length} nhân viên)</span>
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
      ` }} />
    </div>
  );
};

export default WorkAnniversaryAlert;
