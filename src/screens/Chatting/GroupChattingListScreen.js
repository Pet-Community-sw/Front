import React, { useCallback, useState, useEffect, useContext } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { useGroupChattingList } from "../../hooks/useChatting";
import { useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "../../api/apiClient";
import { useViewProfile } from "../../hooks/useProfile";
import { useProfileSession } from "../../context/SelectProfile";
import { UserContext } from "../../context/User";
import {
  connectStomp,
  logStompStatus,
  disconnectStomp,
} from "../../api/chatiing/stompClient";
import {
  subscribeChatList,
  unsubscribeChatList,
} from "../../api/chatiing/stompSubscribe";

const GroupChattingListScreen = ({ navigation }) => {
  const { data: chatRooms = [], refetch, isLoading, error } = useGroupChattingList();
  const { data: profiles = [] } = useViewProfile();
  const { selectProfile } = useProfileSession();
  const { userId } = useContext(UserContext);

  console.log("📋 채팅방 목록 상태:", {
    isLoading,
    error: error?.message,
    chatRoomsCount: chatRooms?.length || 0,
    chatRooms: chatRooms
  });

  const [selectProfileModalVisible, setSelectProfileModalVisible] =
    useState(false);
  const [selectedPetProfileId, setSelectedPetProfileId] = useState(null);

  // ✅ 원본 로직 유지
  useEffect(() => {
    let subscription = null;
    
    const initializeStomp = async () => {
      try {
        console.log("🔄 STOMP 연결 시도 (채팅방 목록)");
        logStompStatus();

        await connectStomp();
        console.log("✅ STOMP 연결 완료, 채팅방 목록 구독 시작");
        logStompStatus();

        subscription = await subscribeChatList((update) => {
          console.log("📬 채팅방 목록 업데이트 수신:", update);
          console.log("📬 업데이트 타입:", update.messageType);
          console.log("📬 업데이트 body:", update.body);
          
          if (update.messageType === "LIST_UPDATE") {
            console.log("🔄 채팅방 목록 새로고침 시작");
            refetch().then((result) => {
              console.log("✅ 채팅방 목록 새로고침 완료:", result.data);
            }).catch((error) => {
              console.error("❌ 채팅방 목록 새로고침 실패:", error);
            });
          } else if (update.messageType === "TALK" && update.body) {
            // TALK 메시지가 오면 해당 채팅방의 unReadCount 업데이트
            console.log("💬 TALK 메시지 수신, 채팅방 목록 새로고침");
            refetch().then((result) => {
              console.log("✅ TALK 메시지로 인한 목록 새로고침 완료:", result.data);
            }).catch((error) => {
              console.error("❌ TALK 메시지로 인한 목록 새로고침 실패:", error);
            });
          }
        });

        if (subscription) {
          console.log("✅ 채팅방 목록 구독 완료:", subscription.id);
        } else {
          console.error("❌ 채팅방 목록 구독 실패");
        }
      } catch (error) {
        console.error("❌ STOMP 연결 실패 (채팅방 목록):", error);
        logStompStatus();
      }
    };

    initializeStomp();

    // cleanup 함수
    return () => {
      if (subscription) {
        unsubscribeChatList(subscription);
        console.log("📤 채팅방 목록 구독 해제 완료");
      }
      disconnectStomp();
    };
  }, []);

  // useFocusEffect(
  //   useCallback(() => {
  //     setSelectProfileModalVisible(true);
  //   }, [])
  // );

  const handleSelectProfile = async () => {
    if (!selectedPetProfileId) return;
    try {
      await selectProfile(selectedPetProfileId);
      await new Promise((resolve) => setTimeout(resolve, 200));
      setSelectProfileModalVisible(false);
      refetch();
    } catch (error) {
      console.error("❌ selectProfile error:", error);
      Alert.alert("오류", "프로필 선택 중 문제가 발생했습니다.");
    }
  };

  const handleEdit = (chatRoomId) => {
    Alert.alert("수정 기능", `방 ID ${chatRoomId} 수정 클릭`);
  };

  const handleDelete = (chatRoomId) => {
    Alert.alert("삭제 기능", `방 ID ${chatRoomId} 삭제 클릭`);
  };

  // 서버 응답 구조에 맞게 수정
  const renderItem = ({ item }) => {
    console.log("📱 채팅방 데이터:", item); // 디버깅용
    
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("ChattingDetail", {
            chatRoomId: item.chatRoomId,
            chatRoomType: "MANY",
            chatName: item.chatName || "채팅방",
          })
        }
        style={styles.chatCard}
      >
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>
            {item.chatName || "채팅방"}
          </Text>
          {item.unReadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unReadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.thumbnailRow}>
          {/* 사용자 이미지들을 카톡처럼 겹쳐서 표시 */}
          {item.users?.slice(0, 3).map((user, index) => (
            <View
              key={user.userId}
              style={[
                styles.thumbnailContainer,
                { marginLeft: index > 0 ? -8 : 0, zIndex: 3 - index }
              ]}
            >
              <Image
                source={{
                  uri: user.userImageUrl?.startsWith("http")
                    ? user.userImageUrl
                    : `${BASE_URL}${user.userImageUrl}`,
                }}
                style={styles.thumbnail}
                onError={(error) => {
                  console.log("이미지 로딩 실패:", user.userImageUrl, error);
                }}
              />
            </View>
          ))}
          {item.users?.length > 3 && (
            <View style={[styles.thumbnailContainer, { marginLeft: -8 }]}>
              <View style={styles.moreProfiles}>
                <Text style={styles.moreText}>+{item.users.length - 3}</Text>
              </View>
            </View>
          )}
          <Text style={styles.participantCount}>
            {item.userSize}명
          </Text>
        </View>

        <Text numberOfLines={1} style={styles.lastMessage}>
          {item.lastMessage || "메시지 없음"}
        </Text>

        <View style={styles.meta}>
          <Text style={styles.timeText}>
            {item.lastMessageTime
              ? new Date(item.lastMessageTime).toLocaleString("ko-KR", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : ""}
          </Text>
          {item.unReadCount > 0 && (
            <Text style={styles.unreadMeta}>안읽음 {item.unReadCount}개</Text>
          )}
        </View>

        {item.owner && (
          <View style={styles.ownerButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(item.chatRoomId)}
            >
              <Text style={styles.buttonText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.chatRoomId)}
            >
              <Text style={styles.buttonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>채팅방 목록을 불러오는 중...</Text>
      </View>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>오류가 발생했습니다: {error.message}</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ 프로필 선택 모달 */}
      <Modal visible={selectProfileModalVisible} animationType="slide" transparent>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <ScrollView style={{ maxHeight: 360 }}>
              <Text style={styles.modalTitle}>🐶 채팅에 사용할 펫을 선택하세요</Text>

              {Array.isArray(profiles) && profiles.length === 0 && (
                <Text style={{ color: "#666", marginBottom: 12 }}>
                  등록된 프로필이 없습니다. 먼저 프로필을 추가해주세요.
                </Text>
              )}

              {profiles.map((profile) => (
                <TouchableOpacity
                  key={profile.profileId}
                  style={[
                    styles.profileCard,
                    selectedPetProfileId === profile.profileId && {
                      borderColor: "#7EC8C2",
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setSelectedPetProfileId(profile.profileId)}
                >
                  <Image
                    source={
                      profile.petImageUrl
                        ? { uri: `${BASE_URL}${profile.petImageUrl}` }
                        : require("../../../assets/icon.png")
                    }
                    style={styles.profileImage}
                  />
                  <Text style={styles.profileName}>{profile.petName}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.applyBtn,
                  { opacity: selectedPetProfileId ? 1 : 0.6 },
                ]}
                disabled={!selectedPetProfileId}
                onPress={handleSelectProfile}
              >
                <Text style={styles.applyText}>선택하기</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setSelectProfileModalVisible(false)}
              >
                <Text style={styles.applyText}>닫기</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.headerRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => navigation.navigate("PersonalChattingList")}
        >
          <Text style={styles.smallButtonText}>👤 개인 채팅방</Text>
        </TouchableOpacity>
      </View>

      {chatRooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>채팅방이 없습니다</Text>
          <Text style={styles.emptySubText}>새로운 채팅을 시작해보세요!</Text>
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.chatRoomId.toString()}
          contentContainerStyle={{ 
            paddingBottom: 20,
            paddingTop: 8,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default GroupChattingListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 12,
  },
  smallButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 17,
    paddingVertical: 8,
    borderRadius: 20,
    borderColor: "#6A9C89",
    borderWidth: 1.5,
  },
  smallButtonText: {
    color: "#3C6255",
    fontSize: 15,
    fontWeight: "600",
  },
  chatCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chatName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    flex: 1,
    letterSpacing: -0.5,
  },
  unreadBadge: {
    backgroundColor: "#ff4757",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    shadowColor: "#ff4757",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  thumbnailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  thumbnailContainer: {
    position: "relative",
  },
  thumbnail: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#fff",
  },
  moreProfiles: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  moreText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#666",
  },
  participantCount: {
    fontSize: 13,
    color: "#6c757d",
    alignSelf: "center",
    marginLeft: 12,
    fontWeight: "600",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lastMessage: {
    color: "#6c757d",
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
    fontWeight: "500",
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    fontSize: 12,
    color: "#adb5bd",
    fontWeight: "600",
  },
  unreadMeta: {
    fontSize: 12,
    color: "#ff4757",
    fontWeight: "700",
  },
  ownerButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  editButton: {
    backgroundColor: "#6A9C89",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#E57373",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  senderProfileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginTop: 2,
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    marginBottom: 10,
  },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  profileName: { fontSize: 16, color: "#333" },
  applyBtn: {
    backgroundColor: "#7EC8C2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 6,
  },
  applyText: { color: "white", fontWeight: "600" },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: "#ff4757",
    textAlign: "center",
    marginTop: 50,
    marginHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#007aff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },
  retryText: {
    color: "white",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
