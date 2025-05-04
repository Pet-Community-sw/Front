//홈 화면 펫 프로필
import apiClient from "./apiClient";

//프로필 추가
const addProfile = async (formData) => {
  const response = await apiClient.post("/profiles", formData);
  return response.data;
}

//전체 프로필 조회
const viewProfiles = async () => {
  const response = await apiClient.get("/profiles");
  return response.data;
}

//특정 프로필 조회
const viewOneProfile = async (profileId) => {
  const response = await apiClient.get(`/profiles/${profileId}`);
  return response.data;
}

//프로필 수정
const modifyProfile = async (profileId, formData) => {
  const response = await apiClient.put(`/profiles/${profileId}`, formData);
  return response.data;
}

//프로필 삭제
const removeProfile = async (profileId) => {
  const response = await apiClient.delete(`/profiles/${profileId}`);
  return response.data;
}

export {addProfile, viewProfiles, viewOneProfile, modifyProfile, removeProfile};