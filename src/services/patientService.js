import httpService from "./axios";

const VITE_CANTALOUPE_SERVER = import.meta.env.VITE_CANTALOUPE_SERVER;

// export const getDetailsByNationalID = async (id) => {
//   const response = await httpService.get(`/api/patient/national-id/${id}`);
//   return response.data;
// };

export const getDetailsByMRN = async (id) => {
  const response = await httpService.get(`/api/patient/mrn/${id}`);
  return response.data;
};

export const uploadPatientImage = async (payload) => {
  const response = await httpService.post("/api/upload/image", payload);
  return response.data;
};

export const uploadPatientSlide = async (payload) => {
  const response = await httpService.post("/api/patient/slide", payload);
  return response.data;
};

export const getPatientSlideByID = async (id) => {
  const response = await httpService.get(`/api/patient/slide/${id}`);
  return response.data;
};

export const deletePatientSlideByID = async (id) => {
  try {
    const response = await httpService.delete(`/api/patient/slide/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting slide with ID ${id}:`, error);
    throw error;
  }
};

export const updatePatientSlideStatus = async (id, payload) => {
  const response = await httpService.put(
    `/api/patient/slide/${id}/status`,
    payload
  );
  return response.data;
};

export const fetchImageMetadata = async (currentSlide) => {
  const metadataUrl = `${VITE_CANTALOUPE_SERVER}${currentSlide}/info.json`;
  try {
    const response = await fetch(metadataUrl);
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error("Failed to fetch image metadata:", error);
    return null;
  }
};
