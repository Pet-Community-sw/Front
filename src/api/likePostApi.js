//게시글 좋아요 api
import apiClient from "./apiClient";

//좋아요 추가 및 삭제
const likePost = async ({ postId, postType}) => {
  const response = await apiClient.post("/likes", {postId});
  return response.data;
}

//좋아요 목록 조회
const likeList = async ({ postType, postId }) => {
  const response = await apiClient.get(`/likes/${postType}/${postId}`)
  return response.data;
}

export {likePost, likeList};