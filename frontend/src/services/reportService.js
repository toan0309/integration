// reportService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reports';

export const reportService = {
  getAttendanceReport: async (yearMonth) => {
    try {
      const response = await axios.get(`${API_URL}/attendance`, { params: { yearMonth } });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      throw error;
    }
  },

  getStatus: async () => {
    try {
      const response = await axios.get(`${API_URL}/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report status:', error);
      throw error;
    }
  }
};
