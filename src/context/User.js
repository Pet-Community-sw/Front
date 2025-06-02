// 로그인 토큰 정보 전역 관리
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { disconnectStomp } from "../api/stompClient";
import { disconnectNotification } from "../hooks/useNotification";
import axios from "axios";
import { BASE_URL } from "../api/apiClient";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [token, setToken] = useState(true);
  const [name, setName] = useState(null);
  const [memberId, setMemberId] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        {/* 화면 깜빡임 방지용 */ }
        setTimeout(() => {
          setLoading(false);
        }, 0);
      }
    };

    loadUserData();
  }, []);


  // 로그인 시 토큰 저장
  const login = async (accessToken, name, memberId) => {
    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("name", name);
    await AsyncStorage.setItem("memberId", memberId);
    setToken(accessToken);
    setName(name);
    setMemberId(memberId);
  };

  // 로그아웃 시 토큰 삭제, 웹소켓 연결 해제
  const logout = async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    try {   //서버에 로그아웃 요청 보냄
      await axios.delete(`${BASE_URL}/members/logout`, {
        headers: { accessToken },
      });
    } catch (err) {
      console.log("서버 로그아웃 실패 (무시 가능):", err);
    }
    setToken(null);
    setName(null);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("name");
    await AsyncStorage.removeItem("memberId");
    await disconnectNotification();
    await disconnectStomp();
  };

  return (
    <UserContext.Provider value={{ token, name, memberId, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
