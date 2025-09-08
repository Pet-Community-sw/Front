//선택한 프로필 전역 상태 관리
import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useSelectProfile = create(
    persist(
        (set) => ({
            //상태값들
            profileToken: null, 
            profileId: null, 

            //상태 변경 함수
            setProfileToken: (profileToken) => set({ profileToken }), 
            setProfileId: (profileId) => set({ profileId }), 

            //토큰 AsyncStorage 저장 함수
            

            //토큰 저장 직후 로딩 함수
            checkToken: async (accessToken) => {
                await AsyncStorage.getItem("profileToken", accessToken)
                set({ profileToken: accessToken})
            }
        }),
        {
            name: "selectProffile-stroage", 
            getStorage: () => AsyncStorage, 
        }
    )
)