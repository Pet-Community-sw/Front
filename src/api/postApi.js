//게시물 api
import apiClient from "./apiClient";
import { BASE_URL } from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

//게시물 추가
// 게시물 추가 - 이미지 URL을 문자열로 보내는 경우
// hooks/usePost.js 안에 정의된 API 함수 예시
const addPost = async (postData) => {
  const formData = new FormData();
  formData.append("title", postData.title);
  formData.append("content", postData.content);

  if (postData.postImageFile) {
    formData.append("postImageFile", {
      uri: postData.postImageFile.uri,
      name: postData.postImageFile.name,
      type: "image/jpeg", // 필요 시 동적으로 수정 가능
    });
  }

  try {
    const token = await AsyncStorage.getItem("accessToken");

    console.log("📝 제목:", postData.title);
    console.log("📝 내용:", postData.content);
    console.log("🔐 토큰:", token);
    console.log("Authorization:", `Bearer ${token}`);

    const response = await axios.post(`${BASE_URL}/posts`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log("❌ 서버 오류 응답:", error.response?.data);
    throw error;
  }
};




//게시물 목록 조회
const viewPosts = async (page = 0) => {
  const response = await apiClient.get("/posts", {
    params: { page },
  });
  return response.data;
}

//특정 게시물 조회
const viewOnePost = async (postId) => {
  const response = await apiClient.get(`/posts/${postId}`);
  return response.data;
}

//게시물 수정
const modifyPost = async (postId, formData) => {
  const response = await apiClient.put(`/posts/${postId}`, formData);
  return response.data;
}

//게시물 삭제
const removePost = async (postId) => {
  const response = await apiClient.delete(`/posts/${postId}`);
  return response.data;
}

export { addPost, viewPosts, viewOnePost, modifyPost, removePost };