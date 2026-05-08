import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import '../../styles/table.scss';

const AttendanceAnalytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Vì backend có endpoint /dashboard-stats trả về thống kê
      const result = await attendanceService.getDashboardStats();
      if (result.success) {
        // Tạm thời giả lập data biểu đồ vì endpoint analytics chưa hoàn thiện hoàn toàn trên frontend chart
        // Hoặc có thể gọi API phân tích chi tiết nếu bạn thêm route
        setData([result.today]);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Lỗi khi tải dữ liệu phân tích');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analytics-page animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>Phân Tích Chấm Công {currentYear}</h1>
        <p style={{ color: '#6b7280' }}>Tổng quan tình hình nhân sự và chấm công</p>
      </div>

      {error && <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', fontSize: '0.875rem', textTransform: 'uppercase' }}>Tổng Nhân Sự</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4f46e5' }}>{data[0]?.total || 0}</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', fontSize: '0.875rem', textTransform: 'uppercase' }}>Số Ngày Công</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{data[0]?.present || 0}</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', fontSize: '0.875rem', textTransform: 'uppercase' }}>Tổng Vắng Mặt</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{data[0]?.absent || 0}</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', fontSize: '0.875rem', textTransform: 'uppercase' }}>Nghỉ Phép</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{data[0]?.leave || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAnalytics;
