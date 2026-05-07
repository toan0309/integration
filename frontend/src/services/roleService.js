import api from "../utils/api";

export const getData = async () => {
  const response = await api.get("/");
  return response.data;
};
