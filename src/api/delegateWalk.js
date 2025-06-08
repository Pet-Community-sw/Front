//대리 산책자 API
import apiClient from "./apiClient";

//대리 산책자 구하는 게시글 추가
export const addDelegate = async () => {
  try {
    const response = await apiClient.post("/delegate-walk-posts");
    return response.data;
  } catch (error) {
    // 서버에서 보낸 에러 메시지를 꺼내서 throw
    const message = error.response?.data?.message || "에러가 발생했습니다.";
    throw new Error(message);
  }
};


// 대리 산책자 게시글 목록 조회 (지도 범위)
export const viewLocationDelegatePosts = async (params) => {
  try {
    const response = await apiClient.get("/delegate-walk-posts/by-location", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "지도 기반 게시글 조회 실패");
  }
};

// 대리 산책자 게시글 목록 조회 (장소 검색)
export const viewPlaceDelegatePosts = async (params) => {
  try {
    const response = await apiClient.get("/delegate-walk-posts/by-place", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "장소 기반 게시글 조회 실패");
  }
};

// 대리 산책자 게시글 상세 조회
export const viewDelegatePostDetail = async ({ delegateWalkPostId }) => {
  try {
    const response = await apiClient.get(`/delegate-walk-posts/${delegateWalkPostId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "게시글 상세 조회 실패");
  }
};

// 대리 산책자 글 수정
export const modifyDelegatePost = async ({ delegateWalkPostId }) => {
  try {
    const response = await apiClient.put(`/delegate-walk-posts/${delegateWalkPostId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "게시글 수정 실패");
  }
};

// 대리 산책자 글 삭제
export const deleteDelegatePost = async ({ delegateWalkPostId }) => {
  try {
    const response = await apiClient.delete(`/delegate-walk-posts/${delegateWalkPostId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "게시글 삭제 실패");
  }
};

// 펫 프로필 여부 확인
export const checkPofile = async () => {
  try {
    const response = await apiClient.get("/delegate-walk-posts/check");
    const message = response.data;

    // 문자열을 Boolean으로 변환
    const hasProfile = message.includes("있음");
    return hasProfile;
  } catch (error) {
    throw new Error(error.response?.data?.message || "프로필 확인 실패");
  }
};


// 대리 산책 지원
export const applicationDelegate = async ({ delegateWalkPostId }) => {
  try {
    const response = await apiClient.post(`/delegate-walk-posts/${delegateWalkPostId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "대리 산책 지원 실패");
  }
};


//대리 산책지원자 목록 조회
export const viewDelegateApplicants = async ({ delegateWalkPostId }) => {
    try {
        const response = await apiClient.get(`/delegate-walk-posts/applicants/${delegateWalkPostId}`)
        return response.data;
    }
    catch (error) {
    // 서버에서 보낸 에러 메시지를 꺼내서 throw
    const message = error.response?.data?.message || "에러가 발생했습니다.";
    throw new Error(message);
  }
}

//대리 산책 지원자 선정
export const selectDelegateApplicant = async ({ delegateWalkPostId }) => {
    try {
        const response = await apiClient.post(`/delegate-walk-posts/select-applicant/${delegateWalkPostId}`)
        return response.data;
    }
    catch (error) {
    // 서버에서 보낸 에러 메시지를 꺼내서 throw
    const message = error.response?.data?.message || "에러가 발생했습니다.";
    throw new Error(message);
  }
}

//산책 기록 권한 부여
export const authDelegateRecord = async ({ delegateWalkPostId }) => {
    try {
        const response = await apiClient.put(`/delegate-walk-posts/start-authorized/${delegateWalkPostId}`)
        return response.data;
    }
    catch (error) {
    // 서버에서 보낸 에러 메시지를 꺼내서 throw
    const message = error.response?.data?.message || "에러가 발생했습니다.";
    throw new Error(message);
  }
}