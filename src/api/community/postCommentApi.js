// api/comment.js
import apiClient from "../../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ 댓글 추가
export const postComment = async ({ postId, content }) => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    console.log("📤 댓글 요청 데이터:", { postId, content });
    
    const response = await apiClient.post(
      "/comments",
      { postId, content },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ 댓글 추가 실패:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ 댓글 수정
export const modifyComment = async ({ commentId, postId, content }) => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const response = await apiClient.put(
      `/comments/${commentId}`,
      { postId, content },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ 댓글 수정 실패:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ 댓글 삭제
export const removeComment = async ({ commentId }) => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const response = await apiClient.delete(`/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ 댓글 삭제 실패:", error.response?.data || error.message);
    throw error;
  }
};
