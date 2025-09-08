//로그인 정보 상태 관리
import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient, { BASE_URL } from "../api/apiClient";
import { disconnectNotification } from "../hooks/useNotification";
import { disconnectStomp } from "../api/stompClient";

export const useUserStore = create(
    //어싱크 스토리지 자동 저장, 복원 가능 미들웨어
    persist(
        (set) => ({
            //상태값들
            token: null,
            name: null,

            //상태 변경 함수
            setToken: (token) => set({ token }),
            setName: (name) => set({ name }),

            //로그인 함수
            login: async (accessToken, name) => {
                await AsyncStorage.setItem("accessToken", accessToken)
                await AsyncStorage.setItem("name", name)
                set({ token: accessToken, name: name })
                //커넥트 stomp 로직 추가 가능
            },

            //로그아웃 함수
            logout: async () => {
                const accessToken = await AsyncStorage.getItem("accessToken")
                if (accessToken) {
                    try {
                        await apiClient.delete(`${BASE_URL}/members/logout`, {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        })
                    } catch (err) {
                        console.log('❌ 서버 로그아웃 실패: ', err)
                    }
                }
                await AsyncStorage.multiRemove(["accessToken", "name", "memberId"])
                set({ token: null, name: null, memberId: null })

                await disconnectNotification()
                await disconnectStomp()
            },
        }),
        {
            name: "user-storage",   //어싱크스토리지 키 이름
            getStorage: () => AsyncStorage,
        }
    )
)