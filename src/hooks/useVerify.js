import { useMutation } from "@tanstack/react-query";
import { verify } from "../api/membersApi";

export const useVerify = () => {
  return useMutation(verify);
}