import { useMutation } from "@tanstack/react-query";
import { sendemail } from "../api/membersApi";

export const useSendemail = () => {
  return useMutation(sendemail);
}