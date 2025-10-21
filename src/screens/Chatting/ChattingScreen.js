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
  sendChat,
  subscribeChat,
  unsubscribeChat,
  connectStomp,
  isStompConnected,
  logStompStatus,
  testWebSocketConnection,
  enableHttpPollingMode,
  disableHttpPollingMode,
  isHttpPollingMode,
  addPollingCallback,
  removePollingCallback,
} from "../../api/stompClient";
import { useFetchMessages } from "../../hooks/useChatting";

const ChattingScreen = ({ route }) => {
  const { chatRoomId, chatName, chatRoomType } = route.params;
  const { loggedId, name } = useContext(UserContext);
  const flatListRef = useRef(null);

  const [input, setInput] = useState("");
  const [enter, setEnter] = useState(false);
  const [messages, setMessages] = useState([]);

  //채팅 내역 불러오기
  const { data: messagesData = [], refetch: refetchMessages } =
    useFetchMessages({ chatRoomId, chatRoomType });

  // ✅ 방 들어갈 때 서버에서 기존 내역 한번 불러오기
  useEffect(() => {
    refetchMessages().then((res) => {
      console.log("서버에서 받은 메시지 데이터:", res.data);
      
      // 서버 응답 구조 확인 및 처리
      if (res.data && Array.isArray(res.data)) {
        // res.data가 직접 배열인 경우
        setMessages(res.data);
        console.log("메시지 배열 직접 설정:", res.data.length, "개");
      } else if (res.data && res.data.messages && Array.isArray(res.data.messages)) {
        // res.data.messages가 배열인 경우
        setMessages(res.data.messages);
        console.log("메시지 배열 설정:", res.data.messages.length, "개");
      } else {
        console.warn("서버에서 받은 메시지 데이터 구조가 예상과 다름:", res.data);
        setMessages([]);
      }
    });
  }, [chatRoomId]);

  // 입장 처리 및 WebSocket 연결 테스트
  useEffect(() => {
    const initializeChat = async () => {
      console.log("🔄 채팅 초기화 시작");
      
      // 1단계: WebSocket 연결 테스트
      console.log("🧪 1단계: WebSocket 연결 테스트 시작");
      await testWebSocketConnection();
      
      // 2단계: WebSocket 연결 성공 시 STOMP 연결 시도
      console.log("🧪 2단계: STOMP 연결 시도");
      try {
        await connectStomp(() => {
          console.log("✅ STOMP 연결 성공!");
          
          // 입장 메시지 전송
          if (!enter) {
            const enterMessage = {
              messageType: "ENTER",
              chatRoomId: chatRoomId,
              message: "",
              seq: ""
            };
            
            console.log("📤 입장 메시지 전송:", enterMessage);
            const sendResult = sendChat(enterMessage);
            if (sendResult) {
              setEnter(true);
              console.log("✅ 입장 메시지 전송 성공");
            } else {
              console.warn("⚠️ 입장 메시지 전송 실패");
            }
          }

          // 채팅 구독
          subscribeChat(chatRoomId, (message) => {
            console.log("📥 새 메시지 수신:", message);
            setMessages((prev) => {
              if (Array.isArray(prev)) {
                return [...prev, message];
              } else {
                console.warn("⚠️ messages 상태가 배열이 아님, 새 배열로 초기화:", prev);
                return [message];
              }
            });
          });
        });
      } catch (error) {
        console.error("❌ STOMP 연결 실패 - HTTP 폴링 모드로 전환");
        console.error("에러:", error);
        
        // STOMP 연결 실패 시 HTTP 폴링 모드 사용
        enableHttpPollingMode();
        setEnter(true);
      }
    };

    initializeChat();

    //컴포넌트 언마운트 시 정리
    return () => {
      console.log("🚪 채팅방 퇴장 처리");
      
      // HTTP 폴링 모드에서는 퇴장 메시지를 HTTP API로 전송
      console.log("📤 퇴장 처리 (HTTP 폴링 모드)");
      
      // 폴링 모드 비활성화
      disableHttpPollingMode();
    };
  }, [chatRoomId]);

  // 메시지 도착 시 자동 스크롤
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // HTTP 폴링 모드에서 새 메시지 확인
  useEffect(() => {
    const checkNewMessages = async () => {
      if (isHttpPollingMode()) {
        try {
          const newMessages = await refetchMessages();
          // HTTP 폴링에서 받은 데이터 구조 확인
          let messageArray = [];
          if (newMessages?.data && Array.isArray(newMessages.data)) {
            messageArray = newMessages.data;
          } else if (newMessages?.data && newMessages.data.messages && Array.isArray(newMessages.data.messages)) {
            messageArray = newMessages.data.messages;
          }
          
          if (messageArray.length > messages.length) {
            console.log("📥 HTTP 폴링: 새 메시지 발견!", messageArray.length, "개");
            setMessages(messageArray);
          }
        } catch (error) {
          console.error("❌ HTTP 폴링 메시지 확인 실패:", error);
        }
      }
    };

    // 폴링 콜백 등록
    addPollingCallback(checkNewMessages);

    return () => {
      removePollingCallback(checkNewMessages);
    };
  }, [messages.length, refetchMessages]);

  // HTTP 폴링 모드 상태 체크
  useEffect(() => {
    const checkPollingStatus = () => {
      if (isHttpPollingMode()) {
        console.log("📡 HTTP 폴링 모드 활성화됨");
      } else {
        console.warn("⚠️ HTTP 폴링 모드 비활성화됨");
      }
    };

    const interval = setInterval(checkPollingStatus, 10000); // 10초마다 체크
    
    return () => clearInterval(interval);
  }, []);

  // 메시지 전송 (STOMP 또는 HTTP 폴링 모드)
  const handleSend = async () => {
    if (!input.trim()) return;

    const talkMessage = {
      messageType: "TALK",
      chatRoomId: chatRoomId,
      message: input,
      seq: ""
    };

    console.log("📤 메시지 전송 시도:", talkMessage);
    
    // STOMP 연결 상태 확인
    if (isStompConnected()) {
      console.log("🚀 STOMP 연결됨 - STOMP로 메시지 전송");
      try {
        const sendResult = sendChat(talkMessage);
        if (sendResult) {
          console.log("✅ STOMP 메시지 전송 성공");
          setInput("");
        } else {
          console.error("❌ STOMP 메시지 전송 실패");
        }
      } catch (error) {
        console.error("❌ STOMP 메시지 전송 에러:", error);
      }
    } else if (isHttpPollingMode()) {
      console.log("📡 HTTP 폴링 모드 - HTTP API로 메시지 전송");
      
      try {
        // HTTP API로 메시지 전송
        const response = await fetch(`http://10.0.2.2:8080/chat-rooms/${chatRoomId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await AsyncStorage.getItem("accessToken")}`
          },
          body: JSON.stringify({
            messageType: "TALK",
            message: input,
            seq: ""
          })
        });
        
        if (response.ok) {
          console.log("✅ HTTP API 메시지 전송 성공");
          setInput("");
          
          // 성공 시 로컬 상태 업데이트
          const newMessage = {
            messageType: "TALK",
            chatRoomId: chatRoomId,
            senderId: loggedId,
            senderName: name,
            message: input,
            messageTime: new Date().toISOString()
          };
          
          setMessages(prev => {
            if (Array.isArray(prev)) {
              return [...prev, newMessage];
            } else {
              console.warn("⚠️ messages 상태가 배열이 아님, 새 배열로 초기화:", prev);
              return [newMessage];
            }
          });
        } else {
          console.error("❌ HTTP API 메시지 전송 실패:", response.status);
          // 실패 시에도 로컬에 표시 (사용자 경험)
          const newMessage = {
            messageType: "TALK",
            chatRoomId: chatRoomId,
            senderId: loggedId,
            senderName: name,
            message: input,
            messageTime: new Date().toISOString()
          };
          
          setMessages(prev => {
            if (Array.isArray(prev)) {
              return [...prev, newMessage];
            } else {
              return [newMessage];
            }
          });
          setInput("");
        }
      } catch (error) {
        console.error("❌ HTTP API 메시지 전송 에러:", error);
        // 에러 시에도 로컬에 표시
        const newMessage = {
          messageType: "TALK",
          chatRoomId: chatRoomId,
          senderId: loggedId,
          senderName: name,
          message: input,
          messageTime: new Date().toISOString()
        };
        
        setMessages(prev => {
          if (Array.isArray(prev)) {
            return [...prev, newMessage];
          } else {
            return [newMessage];
          }
        });
        setInput("");
      }
    } else {
      console.error("❌ STOMP도 HTTP 폴링도 활성화되지 않음");
    }
  };

  // 메시지 렌더링
  const renderMessage = ({ item }) => {
    const type = item.messageType || "TALK";

    // 새로운 스펙에 맞춰 데이터 추출 (안전하게 처리)
    let messageData;
    if (item.body && typeof item.body === 'object' && !Array.isArray(item.body)) {
      messageData = item.body;
    } else if (item.body && Array.isArray(item.body) && item.body.length > 0) {
      messageData = item.body[0]; // 배열의 첫 번째 요소 사용
    } else {
      messageData = item;
    }
    
    const senderId = messageData?.senderId || messageData?.userId || '';
    const senderName = messageData?.senderName || '';
    const message = messageData?.message || '';
    const messageTime = messageData?.messageTime || '';

    if (type === "ENTER" && senderId === loggedId) {
      return <Text style={styles.systemMessage}>입장하였습니다.</Text>;
    }

    if (chatRoomType === "MANY") {
      if (type === "ENTER") {
        return (
          <Text style={styles.systemMessage}>
            {senderName} 님이 입장했습니다.
          </Text>
        );
      }
      if (type === "LEAVE") {
        return (
          <Text style={styles.systemMessage}>
            {senderName} 님이 퇴장했습니다.
          </Text>
        );
      }
    }

    // 내가 보낸 메시지인지 확인
    const isMyMessage = senderId === loggedId;
    
    return (
      <View style={[
        styles.messageItem, 
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        {!isMyMessage && (
          messageData?.senderImageUrl ? (
            <Image
              source={{ uri: messageData.senderImageUrl }}
              style={styles.profileImage}
              onError={(error) => {
                console.log("이미지 로드 실패:", error);
              }}
            />
          ) : (
            <View style={[styles.profileImage, { backgroundColor: '#ccc' }]} />
          )
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          {!isMyMessage && <Text style={styles.sender}>{senderName}</Text>}
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>{message}</Text>
          <Text style={[
            styles.time,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {messageTime || messageData.createdAt || ""}
          </Text>
        </View>
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
    flexDirection: "row",
    alignItems: "flex-end",
  },
  myMessage: {
    justifyContent: "flex-end",
  },
  otherMessage: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  myMessageBubble: {
    backgroundColor: "#007aff",
    marginLeft: "auto",
  },
  otherMessageBubble: {
    backgroundColor: "#f0f0f0",
    marginRight: "auto",
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ccc",
    marginRight: 8,
  },
  sender: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: "white",
  },
  otherMessageText: {
    color: "black",
  },
  time: {
    fontSize: 10,
    color: "gray",
    marginTop: 4,
  },
  myMessageTime: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
  otherMessageTime: {
    color: "gray",
    textAlign: "left",
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
