//홈 화면 펫 프로필
import apiClient from "./apiClient";

//프로필 추가
const addProfile = async (data) => {
  const formData = new FormData();

  formData.append("petName", data.petName);
  formData.append("petBreed", data.petBreed);
  formData.append("petBirthDate", data.petBirthDate);
  formData.append("avoidBreeds", data.avoidBreeds);
  formData.append("extraInfo", data.extraInfo);
  formData.append("petImageUrl", data.petImageUrl); // 이미지 URL도 그냥 문자열로 append

  const response = await axios.post(`${BASE_URL}/profiles`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};


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