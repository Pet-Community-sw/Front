//게시글 댓글 api
import apiClient from "./apiClient";

const postComment = async ({postId, content, postType}) => {
  const response = await apiClient.post("/comments", {postId, content, postType});
  return response.data;
}

const modifyComment = async ({commentId, postId, content}) => {
  const response = await apiClient.put(`/comments/${commentId}`, {postId, content});
  return response.data;
}

const removeComment = async ({commentId}) => {
  const response = await apiClient.delete(`/comments/${commentId}`);
  return response.data;
}

export {postComment, modifyComment, removeComment};