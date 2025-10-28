import { client } from "../../api/chatiing/stompClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ 채팅방 구독
export const subscribeChatRoom = (chatRoomId, onMessage) => {
  console.log("📩 채팅방 구독 시작, chatRoomId:", chatRoomId);
  console.log("🔌 STOMP 클라이언트 상태:", {
    exists: !!client,
    connected: client?.connected,
    active: client?.active
  });

  if (!client || !client.connected) {
    console.warn("⚠️ STOMP 연결이 없습니다. 채팅방 구독 실패");
    return null;
  }

  const dest = `/sub/chat/${chatRoomId}`;
  console.log(`📩 채팅방 구독 시도: ${dest}`);

  try {
    const subscription = client.subscribe(dest, (msg) => {
      console.log("📨 STOMP 원시 메시지 수신:", msg);
      try {
        const body = JSON.parse(msg.body);
        console.log("💬 파싱된 메시지:", body);
        onMessage?.(body);
      } catch (err) {
        console.error("❌ 메시지 파싱 오류:", err, msg.body);
      }
    });

    console.log("✅ 채팅방 구독 성공 (subscriptionId:", subscription.id, ")");
    console.log("📡 구독 정보:", {
      id: subscription.id,
      destination: dest,
      active: subscription.active
    });
    return subscription;
  } catch (err) {
    console.error("❌ 채팅방 구독 중 오류 발생:", err);
    return null;
  }
};

// ✅ 채팅방 목록 구독
export const subscribeChatList = async (onMessage) => {
  if (!client || !client.connected) {
    console.warn("⚠️ STOMP 연결이 없습니다.");
    return;
  }

  try {
    const userId = await AsyncStorage.getItem("userId");
    console.log("👤 저장된 userId:", userId);
    
    if (!userId) {
      console.error("❌ userId가 없습니다. 로그인이 필요합니다.");
      return;
    }

    const dest = `/sub/list/${userId}`;
    console.log(`📩 채팅 목록 구독 시도: ${dest}`);

    // ✅ 구독 후 리턴값을 변수에 저장해야 함
    const subscription = client.subscribe(dest, (msg) => {
      try {
        const body = JSON.parse(msg.body);
        console.log("📬 목록 업데이트 수신:", body);
        onMessage?.(body);
      } catch (err) {
        console.error("❌ JSON 파싱 실패:", err, msg.body);
      }
    });

    // ✅ 여기서 이제 접근 가능
    console.log("✅ 채팅 목록 구독 성공! (subscriptionId:", subscription.id, ")");
    return subscription;
  } catch (error) {
    console.error("❌ 채팅 목록 구독 중 오류:", error);
  }
};


// ✅ 구독 해제
export const unsubscribe = (subscription) => {
  if (subscription) {
    subscription.unsubscribe();
    console.log("🧹 구독 해제 완료");
  }
};

// ✅ 채팅방 목록 구독 해제
export const unsubscribeChatList = (subscription) => {
  if (subscription) {
    subscription.unsubscribe();
    console.log("🧹 채팅방 목록 구독 해제 완료");
  }
};
