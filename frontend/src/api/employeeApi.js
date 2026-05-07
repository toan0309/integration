import axiosClient from "./axiosClient";

export const getEmployees = async () => {
  const response = await axiosClient.get("/employees");
  return response.data;
};

export const createEmployee = async (payload) => {
  const response = await axiosClient.post("/employees", payload);
  return response.data;
};

export const updateEmployee = async (employeeId, payload) => {
  const response = await axiosClient.put(`/employees/${employeeId}`, payload);
  return response.data;
};

export const deleteEmployee = async (employeeId) => {
  const response = await axiosClient.delete(`/employees/${employeeId}`);
  return response.data;
};