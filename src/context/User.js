// 로그인 토큰 정보 전역 관리
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { disconnectStomp } from "../api/stompClient";
import { disconnectNotification } from "../hooks/useNotification";
import { BASE_URL } from "../api/apiClient";
import apiClient from "../api/apiClient";
import { useMemo } from "react";
import { useProfileSession } from "./SelectProfile";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [name, setName] = useState(null);
  const [memberId, setMemberId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearProfile } = useProfileSession();

  useEffect(() => {
    console.log("🧪 [UserContext] token 변경됨:", token);
  }, [token]);


  // 앱 실행 시 저장된 토큰 불러오기
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("accessToken");
        const storedName = await AsyncStorage.getItem("name");
        const storedMemberId = await AsyncStorage.getItem("memberId");

        if (storedToken) {
          setToken(storedToken);
          if (storedName) setName(storedName);
          if (storedMemberId) setMemberId(storedMemberId);
        }
      } catch (e) {
        console.log("유저 데이터 로딩 실패:", e);
        setToken(null);
      } finally {
        console.log("✅ setLoading(false) 호출");
        {/* 화면 깜빡임 방지용 */ }
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // 토큰 갱신 함수
  const refreshAccessToken = async () => {
    try {
      const oldToken = await AsyncStorage.getItem("accessToken");
      const response = await apiClient.post(`${BASE_URL}/token`, null, {
        headers: { accessToken: oldToken },
      });
      const newToken = response.data.accessToken;

      // 업데이트
      await AsyncStorage.setItem("accessToken", newToken);
      setToken(newToken);
      console.log("🔄 토큰 갱신 완료:", newToken);
      return newToken;
    } catch (error) {
      console.log("❌ 토큰 갱신 실패:", error);
      throw error;
    }
  };



  // 로그인 시 토큰 저장
  const login = async (accessToken, name) => {
    console.log("로그인 함수 실행됨"); // 호출 확인
    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("name", name);
    console.log("✅ AsyncStorage 저장 완료");
    setToken(accessToken);
    console.log("🧩 setToken 실행됨:", accessToken); // 호출 확인
    setName(name);
  };



  // 로그아웃 시 토큰 삭제, 웹소켓 연결 해제, 펫 프로필 토큰 삭제
  const logout = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (accessToken) {
        await apiClient.delete(`${BASE_URL}/members/logout`, {
          Authorization: `Bearer ${accessToken}`,
        });
      } else {
        console.log("⛔ 로그아웃 요청 시 accessToken이 존재하지 않음");
      }
    } catch (err) {
      console.log("서버 로그아웃 실패 (무시 가능):", err);
    }

    setToken(null);
    setName(null);
    await AsyncStorage.multiRemove(["accessToken", "name", "memberId"]);

    // 연결 해제
    await disconnectNotification();
    await disconnectStomp();
    await clearProfile();
  };


  const contextValue = useMemo(() => ({
    token,
    name,
    loading,
    login,
    logout,
    refreshAccessToken,
  }), [token, name, loading]);

  return (
    <UserContext.Provider value={contextValue} >
      {children}
    </UserContext.Provider>
  );
};
export { UserContext, UserProvider };
