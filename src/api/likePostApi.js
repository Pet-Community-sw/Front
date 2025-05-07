//게시글 좋아요 api
import apiClient from "./apiClient";

const likePost = async (postId) => {
  const response = await apiClient.post("/likes", {postId});
  return response.data;
}

const likeList = async ({ postId }) => {
  const response = await apiClient.get(`/likes${postId}`)
  return response.data;
}

export {likePost, likeList};