/* axios 공통 api 설정 */
/* 요청마다 토큰 자동 추가 */
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:1337",
  headers: {
    "Content-Type": "application/json", 
  }, 
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;