//회원 관리
import { useMutation } from "@tanstack/react-query";
import { 
    login, 
    signup,
    findid,
    sendemail, 
    verify, 
    resetpassword,
    deleteMember, 
 } from "../api/membersApi";

//회원가입
export const useSignup = () => {
  return useMutation({
    mutationFn: signup, // 회원가입 함수 호출
    onSuccess: (data) => {
      console.log("✅ 회원가입 성공:", data);
    },
    onError: (error) => {
      // 서버에서 내려준 메시지 우선 출력
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "회원가입 중 알 수 없는 오류 발생";

      console.error("❌ 회원가입 실패:", message);
    },
  });
};




//로그인
export const useLogin = () => {
  return useMutation({
    mutationFn: login, // 로그인 함수 호출
    onSuccess: (data) => {
      console.log("✅ 로그인 성공:", data);
    },
    onError: (error) => {
      // 서버에서 내려준 메시지 우선 출력
      const message =
        error.response?.data?.message ||
        error.message ||
        "로그인 중 알 수 없는 오류 발생";

      console.error("❌ 로그인 실패:", message);
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

//회원 탈퇴
export const useDeleteMember = () => {
    return useMutation(deleteMember)
}