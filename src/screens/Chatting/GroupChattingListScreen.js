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
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ChattingDetail", {
          chatRoomId: item.chatRoomId,
          chatRoomType: "MANY",
          chatName: item.chatName || `${item.ownerName}님의 방`,
        })
      }
      style={styles.chatCard}
    >
      {/* 방 이름 + 인원수 */}
      <View style={styles.chatHeader}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons name="chat-outline" size={20} style={styles.chatIcon} />
          <Text style={styles.chatName}>{item.chatName || `${item.ownerName}님의 방`}</Text>
        </View>
        <Text style={styles.participantCount}>{item.userSize}명</Text>
      </View>
  
      {/* 프로필 이미지 */}
      <View style={styles.thumbnailRow}>
        {item.users?.slice(0, 4).map((user, index) => (
          <View
            key={user.userId}
            style={[
              styles.thumbnailContainer,
              { marginLeft: index > 0 ? -12 : 0, zIndex: 4 - index },
            ]}
          >
            <Image
              source={{
                uri: user.userImageUrl?.startsWith("http")
                  ? user.userImageUrl
                  : `${BASE_URL}${user.userImageUrl}`,
              }}
              style={styles.thumbnail}
            />
          </View>
        ))}
        {item.users?.length > 4 && (
          <View style={[styles.thumbnailContainer, { marginLeft: -10 }]}>
            <View style={styles.moreProfiles}>
              <Text style={styles.moreText}>+{item.users.length - 4}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
  
  

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
    backgroundColor: "#F8FAF9",
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 16,
  },
  smallButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 17,
    paddingVertical: 8,
    borderRadius: 20,
    borderColor: "#7EC8C2",
    borderWidth: 1.5,
  },
  smallButtonText: {
    color: "#3C6255",
    fontSize: 15,
    fontWeight: "600",
  },

  /* 🩵 채팅방 카드 */
  chatCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E6ECEA",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },

  /* 카드 상단 */
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  chatName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  chatIcon: {
    marginRight: 6,
    color: "#7EC8C2",
  },

  /* 참가자 수 */
  participantCount: {
    backgroundColor: "#E7F6F2",
    color: "#3C6255",
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  /* 프로필 썸네일 */
  thumbnailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  thumbnailContainer: {
    position: "relative",
  },
  thumbnail: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2.5,
    borderColor: "#fff",
    backgroundColor: "#F0F4F3",
  },
  moreProfiles: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F5F4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "#fff",
  },
  moreText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
  },

  /* 🔘 공백 상태 */
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
