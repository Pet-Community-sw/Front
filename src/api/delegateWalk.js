//대리 산책자 API
import apiClient from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

//대리 산책자 게시글 추가(post)
export const addDelegate = async (data) => {
  try {
    console.log("📡 addDelegate API 호출, 데이터:", data);
    const response = await apiClient.post("/delegate-walk-posts", data);
    console.log("📡 addDelegate API 응답:", response.data);
    console.log("📡 addDelegate API 응답 상태:", response.status);
    console.log("📡 addDelegate API 응답 헤더:", response.headers);
    return response.data;
  } catch (error) {
    console.error("❌ addDelegate API 에러:", error);
    console.error("❌ 에러 응답:", error.response?.data);
    console.error("❌ 에러 상태:", error.response?.status);
    // 서버에서 보낸 에러 메시지를 꺼내서 throw
    const message = error.response?.data?.message || "에러가 발생했습니다.";
    throw new Error(message);
  }
};

// 대리 산책자 게시글 목록 조회 (지도 범위) (get)
export const viewLocationDelegatePosts = async (params) => {
  try {
    console.log("📡 viewLocationDelegatePosts API 호출, 파라미터:", params);
    console.log("📡 파라미터 타입:", typeof params);
    console.log("📡 파라미터 키들:", params ? Object.keys(params) : "null");
    
    // 서버가 기대하는 파라미터 형식으로 변환 (경계 좌표)
    const queryParams = {
      minLatitude: params?.minLatitude,
      maxLatitude: params?.maxLatitude,
      minLongitude: params?.minLongitude,
      maxLongitude: params?.maxLongitude,
    };
    
    console.log("📡 변환된 쿼리 파라미터:", queryParams);
    console.log("📡 파라미터 값들:", {
      minLatitude: queryParams.minLatitude,
      maxLatitude: queryParams.maxLatitude,
      minLongitude: queryParams.minLongitude,
      maxLongitude: queryParams.maxLongitude,
    });
    
    // 파라미터 유효성 검사
    if (!queryParams.minLatitude || !queryParams.maxLatitude || !queryParams.minLongitude || !queryParams.maxLongitude) {
      console.error("❌ 필수 파라미터 누락:", queryParams);
      throw new Error("필수 파라미터가 누락되었습니다.");
    }
    
    const response = await apiClient.get("/delegate-walk-posts/by-location", {
      params: queryParams,
    });
    console.log("📡 viewLocationDelegatePosts API 응답:", response.data);
    console.log("📡 viewLocationDelegatePosts API 응답 상태:", response.status);
    console.log("📡 viewLocationDelegatePosts API 응답 헤더:", response.headers);
    console.log("📡 viewLocationDelegatePosts 데이터 타입:", typeof response.data);
    console.log("📡 viewLocationDelegatePosts 데이터 길이:", Array.isArray(response.data) ? response.data.length : "배열 아님");
    
    // 응답 데이터 구조 상세 분석
    if (Array.isArray(response.data)) {
      console.log("📡 첫 번째 아이템 구조:", response.data[0]);
      console.log("📡 첫 번째 아이템 키들:", response.data[0] ? Object.keys(response.data[0]) : "없음");
    } else {
      console.log("📡 응답이 배열이 아님:", response.data);
    }
    return response.data;
  } catch (error) {
    console.error("❌ viewLocationDelegatePosts API 에러:", error);
    console.error("❌ 에러 응답:", error.response?.data);
    console.error("❌ 에러 상태:", error.response?.status);
    throw new Error(error.response?.data?.message || "지도 기반 게시글 조회 실패");
  }
};

// 대리 산책자 게시글 목록 조회 (장소 검색) (get)
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

// 대리 산책자 게시글 상세 조회 (get)
export const viewDelegatePostDetail = async ({ delegateWalkPostId }) => {
  try {
    console.log("🔍 viewDelegatePostDetail API 호출, delegateWalkPostId:", delegateWalkPostId);
    const response = await apiClient.get(`/delegate-walk-posts/${delegateWalkPostId}`);
    console.log("🔍 viewDelegatePostDetail API 응답:", response.data);
    console.log("🔍 viewDelegatePostDetail API 상태:", response.status);
    return response.data;
  } catch (error) {
    console.error("❌ viewDelegatePostDetail API 에러:", error);
    console.error("❌ 에러 응답:", error.response?.data);
    console.error("❌ 에러 상태:", error.response?.status);
    throw new Error(error.response?.data?.message || "게시글 상세 조회 실패");
  }
};

// 대리 산책자 글 수정 (put)
export const modifyDelegatePost = async ({ delegateWalkPostId }) => {
  try {
    const response = await apiClient.put(`/delegate-walk-posts/${delegateWalkPostId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "게시글 수정 실패");
  }
};

// 대리 산책자 글 삭제 (delete)
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
export const applicationDelegate = async ({ delegateWalkPostId, message }) => {
  try {
    console.log("🐕 applicationDelegate API 호출 시작");
    console.log("🐕 delegateWalkPostId:", delegateWalkPostId);
    console.log("🐕 message:", message);
    
    // POST 요청에 메시지를 body로 전송
    const response = await apiClient.post(`/delegate-walk-posts/${delegateWalkPostId}`, {
      message: message || ""
    });
    
    console.log("🐕 applicationDelegate API 응답:", response.data);
    console.log("🐕 applicationDelegate API 상태:", response.status);
    
    return response.data;
  } catch (error) {
    console.error("❌ applicationDelegate API 에러:", error);
    console.error("❌ 에러 응답:", error.response?.data);
    console.error("❌ 에러 상태:", error.response?.status);
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
export const selectDelegateApplicant = async ({ delegateWalkPostId, memberId }) => {
    try {
        console.log("👥 selectDelegateApplicant API 호출 시작");
        console.log("👥 delegateWalkPostId:", delegateWalkPostId);
        console.log("👥 memberId:", memberId);
        
        // 토큰 명시적 확인
        const token = await AsyncStorage.getItem("accessToken");
        console.log("👥 지원자 선정 시 토큰 상태:", {
            hasToken: !!token,
            tokenLength: token?.length || 0,
            tokenPreview: token ? token.substring(0, 20) + "..." : "없음"
        });
        
        if (!token) {
            throw new Error("토큰이 없습니다. 프로필을 다시 선택해주세요.");
        }
        
        console.log("👥 memberId:", memberId);
        console.log("👥 memberId 타입:", typeof memberId);
        
        const response = await apiClient.post(`/delegate-walk-posts/${delegateWalkPostId}/select-applicant`, Number(memberId));
        
        console.log("👥 selectDelegateApplicant API 응답:", response.data);
        console.log("👥 selectDelegateApplicant API 상태:", response.status);
        console.log("👥 chatRoomId:", response.data?.chatRoomId);
        console.log("👥 created:", response.data?.created);
        
        return response.data;
    }
    catch (error) {
        console.error("❌ selectDelegateApplicant API 에러:", error);
        console.error("❌ 에러 응답:", error.response?.data);
        console.error("❌ 에러 상태:", error.response?.status);
        const message = error.response?.data?.message || "지원자 선택 실패";
        throw new Error(message);
    }
}

//산책 시작권한 부여
export const authDelegateRecord = async ({ delegateWalkPostId }) => {
    try {
        console.log("authDelegateRecord API 호출 시작");
        console.log("delegateWalkPostId:", delegateWalkPostId);
        
        const response = await apiClient.put(`/delegate-walk-posts/${delegateWalkPostId}/start-authorized/`)
        
        console.log("authDelegateRecord API 응답:", response.data);
        console.log("authDelegateRecord API 상태:", response.status);
        
        return response.data;
    }
    catch (error) {
        console.error("authDelegateRecord API 에러:", error);
        console.error("에러 응답:", error.response?.data);
        console.error("에러 상태:", error.response?.status);
        console.error("에러 헤더:", error.response?.headers);
        
        // 서버에서 보낸 에러 메시지를 꺼내서 throw
        const message = error.response?.data?.message || "에러가 발생했습니다.";
        throw new Error(message);
  }
}

// 대리 산책자 글 지원자 목록 조회
export const viewDelegatePostApplicants = async (delegateWalkPostId) => {
  try {
    console.log("👥 viewDelegatePostApplicants API 호출, delegateWalkPostId:", delegateWalkPostId);
    const response = await apiClient.get(`/delegate-walk-posts/applicants/${delegateWalkPostId}`);
    console.log("👥 viewDelegatePostApplicants API 응답:", response.data);
    console.log("👥 viewDelegatePostApplicants API 응답 상태:", response.status);
    return response.data;
  } catch (error) {
    console.error("❌ viewDelegatePostApplicants API 에러:", error);
    throw new Error(error.response?.data?.message || "지원자 목록 조회 실패");
  }
};

// 대리 산책 시작
export const startDelegateWalk = async ({ delegateWalkPostId }) => {
    try {
        console.log("🏃 startDelegateWalk API 호출 시작");
        console.log("🏃 delegateWalkPostId:", delegateWalkPostId);
        
        // PUT으로 산책 시작
        const response = await apiClient.put(`/delegate-walk-posts/${delegateWalkPostId}/start-authorized`);
        
        console.log("🏃 startDelegateWalk API 응답:", response.data);
        console.log("🏃 startDelegateWalk API 상태:", response.status);
        
        return response.data;
    } catch (error) {
        console.error("❌ startDelegateWalk API 에러:", error);
        console.error("❌ 에러 응답:", error.response?.data);
        console.error("❌ 에러 상태:", error.response?.status);
        throw new Error(error.response?.data?.message || "산책 시작 실패");
    }
};