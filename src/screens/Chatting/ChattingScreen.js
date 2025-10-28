import React, { useEffect, useContext, useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { UserContext } from "../../context/User";
import { useFetchMessages, useGroupChattingList } from "../../hooks/useChatting";
import { subscribeChatRoom } from "../../api/chatiing/stompSubscribe";
import { sendChatMessage } from "../../api/chatiing/chattingApi";
import { isStompConnected, logStompStatus } from "../../api/chatiing/stompClient";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../../api/apiClient";

const ChattingScreen = ({ route }) => {
  const { chatRoomId, chatName, chatRoomType } = route.params;
  const { userId, name } = useContext(UserContext);
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  
  console.log("👤 현재 사용자 정보:", { userId, name });

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  // 기존 메시지 불러오기
  const { data: messagesData = [], refetch: refetchMessages } =
    useFetchMessages({ chatRoomId, chatRoomType });

  // 채팅방 목록 새로고침용 (unReadCount 업데이트)
  const { refetch: refetchChatList } = useGroupChattingList();

    console.log("💬 채팅방 ID:", chatRoomId, "채팅방 이름:", chatName);


  const subscriptionRef = useRef(null);

  // ✅ 채팅 초기화
  useEffect(() => {
    console.log("🚀 채팅 초기화 시작, chatRoomId:", chatRoomId);
    console.log("🔌 STOMP 연결 상태:", isStompConnected());
    logStompStatus();
    
    // ✅ 채팅방 구독
    subscriptionRef.current = subscribeChatRoom(chatRoomId, (message) => {
      console.log("📥 새 메시지 수신:", message);
      console.log("📥 메시지 타입:", message.messageType);
      console.log("📥 메시지 body:", message.body);
      console.log("📥 전체 메시지 구조:", JSON.stringify(message, null, 2));
      
             // STOMP 메시지 구조에 맞게 처리 (서버 명세에 따라)
             if (message.messageType === "TALK" && message.body) {
               const messageData = message.body;
               console.log("📥 TALK 메시지 처리:", messageData);
               
               // 채팅방 목록 새로고침 (unReadCount 업데이트)
               refetchChatList().then((result) => {
                 console.log("✅ TALK 메시지로 인한 채팅방 목록 새로고침 완료:", result.data);
               }).catch((error) => {
                 console.error("❌ TALK 메시지로 인한 채팅방 목록 새로고침 실패:", error);
               });
               
               // 로컬 메시지와 중복되는지 확인 (같은 메시지 내용과 시간으로 판단)
               setMessages((prev) => {
                 const isDuplicate = prev.some(msg => 
                   msg.isLocal && 
                   msg.message === messageData.message &&
                   Math.abs(new Date(msg.messageTime) - new Date(messageData.messageTime)) < 5000 // 5초 이내
                 );
                 
                 if (isDuplicate) {
                   console.log("📥 중복 메시지 무시 (로컬 메시지와 동일):", messageData);
                   return prev;
                 }
                 
                 console.log("📥 새 메시지 추가:", messageData);
                 const newMessages = [...prev, messageData];
                 
                 // ✅ 새 메시지 추가 후 맨 아래로 스크롤
                 setTimeout(() => {
                   if (flatListRef.current) {
                     flatListRef.current.scrollToEnd({ animated: true });
                   }
                 }, 50);
                 
                 return newMessages;
               });
      } else if (message.messageType === "ENTER" && message.body) {
        // ENTER 메시지 처리
        console.log("📥 ENTER 메시지 처리:", message.body);
        const enterMessage = {
          messageType: "ENTER",
          body: message.body
        };
        setMessages((prev) => [...prev, enterMessage]);
      } else if (message.messageType === "LEAVE" && message.body) {
        // LEAVE 메시지 처리
        console.log("📥 LEAVE 메시지 처리:", message.body);
        const leaveMessage = {
          messageType: "LEAVE",
          body: message.body
        };
        setMessages((prev) => [...prev, leaveMessage]);
      } else if (message.messageType === "CHAT_UPDATE" && message.body) {
        // CHAT_UPDATE는 읽음 처리용 (화면에 표시하지 않음)
        console.log("📥 CHAT_UPDATE 메시지 무시 (읽음 처리용):", message.body);
        return;
      } else {
        // 기타 메시지
        console.log("📥 기타 메시지:", message);
        setMessages((prev) => [...prev, message]);
      }
    });

    console.log("📡 STOMP 구독 완료, subscriptionRef:", !!subscriptionRef.current);
    
    // 구독이 제대로 되었는지 확인
    if (subscriptionRef.current) {
      console.log("✅ 구독 성공! subscriptionId:", subscriptionRef.current.id);
      console.log("📡 구독 대상 채팅방 ID:", chatRoomId);
      console.log("📡 구독 URL:", `/sub/chat/${chatRoomId}`);
    } else {
      console.error("❌ 구독 실패! STOMP 연결 상태를 확인하세요.");
      Alert.alert("연결 오류", "채팅방에 연결할 수 없습니다. 다시 시도해주세요.");
    }

    // ✅ 입장 메시지 전송  
    sendChatMessage({
      messageType: "ENTER",
      chatRoomId,
      message: "",
      seq: "",
    });

    // ✅ 기존 대화 불러오기
    refetchMessages().then((res) => {
      console.log("📨 채팅 메시지 응답:", res.data);
      if (res.data?.messages && Array.isArray(res.data.messages)) {
        console.log("📨 메시지 배열 설정:", res.data.messages);
        setMessages(res.data.messages);
      } else if (res.data && Array.isArray(res.data)) {
        console.log("📨 기존 방식으로 메시지 설정:", res.data);
        setMessages(res.data);
      }
      
      // ✅ 메시지 로드 후 맨 아래로 스크롤
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    });

    return () => {
      // ✅ 구독만 해제 (연결은 유지)
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [chatRoomId]);

  // 메시지 전송
  const handleSend = () => {
    if (!input.trim()) return;

    const messageText = input.trim();
    setInput(""); // 먼저 입력창 비우기

    // 고유한 임시 ID 생성 (중복 방지용)
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    const talkMessage = {
      messageType: "TALK",
      chatRoomId,
      message: messageText,
      seq: "",
    };

    // 로컬에서 즉시 표시할 메시지 객체 생성
    const localMessage = {
      messageType: "TALK",
      id: tempId, // 임시 ID로 중복 방지
      senderId: userId,
      senderName: name || "나",
      senderImageUrl: null, // 내 프로필 이미지는 필요시 추가
      message: messageText,
      messageTime: new Date().toISOString(),
      seq: "",
      isLocal: true // 로컬 메시지 표시
    };

          // 로컬에서 즉시 메시지 추가
          setMessages((prev) => {
            const newMessages = [...prev, localMessage];
            
            // ✅ 메시지 전송 후 맨 아래로 스크롤
            setTimeout(() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: true });
              }
            }, 50);
            
            return newMessages;
          });

    if (isStompConnected()) {
      sendChatMessage(talkMessage);
    }
  };

  // 채팅방 나가기
  const handleLeave = () => {
    Alert.alert(
      "채팅방 나가기",
      "정말 채팅방을 나가시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "나가기",
          style: "destructive",
          onPress: () => {
            // 읽음 처리
            if (messages.length > 0) {
              const lastSeq = messages[messages.length - 1]?.seq || "";
              sendChatMessage({
                messageType: "READ",
                chatRoomId,
                userId: userId,
                message: "",
                seq: lastSeq,
              });
            }

            // 퇴장 메시지 전송
            sendChatMessage({
              messageType: "LEAVE",
              chatRoomId,
              userId: userId,
              message: "",
              seq: "",
            });

            // 구독 해제
            if (subscriptionRef.current) {
              subscriptionRef.current.unsubscribe();
              subscriptionRef.current = null;
            }

            // 이전 화면으로 이동
            navigation.goBack();
          }
        }
      ]
    );
  };

  // 메시지 렌더링
  const renderMessage = ({ item }) => {
    const type = item.messageType;
    const body = item.body || item;
    const bodyType = body.messageType || type;

    console.log("🎨 메시지 렌더링:", {
      type: type,
      bodyType: bodyType,
      hasBody: !!item.body,
      item: item
    });

    if (type === "ENTER")
      return (
        <Text style={styles.systemMessage}>
          {body.message || "입장했습니다"}
        </Text>
      );
    if (type === "LEAVE")
      return (
        <Text style={styles.systemMessage}>
          {body.message || "퇴장했습니다"}
        </Text>
      );
    if (type === "CHAT_UPDATE")
      return null; // CHAT_UPDATE는 화면에 표시하지 않음

    const isMine = body.senderId === userId;
    
    console.log("🔍 메시지 비교:", {
      messageId: body.senderId,
      userId: userId,
      isMine: isMine,
      message: body.message?.substring(0, 20),
      senderImageUrl: body.senderImageUrl,
      senderName: body.senderName
    });

    return (
      <View
        style={[
          styles.messageItem,
          isMine ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMine && body.senderImageUrl && (
          <Image
            source={{ 
              uri: body.senderImageUrl.startsWith("http")
                ? body.senderImageUrl
                : `${BASE_URL}${body.senderImageUrl}`
            }}
            style={styles.profileImage}
            onError={(error) => {
              console.log("이미지 로딩 실패:", body.senderImageUrl, error);
            }}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.myBubble : styles.otherBubble,
          ]}
        >
          {!isMine && <Text style={styles.sender}>{body.senderName}</Text>}
          <Text style={[styles.text, isMine && styles.myText]}>{body.message}</Text>
          <Text style={[styles.time, isMine && styles.myTime]}>
            {new Date(body.messageTime || Date.now()).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{chatName}</Text>
        <TouchableOpacity onPress={handleLeave} style={styles.leaveButton}>
          <Text style={styles.leaveButtonText}>나가기</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages.sort((a, b) => {
          const timeA = new Date(a.messageTime || a.body?.messageTime || 0);
          const timeB = new Date(b.messageTime || b.body?.messageTime || 0);
          return timeA - timeB; // 오래된 순서대로 정렬
        })}
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
  container: { 
    flex: 1, 
    backgroundColor: "#f7f7f7" 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 5,
    paddingTop: 20, // 상태바 고려
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontFamily: "cute",
    fontSize: 20,
    textAlign: "center",
    color: "#333",
    marginLeft: 60,
    flex: 1,
  },
  leaveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#ff6b7a",
    shadowColor: "#ff4757",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  leaveButtonText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  list: { 
    flex: 1, 
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  messageItem: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  myMessage: { 
    justifyContent: "flex-end",
    marginLeft: 60,
  },
  otherMessage: { 
    justifyContent: "flex-start",
    marginRight: 60,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  myBubble: { 
    backgroundColor: "#007aff",
    borderBottomRightRadius: 4,
  },
  otherBubble: { 
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: "#e8e8e8",
  },
  profileImage: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    marginRight: 8,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0"
  },
  sender: { 
    fontWeight: "600", 
    fontSize: 13, 
    color: "#666", 
    marginBottom: 4,
    marginLeft: 4,
  },
  text: { 
    fontSize: 16, 
    lineHeight: 20,
    color: "#333",
  },
  myText: {
    color: "#fff",
  },
  time: { 
    fontSize: 11, 
    color: "#999", 
    marginTop: 4, 
    textAlign: "right",
  },
  myTime: {
    color: "rgba(255,255,255,0.8)",
  },
  systemMessage: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    alignSelf: "center",
    maxWidth: "70%",
    fontStyle: "italic",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
    maxHeight: 100,
  },
  sendBtn: { 
    fontWeight: "600", 
    color: "#007aff",
    fontSize: 16,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
});

