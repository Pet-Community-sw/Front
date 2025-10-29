// src/hooks/useLikePost.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { likePost, likeList } from "../api/community/likePostApi";

/**
 * ✅ 좋아요 추가 및 삭제 훅
 */
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) => likePost(postId),
    onSuccess: (_, postId) => {
      console.log("❤️ 좋아요 토글 성공:", postId);

      // 좋아요 수 갱신
      queryClient.invalidateQueries(["likes", postId]);
      // 게시글 상세 캐시 무효화 (커뮤니티, 추천글 등 공통 처리)
      queryClient.invalidateQueries(["post", postId]);
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      console.error("❌ 좋아요 토글 실패:", error.message);
    },
  });
};

/**
 * ✅ 좋아요 목록 조회 훅
 */
export const useLikeList = (postId) => {
  return useQuery({
    queryKey: ["likes", postId],
    queryFn: () => likeList(postId),
    enabled: !!postId,
    onSuccess: (data) => {
      console.log("👍 좋아요 목록 조회 성공:", data);
    },
    onError: (error) => {
      console.error("❌ 좋아요 목록 조회 실패:", error.message);
    },
  });
};
