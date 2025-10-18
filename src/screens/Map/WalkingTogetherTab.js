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
    console.log("🚀 매칭 시작 postId:", walkingTogetherPostId);
    if (!selectedPost?.walkingTogetherPostId) {
      Alert.alert("오류", "매칭할 게시글 ID가 없습니다.");
      return;
    }

    startMatching(
      { walkingTogetherPostId },
      {
        onSuccess: (response) => {
          if (response?.chatRoomId) {
            // 새 채팅방 or 기존 채팅방 모두 chatRoomId와 chatName 포함됨
            navigation.navigate("ChattingScreen", {
              chatRoomId: response.chatRoomId,
              chatRoomType: "MANY", // 매칭 기반은 무조건 단체
              chatName: response.chatName, // 서버에서 제공된 이름 그대로 사용
            });
          } else {
            // 혹시 모를 예외 대응
            Alert.alert("오류", "채팅방 정보를 불러올 수 없습니다.");
          }
        },
        onError: (error) => {
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
      <Text style={styles.title}>🐾 함께 산책해요</Text>

      {/* 매칭 글 쓰기 버튼 */}
      <TouchableOpacity
        style={styles.matchButton}
        onPress={() => setWriteModalVisible(true)}
      >
        <MaterialIcons name="check-circle" size={18} color="#7EC8C2" />
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => openModal(item.walkingTogetherPostId)}
          >
            <Image
              source={{ uri: `${BASE_URL}${item.petImageUrl}` }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                marginBottom: 8,
              }}
            />

            <Text style={styles.walkMeta}>
              {item.scheduledTime || "시간 미정"} · {item.petName || "작성자"}
            </Text>
            {item.isOwner && (
              <View style={styles.ownerButtonRow}>
                <TouchableOpacity onPress={() => handleEditFromList(item)}>
                  <Text style={styles.editButton}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteFromList(item)}>
                  <Text style={styles.deleteButton}>삭제</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
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
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={styles.modalTitle}>
                🐶 함께 산책할 펫을 선택하세요
              </Text>
              {profiles.map((profile) => (
                <TouchableOpacity
                  key={profile.profileId}
                  style={[
                    styles.card,
                    selectedPetProfileId === profile.profileId && {
                      borderColor: "#7EC8C2",
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setSelectedPetProfileId(profile.profileId)}
                >
                  <Image
                    source={{ uri: `${BASE_URL}${profile.petImageUrl}` }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      marginBottom: 8,
                    }}
                  />
                  <Text
                    style={{ fontFamily: "cute", fontSize: 20, marginLeft: 5 }}
                  >
                    {profile.petName}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.applyBtn}
                disabled={!selectedPetProfileId}
                onPress={handleSelectProfile}
              >
                <Text style={styles.applyText}>선택하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setSelectProfileModalVisible(false)}
              >
                <Text style={styles.applyText}>닫기</Text>
              </TouchableOpacity>
            </ScrollView>
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
      <Modal visible={writeModalVisible} animationType="fade" transparent>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>매칭 글 작성</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setDatePickerVisibility(true)}
            >
              <Text>
                {scheduledTime
                  ? scheduledTime.toLocaleString()
                  : "날짜/시간 선택"}
              </Text>
            </TouchableOpacity>
            <TextInput
              placeholder="최대 인원 수"
              value={limitCount}
              onChangeText={setLimitCount}
              keyboardType="number-pad"
              style={styles.input}
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleSubmit}>
              <Text style={styles.applyText}>등록</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setWriteModalVisible(false)}
            >
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
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
  card: {
    backgroundColor: "#F6FDFC",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D2EAE4",
  },
  walkTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    color: "#2C3E50",
  },
  walkMeta: {
    fontSize: 13,
    color: "#6B7B8C",
    marginBottom: 8,
  },
  matchButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#E8F7F1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  matchText: {
    marginLeft: 6,
    color: "#4CA195",
    fontWeight: "500",
    fontSize: 13,
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
