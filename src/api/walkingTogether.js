//함께 산책해요
import apiClient from "./apiClient";

//함께 산책해요 게시글 추가
export const addWalkingTogether = async (
    {
        recommendRoutePostId,
        scheduledTime,
        limitCount,
    }
) => {
    const response = await apiClient.post("/walking-together-posts", {
        recommendRoutePostId,
        scheduledTime,
        limitCount,
    });
    return response.data;
};

//함께 산책해요 게시글 목록 조회
export const viewWalkingTogether = async ({ recommendRoutePostId }) => {
    const response = await apiClient.get(`/walking-together-posts/by-recommend-route-post/${recommendRoutePostId}`);
    return response.data;
}

//함께 산책해요 게시글 상세 조회
export const viewWalkingTogetherDatail = async ({ walkingTogetherPostId }) => {
    const response = await apiClient.get(`/walking-together-posts/$${walkingTogetherPostId}`)
    return response.data;
}

//함께 산책해요 글 수정
export const modifyWalkingTogetherPost = async ({ walkingTogetherPostId, scheduledTime, limitCount }) => {
    const response = await apiClient.put(`/walking-together-posts/$${walkingTogetherPostId}`, {
        scheduledTime,
        limitCount,
    })
    return response.data;
}

//함께 산책해요 글 삭제
export const deleteWalkingTogetherPost = async ({ walkingTogetherPostId }) => {
    const response = await apiClient.delete(`/walking-together-posts/${walkingTogetherPostId}`)
    return response.data;
}

//매칭 시작
export const startWalkingTogether = async ({ walkingTogetherPostId }) => {
    const response = await apiClient.post(`/walking-together-posts/${walkingTogetherPostId}`)
    return response.data;
}

