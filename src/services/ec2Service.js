import httpService from "./axios";

export const getEC2Status = async () => {
  const response = await httpService.get("/api/config/ec2TaskEnabled");
  return response.data;
};
export const changeEC2Status = async (status) => {
  const response = await httpService.put(
    `/api/config/ec2TaskEnabled?enabled=${status}`
  );
  return response;
};

export const getAnonymiserStatus = async () => {
  const response = await httpService.get("/api/config/anonymizer");
  return response.data;
};
export const changeAnonymiserStatus = async (status) => {
  const response = await httpService.put(
    `/api/config/anonymizer?enabled=${status}`
  );
  return response;
};
