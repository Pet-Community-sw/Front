//회원 관련 api
import apiClient from "./apiClient";

//회원가입
//서버에 회원가입 요청 보냄
const signup = async (userData) => {
  const response = await apiClient.post("/members/signup", userData);
  return response.data;
};

//로그인
const login = async (userData) => {
  const response =  await apiClient.post("/members/login", userData);
  return response.data;
};

//로그아웃
const logout = async () => {
  const response = await apiClient.delete("/members/logout");
  return response.data;
}

//아이디 찾기
const findid = async (userData) => {
  const response = await apiClient.post("/members/find-id", userData);
  return response.data;
}

//비밀번호 이메일 인증
const sendemail = async (userData) => {
  const response = await apiClient.post("/members/send-email", userData);
  return response.data; 
}

//인증번호 검증(사용자가 인증번호 입력)
const verify = async (userData) => {
  const response = await apiClient.post("/members/verify-code", userData);
  return response.data;
}

//비밀번호 재설정
const resetpassword = async (userData) => {
  const response = await apiClient.post("/members/reset-password", userData);
  return response.data;
}

//회원 탈퇴
const deleteMember = async () => {
  const response = await apiClient.delete("members");
  return response.data;
}

export {signup, login, logout, findid, sendemail, verify, resetpassword, deleteMember};