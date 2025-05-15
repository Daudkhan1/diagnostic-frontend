import httpService from "./axios";

export const getAllUsers = async (query) => {
  const response = await httpService.get(`/api/user${query ? query : ""}`);
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await httpService.put(`/api/user/${id}/status`, {
    status: status,
  });
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await httpService.put(`/api/user/${id}/role`, {
    role: role,
  });
  return response.data;
};

export const getUserCounts = async (userRole) => {
  const response = await httpService.get(`/api/user/role/${userRole}/count`);
  return response.data;
};

export const getTransferUsers = async (query) => {
  const response = await httpService.get(`/api/user${query}`);
  return response.data;
};
