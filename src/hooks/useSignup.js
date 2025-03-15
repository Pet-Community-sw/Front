//회원가입 api 호출하는 hook
import { useMutation } from "@tanstack/react-query"
import { signup } from "../api/membersApi"

export const useSignup = () => {
  return useMutation(signup);
};