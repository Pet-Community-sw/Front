import React, {createContext, useState, useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "./User";
import { assertEasingIsWorklet } from "react-native-reanimated/lib/typescript/animation/util";

const ProfileContext = createContext();

const ProfileProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  //앱 실행 시 저장된 토큰 불러오기
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem("accessToken");
      if (storedToken) setToken(storedToken);
    };
    loadToken();
  }, []);

   //프로필 추가 시 토큰 저장
   const addProfile = async (accessToken) => {
    setToken(accessToken);
    await AsyncStorage.setItem("accessToken", accessToken);
  };

  //프로필 삭제 시 토큰 삭제
  const removeProfile = async () => {
    setToken(null);
    await AsyncStorage.removeItem("accessToken");
  }

  return(
    <ProfileContext.Provider value={{token, addProfile, removeProfile}}>
      {children}
    </ProfileContext.Provider>
  );
};

export {ProfileContext, ProfileProvider};

