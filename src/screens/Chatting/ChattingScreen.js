import React, {useEffect, useState, useContext} from "react";
import { UserContext } from "../../context/User";
import { StyleSheet, TextInput, Text, View, TouchableOpacity } from "react-native";
import { connectStomp, subscribeChat, unsubscribeChat, sendChat, disconnectStomp } from "../../api/stompClient";
import { FlatList, } from "react-native-gesture-handler";
import apiClient from "../../api/apiClient";

//채팅 상세 스크린
const ChattingScreen = ({route}) => {
  const {chatRoomId, chatName, chatRoomType} = route.params;
  const {loggedId, name} = useContext(UserContext);

  const [messages, setMessages] = useState([]);   //채팅 기록
  const [input, setInput] = useState("");   //입력창 상태
  const [enter, setEnter] = useState(false);  //채팅방 들낙

  //채팅 내역 불러오기
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await apiClient.get(`/chat-rooms/${chatRoomId}`)
      }
      catch (err) {
        console.log("채팅 내역 불러오기 실패", err);
      }
    };

    fetchMessages();
  }, [chatRoomId]);

  //메시지 전송
  const handleSend = () => {
    if (!input.trim()) return;
    const talkMessage = {
      id, 
      messageType: "TALK", 
      chatRoomType, 
      chatRoomId,
      senderId: loggedId, 
      senderName: name,
      message: input,   
    };

    sendChat(talkMessage);
    setInput("");
  }

  //채팅방 구독, 입장 메시지
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
      setMessages((prev) => [...prev, message]);
    });

    return() => {
      const leaveMessage = {
        messageType: "LEAVE", 
        chatRoomType, 
        chatRoomId,
        senderId: loggedId, 
        senderName: name,
        message: "",
      };

      sendChat(leaveMessage);
      unsubscribeChat(chatRoomId);   //해당 채팅방 나가면 구독만 해제
    };
  }, [chatRoomId]);

  //메시지 렌더링
  const renderMessage = ({ item }) => {
    if (chatRoomType === "MANY" && item.messageType === "ENTER") {
      return (
        <Text style={styles.systemMessage}>
          {item.senderName} 님이 입장했습니다.
        </Text>
      );
    }

    if (chatRoomType === "MANY" && item.messageType === "LEAVE") {
      return (
        <Text style={styles.systemMessage}>
          {item.senderName} 님이 퇴장했습니다.
        </Text>
      );
    }

    return (
      <View style={styles.messageItem}>
        <Text style={styles.sender}>{item.senderName}</Text>
        <Text>{item.message}</Text>
        <Text style={styles.time}>{item.messageTime}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{chatRoomType === "ONE" ? name : chatName}</Text>

      <FlatList
        data={messages}
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