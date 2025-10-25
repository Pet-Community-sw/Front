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
  subscribeChatList, 
  unsubscribeChatList,
  isStompConnected,
  logStompStatus 
} from "../../api/chatiing/stompClient"; 

const GroupChattingListScreen = ({ navigation }) => {
  const { data: chatRooms = [], refetch } = useGroupChattingList();
  const { data: profiles = [] } = useViewProfile();
  const { selectProfile } = useProfileSession();
  const { loggedId } = useContext(UserContext);
  
  const [selectProfileModalVisible, setSelectProfileModalVisible] = useState(false);
  const [selectedPetProfileId, setSelectedPetProfileId] = useState(null);

  // STOMP 연결 및 채팅방 목록 구독
  useEffect(() => {
    const initializeStomp = async () => {
      try {
        console.log("🔄 STOMP 연결 시도 (채팅방 목록)");
        logStompStatus();
        
        await connectStomp(() => {
          console.log("✅ STOMP 연결 완료, 채팅방 목록 구독 시작");
          logStompStatus();
          
          // 채팅방 목록 구독
          subscribeChatList(loggedId, (listUpdate) => {
            console.log("📥 채팅방 목록 업데이트 수신:", listUpdate);
            // 목록 새로고침
            refetch();
          });
        });
      } catch (error) {
        console.error("❌ STOMP 연결 실패 (채팅방 목록):", error);
        logStompStatus();
      }
    };

    if (loggedId) {
      initializeStomp();
    }

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (loggedId) {
        unsubscribeChatList(loggedId);
        console.log("📤 채팅방 목록 구독 해제");
      }
    };
  }, [loggedId]);

  useFocusEffect(
    useCallback(() => {
      setSelectProfileModalVisible(true); // 화면 진입 시 프로필 선택 모달 열기
    }, [])
  );

  const handleSelectProfile = async () => {
    console.log("🚀 채팅 프로필 선택 시작, selectedPetProfileId:", selectedPetProfileId);
    
    if (!selectedPetProfileId) {
      console.log("❌ selectedPetProfileId가 없음");
      return;
    }
    
    try {
      console.log("🔄 selectProfile 호출 시작...");
      await selectProfile(selectedPetProfileId);
      console.log("✅ selectProfile 완료");
      
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log("⏰ 대기 완료");
      
      setSelectProfileModalVisible(false);
      console.log("🎉 프로필 선택 완료, 채팅 목록 로드 시작");
      
      // 프로필 선택 후 채팅 목록 로드
      refetch()
        .then((result) => {
          console.log("✅ 채팅 목록 refetch 성공:", result?.data);
        })
        .catch((error) => {
          console.error("❌ 채팅 목록 refetch 실패:", error);
        });
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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ChattingDetail", {
          chatRoomId: item.chatRoomId,
          chatRoomType: "MANY",
          chatName: item.chatName,
        })
      }
      style={styles.chatItem}
    >
      <Text style={styles.chatName}>
        {item.chatName} ({item.userSize || 1}명)
      </Text>
  
      <View style={styles.thumbnailRow}>
        {item.users?.map((user) => {
          const finalUri =
          user.userImageUrl?.startsWith("http")
            ? user.userImageUrl
            : `${BASE_URL}${user.userImageUrl.replace(/^\/+/, "/")}`;
        
  
          return (
            <Image
              key={user.userId}
              source={{ uri: finalUri }}
              style={styles.thumbnail}
            />
          );
        })}
      </View>
  
      <Text numberOfLines={1} style={styles.lastMessage}>
        {item.lastMessage || "메시지 없음"}
      </Text>
  
      <Text style={styles.meta}>
        {item.lastMessageTime
          ? new Date(item.lastMessageTime).toLocaleString("ko-KR")
          : ""}
        {item.unReadCount > 0 && `  ·  안읽음 ${item.unReadCount}개`}
      </Text>
  
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
  

  return (
    <View style={styles.container}>
      {/* 프로필 선택 모달 */}
      <Modal
        visible={selectProfileModalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <ScrollView style={{ maxHeight: 360 }}>
              <Text style={styles.modalTitle}>
                🐶 채팅에 사용할 펫을 선택하세요
              </Text>

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

      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.chatRoomId.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={renderItem}
      />
    </View>
  );
};

export default GroupChattingListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    backgroundColor: "white",
    paddingHorizontal: 17,
    paddingVertical: 8,
    borderRadius: 20,
    borderColor: "black",
    borderWidth: 2,
  },
  smallButtonText: {
    color: "black",
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "cute",
  },
  chatItem: {
    backgroundColor: "#FAFAFA",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  lastMessage: {
    color: "#6B7B8C",
    fontSize: 13,
    marginVertical: 4,
  },
  meta: {
    fontSize: 12,
    color: "#999",
  },
  thumbnailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  thumbnail: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#ccc",
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
  // 프로필 선택 모달 스타일
  modalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
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
});



//임의 데이터 추가

/*
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const GroupChattingListScreen = ({ navigation }) => {
  const [chatRooms] = useState(sampleGroupChats);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.avatar }} style={styles.profileImage} />
      <View style={styles.textSection}>
        <Text style={styles.title}>
          {item.name} ({item.current}/{item.limit})
        </Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
        <Text style={styles.meta}>
          {item.timeAgo}
          {item.unreadCount > 0 && ` · 안읽음 ${item.unreadCount}개`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>💬 단체 채팅방</Text>
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => navigation.navigate("PersonalChattingList")}
        >
          <Text style={styles.smallButtonText}>👤 개인 채팅방</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default GroupChattingListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "##F6F6F6",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A7B9D",
  },
  smallButton: {
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderColor: "#7EC8C2",
    borderWidth: 1,
  },
  smallButtonText: {
    color: "#4A7B9D",
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E7F6F2",
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 13,
    color: "#6B7B8C",
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: "#999",
  },
});
*/