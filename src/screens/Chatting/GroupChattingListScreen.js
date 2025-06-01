/*
import React, { useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import { useGroupChattingList } from "../../hooks/useChatting";
import { useFocusEffect } from "@react-navigation/native";

const GroupChattingListScreen = ({ navigation }) => {
  const { data: chatRooms = [], refetch } = useGroupChattingList();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Chatting", {
          chatRoomId: item.chatRoomId,
          chatRoomType: "MANY",
          chatName: item.chatName,
        })
      }
      style={styles.chatItem}
    >
      <Text style={styles.chatName}>
        {item.chatName} ({item.currentCount}/{item.chatLimitCount})
      </Text>
      <Text numberOfLines={1} style={styles.lastMessage}>
        {item.lastMessage || "메시지 없음"}
      </Text>
      <Text style={styles.meta}>
        {item.lastMessageTime}
        {item.unReadCount > 0 && `  ·  안읽음 ${item.unReadCount}개`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

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
    fontFamily: "cute"
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
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: "#999",
  },
});

*/

//임의 데이터 추가


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

// 임의의 단체 채팅방 데이터
const sampleGroupChats = [
  {
    id: 1,
    name: "강아지 산책 메이트 🐾",
    lastMessage: "내일 산책 어때요?",
    timeAgo: "2시간 전",
    unreadCount: 3,
    avatar: "https://placekitten.com/60/60",
    current: 5,
    limit: 10,
  },
  {
    id: 2,
    name: "댕댕이 정보방",
    lastMessage: "이 사료 어떤가요?",
    timeAgo: "어제",
    unreadCount: 0,
    avatar: "https://placekitten.com/61/61",
    current: 10,
    limit: 10,
  },
];

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

