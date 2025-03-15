//회원 관련 api
import apiClient from "./apiClient";

//회원가입
const signup = async (userData) => {
  const response = await apiClient.post("/members/signup", userData);
  return response.data;
};

//로그인
const login = async (credentials) => {
  const response =  await apiClient.post("/members/login", credentials);
  return response.data;
};

export {signup, login};
