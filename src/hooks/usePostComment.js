// hooks/useComment.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postComment, modifyComment, removeComment } from "../api/community/postCommentApi";

// ✅ 댓글 추가
export const usePostComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postComment,
    onSuccess: (_, variables) => {
      console.log("✅ 댓글 추가 성공");
      queryClient.invalidateQueries(["comments", variables.postId]);
      queryClient.invalidateQueries(["posts", variables.postId]); // 게시글 상세도 갱신
    },
    onError: (error) => {
      console.error("❌ 댓글 추가 실패:", error.response?.data || error.message);
    },
  });
};

// ✅ 댓글 수정
export const useModifyComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modifyComment,
    onSuccess: (_, variables) => {
      console.log("✅ 댓글 수정 성공");
      queryClient.invalidateQueries(["comments", variables.postId]);
      queryClient.invalidateQueries(["posts", variables.postId]);
    },
    onError: (error) => {
      console.error("❌ 댓글 수정 실패:", error.response?.data || error.message);
    },
  });
};

// ✅ 댓글 삭제
export const useRemoveComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeComment,
    onSuccess: (_, variables) => {
      console.log("✅ 댓글 삭제 성공");
      queryClient.invalidateQueries(["comments", variables.postId]);
      queryClient.invalidateQueries(["posts", variables.postId]);
    },
    onError: (error) => {
      console.error("❌ 댓글 삭제 실패:", error.response?.data || error.message);
    },
  });
};
