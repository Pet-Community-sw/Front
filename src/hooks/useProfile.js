//프로필 hook
import { addProfile } from "../api/profileApi";
import { viewProfiles } from "../api/profileApi";
import { useMutation, useQuery, useQueryClient, } from "@tanstack/react-query";
import { modifyProfile } from "../api/profileApi";
import { removeProfile } from "../api/profileApi";
import { viewOneProfile } from "../api/profileApi";
import { fetchProfileToken } from "../api/profileApi";
import { useProfileSession } from "../context/SelectProfile";

//프로필 추가
//setQueryData ui 업데이트
const useAddProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addProfile,
    onSuccess: (newProfiles) => {
      queryClient.setQueryData(["profiles"], (oldProfiles = []) => {
        return [...oldProfiles, newProfiles];
      });
    }
  });
};

//프로필 수정
const useModifyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: modifyProfile,
    onSuccess: (modifiedProfile) => {
      queryClient.setQueryData(["profiles"], (oldProfiles = []) => {
        return oldProfiles.map(profile =>
          profile.id === modifiedProfile.id ? modifiedProfile : profile
        )
      });
    },
  })
};

//프로필 삭제
const useRemoveProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeProfile,
    onSuccess: (response, profileId) => {
      queryClient.setQueryData(["profiles"], (oldProfiles = []) => {
        return oldProfiles.filter(profile => profile.id !== profileId);
      });

      //개별 프로필 데이터 Id 삭제
      queryClient.removeQueries(["profiles", profileId]);
    }
  })
};

//전체 프로필 조회
//쿼리키: 특정 데이터 식별, 캐싱
//enabled로 자동 실행 막음
const useViewProfile = () => {
  return useQuery({
    queryKey: ["profiles"], //모든 프로필 목록 데이터
    queryFn: viewProfiles,
    enabled: false,
  });
}

//특정 프로필 조회
const useViewOneProfile = (profileId) => {
  return useQuery({
    queryKey: ["profiles", profileId],
    queryFn: () => viewOneProfile(profileId),
    enabled: !!profileId,
  });
}

//펫 프로필 토큰 새로 발급
export const useFetchAccessToken = () => {
  return useMutation({
    mutationFn: fetchProfileToken,
    onSuccess: (data) => {
      const { accessToken, profileId } = data;

      // 예시: axios에 토큰 설정
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      console.log("✅ 프로필 토큰 발급 완료:", data);
    },
    onError: (error) => {
      console.error("❌ 프로필 토큰 발급 실패:", error.message);
    },
  });
}

export { useAddProfile, useViewProfile, useModifyProfile, useRemoveProfile, useViewOneProfile };