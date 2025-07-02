import React, { useEffect, useContext, useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { UserContext } from "../../context/User";
import {
  sendChat,
  subscribeChat,
  unsubscribeChat,
  connectStomp, 
} from "../../api/stompClient";
import { useFetchMessages } from "../../hooks/useChatting";

const ChattingScreen = ({ route }) => {
  const { chatRoomId, chatName, chatRoomType } = route.params;
  const { loggedId, name } = useContext(UserContext);
  const flatListRef = useRef(null);

  const [input, setInput] = useState("");
  const [enter, setEnter] = useState(false);

  
  //채팅 내역 불러오기
  const {
    data: messagesData = [],
    refetch: refetchMessages,
  } = useFetchMessages({ chatRoomId, chatRoomType });

  // 채팅방 입장 시 메시지 불러오기
  useEffect(() => {
    refetchMessages();
  }, [chatRoomId]);

  // 입장 처리 및 실시간 메시지 구독
  useEffect(() => {
    if (!enter) {
      const enterMessage = {
        messageType: "ENTER",
        chatRoomType,
        chatRoomId,
        senderId: loggedId,
        senderName: name,
        message: "",
      };
      sendChat(enterMessage);
      setEnter(true);
    }

    subscribeChat(chatRoomId, (message) => {
      refetchMessages();    //수신된 메시지가 생기면 다시 메시지 조회
    });

    //컴포넌트 언마운트 시 구독 해제
    return () => {
      const leaveMessage = {
        messageType: "LEAVE",
        chatRoomType,
        chatRoomId,
        senderId: loggedId,
        senderName: name,
        message: "",
      };
      sendChat(leaveMessage);
      unsubscribeChat(chatRoomId);
    };
  }, [chatRoomId]);

  // 메시지 도착 시 자동 스크롤
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messagesData]);

  // 메시지 전송
  const handleSend = () => {
    if (!input.trim()) return;

    const talkMessage = {
      messageType: "TALK",
      chatRoomType,
      chatRoomId,
      senderId: loggedId,
      senderName: name,
      message: input,
    };

    try {
      sendChat(talkMessage);
      setInput("");
    } catch (err) {
      console.log("메시지 전송 실패", err);
    }
  };

  // 메시지 렌더링
  const renderMessage = ({ item }) => {
    const type = item.messageType || "TALK";

    if (type === "ENTER" && item.senderId === loggedId) {
      return <Text style={styles.systemMessage}>입장하였습니다.</Text>;
    }

    if (chatRoomType === "MANY") {
      if (type === "ENTER") {
        return (
          <Text style={styles.systemMessage}>
            {item.senderName} 님이 입장했습니다.
          </Text>
        );
      }
      if (type === "LEAVE") {
        return (
          <Text style={styles.systemMessage}>
            {item.senderName} 님이 퇴장했습니다.
          </Text>
        );
      }
    }

    return (
      <View style={styles.messageItem}>
        <Image source={{ uri: item.senderImageUrl }} style={styles.profileImage} />
        <Text style={styles.sender}>{item.senderName}</Text>
        <Text>{item.message}</Text>
        <Text style={styles.time}>
          {item.messageTime || item.createdAt || ""}
        </Text>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {chatRoomType === "ONE" ? name : chatName}
      </Text>

      <FlatList
        ref={flatListRef}
        data={messagesData}
        keyExtractor={(_, idx) => String(idx)}
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  list: { flex: 1 },
  messageItem: {
    marginBottom: 10,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ccc",
  },
  sender: {
    fontWeight: "bold",
  },
  time: {
    fontSize: 10,
    color: "gray",
  },
  systemMessage: {
    textAlign: "center",
    fontSize: 12,
    color: "gray",
    marginVertical: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginRight: 8,
  },
  sendBtn: {
    fontWeight: "bold",
    color: "#007aff",
  },
});

export default ChattingScreen;
