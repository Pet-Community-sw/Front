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
export const viewWalkingTogetherDetail = async ({ walkingTogetherPostId }) => {
  const res = await apiClient.get(`/walking-together-posts/${walkingTogetherPostId}`);
  console.log("📡 응답 받음:", res.data);

  // 배열 응답인 경우 첫 번째 항목만 리턴
  return Array.isArray(res.data) ? res.data[0] : res.data;
};


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
    console.log("🚀 매칭 시작 API 호출:", {
        url: `/walking-together-posts/${walkingTogetherPostId}`,
        method: "POST",
        walkingTogetherPostId
    });
    
    const response = await apiClient.post(`/walking-together-posts/${walkingTogetherPostId}`)
    
    console.log("✅ 매칭 시작 API 응답:", {
        status: response.status,
        data: response.data
    });
    
    return response.data;
}

