import api from "./api";

export const getProfile = async () => {
  const response = await api.get("/profile");
  return response.data.data;
};

export const updateProfile = async (name: string) => {
  const response = await api.put("/profile", { name });
  return response.data.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const response = await api.put("/profile/password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};
