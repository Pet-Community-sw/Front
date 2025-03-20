import React, {reateContext, useState, useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  //앱이 실행될 때마다 토큰 불러옴
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem("accessToken");
      if(storedToken) setToken(storedToken);
    };
    loadToken();
  }, []);

  //로그아웃하면 토큰 삭제 
  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem("accessToken");
  };

  return(
    <AuthContext.Provider value={{token, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};
