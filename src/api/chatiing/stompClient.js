import { Client } from "@stomp/stompjs";
import AsyncStorage from "@react-native-async-storage/async-storage";

let client = null;

/** ✅ STOMP 연결 */
export const connectStomp = async () => {
  const token = await AsyncStorage.getItem("accessToken");
  if (!token) {
    console.warn("⚠️ connectStomp 호출 시 토큰이 없습니다.");
    return;
  }

  // 이미 연결된 상태면 재연결 방지
  if (client && client.connected) {
    console.log("⚡ 이미 STOMP 연결 중입니다.");
    return client;
  }

  console.log("🚀 STOMP 연결 시도...");

  client = new Client({
    brokerURL: "ws://10.0.2.2:8080/ws-stomp",
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    forceBinaryWSFrames: true, // RN에서 필수
    appendMissingNULLonIncoming: true,

    debug: (msg) => console.log("📡 STOMP Debug:", msg),

    onConnect: () => console.log("✅ STOMP CONNECT 성공"),
    onDisconnect: (frame) => console.log("🔌 STOMP DISCONNECT 이벤트:", frame),
    onWebSocketClose: (evt) => console.log("⚠️ WebSocket 닫힘:", evt.code, evt.reason),
    onWebSocketError: (error) => console.error("❌ WebSocket 오류:", error.message),
  });

  client.activate();
  return client;
};

/** ✅ STOMP 연결 해제 */
export const disconnectStomp = async () => {
  if (client && client.connected) {
    console.log("🛑 STOMP 연결 해제 시도...");
    await client.deactivate();
    console.log("🔌 STOMP 연결 종료 완료");
  } else {
    console.log("⚠️ STOMP 클라이언트가 이미 비활성 상태입니다.");
  }
  client = null;
};

/** ✅ 연결 상태 확인 */
export const isStompConnected = () => !!client && client.connected;

/** ✅ 채팅방 구독 */
export const subscribeChatRoom = (chatRoomId, onMessage) => {
  if (!client || !client.connected) {
    console.warn("⚠️ STOMP 클라이언트가 연결되지 않았습니다.");
    return;
  }

  const destination = `/sub/chat/${chatRoomId}`;
  console.log(`📩 채팅방 구독: ${destination}`);

  client.subscribe(destination, (message) => {
    const body = JSON.parse(message.body);
    console.log("💬 새 메시지 수신:", body);

    switch (body.messageType) {
      case "ENTER":
      case "TALK":
      case "LEAVE":
        onMessage(body);
        break;

      case "CHAT_UPDATE":
        console.log("📊 안읽은 수 갱신:", body.body);
        break;

      default:
        console.warn("⚠️ 알 수 없는 messageType:", body.messageType);
    }
  });
};

/** ✅ 채팅방 목록 구독 */
export const subscribeChatList = (userId, onMessage) => {
  if (!client || !client.connected) {
    console.warn("⚠️ STOMP 클라이언트가 연결되지 않았습니다.");
    return;
  }

  const destination = `/sub/list/${userId}`;
  console.log(`📩 채팅 목록 구독: ${destination}`);

  client.subscribe(destination, (message) => {
    const body = JSON.parse(message.body);
    console.log("📬 목록 업데이트:", body);

    if (body.messageType === "LIST_UPDATE") {
      onMessage(body.body);
    }
  });
};

/** ✅ 메시지 발행 */
export const sendChatMessage = (messageData) => {
  if (!client || !client.connected) {
    console.warn("⚠️ STOMP 클라이언트가 연결되지 않았습니다.");
    return;
  }

  console.log("📤 메시지 전송:", messageData);

  client.publish({
    destination: "/pub/chat",
    body: JSON.stringify(messageData),
  });
};
