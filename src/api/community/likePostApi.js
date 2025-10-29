// src/api/like/likeApi.js
import apiClient from "../../api/apiClient";

//좋아요
export const likePost = async ({ postId }) => {
  try {
    const response = await apiClient.post("/likes", postId, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ 좋아요 요청 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 좋아요 요청 실패:", error.response?.data || error.message);
    throw error;
  }
};

//좋아요 목록 조회
export const likeList = async (postId) => {
  try {
    const response = await apiClient.get(`/likes/${postId}`);
    console.log("✅ 좋아요 목록 조회 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 좋아요 목록 조회 실패:", error.response?.data || error.message);
    throw error;
  }
};
