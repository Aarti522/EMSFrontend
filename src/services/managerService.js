import api from "./api";

export const getMyTeam = async () => {
  const response = await api.get("/manager/my-team");
  return response.data;
};