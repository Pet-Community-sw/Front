//게시물 api
import apiClient from "../apiClient";

//게시물 추가
const addPost = async (postData) => {
  const formData = new FormData();
  formData.append("profileId", postData.profileId);
  formData.append("title", postData.title);
  formData.append("content", postData.content);

  if (postData.postImageFile) {
    formData.append("postImageFile", {
      uri: postData.postImageFile.uri,
      name: postData.postImageFile.name,
      type: "image/jpeg",
    });
  }

  const response = await apiClient.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

//게시물 목록 조회
const viewPosts = async (page = 1) => {
  try {
    const safePage = Math.max(0, page);
    const response = await apiClient.get("/posts", {
      params: { page: safePage },
    });
    console.log("📋 서버에서 받은 게시글 데이터:", response.data);
    console.log("📋 첫 번째 게시글:", response.data?.[0]);
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
