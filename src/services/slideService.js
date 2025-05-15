import httpService from "./axios";

export const getSlideAnnotations = async (slideID) => {
  const response = await httpService.get(`/api/slide?slideId=${slideID}`);
  return response.data;
};

export const getSlideDetailsByID = async (id) => {
  const response = await httpService.get(
    `/api/patient/slide/${id}/details`
  );
  return response.data;
};

export const getOrganOptions = async () => {
  const response = await httpService.get("/api/organ");
  return response.data;
};