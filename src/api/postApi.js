//게시물 api
import apiClient from "./apiClient";

//게시물 추가
// 게시물 추가 - 이미지 URL을 문자열로 보내는 경우
const addPost = async (data) => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("content", data.content);

  // 이미지 URL을 문자열로 append (파일 자체를 업로드하지 않는 경우)
  if (data.postImageUrl) {
    formData.append("postImageUrl", data.postImageUrl);
  }

  const response = await apiClient.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};


//게시물 목록 조회
const viewPosts = async (page = 0) => {
  const response = await apiClient.get("/posts", {
    params: {page}, 
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

export {addPost, viewPosts, viewOnePost, modifyPost, removePost};