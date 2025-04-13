//게시물 api
import { resolvePlugin } from "@babel/core";
import apiClient from "./apiClient";

//게시물 추가
const addPost = async (formData) => {
  const response = await apiClient.post("/posts", formData);
  return response.data;
}

//게시물 목록 조회
const viewPosts = async () => {
  const response = await apiClient.get("/posts");
  return response.data;
}

//특정 게시물 조회
const viewOnePost = async (postId) => {
  const response = await apiClient.get(`/posts/${postId}`);
  return response.data;
}

//게시물 수정
const modifyPost = async (postId) => {
  const response = await apiClient.put(`/posts/${postId}`);
  return response.data;
}

//게시물 삭제
const removePost = async (postId) => {
  const response = await apiClient.delete(`/posts/${postId}`);
  return response.data;
}

export {addPost, viewPosts, viewOnePost, modifyPost, removePost};