// 산책 기록 관련 훅
import { walkStart, walkFinish, viewWalkRecord, getWalkLocation } from "../api/walkRecord";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";

// 산책 기록 시작
export const useWalkStart = () => {
  return useMutation({
    mutationFn: walkStart,
    onSuccess: () => {
      Alert.alert("산책 시작", "산책 기록이 시작되었습니다! 🐕");
    },
    onError: (error) => {
      Alert.alert("산책 시작 실패", error.message);
    },
  });
};

// 산책 기록 끝
export const useWalkFinish = () => {
  return useMutation({
    mutationFn: walkFinish,
    onSuccess: () => {
      Alert.alert("산책 완료", "산책 기록이 완료되었습니다! 🎉");
    },
    onError: (error) => {
      Alert.alert("산책 완료 실패", error.message);
    },
  });
};

// 산책 기록 상세 조회
export const useViewWalkRecord = (walkRecordId) => {
  return useQuery({
    queryKey: ["walkRecord", walkRecordId],
    queryFn: () => viewWalkRecord({ walkRecordId }),
    enabled: !!walkRecordId,
  });
};

// 산책 기록 위치 조회
export const useGetWalkLocation = (walkRecordId) => {
  return useQuery({
    queryKey: ["walkLocation", walkRecordId],
    queryFn: () => getWalkLocation({ walkRecordId }),
    enabled: !!walkRecordId,
    refetchInterval: 5000, // 5초마다 위치 업데이트
  });
};
