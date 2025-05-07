//게시물 좋아요 hook
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { likePost, likeList } from "../api/likePostApi";

//좋아요 추가
const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: likePost, 
    onSuccess: (response, variable) => {
      queryClient.invalidateQueries(["likes", variable.postId])
    }
  });
};

//전체 좋아요 조회
const useLikeList = (postId) => {
  return useQuery({
    queryKey: ["likes", postId], 
    queryFn: () => likeList(postId), 
    enabled: false, 
  });
}

export {useLikePost, useLikeList};