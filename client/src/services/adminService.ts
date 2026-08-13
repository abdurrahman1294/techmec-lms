import api from "./api";

export const getUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data.data;
};

export const updateUserStatus = async (
  id: number,
  status: "ACTIVE" | "SUSPENDED"
) => {
  const response = await api.patch(`/admin/users/${id}/status`, {
    status,
  });
  return response.data.data;
};

export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data.data;
};

export const getSystemLogs = async () => {
  const response = await api.get("/admin/logs");
  return response.data.data;
};
