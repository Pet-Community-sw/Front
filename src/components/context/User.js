import React, {createContext, useState, useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [memberId, setMemberId] = useState(null);
  const [nickname, setNickname] = useState(null);

  // 앱 실행 시 저장된 토큰 불러오기
  useEffect(() => {
    const loadUserData = async () => {
      const storedToken = await AsyncStorage.getItem("accessToken");
      const storedMemberId = await AsyncStorage.getItem("memberId");
      const storedNickname = await AsyncStorage.getItem("nickname");
      
      if (storedToken) setToken(storedToken);
      if (storedMemberId) setMemberId(Number(storedMemberId));
      if (storedNickname) setNickname(storedNickname);
    };
    loadUserData();
  }, []);

  // 로그인 시 토큰 저장
  const login = async (accessToken, memberId, nickname) => {
    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("memberId", String(memberId));
    await AsyncStorage.setItem("nickname", nickname);
    setToken(accessToken);
    setMemberId(memberId);
    setNickname(nickname);
  };

  // 로그아웃 시 토큰 삭제
  const logout = async () => {
    setToken(null);
    setMemberId(null);
    setNickname(null);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("memberId");
    await AsyncStorage.removeItem("nickname");
  };

  return (
    <UserContext.Provider value={{ token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
