import React, { useEffect, useContext, useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { UserContext } from "../../context/User";
import {
  connectStomp,
  subscribeChatRoom,
  sendChatMessage,
  isStompConnected,
  disconnectStomp,
} from "../../api/chatiing/stompClient";
import { useFetchMessages } from "../../hooks/useChatting";

const ChattingScreen = ({ route }) => {
  const { chatRoomId, chatName, chatRoomType } = route.params;
  const { loggedId, name } = useContext(UserContext);
  const flatListRef = useRef(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  // 기존 메시지 불러오기
  const { data: messagesData = [], refetch: refetchMessages } =
    useFetchMessages({ chatRoomId, chatRoomType });

  // ✅ 채팅 초기화
  useEffect(() => {
    const initChat = async () => {
      await connectStomp();

      subscribeChatRoom(chatRoomId, (message) => {
        console.log("📥 수신된 메시지:", message);
        setMessages((prev) => [...prev, message]);
      });

      // 입장 메시지 전송
      sendChatMessage({
        messageType: "ENTER",
        chatRoomId,
        message: "",
        seq: "",
      });

      // 기존 대화 불러오기
      const res = await refetchMessages();
      if (res.data && Array.isArray(res.data)) {
        setMessages(res.data);
      }
    };

    initChat();

    // 퇴장 시
    return () => {
      if (messages.length > 0) {
        const lastSeq = messages[messages.length - 1]?.seq || "";
        sendChatMessage({
          messageType: "READ",
          chatRoomId,
          message: "",
          seq: lastSeq,
        });
      }

      sendChatMessage({
        messageType: "LEAVE",
        chatRoomId,
        message: "",
        seq: "",
      });

      disconnectStomp();
    };
  }, [chatRoomId]);

  // 메시지 전송
  const handleSend = () => {
    if (!input.trim()) return;

    const talkMessage = {
      messageType: "TALK",
      chatRoomId,
      message: input,
      seq: 0,
    };

    if (isStompConnected()) {
      sendChatMessage(talkMessage);
      setInput("");
    }
  };

  // 메시지 렌더링
  const renderMessage = ({ item }) => {
    const type = item.messageType;
    const body = item.body || item;

    if (type === "ENTER")
      return <Text style={styles.systemMessage}>{body.message || "입장했습니다."}</Text>;
    if (type === "LEAVE")
      return <Text style={styles.systemMessage}>{body.message || "퇴장했습니다."}</Text>;

    const isMine = body.senderId === loggedId;

    return (
      <View
        style={[
          styles.messageItem,
          isMine ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMine && body.senderImageUrl && (
          <Image source={{ uri: body.senderImageUrl }} style={styles.profileImage} />
        )}
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.myBubble : styles.otherBubble,
          ]}
        >
          {!isMine && <Text style={styles.sender}>{body.senderName}</Text>}
          <Text style={styles.text}>{body.message}</Text>
          <Text style={styles.time}>
            {new Date(body.messageTime || Date.now()).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{chatName}</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderMessage}
        style={styles.list}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="메시지를 입력하세요"
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSend}>
          <Text style={styles.sendBtn}>전송</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChattingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontWeight: "bold", fontSize: 16, marginBottom: 10, textAlign: "center" },
  list: { flex: 1 },
  messageItem: { marginBottom: 10, flexDirection: "row", alignItems: "flex-end" },
  myMessage: { justifyContent: "flex-end" },
  otherMessage: { justifyContent: "flex-start" },
  messageBubble: { maxWidth: "70%", padding: 10, borderRadius: 15, marginHorizontal: 5 },
  myBubble: { backgroundColor: "#007aff", marginLeft: "auto" },
  otherBubble: { backgroundColor: "#f0f0f0", marginRight: "auto" },
  profileImage: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  sender: { fontWeight: "bold", fontSize: 12, color: "#666", marginBottom: 2 },
  text: { fontSize: 16 },
  time: { fontSize: 10, color: "gray", marginTop: 4, textAlign: "right" },
  systemMessage: { textAlign: "center", fontSize: 12, color: "gray", marginVertical: 4 },
  inputRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderColor: "#ccc", paddingTop: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 8, marginRight: 8 },
  sendBtn: { fontWeight: "bold", color: "#007aff" },
});
