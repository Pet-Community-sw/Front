//회원가입 api 호출하는 hook
import { useMutation } from "@tanstack/react-query"
import { signup } from "../api/membersApi"

//mutate 함수 반환
export const useSignup = () => {
  return useMutation(signup);
};