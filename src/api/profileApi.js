//홈 화면 펫 프로필
import apiClient from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "./apiClient";

// 프로필 추가
export const addProfile = async (data) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    const formData = new FormData();

    formData.append("petName", data.petName);
    formData.append("petBreed", data.petBreed);
    formData.append("petBirthDate", data.petBirthDate);
    formData.append("avoidBreeds", data.avoidBreeds);
    formData.append("extraInfo", data.extraInfo);

    if (data.petImageUrl?.uri) {
      formData.append("petImageUrl", {
        uri: data.petImageUrl.uri,
        name: data.petImageUrl.name || "photo.jpg",
        type: "image/jpeg",
      });
    }

    console.log("🔥 보내는 토큰:", token);
    for (let pair of formData.entries()) {
      console.log(`🔥 FormData - ${pair[0]}:`, pair[1]);
    }

    // ✅ 요청 직전에 인터셉터 설정
    axios.interceptors.request.use((config) => {
      console.log("🛰️ Axios 요청 구성:", config);
      return config;
    });

    const response = await axios.post(`${BASE_URL}/profiles`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
  console.log("❌ API 요청 실패:", {
    message: error.message,
    response: error.response,
    data: error.response?.data,
    status: error.response?.status,
    headers: error.response?.headers,
  });

  throw new Error(error.response?.data?.message || "전체 프로필 조회 실패");
}

};

// 전체 프로필 조회
export const viewProfiles = async () => {
  try {
    const response = await apiClient.get("/profiles");
    return response.data;
  } catch (error) {
  console.log("❌ API 요청 실패:", {
    message: error.message,
    response: error.response,
    data: error.response?.data,
    status: error.response?.status,
    headers: error.response?.headers,
  });
}
}

// 특정 프로필 조회
export const viewOneProfile = async (profileId) => {
  try {
    const response = await apiClient.get(`/profiles/${profileId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "프로필 상세 조회 실패");
  }
};

// 프로필 수정
export const modifyProfile = async (profileId, formData) => {
  try {
    const response = await apiClient.put(`/profiles/${profileId}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "프로필 수정 실패");
  }
};

// 프로필 삭제
export const removeProfile = async (profileId) => {
  try {
    const response = await apiClient.delete(`/profiles/${profileId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "프로필 삭제 실패");
  }
};

//프로필 액세스 토큰 발급
export const fetchProfileToken = async (profileId) => {
  try {
    const response = await apiClient.post(`/profiles/token/${profileId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "프로필 토큰 발급 실패");
  }
};
