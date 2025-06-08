//대리 산책자
import { 
    addDelegate, 
    viewLocationDelegatePosts, 
    viewPlaceDelegatePosts, 
    viewDelegatePostDetail, 
    modifyDelegatePost, 
    deleteDelegatePost, 
    checkPofile, 
    applicationDelegate, 
    viewDelegateApplicants, 
    selectDelegateApplicant, 
    authDelegateRecord, 
 } from "../api/delegateWalk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

//대리 산책자 게시글 추가
export const useAddDelegate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addDelegate,
        onSuccess: (newDelegatePost) => {
            queryClient.setQueryData(["delegatePosts"], (olddelegatePost = []) => {
                return [...olddelegatePost, newDelegatePost];
            });
        }
    });
};

//지도 범위 기반 대리 산책자 글 목록 조회 (사용자가 직접 지도 움직임)
export const useViewLocationDelegate = (params) => {
    return useQuery({
        queryKey: ["delegatePosts", "location", params],
        queryFn: () => viewLocationDelegatePosts(params),
        enabled: false,
    });
};

//장소 기반 대리 산책자 글 목록 조회 (사용자가 장소 입력)
export const useViewPlaceDelegate = (params) => {
    return useQuery({
        queryKey: ["delegatePosts", "location", params],
        queryFn: () => viewPlaceDelegatePosts(params),
        enabled: false,
    });
}

//글 상세 조회
export const useViewDelegatePostDetail = (delegateWalkPostId) => {
    return useQuery({
        queryKey: ["delegatePosts", delegateWalkPostId],
        queryFn: () => viewDelegatePostDetail(delegateWalkPostId),
        enabled: false,
    });
}

//글 수정
export const useModifyDelegatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: modifyDelegatePost,
        onSuccess: (newPost) => {
            queryClient.setQueryData(["delegatePosts"], (oldPosts = []) =>
                oldPosts.map(post =>
                    post.id === newPost.id ? newPost : post
                )
            );
        }
    });
};

//글 삭제
export const useRemoveDelegatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteDelegatePost,
        onSuccess: (response, variables) => {
            const delegateWalkPostId = variables;
            queryClient.setQueryData(["delegatePosts"], (oldDelegatePost = []) => {
                return oldDelegatePost.filter(delegatePost => delegatePost.id !== delegateWalkPostId);
            });

            //개별 프로필 데이터 Id 삭제
            queryClient.removeQueries(["delegatePosts", delegateWalkPostId]);
        }
    })
};

//펫 프로필 여부 확인
export const useCheckProfile = () => {
  return useMutation({
    mutationFn: checkPofile,
    onSuccess: (hasProfile) => {
      if (!hasProfile) {
        Alert.alert("알림", "먼저 펫 프로필을 등록해주세요.");
      }
    },
    onError: (error) => {
      Alert.alert("오류", error.message);
    },
  });
};

export const useApplicateDelegate = () => {
  return useMutation({
    mutationFn: applicationDelegate,
    onSuccess: () => {
      Alert.alert("지원 완료", "정상적으로 지원되었습니다.");
    },
    onError: (error) => {
      Alert.alert("지원 실패", error.message);
    },
  });
};

//대리 산책 지원자 목록 조회
export const useViewDelegateApplicants = (delegateWalkPostId) => {
  return useQuery({
    queryKey: ["delegateApplicants", delegateWalkPostId],
    queryFn: () => viewDelegateApplicants({ delegateWalkPostId }),
    enabled: !!delegateWalkPostId, // id가 있을 때만 실행
  });
};

//대리 산책 지원자 선정
export const useSelectDelegateApplicant = () => {
  return useMutation({
    mutationFn: selectDelegateApplicant,
    onSuccess: () => {
      Alert.alert("선정 완료", "지원자가 선정되었습니다.");
    },
    onError: (error) => {
      Alert.alert("선정 실패", error.message);
    },
  });
};


//산책 기록 권한 부여
export const useAuthDelegateRecord = () => {
  return useMutation({
    mutationFn: authDelegateRecord,
    onSuccess: () => {
      Alert.alert("권한 부여 완료", "산책 기록 권한이 부여되었습니다.");
    },
    onError: (error) => {
      Alert.alert("권한 부여 실패", error.message);
    },
  });
};
