import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

// 더미 채팅 데이터
const dummyMessages = Array.from({ length: 10 }, (_, idx) => ({
  id: idx,
  senderName: idx % 2 === 0 ? "나" : "상대방",
  message: `테스트 메시지 #${idx + 1}`,
  messageTime: `${idx + 1}분 전`,
}));

const Mock = () => {
  const renderMessage = ({ item }) => {
    const isMine = item.senderName === "나";

    return (
      <View
        style={[
          styles.messageRow,
          isMine ? styles.myMessageRow : styles.otherMessageRow,
        ]}
      >
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
          <Text style={styles.messageText}>{item.message}</Text>
          <Text style={[styles.time, isMine ? styles.timeRight : styles.timeLeft]}>
            {item.messageTime}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 채팅 미리보기</Text>
      <FlatList
        data={dummyMessages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={renderMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFAF6",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  myMessageRow: {
    justifyContent: "flex-end",
  },
  otherMessageRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    padding: 12,
  },
  myBubble: {
    backgroundColor: "#007AFF",
    borderTopRightRadius: 0,
  },
  otherBubble: {
    backgroundColor: "#E5E5EA",
    borderTopLeftRadius: 0,
  },
  messageText: {
    color: "#fff",
    fontSize: 15,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
  },
  timeRight: {
    textAlign: "right",
    color: "#d9edff",
  },
  timeLeft: {
    textAlign: "left",
    color: "#555",
  },
});

export default Mock;
