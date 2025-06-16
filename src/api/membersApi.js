//회원 관련 api
import apiClient from "./apiClient";
import axios from "axios";
import { BASE_URL } from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

//회원가입
// FormData를 사용한 회원가입
const signup = async (userData) => {
  const formData = new FormData();
  formData.append("name", userData.name);
  formData.append("email", userData.email);
  formData.append("password", userData.password);
  formData.append("phoneNumber", userData.phoneNumber);

  if (userData.memberImageUrl) {
    formData.append("memberImageUrl", {
      uri: userData.memberImageUrl.uri,
      name: userData.memberImageUrl.name,
      type: "image/jpeg", // 확장자에 맞게 조정 가능
    });
  }

  try {
    const response = await axios.post(`${BASE_URL}/members/signup`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      (typeof error.response?.data === "string" ? error.response.data : null) ||
      "회원가입 중 오류가 발생했습니다.";
    throw new Error(message);
  }
};

//로그인
const login = async (userData) => {
  const response = await apiClient.post("/members/login", userData);
  return response.data;
};

//로그아웃
/*const logout = async (navigation) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    console.log("🪪 로그아웃 시도 중 토큰:", token);

    // 토큰이 없으면 서버에 요청 안 보냄
    if (token) {
      await apiClient.delete("/members/logout", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    }

  } catch (error) {
    console.warn("❌ 로그아웃 실패:", error);
  } finally {
    // 무조건 토큰 제거 + 홈으로 이동
    await AsyncStorage.removeItem("accessToken");
    /*setTimeout(() => {
      navigation.replace("Welcome");
    }, 100);*/
  


// 아이디 찾기
const findid = async (userData) => {
  try {
    const res = await apiClient.get(`/members/find-id`, {
      params: { phoneNumber: userData.phoneNumber },
    });
    return res.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      (typeof error.response?.data === "string" ? error.response.data : null) ||
      "서버 요청 중 문제가 발생했습니다.";
    throw new Error(message);
  }
};


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

// 비밀번호 재설정 - 임시 토큰 같이 보냄
const resetpassword = async ({ token, newPassword }) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/members/reset-password`,
      { newPassword },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      (typeof error.response?.data === "string" ? error.response.data : null) ||
      error.message ||
      "비밀번호 재설정 중 오류가 발생했습니다.";
    throw new Error(message);
  }
};



//회원 탈퇴
const deleteMember = async () => {
  const response = await apiClient.delete("members");
  return response.data;
}

export { signup, login, findid, sendemail, verify, resetpassword, deleteMember };