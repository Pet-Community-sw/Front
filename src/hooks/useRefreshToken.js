//토큰 갱신
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./apiClient";
import { refreshAccessToken } from "../api/tokenApi";

export const addPost = async (postData) => {
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

  let token = await AsyncStorage.getItem("accessToken");

  try {
    const response = await axios.post(`${BASE_URL}/posts`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      token = await refreshAccessToken();
      const retry = await axios.post(`${BASE_URL}/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      return retry.data;
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "게시물 등록 중 오류 발생"
    );
  }
};
