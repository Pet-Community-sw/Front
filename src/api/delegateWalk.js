//대리 산책자 API
import apiClient from "./apiClient";

//대리 산책자 구하는 게시글 추가
export const addDelegate = async () => {
    const response = await apiClient.post("/delegate-walk-posts");
    return response.data;
}

//대리 산책자 게시글 목록 조회 (지도 범위)
export const viewLocationDelegatePosts = async (params) => {
    const response = await apiClient.get("/delegate-walk-posts/by-location", {
        params, 
    });
    return response.data;
}

//대리 산책자 게시글 목록 조회 (장소 검색)
export const viewPlaceDelegatePosts = async (params) => {
    const response = await apiClient.get("/delegate-walk-posts/by-place", {
        params, 
    });
    return response.data;
}

//대리 산책자 게시글 상세 조회
export const viewDelegatePostDetail = async ({ delegateWalkPostId }) => {
    const response = await apiClient.get(`/delegate-walk-posts/${delegateWalkPostId}`)
    return response.data;
}

//매칭 글 수정
export const modifyDelegatePost = async ({ delegateWalkPostId }) => {
    const response = await apiClient.put(`/delegate-walk-posts/${delegateWalkPostId}`)
    return response.data;
}

//매칭 글 삭제
export const deleteDelegatePost = async ({ delegateWalkPostId }) => {
    const response = await apiClient.delete(`/delegate-walk-posts/${delegateWalkPostId}`)
    return response.data;
}