//게시물 hook
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addPost, viewOnePost } from "../api/postApi"; 
import { viewPosts } from "../api/postApi";
import { viewOnePost } from "../api/postApi";
import { modifyPost } from "../api/postApi";
import { removePost } from "../api/postApi";

//게시물 추가
const useAddPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addPost, 
    onSuccess: (newPost) => {
      queryClient.setQueryData(["posts"], (oldPostList = []) => {
        return [...oldPostList, newPost];
      });
    }
  });
};

//게시물 수정
const useModifyPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: modifyPost, 
    onSuccess: (modifiedPost) => {
      queryClient.setQueryData(["posts"], (oldPostList = []) => {
        return oldPostList.map(post => 
          post.id === modifiedPost.id ? modifiedPost: post
        )
      });
    }, 
  })
};

//게시물 삭제
const useRemovePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removePost, 
    onSuccess: (response, postId) => {
      queryClient.setQueryData(["posts"], (oldPostList = []) => {
        return oldPostList.filter(post => post.id !== postId);
      });
      
      //개별 프로필 데이터 Id 삭제
      queryClient.removeQueries(["posts", postsId]);
    }
  })
};

//게시물 목록 조회
const useViewPosts = () => {
  return useQuery({
    queryKey: ["posts"], 
    queryFn: viewPosts, 
  });
}

//특정 게시물 조회
const useViewOnePost = (postId) => {
  return useQuery({
    queryKey: ["posts", postId], 
    queryFn: () => viewOnePost(postId), 
  });
}


export {useAddPost, useModifyPost, useRemovePost, useViewPosts, useViewOnePost};