//활동 시작 전 선택한 펫 프로필 저장한 액세스 토큰
import React, { createContext, useState, useContext } from "react";
import { fetchProfileToken } from "../api/profileApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import apiClient from "../api/apiClient";

const SelectProfileContext = createContext();

export const SelectProfileProvider = ({ children }) => {
  const [profileToken, setProfileToken] = useState(null);
  const [profileId, setProfileId] = useState(null);

  const selectProfile = async (profileId) => {
    try {
      // 1️⃣ 서버에서 새 토큰 발급
      const data = await fetchProfileToken(profileId);
      const { accessToken } = data;
  
      if (!accessToken) throw new Error("토큰 발급 실패");
  
      // 2️⃣ AsyncStorage에 저장
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("profileId", profileId.toString());

      apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  
      // 3️⃣ 저장이 끝났으니 확인 로그
      console.log("✅ 프로필 토큰 저장 완료:", accessToken.substring(0, 20) + "...");
  
      // 4️⃣ 딜레이를 주어 인터셉터가 새 토큰을 읽을 수 있게 함
      await new Promise((resolve) => setTimeout(resolve, 150));
  
      // 5️⃣ 상태 업데이트
      setProfileToken(accessToken);
      setProfileId(profileId);
  
      console.log("🚀 새 프로필 적용 완료 (이제 모든 요청에 새 토큰 사용)");
  
    } catch (err) {
      console.error("❌ selectProfile 에러:", err);
      throw err;
    }
  };
  

  //로그아웃, 프로필 변경 시 프로필 정보 초기화
  const clearProfile = () => {
    setProfileToken(null);
    setProfileId(null);
  };

  return (
    <SelectProfileContext.Provider
      value={{ profileToken, profileId, selectProfile, clearProfile }}
    >
      {children}
    </SelectProfileContext.Provider>
  );
};

export const useProfileSession = () => useContext(SelectProfileContext);
