import httpService from "./axios";

export const getAllCases = async (query) => {
  const response = await httpService.get(`/api/case${query}`);
  return response.data;
};

export const updateCaseStatus = async (id, payload) => {
  const response = await httpService.put(`/api/case/${id}/status`, payload);
  return response.data;
};

export const getCaseByID = async (id) => {
  const response = await httpService.get(`/api/case/${id}`);
  return response.data;
};

export const createPatientCase = async (payload) => {
  const response = await httpService.post("/api/case/patient", payload);
  return response.data;
};

export const assignCaseByID = async (caseID) => {
  const response = await httpService.put(`/api/case/${caseID}/assign`);
  return response.data;
};

export const createReportbyCaseID = async (payload) => {
  const response = await httpService.post("/api/report", payload);
  return response.data;
};

export const downloadPathologyReport = async (caseID) => {
  const response = await httpService.get(
    `/api/case/${caseID}/report/pathology`
  );
  return response.data;
};

export const downloadRadiologyReport = async (caseID) => {
  const response = await httpService.get(
    `/api/case/${caseID}/report/radiology`
  );
  return response.data;
};

export const fetchCaseStatistics = async (caseType) => {
  const response = await httpService.get(
    `api/case/type/${caseType}/status/count`
  );
  return response.data;
};

export const getCaseSlidesStatus = async (id) => {
  const response = await httpService.get(
    `/api/case/${id}/patient/slide/status`
  );
  return response.data;
};

export const assignCaseToMe = async (caseId) => {
  const response = await httpService.post(`/api/case/${caseId}/assign`);
  return response.data;
};

export const unAssignCaseToMe = async (
  caseId,
  deleteAnnotationsAndComments = true
) => {
  const response = await httpService.post(
    `/api/case/${caseId}/unassign?deleteAnnotationsAndComments=${deleteAnnotationsAndComments}`
  );
  return response.data;
};

export const createDiagnosis = async (payload) => {
  const response = await httpService.post(`/api/diagnosis`, payload);
  return response.data;
};

export const createFeedback = async (payload) => {
  const response = await httpService.post(`/api/feedback`, payload);
  return response.data;
};

export const getLatestCaseStatus = async (caseId) => {
  const response = await httpService.get(`/api/case/${caseId}/latest-status`);
  return response.data;
};

export const getTransferStatus = async (caseId) => {
  const response = await httpService.get(
    `/api/case/${caseId}/latest-transfer-status`
  );
  return response.data;
};

export const postTransferCase = async (caseId, targetPathologistId) => {
  const response = await httpService.post(
    `/api/case/${caseId}/transfer?targetPathologistId=${targetPathologistId}`
  );
  return response.data;
};

export const postCompleteCase = async (caseId) => {
  const response = await httpService.post(`/api/case/${caseId}/complete`);
  return response.data;
};
