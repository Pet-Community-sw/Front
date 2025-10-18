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
    const data = await fetchProfileToken(profileId);
    const { accessToken } = data;

    //const decoded = jwtDecode(accessToken);
    const decoded = jwtDecode(accessToken);

    console.log("🔐 JWT Payload:", decoded);

    console.log("🔐 JWT Payload:", decoded);

    // AsyncStorage 저장
    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("profileId", profileId.toString());

    // Axios 헤더에 새 토큰 바로 반영
    apiClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${accessToken}`;

    // 토큰 저장 직후 강제로 로딩
    const checkToken = await AsyncStorage.getItem("accessToken");
    console.log("✅ 토큰 저장 후 확인:", checkToken);

    // 전역 상태 저장
    setProfileToken(accessToken);
    setProfileId(profileId);
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
