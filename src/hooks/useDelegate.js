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
    startAuthorizedDelegate,
    startDelegateWalk,
} from "../api/delegateWalk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";


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
        queryFn: () => viewDelegatePostDetail({ delegateWalkPostId }),
        enabled: !!delegateWalkPostId, // postId가 있을 때만 실행
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

//대리 산책자 지원
export const useApplicateDelegate = (onSuccess) => {
  return useMutation({
    mutationFn: applicationDelegate,
    onSuccess: () => {
      Alert.alert("지원 완료", "정상적으로 지원되었습니다.");
      onSuccess?.(); // 성공 시 콜백 실행
    },
    onError: (error) => {
      // 409 Conflict는 중복 신청으로 정상적인 응답
      if (error.response?.status === 409) {
        Alert.alert("알림", "이미 신청한 게시글입니다.");
      } else {
        Alert.alert("지원 실패", error.message);
      }
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
export const useSelectDelegateApplicant = (onSuccess) => {
  return useMutation({
    mutationFn: selectDelegateApplicant,
    onSuccess: (data, variables) => {
      Alert.alert("선정 완료", "지원자가 선정되었습니다.");
      // 콜백이 있으면 실행 (data와 variables 모두 전달)
      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error) => {
      Alert.alert("선정 실패", error.message);
    },
  });
};


//산책 기록 권한 부여
export const useAuthDelegateRecord = (onSuccess) => {
  return useMutation({
    mutationFn: authDelegateRecord,
    onSuccess: () => {
      Alert.alert("권한 부여 완료", "산책 기록 권한이 부여되었습니다.");
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      Alert.alert("권한 부여 실패", error.message);
    },
  });
};

//대리 산책 시작 권한 부여
export const useStartAuthorizedDelegate = (onSuccess) => {
  return useMutation({
    mutationFn: startAuthorizedDelegate,
    onSuccess: () => {
      Alert.alert("시작 권한 부여 완료", "대리 산책 시작 권한이 부여되었습니다.");
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      Alert.alert("시작 권한 부여 실패", error.message);
    },
  });
};
