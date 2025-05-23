import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
} from "react-native";

const loggedInUser = "홍길동";

const dummyMessages = [
  {
    messageType: "TALK",
    senderName: "홍길동",
    senderImageUrl: "https://placekitten.com/40/40",
    message: "테스트 메시지 #1",
    messageTime: "2025-05-23 14:25",
  },
  {
    messageType: "TALK",
    senderName: "김영희",
    senderImageUrl: "https://placekitten.com/40/41",
    message: "테스트 메시지 #2",
    messageTime: "2025-05-23 14:22",
  },
  {
    messageType: "TALK",
    senderName: "홍길동",
    senderImageUrl: "https://placekitten.com/40/42",
    message: "테스트 메시지 #3",
    messageTime: "2025-05-23 14:19",
  },
  {
    messageType: "TALK",
    senderName: "김영희",
    senderImageUrl: "https://placekitten.com/40/43",
    message: "테스트 메시지 #4",
    messageTime: "2025-05-23 14:16",
  },
  {
    messageType: "TALK",
    senderName: "홍길동",
    senderImageUrl: "https://placekitten.com/40/44",
    message: "테스트 메시지 #5",
    messageTime: "2025-05-23 14:13",
  },
  {
    messageType: "TALK",
    senderName: "김영희",
    senderImageUrl: "https://placekitten.com/40/45",
    message: "테스트 메시지 #6",
    messageTime: "2025-05-23 14:10",
  },
  {
    messageType: "TALK",
    senderName: "홍길동",
    senderImageUrl: "https://placekitten.com/40/46",
    message: "테스트 메시지 #7",
    messageTime: "2025-05-23 14:07",
  },
  {
    messageType: "TALK",
    senderName: "김영희",
    senderImageUrl: "https://placekitten.com/40/47",
    message: "테스트 메시지 #8",
    messageTime: "2025-05-23 14:04",
  },
  {
    messageType: "TALK",
    senderName: "홍길동",
    senderImageUrl: "https://placekitten.com/40/48",
    message: "테스트 메시지 #9",
    messageTime: "2025-05-23 14:01",
  },
  {
    messageType: "TALK",
    senderName: "김영희",
    senderImageUrl: "https://placekitten.com/40/49",
    message: "테스트 메시지 #10",
    messageTime: "2025-05-23 13:58",
  },
];

const Mock = () => {
  const renderMessage = ({ item }) => {
    const isMine = item.senderName === loggedInUser;

    return (
      <View
        style={[
          styles.messageItem,
          isMine ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMine && (
          <Image
            source={{ uri: item.senderImageUrl }}
            style={styles.profileImage}
          />
        )}
        <View style={{ flex: 1 }}>
          {!isMine && <Text style={styles.sender}>{item.senderName}</Text>}
          <Text style={styles.messageBubble}>{item.message}</Text>
          <Text style={styles.time}>{item.messageTime}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 채팅 미리보기</Text>
      <FlatList
        data={dummyMessages}
        keyExtractor={(_, idx) => String(idx)}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
};

export default Mock;

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
  messageItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 8,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ccc",
  },
  sender: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  messageBubble: {
    padding: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 2,
  },
  time: {
    fontSize: 10,
    color: "gray",
    marginTop: 4,
  },
});
