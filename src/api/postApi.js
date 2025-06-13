//게시물 api
import apiClient from "./apiClient";
import { BASE_URL } from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

//게시물 추가
// 게시물 추가 - 이미지 URL을 문자열로 보내는 경우
// hooks/usePost.js 안에 정의된 API 함수 예시
const addPost = async (postData) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
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

    console.log("🔥 보내는 토큰:", token);
    for (let pair of formData.entries()) {
      console.log(`🔥 FormData - ${pair[0]}:`, pair[1]);
    }

    // ✅ 요청 직전에 인터셉터 설정
    axios.interceptors.request.use((config) => {
      console.log("🛰️ Axios 요청 구성:", config);
      return config;
    });

    const response = await axios.post(`${BASE_URL}/posts`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log("❌ 서버 오류 응답:", {
      message: error.message,
    });
    throw new Error(error.response?.data?.message || "게시물 추가 실패");
  }
};

//게시물 목록 조회
const viewPosts = async (page = 0) => {
  try {
    const response = await apiClient.get("/posts", {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.log("❌ 서버 오류 응답:", {
      message: error.message,
    });
    throw new Error(error.response?.data?.message || "게시물 조회 실패");
  }
}

//특정 게시물 조회
const viewOnePost = async (postId) => {
  try {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.log("❌ 서버 오류 응답:", {
      message: error.message,
    });
    throw new Error(error.response?.data?.message || "특정 게시물 조회 실패");
  }
}

//게시물 수정
const modifyPost = async (postId, formData) => {
  try {
    const response = await apiClient.put(`/posts/${postId}`, formData);
    return response.data;
  } catch (error) {
  console.log("❌ 서버 오류 응답:", {
    code: error?.response?.status,
    serverMessage: error?.response?.data,
    defaultMessage: error.message,
  });

  const serverMsg =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "요청 처리 중 오류가 발생했습니다.";

  throw new Error(serverMsg);
}
}

//게시물 삭제
const removePost = async (postId) => {
  console.log("📡 DELETE 요청 보냄:", `/posts/${postId}`);
  try {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.log("❌ 서버 오류 응답:", {
      message: error.message,
    });
    throw new Error(error.response?.data?.message || "게시물 수정 실패");
  }
}

export { addPost, viewPosts, viewOnePost, modifyPost, removePost };
