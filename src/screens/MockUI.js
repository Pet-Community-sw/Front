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

const MockUI = ({ navigation }) => {
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
          onPress={() => navigation.navigate("PersonalChattingListScreen")}
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

export default MockUI;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
