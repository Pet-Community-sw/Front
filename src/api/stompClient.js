import { Client } from "@stomp/stompjs";
import { BASE_URL } from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
//웹소켓 연결, 구독, 전송 관리

//const SOCKET_URL = BASE_URL.replace("http", "ws") + `/ws-stomp?token=${token}`;

//메시지 구독, 전송, 연결 끊기 등 모든 행동의 중심 객체
let stompClient = null;
let isConnecting = false;

//웹소켓 서버 연결
export const connectStomp = async (onConnect) => {
   if (stompClient?.connected || isConnecting) {
    console.log("이미 STOMP 연결됨. 재연결하지 않음.");
    return stompClient;
  }
  const token = await AsyncStorage.getItem("accessToken");
  console.log("🔑 WebSocket 토큰 확인:", token);

  isConnecting = true;

  stompClient = new Client({
    webSocketFactory: () => 
  new WebSocket(`ws://210.123.255.117:8080/ws-stomp?token=${token}`),

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    onConnect: () => {    //연결 성공 후 실행할 코드
      console.log("STOMP 연결됨!");
      onConnect?.();
    },
    onStompError: (frame) => {
      console.error("❌ STOMP 프로토콜 에러:", frame.headers["message"]);
      console.error("📩 상세 메시지:", frame.body);
    },

    onWebSocketError: (error) => {
      //console.error("❌ 웹소켓 레벨 에러 발생:", error);
    },
  });

  console.log("🧪 connectHeaders:", {
  Authorization: `Bearer ${token}`
});

  stompClient.activate();   //연결 시작, new WebSocket(url)
  
  return stompClient;
};

const subscriptions = {};

//채팅방 구독 (사용자가 채팅방에 입장 시, 서버로부터 오는 메시지 실시간으로 받음)
export const subscribeChat = (chatRoomId, onMessage) => {
  if (!stompClient) return;

  const subscription = stompClient.subscribe(`/sub/chat/${chatRoomId}`, (msg) => {
    const payload = JSON.parse(msg.body);
    onMessage(payload);
  });
  subscriptions[chatRoomId] = subscription;
}

//채팅방 구독 해제
export const unsubscribeChat = (chatRoomId) => {
  const subscription = subscriptions[chatRoomId];
  if (subscription) {
    subscription.unsubscribe();
    delete subscriptions[chatRoomId];
  }
};

//메시지 전송, message: 서버에 보내는 객체
export const sendChat = (message) => {
  if (!stompClient) return;

  stompClient.publish({   //메시지 서버로 보냄
    destination: "/pub/chat/message",
    body: JSON.stringify(message),    //전송할 실제 데이터
  });
};

//연결 해제
export const disconnectStomp = async () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log("웹소켓 연결 해제")
  };
};