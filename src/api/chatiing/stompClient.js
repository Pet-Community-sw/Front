import { Client } from "@stomp/stompjs";
import AsyncStorage from "@react-native-async-storage/async-storage";

export let client = null;

export const connectStomp = async () => {
  const token = await AsyncStorage.getItem("accessToken");
  return new Promise((resolve, reject) => {
    let finished = false;
    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        reject(new Error("STOMP connection timeout"));
      }
    }, 5000);

    if (client && client.connected) {
      console.log("⚡ 이미 STOMP 연결 중");
      clearTimeout(timeout);
      resolve(true);
      return;
    }

    client = new Client({
      brokerURL: "ws://10.0.2.2:8080/ws-stomp",
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      debug: (msg) => msg.includes("CONNECT") && console.log("🐛", msg),

      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,

      onConnect: () => {
        if (!finished) {
          finished = true;
          clearTimeout(timeout);
          console.log("✅ STOMP 연결 성공");
          resolve();
        }
      },
      onStompError: (frame) => {
        if (!finished) {
          finished = true;
          clearTimeout(timeout);
          console.error("❌ STOMP 오류:", frame);
          reject(frame);
        }
      },
      onWebSocketError: (err) => {
        if (!finished) {
          finished = true;
          clearTimeout(timeout);
          console.error("💣 WebSocket 오류:", err);
          reject(err);
        }
      },
    });

    client.activate();
  });
};

export const disconnectStomp = async () => {
  if (client && client.connected) {
    console.log("🔌 STOMP 연결 해제 중...");
    await client.deactivate();
  }
  client = null;
};

export const isStompConnected = () => !!client && client.connected;

// 🧩 STOMP 상태 로그 확인용
export const logStompStatus = () => {
  if (!client) {
    console.log("⚠️ STOMP 클라이언트 없음");
    return;
  }

  console.log("📡 STOMP 상태 체크:");
  console.log("  - 활성화 여부:", client.active);
  console.log("  - 연결 상태:", client.connected);
  console.log("  - 브로커 URL:", client.brokerURL);
};
