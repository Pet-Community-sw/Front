//함께 산책해요
import {
    addWalkingTogether,
    viewWalkingTogether,
    viewWalkingTogetherDetail,
    modifyWalkingTogetherPost,
    deleteWalkingTogetherPost,
    startWalkingTogether
} from "../api/walkingTogether";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//함께 산책해요 게시글 추가, 응답: recommendRoutePostId
export const useAddWalkingTogether = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addWalkingTogether,
    onSuccess: (newWalkingPost) => {
      queryClient.setQueryData(
        ["walkingPosts", newWalkingPost.recommendRoutePostId],
        (oldWalkingPost = []) => {
          return [...oldWalkingPost, newWalkingPost];
        }
      );
    },
    onError: (error) => {
  console.log("❌ Axios error message:", error.message);
  console.log("📦 Axios error response:", error.response);

  const serverMessage =
    error?.response?.data?.message || "매칭 글 등록에 실패했습니다.";
  Alert.alert("오류", serverMessage);
}


  });
};


//함께 산책해요 게시글 목록 조회
export const useViewWalkingTogether = ({ recommendRoutePostId }) => {
    return useQuery({
        queryKey: ["walkingPosts", recommendRoutePostId],
        queryFn: () => viewWalkingTogether({ recommendRoutePostId }),
        enabled: false,
    });
}

//함께 산책해요 게시글 상세 조회
export const useViewWalkingTogetherPostDetail = ({ walkingTogetherPostId }) => {
    return useQuery({
        queryKey: ["walkingPosts", walkingTogetherPostId],
        queryFn: () => viewWalkingTogetherDetail({ walkingTogetherPostId }),
        enabled: !!walkingTogetherPostId, 
    });
}

//함께 산책해요 글 수정
export const useModifyWalkingTogether = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: modifyWalkingTogetherPost, 
    onSuccess: (response, variables) => {
      const { recommendRoutePostId, walkingTogetherPostId, scheduledTime, limitCount } = variables;

      // 목록 캐시 업데이트
      queryClient.setQueryData(
        ["walkingPosts", recommendRoutePostId],
        (oldList = []) => {
          return oldList.map(post =>
            post.walkingTogetherPostId === walkingTogetherPostId
              ? { ...post, scheduledTime, limitCount } 
              : post
          );
        }
      );
      // 상세 캐시 업데이트
      queryClient.setQueryData(
        ["walkingPosts", walkingTogetherPostId],
        (oldPost) => {
          return {
            ...oldPost,
            scheduledTime,
            limitCount,
          };
        }
      );
    },
  });
};

//함께 산책해요 글 삭제
export const useRemoveWalkingTogether = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWalkingTogetherPost,
        onSuccess: (response, variables) => {
            const walkingTogetherPostId = variables;
            queryClient.setQueryData(["walkingPosts", walkingTogetherPostId], (oldWalkingPost = []) => {
                return oldWalkingPost.filter(post => post.walkingTogetherPostId !== walkingTogetherPostId);
            });

            //개별 프로필 데이터 Id 삭제
            queryClient.removeQueries(["walkingPosts", walkingTogetherPostId]);
        }
    })
};

//매칭 시작
export const useStartWalking = () => {
    return useMutation({
        mutationFn: startWalkingTogether,
        onSuccess: (data) => {
            console.log("매칭 성공, 채팅방 생성")
        }, 
       onError: (error) => {
      console.log("❌ Axios error message:", error.message);
      console.log("📦 Axios error response:", error.response);

      const raw = error?.response?.data;
      const message =
        typeof raw === "string"
          ? raw
          : typeof raw?.message === "string"
          ? raw.message
          : JSON.stringify(raw);

      Alert.alert("오류", message);
    },
  })
}