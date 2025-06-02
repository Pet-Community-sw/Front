//회원 관리
import { useMutation } from "@tanstack/react-query";
import { 
    login, 
    logout, 
    signup,
    findid,
    sendemail, 
    verify, 
    resetpassword, 
 } from "../api/membersApi";

//회원가입
export const useSignup = () => {
  return useMutation(signup);
};


//로그인
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

//아이디 찾기
export const useFindId = () => {
    return useMutation(findid);
}

//비밀번호 이메일 인증 (이메일 보냄)
export const useSendemail = () => {
  return useMutation(sendemail);
}

//비밀번호 인증번호 검증
export const useVerify = () => {
  return useMutation(verify);
}

//비밀번호 재설정
export const useResetpassword = () => {
  return useMutation(resetpassword);
}

//로그아웃
export const useLogout = () => {
    return useMutation(logout);
}