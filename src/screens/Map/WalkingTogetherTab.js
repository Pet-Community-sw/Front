//산책길 추천 코스 -> 함께 산책해요 매칭 탭
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  useViewWalkingTogether,
  useViewWalkingTogetherPostDetail,
  useAddWalkingTogether,
  useModifyWalkingTogether,
  useRemoveWalkingTogether,
  useStartWalking,
} from "../../hooks/useWalkingTogether";
import { useViewProfile } from "../../hooks/useProfile";
import { useProfileSession } from "../../context/SelectProfile";
import { ScrollView } from "react-native-gesture-handler";
import { BASE_URL } from "../../api/apiClient";
import dayjs from "dayjs";
import selectPetProfile from "../../components/Modal/selectPetProfile";

export const WalkingTogetherTab = ({ recommendRoutePostId }) => {
  console.log("🐾 recommendRoutePostId:", recommendRoutePostId);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [writeModalVisible, setWriteModalVisible] = useState(false);
  const [selectProfileModalVisible, setSelectProfileModalVisible] =
    useState(false);
  const [selectedPetProfileId, setSelectedPetProfileId] = useState(null);

  //선택한 펫 전역으로 저장
  const [scheduledTime, setScheduledTime] = useState(null);
  const [limitCount, setLimitCount] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editScheduledTime, setEditScheduledTime] = useState(null);
  const [editLimitCount, setEditLimitCount] = useState("");
  const [isEditDatePickerVisible, setEditDatePickerVisibility] =
    useState(false);

  const { mutate: createMatch } = useAddWalkingTogether();
  const { mutate: deletePost } = useRemoveWalkingTogether();
  const { mutate: updatePost } = useModifyWalkingTogether();
  const { mutate: startMatching } = useStartWalking();

  const { selectProfile, profileId } = useProfileSession();

  const handleSelectProfile = async () => {
    if (!selectedPetProfileId) return;

    try {
      // 1. 통합 함수 호출
      await selectProfile(selectedPetProfileId);
      await new Promise((resolve) => setTimeout(resolve, 100)); // 토큰 반영 기다림

      // 2. 모달 전환
      setSelectProfileModalVisible(false);
      
      // 3. 목록 다시 불러오기 (새로운 토큰으로 owner 값 업데이트)
      await new Promise((resolve) => setTimeout(resolve, 200)); // 토큰 완전히 반영되도록 추가 대기
      refetch();
    } catch (error) {
      Alert.alert("토큰 발급 실패", "프로필 선택 중 오류가 발생했습니다.");
      console.error("❌ selectProfile 에러:", error);
    }
  };

  if (!recommendRoutePostId) {
    return <Text>경로 정보가 없습니다.</Text>;
  }

  //postId가 바뀐 후에 상세 불러옴
  useEffect(() => {
    if (selectedPostId) {
      refetchDetail();
    }
  }, [selectedPostId]);

  // ✅ 추가: 상세 데이터 받아온 후 콘솔 확인
  useEffect(() => {
    console.log("📦 글 상세 조회 결과:", selectedPost);
  }, [selectedPost]);

  //글 목록 조회
  const {
    data: walks = [],
    refetch,
    isLoading,
  } = useViewWalkingTogether({ recommendRoutePostId });

  // 목록 데이터 확인
  useEffect(() => {
    console.log("📋 함께 산책해요 전체 목록:", walks);
    walks.forEach((item, index) => {
      console.log(`📌 [${index}] walkingTogetherPostId: ${item.walkingTogetherPostId}, petName: ${item.petName}, owner: ${item.owner}`);
    });
  }, [walks]);
  

  //글 상세 조회
  const {
    data: selectedPost,
    refetch: refetchDetail,
    isFetching: isDetailLoading,
  } = useViewWalkingTogetherPostDetail({
    walkingTogetherPostId: selectedPostId,
  });

  //펫 프로필 목록 불러오기
  const { data: profiles = [], refetch: refetchProfiles } = useViewProfile();

  useFocusEffect(
    useCallback(() => {
      refetchProfiles(); // 탭 진입 시 새로 불러오기
    }, [])
  );

  console.log("🐾 프로필 목록:", profiles);

  //탭이 활성화 될 때마다 글 목록 불러옴
  useFocusEffect(
    useCallback(() => {
      refetch();
      setSelectProfileModalVisible(true);
    }, [])
  );

  //postId가 바뀐 후에 상세 불러옴
  useEffect(() => {
    if (selectedPostId) {
      refetchDetail();
    }
  }, [selectedPostId]);

  //선택된 게시글의 ID 가 전달됨
  const openModal = (postId) => {
    console.log("👆 openModal 클릭됨, postId:", postId);
    setSelectedPostId(postId);
    setModalVisible(true);
    setSelectedPostId(null);
    setTimeout(() => {
      setSelectedPostId(postId);
    }, 0);
  };

  //날짜, 시간 선택
  const handleConfirmDate = (date) => {
    const formatted = dayjs(date).format("YYYY-MM-DDTHH:mm:ss");
    setScheduledTime(formatted);
    setDatePickerVisibility(false);
  };

  //글 수정 날짜, 시간 선택
  const handleConfirmEditDate = (date) => {
    const formatted = dayjs(date).format("YYYY-MM-DDTHH:mm:ss");
    setEditScheduledTime(formatted);
    setEditDatePickerVisibility(false);
  };

  //매칭 글 추가
  const handleSubmit = () => {
    if (!scheduledTime || !limitCount) {
      Alert.alert("입력 오류", "날짜/시간과 인원 수를 모두 입력해주세요.");
      return;
    }
    createMatch(
      {
        recommendRoutePostId,
        scheduledTime: scheduledTime,
        limitCount: Number(limitCount),
        profileId: profileId,
      },
      {
        onSuccess: () => {
          Alert.alert("등록 완료", "매칭 글이 등록되었습니다.");
          setWriteModalVisible(false);
          setScheduledTime(null);
          setLimitCount("");
          refetch();
        },
        onError: (error) => {
          const serverMessage =
            error?.response?.data?.message || "매칭 글 등록에 실패했습니다.";
          Alert.alert("오류", serverMessage);
        },
      }
    );
  };

  //매칭 글 수정
  const handleEditFromList = (item) => {
    setSelectedPostId(item.walkingTogetherPostId);
    setEditScheduledTime(item.scheduledTime);
    setEditLimitCount(item.limitCount.toString());
    setEditModalVisible(true);
  };

  const handleSubmitEdit = () => {
    if (!editScheduledTime || !editLimitCount) {
      Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
      return;
    }

    updatePost(
      {
        walkingTogetherPostId: selectedPostId,
        recommendRoutePostId,
        scheduledTime: editScheduledTime,
        limitCount: Number(editLimitCount),
      },
      {
        onSuccess: () => {
          Alert.alert("수정 완료", "게시글이 수정되었습니다.");
          setEditModalVisible(false);
          refetch();
        },
        onError: () => {
          Alert.alert("수정 실패", "게시글 수정에 실패했습니다.");
        },
      }
    );
  };

  //매칭 글 삭제
  const handleDeleteFromList = (item) => {
    Alert.alert("삭제 확인", "정말 이 글을 삭제하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deletePost(item.walkingTogetherPostId, {
            onSuccess: () => {
              Alert.alert("삭제 완료", "게시글이 삭제되었습니다.");
              refetch(); // 삭제 후 목록 다시 불러오기
            },
            onError: () => {
              Alert.alert("오류", "게시글 삭제에 실패했습니다.");
            },
          });
        },
      },
    ]);
  };

  //매칭 시작
  const handleStartMatching = (walkingTogetherPostId) => {
    console.log("매칭 시작 postId:", walkingTogetherPostId);
    console.log("매칭 시작 요청 데이터:", { walkingTogetherPostId });
    
    if (!walkingTogetherPostId) {
      Alert.alert("오류", "매칭할 게시글 ID가 없습니다.");
      return;
    }

    startMatching(
      { walkingTogetherPostId },
      {
        onSuccess: (response) => {
          console.log("🎉 매칭 시작 성공 응답:", response);
          if (response?.chatRoomId) {
            // 새 채팅방 or 기존 채팅방 모두 chatRoomId와 chatName 포함됨
            navigation.navigate("ChattingScreen", {
              chatRoomId: response.chatRoomId,
              chatRoomType: "MANY", // 매칭 기반은 무조건 단체

            });
          } else {
            // 혹시 모를 예외 대응
            Alert.alert("채팅방이 생성되었습니다.");
          }
        },
        onError: (error) => {
          console.log("❌ 매칭 시작 오류:", {
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            message: error?.message
          });
          
          const raw = error?.response?.data;

          const message =
            typeof raw === "string"
              ? raw
              : typeof raw?.message === "string"
              ? raw.message
              : JSON.stringify(raw); // 마지막 fallback

          Alert.alert("오류", message);
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      {/* 매칭 글 쓰기 버튼 */}
      <TouchableOpacity
        style={styles.matchButton}
        onPress={() => setWriteModalVisible(true)}
      >
        <MaterialIcons name="check-circle" size={22} color="#7EC8C2" />
        <Text style={styles.matchText}>매칭 글 쓰기</Text>
      </TouchableOpacity>

      {/* 매칭 글 목록 */}
      <FlatList
        data={walks}
        keyExtractor={(item, index) =>
          item.walkingTogetherPostId
            ? item.walkingTogetherPostId.toString()
            : `fallback-${index}`
        }
        renderItem={({ item }) => {
          console.log("🐾 WalkingTogether Item:", {
            walkingTogetherPostId: item.walkingTogetherPostId,
            petName: item.petName,
            owner: item.owner,
            isOwner: item.isOwner,
          });
          
          return (
          <View style={styles.walkCard}>
            {/* 펫 정보 섹션 */}
            <View style={styles.walkCardHeader}>
              <Image
                source={{ uri: `${BASE_URL}${item.petImageUrl}` }}
                style={styles.walkPetImage}
              />
              <View style={styles.walkPetInfo}>
                <Text style={styles.walkPetName}>{item.petName || "알 수 없음"}</Text>
                <Text style={styles.walkCreatedAt}>{item.createdAt || "방금 전"}</Text>
              </View>
              {/* {item.owner === true && (
                <View style={styles.ownerBadge}>
                  <Text style={styles.ownerBadgeText}>내 글</Text>
                </View>
              )} */}
            </View>

            {/* 산책 정보 */}
            <View style={styles.walkInfoSection}>
              <View style={styles.walkInfoRow}>
                <MaterialIcons name="event" size={18} color="#7EC8C2" />
                <Text style={styles.walkInfoText}>
                  {item.scheduledTime 
                    ? dayjs(item.scheduledTime).format("MM월 DD일 HH:mm") 
                    : "시간 미정"}
                </Text>
              </View>
              <View style={styles.walkInfoRow}>
                <MaterialIcons name="people" size={18} color="#7EC8C2" />
                <Text style={styles.walkInfoText}>
                  {item.currentCount || 1}/{item.limitCount || 0}명
                </Text>
              </View>
            </View>

            {/* 버튼 영역 */}
            <View style={styles.walkCardActions}>
              {/* {item.owner === true ? (
                <View style={styles.walkOwnerActions}>
                  <TouchableOpacity 
                    style={styles.walkEditButton}
                    onPress={() => handleEditFromList(item)}
                  >
                    <Text style={styles.walkEditButtonText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.walkDeleteButton}
                    onPress={() => handleDeleteFromList(item)}
                  >
                    <Text style={styles.walkDeleteButtonText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              ) : ( */}
                <TouchableOpacity 
                  style={styles.walkMatchButton}
                  onPress={() => handleStartMatching(item.walkingTogetherPostId)}
                >
                  <MaterialIcons name="pets" size={18} color="#FFFFFF" />
                  <Text style={styles.walkMatchButtonText}>매칭 시작</Text>
                </TouchableOpacity>
              {/* )} */}
            </View>
          </View>
          );
        }}
        ListEmptyComponent={
          !isLoading && <Text style={styles.empty}>등록된 글이 없어요!</Text>
        }
      />

      {/* 펫 프로필 선택 모달 */}
      <Modal
        visible={selectProfileModalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.petModalWrapper}>
          <View style={styles.petModalContent}>
            {/* 모달 헤더 */}
            <View style={styles.petModalHeader}>
              <Text style={styles.petModalTitle}>🐶 함께 산책할 펫을 선택하세요</Text>
            </View>

            {/* 펫 프로필 리스트 */}
            <ScrollView style={styles.petProfileList} showsVerticalScrollIndicator={false}>
              {profiles.map((profile) => (
                <TouchableOpacity
                  key={profile.profileId}
                  style={[
                    styles.petProfileCard,
                    selectedPetProfileId === profile.profileId && styles.petProfileCardSelected
                  ]}
                  onPress={() => setSelectedPetProfileId(profile.profileId)}
                >
                  <View style={styles.petProfileImageContainer}>
                    <Image
                      source={{ uri: `${BASE_URL}${profile.petImageUrl}` }}
                      style={styles.petProfileImage}
                    />
                    {selectedPetProfileId === profile.profileId && (
                      <View style={styles.petProfileSelectedBadge}>
                        <Text style={styles.petProfileSelectedText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.petProfileName}>
                    {profile.petName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 버튼들 */}
            <View style={styles.petModalButtonContainer}>
              <TouchableOpacity 
                style={styles.petModalCancelButton} 
                onPress={() => setSelectProfileModalVisible(false)}
              >
                <Text style={styles.petModalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.petModalSelectButton,
                  !selectedPetProfileId && styles.petModalSelectButtonDisabled
                ]} 
                disabled={!selectedPetProfileId}
                onPress={handleSelectProfile}
              >
                <Text style={styles.petModalSelectText}>선택하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 글 상세 모달 */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            {isDetailLoading ? (
              <Text>불러오는 중...</Text>
            ) : (
              <>
                <Text style={styles.modalTitle}>
                  🐶 {selectedPost?.petName}와 산책해요
                </Text>
                <Text style={styles.meta}>
                  일시: {selectedPost?.scheduledTime}
                </Text>
                <Text style={styles.meta}>
                  인원: {selectedPost?.currentCount} /{" "}
                  {selectedPost?.limitCount}
                </Text>
                <Text style={styles.meta}>
                  등록일: {selectedPost?.createdAt}
                </Text>

                {selectedPost?.filtering ? (
                  <Text style={[styles.meta, { color: "red" }]}>
                    ⚠️ 함께 산책이 제한된 대상입니다
                  </Text>
                ) : (
                  <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={() => {
                      console.log(
                        "🧩 터치된 글 ID:",
                        selectedPost?.walkingTogetherPostId
                      );
                      handleStartMatching(selectedPost?.walkingTogetherPostId);
                    }}
                  >
                    <Text style={styles.applyText}>매칭 시작</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeText}>닫기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 매칭 글 쓰기 모달 */}
      <Modal visible={writeModalVisible} animationType="slide" transparent>
        <View style={styles.writeMatchModalWrapper}>
          <View style={styles.writeMatchModalContent}>
            {/* 모달 헤더 */}
            <View style={styles.writeMatchModalHeader}>
              <Text style={styles.writeMatchModalTitle}>매칭 글 작성</Text>
            </View>

            {/* 입력 필드들 */}
            <View style={styles.writeMatchInputSection}>
              <View style={styles.writeMatchInputGroup}>
                <Text style={styles.writeMatchInputLabel}>산책 날짜 & 시간</Text>
                <TouchableOpacity
                  style={styles.writeMatchDateButton}
                  onPress={() => setDatePickerVisibility(true)}
                >
                  <MaterialIcons name="event" size={20} color="#7EC8C2" />
                  <Text style={styles.writeMatchDateText}>
                    {scheduledTime
                      ? dayjs(scheduledTime).format("YYYY년 MM월 DD일 HH:mm")
                      : "날짜와 시간을 선택해주세요"}
                  </Text>
                  <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View style={styles.writeMatchInputGroup}>
                <Text style={styles.writeMatchInputLabel}>최대 인원 수</Text>
                <TextInput
                  placeholder="최대 인원 수를 입력하세요"
                  value={limitCount}
                  onChangeText={setLimitCount}
                  keyboardType="number-pad"
                  style={styles.writeMatchInput}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* 버튼들 */}
            <View style={styles.writeMatchButtonContainer}>
              <TouchableOpacity 
                style={styles.writeMatchCancelButton} 
                onPress={() => setWriteModalVisible(false)}
              >
                <Text style={styles.writeMatchCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.writeMatchSubmitButton,
                  (!scheduledTime || !limitCount) && styles.writeMatchSubmitButtonDisabled
                ]} 
                onPress={handleSubmit}
                disabled={!scheduledTime || !limitCount}
              >
                <Text style={styles.writeMatchSubmitText}>등록하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisibility(false)}
      />

      {/* 매칭 글 수정 모달 */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✏️ 글 수정하기</Text>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setEditDatePickerVisibility(true)}
            >
              <Text>
                {editScheduledTime
                  ? new Date(editScheduledTime).toLocaleString()
                  : "날짜/시간 선택"}
              </Text>
            </TouchableOpacity>

            <Text>모집 인원</Text>
            <TextInput
              value={editLimitCount}
              onChangeText={setEditLimitCount}
              keyboardType="numeric"
              style={styles.input}
            />

            <View
              style={{
                marginTop: 16,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleSubmitEdit}
              >
                <Text style={styles.applyText}>수정 완료</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.closeText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <DateTimePickerModal
        isVisible={isEditDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirmEditDate}
        onCancel={() => setEditDatePickerVisibility(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFF" },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
    fontFamily: "cute",
    color: "#333",
  },
  /* 🐾 산책 카드 스타일 */
  walkCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  walkCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  walkPetImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  walkPetInfo: {
    flex: 1,
  },
  walkPetName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "cute",
    marginBottom: 2,
  },
  walkCreatedAt: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "cute",
  },
  ownerBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownerBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
    fontFamily: "cute",
  },
  walkInfoSection: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  walkInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  walkInfoText: {
    fontSize: 16,
    color: "#374151",
    fontFamily: "cute",
  },
  walkCardActions: {
    marginTop: 4,
  },
  walkOwnerActions: {
    flexDirection: "row",
    gap: 8,
  },
  walkEditButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  walkEditButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: "cute",
  },
  walkDeleteButton: {
    flex: 1,
    backgroundColor: "#FEE2E2",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  walkDeleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
    fontFamily: "cute",
  },
  walkMatchButton: {
    backgroundColor: "#7EC8C2",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#7EC8C2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  walkMatchButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "cute",
  },
  matchButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E8F7F1",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  matchText: {
    marginLeft: 8,
    color: "#4CA195",
    fontWeight: "600",
    fontSize: 18,
    fontFamily: "cute",
  },
  empty: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 14,
    marginTop: 40,
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  /* 🐾 펫 선택 모달 스타일 */
  petModalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  petModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  petModalHeader: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  petModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "cute",
  },
  petProfileList: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    maxHeight: 300,
  },
  petProfileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  petProfileCardSelected: {
    backgroundColor: "#F0FDF4",
    borderColor: "#7EC8C2",
  },
  petProfileImageContainer: {
    position: "relative",
    marginRight: 16,
  },
  petProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  petProfileSelectedBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#7EC8C2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  petProfileSelectedText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  petProfileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "cute",
  },
  petModalButtonContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 12,
  },
  petModalCancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  petModalCancelText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: "cute",
  },
  petModalSelectButton: {
    flex: 2,
    backgroundColor: "#7EC8C2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#7EC8C2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  petModalSelectButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  petModalSelectText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "cute",
  },

  /* 📝 매칭 글 작성 모달 스타일 */
  writeMatchModalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  writeMatchModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 34,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  writeMatchModalHeader: {
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 20,
  },
  writeMatchModalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "cute",
  },
  writeMatchInputSection: {
    marginBottom: 24,
  },
  writeMatchInputGroup: {
    marginBottom: 20,
  },
  writeMatchInputLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    fontFamily: "cute",
  },
  writeMatchDateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
  writeMatchDateText: {
    flex: 1,
    fontSize: 18,
    color: "#1F2937",
    fontFamily: "cute",
  },
  writeMatchInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
    fontFamily: "cute",
  },
  writeMatchButtonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  writeMatchCancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  writeMatchCancelText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: "cute",
  },
  writeMatchSubmitButton: {
    flex: 2,
    backgroundColor: "#7EC8C2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#7EC8C2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  writeMatchSubmitButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  writeMatchSubmitText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "cute",
  },

  meta: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    marginBottom: 10,
    fontSize: 14,
    color: "#333",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  applyBtn: {
    marginTop: 10,
    backgroundColor: "#7EC8C2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontWeight: "600",
  },
  closeBtn: {
    marginTop: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#7E7E7E",
    fontSize: 13,
  },
  ownerButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },

  editButton: {
    marginRight: 12,
    fontSize: 13,
    color: "#4CA195",
    fontWeight: "500",
  },

  deleteButton: {
    fontSize: 13,
    color: "#D94C4C",
    fontWeight: "500",
  },
});
