import { useMutation } from "@tanstack/react-query";
import { login } from "../api/membersApi";

export const useLogin = () => {
  return useMutation({
    mutationFn: login, // 올바른 방식으로 함수 전달
    onSuccess: (data) => {
      console.log("로그인 성공:", data);
    },
    onError: (error) => {
      console.error("로그인 실패:", error);
    },
  });
};
