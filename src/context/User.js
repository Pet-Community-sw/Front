import React, {createContext, useState, useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  // 앱 실행 시 저장된 토큰 불러오기
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem("accessToken");
      if (storedToken) setToken(storedToken);
    };
    loadToken();
  }, []);

  // 로그인 시 토큰 저장
  const login = async (accessToken) => {
    setToken(accessToken);
    await AsyncStorage.setItem("accessToken", accessToken);
  };

  // 로그아웃 시 토큰 삭제
  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem("accessToken");
  };

  return (
    <UserContext.Provider value={{ token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
