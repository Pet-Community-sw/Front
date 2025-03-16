//아이디 찾기
import { useMutation } from "@tanstack/react-query";
import { findid } from "../api/membersApi";

export const useFindid = () => {
  return useMutation(findid);
};