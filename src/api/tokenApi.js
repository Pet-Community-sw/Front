//토큰 관련 API 연동
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./apiClient";

export const refreshAccessToken = async () => {
  const oldToken = await AsyncStorage.getItem("accessToken");

  const response = await axios.post(
    `${BASE_URL}/token`,
    null,
    { headers: { accessToken: oldToken } }
  );

  const newToken = response.data.accessToken;
  await AsyncStorage.setItem("accessToken", newToken);
  return newToken;
};
