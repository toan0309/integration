import axiosClient from "./axiosClient";

export const getDepartments = async () => {
  const response = await axiosClient.get("/departments");
  return response.data;
};

export const getPositions = async () => {
  const response = await axiosClient.get("/positions");
  return response.data;
};