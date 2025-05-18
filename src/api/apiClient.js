// axios 공통 api 설정, 요청마다 토큰 자동 추가
// 자동인증 시스템
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const BASE_URL = "http://192.210.160.1:8080";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json", 
  }, 
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("👉 서버 요청:", config.method.toUpperCase(), config.url);
  return config;
});


export default apiClient;