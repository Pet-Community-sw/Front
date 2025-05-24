// 로그인 토큰 정보 전역 관리
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { disconnectStomp } from "../api/stompClient";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [token, setToken] = useState(null);
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
      } finally { {/* 화면 깜빡임 방지용 */}
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
    setToken(null);
    setName(null);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("name");
    await AsyncStorage.removeItem("memberId");
    await disconnectStomp();
  };

  return (
    <UserContext.Provider value={{ token, name, memberId, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
