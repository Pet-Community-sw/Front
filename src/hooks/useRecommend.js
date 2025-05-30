//산책길 추천, 매칭 훅
import {
    addRecommendRoute,
    viewLocationRoutePosts,
    viewPlaceRoutePosts,
    viewRecommendPostDetail,
    modifyRecommendPost,
    deleteRecommendPost,
} from "../api/recommendRouteApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

//산책길 추천 게시글 추가
export const useAddRecommend = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addRecommendRoute,
        onSuccess: (newRecommendPost) => {
            queryClient.setQueryData(["recommendPosts"], (oldRecommendPost = []) => {
                return [...oldRecommendPost, newRecommendPost];
            });
        }
    });
};

//지도 범위 기반 산책길 추천 글 목록 조회 (사용자가 직접 지도 움직임)
export const useViewLocation = (params) => {
    return useQuery({
        queryKey: ["recommendPosts", "location", params],
        queryFn: () => viewLocationRoutePosts(params),
        enabled: false,
    });
}

//장소 기반 산책길 추천 글 목록 조회 (사용자가 장소 입력)
export const useViewPlace = (params) => {
    return useQuery({
        queryKey: ["recommendPosts", "place", params],
        queryFn: () => viewPlaceRoutePosts(params),
        enabled: false,
    });
}

//글 상세 조회
export const useViewRecommendPostDetail = (recommendRoutePostId) => {
    return useQuery({
        queryKey: ["recommendPosts", recommendRoutePostId],
        queryFn: () => viewRecommendPostDetail(recommendRoutePostId),
        enabled: false,
    });
}

//글 수정
export const useModifyRecommendPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: modifyRecommendPost,
        onSuccess: (newPost) => {
            queryClient.setQueryData(["recommendPosts"], (oldPosts = []) =>
                oldPosts.map(post =>
                    post.id === newPost.id ? newPost : post
                )
            );
        }
    });
};

//글 삭제
export const useRemoveRecommendPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteRecommendPost,
        onSuccess: (response, variables) => {
            const recommendRoutePostId = variables;
            queryClient.setQueryData(["recommendPosts"], (oldRecommendPost = []) => {
                return oldRecommendPost.filter(recommendPost => recommendPost.id !== recommendRoutePostId);
            });

            //개별 프로필 데이터 Id 삭제
            queryClient.removeQueries(["recommendPosts", recommendRoutePostId]);
        }
    })
};
