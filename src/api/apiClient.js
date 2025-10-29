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
  
  console.log("🌐 API 요청 정보:", {
    baseURL: config?.baseURL || "(baseURL 없음)",
    endpoint: config?.url,
    token: token ? token.substring(0, 20) + "..." : "없음",
  });
  

  // 로그인과 회원가입 요청은 토큰 없이 보냄
  if (
    config.url?.includes("/members/login") ||
    config.url?.includes("/members/signup")
  ) {
    return config;
  }

  // 이미 Authorization 헤더가 설정되어 있으면 덮어쓰지 않음
  if (config.headers.Authorization) {
    return config;
  }

  // 토큰이 없으면 에러 처리
  if (!token) {
    console.error("토큰이 없습니다. 프로필을 선택해주세요.");
    throw new Error("토큰이 없습니다. 프로필을 먼저 선택해주세요.");
  }

  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${token}`,
  };

  console.log("설정된 Authorization 헤더:", config.headers.Authorization);

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