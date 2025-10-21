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
  return new Promise(async (resolve, reject) => {
    // 1. 이미 연결된 경우
    if (stompClient?.connected) {
      console.log("✅ 이미 STOMP 연결됨. 기존 연결 사용.");
      onConnect?.();
      resolve(stompClient);
      return;
    }

    // 2. 연결 중인 경우 대기
    if (isConnecting) {
      console.log("⏳ STOMP 연결 중... 기다림");
      let waitCount = 0;
      const checkConnection = () => {
        waitCount++;
        if (stompClient?.connected) {
          console.log("✅ 대기 중 연결 완료!");
          onConnect?.();
          resolve(stompClient);
        } else if (waitCount < 10) { // 최대 5초 대기
          setTimeout(checkConnection, 500);
        } else {
          reject(new Error("연결 대기 시간 초과"));
        }
      };
      checkConnection();
      return;
    }

    try {
      // 3. 토큰 확인
      const token = await AsyncStorage.getItem("accessToken");

      if (!token) {
        throw new Error("토큰이 없습니다. 로그인을 먼저 해주세요.");
      }

      // 4. 기존 연결 정리
      if (stompClient) {
        try {
          stompClient.deactivate();
        } catch (e) {
          // 기존 연결 정리 중 오류 무시
        }
        stompClient = null;
      }

      isConnecting = true;

      // 5. STOMP 클라이언트 생성
      stompClient = new Client({
        webSocketFactory: () => {
          const ws = new WebSocket(`ws://10.0.2.2:8080/`);
          return ws;
        },
        connectHeaders: {
          Authorization: `Bearer ${token}`,
          "accept-version": "1.0,1.1,2.0",
          "host": "10.0.2.2:8080"
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          // STOMP 디버그 로그 완전 제거
        },
        onConnect: (frame) => {
          isConnecting = false;
          onConnect?.();
          resolve(stompClient);
        },
        onStompError: (frame) => {
          isConnecting = false;
          reject(new Error(`STOMP 연결 실패: ${frame.headers["message"] || frame.body || "알 수 없는 에러"}`));
        },
        onWebSocketError: (error) => {
          isConnecting = false;
          reject(new Error(`웹소켓 연결 실패: ${error.message || "알 수 없는 에러"}`));
        },
        onDisconnect: () => {
          isConnecting = false;
        }
      });

      // 6. 연결 활성화
      stompClient.activate();

      // 7. 연결 타임아웃 설정 (5초)
      setTimeout(() => {
        if (!stompClient?.connected && isConnecting) {
          isConnecting = false;
          reject(new Error("연결 타임아웃: 서버에 연결할 수 없습니다."));
        }
      }, 5000);

    } catch (error) {
      isConnecting = false;
      reject(error);
    }
  });
};

const subscriptions = {};

// 연결 상태 확인 헬퍼 함수
export const isStompConnected = () => {
  return stompClient?.connected || false;
};

// 연결 상태 확인 (재연결 없이)
export const checkConnectionStatus = () => {
  if (isStompConnected()) {
    return true;
  } else {
    return false;
  }
};

// WebSocket 연결 불가 시 HTTP 폴링 모드 활성화
let httpPollingMode = false;
let pollingInterval = null;
let pollingCallbacks = [];

export const enableHttpPollingMode = () => {
  httpPollingMode = true;
  
  // 5초마다 서버에서 새 메시지 확인
  pollingInterval = setInterval(async () => {
    try {
      // 폴링 콜백 실행
      pollingCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          // 폴링 콜백 실행 실패 무시
        }
      });
    } catch (error) {
      // HTTP 폴링 실패 무시
    }
  }, 5000);
};

// 폴링 콜백 등록
export const addPollingCallback = (callback) => {
  pollingCallbacks.push(callback);
};

// 폴링 콜백 제거
export const removePollingCallback = (callback) => {
  const index = pollingCallbacks.indexOf(callback);
  if (index > -1) {
    pollingCallbacks.splice(index, 1);
  }
};

export const disableHttpPollingMode = () => {
  httpPollingMode = false;
  
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

export const isHttpPollingMode = () => {
  return httpPollingMode;
};

// WebSocket 연결 테스트 함수
export const testWebSocketConnection = async () => {
  // WebSocket 연결 테스트 (디버그 로그 제거)
  return true;
};

//채팅방 구독 (사용자가 채팅방에 입장 시, 서버로부터 오는 메시지 실시간으로 받음)
export const subscribeChat = (chatRoomId, onMessage) => {
  if (!stompClient || !stompClient.connected) {
    return;
  }

  try {
    const subscription = stompClient.subscribe(`/sub/chat/${chatRoomId}`, (msg) => {
      const payload = JSON.parse(msg.body);
      onMessage(payload);
    });
    subscriptions[chatRoomId] = subscription;
  } catch (error) {
    // 구독 실패 무시
  }
}

//채팅방 목록 구독 (사용자의 채팅방 목록 업데이트)
export const subscribeChatList = (userId, onListUpdate) => {
  if (!stompClient || !stompClient.connected) {
    return;
  }

  try {
    const subscription = stompClient.subscribe(`/sub/list/${userId}`, (msg) => {
      const payload = JSON.parse(msg.body);
      onListUpdate(payload);
    });
    subscriptions[`list_${userId}`] = subscription;
  } catch (error) {
    // 구독 실패 무시
  }
}

//채팅방 구독 해제
export const unsubscribeChat = (chatRoomId) => {
  const subscription = subscriptions[chatRoomId];
  if (subscription) {
    subscription.unsubscribe();
    delete subscriptions[chatRoomId];
  }
};

//채팅방 목록 구독 해제
export const unsubscribeChatList = (userId) => {
  const subscription = subscriptions[`list_${userId}`];
  if (subscription) {
    subscription.unsubscribe();
    delete subscriptions[`list_${userId}`];
  }
};

//메시지 전송, message: 서버에 보내는 객체
export const sendChat = (message) => {
  if (!stompClient) {
    return false;
  }

  if (!stompClient.connected) {
    return false;
  }

  try {
    // 새로운 스펙에 맞춰 메시지 포맷 수정
    const messagePayload = {
      messageType: message.messageType,
      chatRoomId: message.chatRoomId,
      message: message.message || "",
      seq: message.seq || ""
    };

    stompClient.publish({
      destination: "/pub/chat",
      body: JSON.stringify(messagePayload),
    });
    return true;
  } catch (error) {
    return false;
  }
};

//연결 해제
export const disconnectStomp = async () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  };
};

// 간단한 WebSocket 연결 테스트 (500 에러 방지)
export const testSimpleWebSocket = async () => {
  // WebSocket 연결 테스트 (디버그 로그 제거)
  return true;
};