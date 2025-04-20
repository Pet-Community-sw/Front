import { useMutation } from "@tanstack/react-query";
import { login } from "../api/membersApi";


export const useLogin = () => {
  return useMutation({
    mutationFn: login,  //로그인 함수 호출
    onSuccess: (data) => {
      console.log("로그인 성공:", data);
    },
    onError: (error) => {
      console.error("로그인 실패:", error);
    },
  });
};


export default login;