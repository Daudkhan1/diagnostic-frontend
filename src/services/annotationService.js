import httpService from "./axios";

export const createAnnotationInSlide = async (payload) => {
  const response = await httpService.post("/api/slide/annotation", payload);
  return response.data;
};

export const deleteAnnotationByID = async (slideID, annotationID) => {
  const response = await httpService.delete(
    `/api/slide/${slideID}/annotation/${annotationID}`
  );
  return response.data;
};

export const getAnnotationTypeList = async (type) => {
  const response = await httpService.get(
    `/api/slide/annotation/type/biological/${type}`
  );
  return response.data;
};

export const updateAnnotationState = async (
  slideId,
  annotationId,
  newState
) => {
  const response = await httpService.put(
    `/api/slide/${slideId}/annotations/${annotationId}/state`,
    {},
    { params: { state: newState } }
  );
  return response.data;
};

export const getAnnotationDetails = async (slideId, annotationId) => {
  const response = await httpService.get(
    `/api/slide/${slideId}/annotation/${annotationId}/details`
  );
  return response.data;
};

export const updateAllAnnotations = async (slideId, state) => {
  const response = await httpService.put(
    `/api/slide/${slideId}/annotations/state`,
    {},
    { params: { state } }
  );
  return response.data;
};

export const getSpectrumList = async (organName) => {
  const response = await httpService.get(
    `/api/disease-spectrum/organ/${organName}`
  );
  return response.data;
};

export const getGradingList = async (organName) => {
  const response = await httpService.get(
    `/api/grading/organ/${organName}`
  );
  return response.data;
};

export const getSubTypeList = async (organName) => {
  const response = await httpService.get(
    `/api/subtype/organ/${organName}`
  );
  return response.data;
};

export const getGradingListBySpectrum = async (organName, diseaseSpectrum) => {
  const response = await httpService.get(
    `/api/grading/organ/${organName}/disease-spectrum/${diseaseSpectrum}`
  );
  return response.data;
};
    
export const updateAnnotation = async (slideId, annotationId, caseType, payload) => {
  const response = await httpService.put(
    `/api/slide/${slideId}/annotations/${annotationId}?caseType=${caseType}`,
    payload
  );
  return response.data;
};