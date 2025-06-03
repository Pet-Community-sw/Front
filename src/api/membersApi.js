//회원 관련 api
import apiClient from "./apiClient";
import axios from "axios";
import { BASE_URL } from "./apiClient";

//회원가입
// FormData를 사용한 회원가입
const signup = async (userData) => {
  const formData = new FormData();
  formData.append("name", userData.name);
  formData.append("email", userData.email);
  formData.append("password", userData.password);
  formData.append("phoneNumber", userData.phoneNumber);

  // 이미지 파일 객체로 추가 (type 없이)
  formData.append("memberImageUrl", {
    uri: userData.memberImageUrl.uri,
    name: userData.memberImageUrl.name,
  });

  const response = await axios.post(`${BASE_URL}/members/signup`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

//로그인
const login = async (userData) => {
  const response = await apiClient.post("/members/login", userData);
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
const sendemail = async ({ email }) => {
  const response = await apiClient.post("/members/send-email", {
    email,
  });
  return response.data;
}

//인증번호 검증(사용자가 인증번호 입력)
const verify = async (userData) => {
  const response = await apiClient.post("/members/verify-code", userData);
  return response.data;
}

//비밀번호 재설정
const resetpassword = async ({ newPassword }) => {
  const response = await apiClient.put("/members/reset-password", {
    newPassword,
  }
  );
  return response.data;
}

//회원 탈퇴
const deleteMember = async () => {
  const response = await apiClient.delete("members");
  return response.data;
}

export { signup, login, logout, findid, sendemail, verify, resetpassword, deleteMember };