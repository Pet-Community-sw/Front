//게시글 댓글 api
import apiClient from "./apiClient";

const postComment = async ({postId, memberId, content}) => {
  const response = await apiClient.post("/comments", {postId, memberId, content});
  return response.data;
}

const modifyComment = async ({commentId, postId, content}) => {
  const response = await apiClient.put(`/comments/${commentId}`, {postId, content});
  return response.data;
}

const deleteComment = async ({commentId}) => {
  const response = await apiClient.delete(`/comments/${commentId}`);
  return response.data;
}

export {postComment, modifyComment, deleteComment};