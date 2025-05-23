import React from "react";
import { View, TouchableOpacity, Text, FlatList, StyleSheet } from "react-native";

// 더미 채팅방 데이터
const dummyChatRooms = Array.from({ length: 5 }, (_, idx) => ({
  chatRoomId: idx + 1,
  chatName: `산책 그룹 ${idx + 1}`,
  crrentCount: Math.floor(Math.random() * 5) + 1,
  chatLimitCount: 5,
  lastMessage: `마지막 메시지 예시 ${idx + 1}`,
  lastMessageTime: `${idx + 1}시간 전`,
  unReadCount: idx % 2 === 0 ? 0 : Math.floor(Math.random() * 5) + 1,
}));

const MockGroupChattingListScreen = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={dummyChatRooms}
        keyExtractor={(item) => item.chatRoomId.toString()}
        contentContainerStyle={{ paddingBottom: 32 }}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatCard}>
            <Text style={styles.chatName}>
              {item.chatName} ({item.crrentCount}/{item.chatLimitCount})
            </Text>
            <Text numberOfLines={1} style={styles.lastMessage}>
              {item.lastMessage || "메시지 없음"}
            </Text>
            <Text style={styles.timeText}>
              {item.lastMessageTime}
              {item.unReadCount > 0 && `  ·  안읽음 ${item.unReadCount}개`}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>개인 채팅방 보기</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MockGroupChattingListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  chatCard: {
    flexDirection: "column",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  lastMessage: {
    color: "#666",
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    color: "#aaa",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  button: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#0066cc",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
