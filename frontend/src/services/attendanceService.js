// attendanceService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/attendance';

export const attendanceService = {
  // Lấy danh sách chấm công hôm nay (hoặc theo tháng)
  getTodayAttendance: async (date) => {
    try {
      const response = await axios.get(`${API_URL}/today`, { params: { date } });
      return response.data;
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      throw error;
    }
  },

  // Lấy tổng hợp chấm công
  getSummary: async (yearMonth) => {
    try {
      const response = await axios.get(`${API_URL}/summary`, { params: { yearMonth } });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      throw error;
    }
  },

  // Lấy danh sách cảnh báo nghỉ phép
  getExcessiveLeave: async (year, filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/excessive-leave`, { 
        params: { year, ...filters } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching excessive leave:', error);
      throw error;
    }
  },

  // Lấy thống kê Dashboard
  getDashboardStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard-stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Phân tích dữ liệu (Analytics)
  getAnalytics: async (year) => {
    try {
      // Giả sử có endpoint này được thêm vào attendance_routes
      // Hoặc nó được định nghĩa trong analytics_routes
      // Tạm thời gọi endpoint summary hoặc endpoint bạn sẽ tạo
      const response = await axios.get(`${API_URL}/analytics`, { params: { year } });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Lấy danh sách các tháng có dữ liệu
  getAvailableMonths: async () => {
    try {
      const response = await axios.get(`${API_URL}/available-months`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available months:', error);
      throw error;
    }
  }
};
