//게시물 좋아요 hook
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { likePost, likeList } from "../api/likePostApi";

// 좋아요 추가 or 삭제
const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: likePost, // postId, postType 받아서 POST 요청 보내는 함수
    onSuccess: (_, variables) => {
      const { postId, postType } = variables;
      
      // 게시글 상세 invalidate
      if (postType === "RECOMMEND") {
        queryClient.invalidateQueries(["recommendPosts", postId]);
        queryClient.invalidateQueries(["likes", "RECOMMEND", postId]);
      } else {
        queryClient.invalidateQueries(["posts", postId]);
        queryClient.invalidateQueries(["likes", "COMMUNITY", postId]);
      }
    },
  });
};


//전체 좋아요 조회
const useLikeList = (postId, postType) => {
  return useQuery({
    queryKey: ["likes", postType, postId],
    queryFn: () => likeList(postId, postType),
    enabled: !!postId,
  });
};



export {useLikePost, useLikeList};