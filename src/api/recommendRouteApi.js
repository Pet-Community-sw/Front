//산책길 추천
import apiClient from "./apiClient";

//산책길 추천 게시글 추가
const addRecommendRoute = async (
    {
        locationLongitude,  //경도
        locationLatitude,   //위도
        locationName,
        content,
        title
    }
) => {
    const response = await apiClient.post("/recommend-route-posts", {
        locationLongitude,
        locationLatitude,
        locationName,
        content,
        title,
    });
    return response.data;
};

//산책길 추천 글 목록 조회(2개의 위도, 경도)
const viewLocationRoutePosts = async (params) => {
    console.log("📡 [API 호출] viewLocationRoutePosts 실행됨 ✅", params);
    const response = await apiClient.get("/recommend-route-posts/by-location", {
        params,
    });
    return response.data;
}

//산책길 추천 글 목록 조회(특정 장소의 반경 1km)
const viewPlaceRoutePosts = async (params) => {
    const response = await apiClient.get("/recommend-route-posts/by-place", {
        params,
    });
    return response.data;
}

//산책길 추천글 상세 조회
const viewRecommendPostDetail = async ( recommendRoutePostId ) => {
    try {
        const response = await apiClient.get(`/recommend-route-posts/${recommendRoutePostId}`)
        return response.data;
    }
    catch (error) {
        console.error("❌ 상세 조회 실패:", error.response?.data || error.message);
        throw error;
    }
};

    //매칭 글 수정
    const modifyRecommendPost = async ( recommendRoutePostId ) => {
        const response = await apiClient.put(`/recommend-route-posts/${recommendRoutePostId}`)
        return response.data;
    }

    //매칭 글 삭제
    const deleteRecommendPost = async ( recommendRoutePostId ) => {
        const response = await apiClient.delete(`/recommend-route-posts/${recommendRoutePostId}`)
        return response.data;
    }

    export { addRecommendRoute, viewLocationRoutePosts, viewPlaceRoutePosts, viewRecommendPostDetail, modifyRecommendPost, deleteRecommendPost };
