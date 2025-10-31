import { Client } from "@stomp/stompjs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../apiClient";

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
    const WS_URL = BASE_URL.replace("https://", "wss://").replace("http://", "ws://");

    client = new Client({
      brokerURL: `${WS_URL}/ws-stomp`,
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
  try {
    if (client && client.connected) {
      await client.deactivate();
      console.log("✅ STOMP 연결 해제 완료");
    } else {
      console.log("⚠️ STOMP 클라이언트가 없거나 이미 비활성화 상태입니다.");
    }
  } catch (err) {
    console.log("❌ STOMP 연결 해제 중 오류:", err);
  }
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
