//프로필 hook
import { addProfile } from "../api/profileApi";
import { useMutation } from "@tanstack/react-query";

//프로필 추가
const useAddProfile = () => {
  return useMutation(addProfile);
}

export {useAddProfile};