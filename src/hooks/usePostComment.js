import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postComment, modifyComment, removeComment } from "../api/postCommentApi";

//댓글 추가
const usePostComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postComment, 
    onSuccess: (response, variable) => {
      queryClient.invalidateQueries(["comments", variable.postId]);
    }    
  });
};

//댓글 수정
const useModifyComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: modifyComment, 
    onSuccess: (response, variable) => {
      queryClient.invalidateQueries(["comments", variable.postId]);
    }
  });
}

//댓글 삭제
const useRemoveComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeComment, 
    onSuccess: (response, variable) => {
      queryClient.invalidateQueries(["comments", variable.postId]);
    }
  })
};

export {usePostComment, useModifyComment, useRemoveComment};