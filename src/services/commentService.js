import httpService from "./axios";

export const getCommentsByID = async (id) => {
  const response = await httpService.get(`/api/comment?caseId=${id}`);
  return response.data;
};

export const addCommentByID = async (id, comment) => {
  const response = await httpService.post("/api/comment", {
    caseId: id,
    commentText: comment,
  });
  return response.data;
};

export const editCommentByID = async (id, caseID, comment) => {
  const response = await httpService.put(`/api/comment/${id}`, {
    caseId: caseID,
    commentText: comment,
  });
  return response.data;
};
