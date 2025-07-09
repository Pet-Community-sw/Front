// axios 공통 api 설정, 요청마다 토큰 자동 추가
// 자동인증 시스템
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json", 
  }, 
   withCredentials: false,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  console.log("🧪 토큰 확인:", token);
  console.log("👉 axios 최종 요청 config 확인:", config.headers);

  // 로그인과 회원가입 요청은 토큰 없이 보냄
  if (
    config.url?.includes("/members/login") ||
    config.url?.includes("/members/signup")
  ) {
    return config;
  }

  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${token}`,
  };

  console.log("👉 최종 요청 헤더:", config.headers);
  return config;
});

/*
//응답 에러 발생 시 토큰 만료 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 토큰 만료로 401이면서, 재시도 아직 안 했으면
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken(); // → 갱신 API 요청
        if (newToken) {
          await AsyncStorage.setItem("accessToken", newToken); // 저장
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest); // 🔁 재요청
        }
      } catch (refreshError) {
        console.log("토큰 갱신 실패:", refreshError);
      }
    }
    return Promise.reject(error);
  }
);
*/
export default apiClient;