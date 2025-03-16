//비밀번호 찾기
import { useMutation } from "@tanstack/react-query";
import { findpassword } from "../api/membersApi";

export const useFindpassword = () => {
  return useMutation(findpassword);
};