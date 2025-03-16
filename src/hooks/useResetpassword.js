import { useMutation } from "@tanstack/react-query";
import { resetpassword } from "../api/membersApi";

export const useResetpassword = () => {
  return useMutation(resetpassword);
}