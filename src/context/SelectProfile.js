//활동 시작 전 선택한 펫 프로필 저장한 액세스 토큰
import React, { createContext, useState, useContext } from "react";
import apiClient from "../api/apiClient";
import { fetchProfileToken } from "../api/profileApi";

const SelectProfileContext = createContext();

export const SelectProfileProvider = ({ children }) => {
    const [profileToken, setProfileToken] = useState(null);
    const [profileId, setProfileId] = useState(null);

    const selectProfile = async (profileId) => {
        const data = await fetchProfileToken(profileId);
        const { accessToken } = data;

        // axios 기본 헤더 설정
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        // AsyncStorage 저장
        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("profileId", profileId.toString());

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
        <SelectProfileContext.Provider value={{ profileToken, profileId, selectProfile, clearProfile }}>
            {children}
        </SelectProfileContext.Provider>
    );
};

export const useProfileSession = () => useContext(SelectProfileContext);
