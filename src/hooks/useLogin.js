//로그인 api 호출
import { useMutation } from "@tanstack/react-query";
import { login } from "../api/membersApi";

//mutate 함수 반환
export const useLogin = () => {
  return useMutation(login);
}