import httpService from "./axios";

export const getDashboardCard = async () => {
  const response = await httpService.get("/api/dashboard");
  return response.data;
};
