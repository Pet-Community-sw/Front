//산책 기록
import apiClient from "./apiClient";

// 산책 기록 시작
export const walkStart = async ({ walkRecordId }) => {
  try {
    const response = await apiClient.put(`/walk-record/${walkRecordId}/start`);
    const message = response.data;
    return message;
  } catch (error) {
    throw new Error(error.response?.data?.message || "산책 기록 실패");
  }
};

//산책 기록 끝
export const walkFinish = async ({ walkRecordId }) => {
  try {
    const response = await apiClient.put(`/walk-record/${walkRecordId}/finish`);
    const message = response.data;
    return message;
  } catch (error) {
    throw new Error(error.response?.data?.message || "산책 기록 실패");
  }
};

//산책 기록 상세 조회
export const viewWalkRecord = async ({ walkRecordId }) => {
  try {
    const response = await apiClient.get(`/walk-record/${walkRecordId}`);
    const message = response.data;
    return message;
  } catch (error) {
    throw new Error(error.response?.data?.message || "산책 기록 조회 실패");
  }
};

//대리 산책자 실시간 위치 정보 조회
export const getWalkLocation = async ({ walkRecordId }) => {
  try {
    const response = await apiClient.get(
      `/walk-record/${walkRecordId}/location`
    );
    const message = response.data;
    return message;
  } catch (error) {
    throw new Error(error.response?.data?.message || "위치 정보 조회 실패");
  }
};
