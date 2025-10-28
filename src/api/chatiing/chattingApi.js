import apiClient from "../apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { client } from "./stompClient";
//채팅 api 연동, 개인 or 단체에 따라 조건부로 연동

//채팅방 생성
const memberChat = async ({memberId}) => {
    const response = await apiClient.post("/member-chat-rooms", {
        memberId, 
    });
    return response.data;
}

//채팅방 목록
const chattingList = async ({ chatRoomType }) => {
    // userId 가져오기
    const userId = await AsyncStorage.getItem("userId");
    console.log("📋 채팅방 목록 요청 - userId:", userId);
    
    // chatRoomType에 따른 URL 매핑 수정
    let url;
    if (chatRoomType === "ONE") {
        url = "/member-chat-rooms";
    } else if (chatRoomType === "GROUP" || chatRoomType === "MANY") {
        url = "/chat-rooms";
    } else {
        url = "/chat-rooms"; // 기본값
    }
    
    // userId를 쿼리 파라미터로 추가
    const params = userId ? { userId } : {};
    console.log("📋 채팅방 목록 요청 URL:", url, "params:", params);
    
    const response = await apiClient.get(url, { params });
    return response.data;
}

//채팅방 수정, 단체 채팅방만 가능
const modifyChattingRoom = async ({ chatRoomId, chatRoomName, limitCount }) => {
    const response = await apiClient.put(`/chat-rooms/${chatRoomId}`, {
        chatRoomName, 
        limitCount, 
    })
    return response.data;
}

//채팅방 나가기
const exitChattingRoom = async ({ memberChatRoomId, chatRoomId, chatRoomType }) => {
    const url = chatRoomType === "ONE"
    ? `/member-chat-rooms/${memberChatRoomId}`
    : `/chat-rooms/${chatRoomId}`
    const response = await apiClient.delete(url);
    return response.data;
}

//채팅 내역 불러오기
const fetchMessages = async ({ memberChatRoomId, chatRoomId, chatRoomType, page = 0 }) => {
    const url = chatRoomType === "ONE"
    ? `/member-chat-rooms/${memberChatRoomId}?`
    : `/chat-rooms/${chatRoomId}`
    const response = await apiClient.get(url, {
        params: { page }, 
    });
    return response.data;
}

const sendChatMessage = (payload) => {
    console.log("📤 메시지 전송 시도:", payload);
    console.log("🔌 STOMP 클라이언트 상태:", {
      exists: !!client,
      connected: client?.connected,
      active: client?.active
    });
    
    if (!client || !client.connected) {
      console.warn("⚠️ STOMP 연결이 없습니다. 메시지 전송 실패:", payload);
      return;
    }
  
    try {
      const message = {
        destination: "/pub/chat",
        body: JSON.stringify(payload),
      };
      
      console.log("📤 전송할 메시지:", message);
      client.publish(message);
  
      console.log("✅ 메시지 전송 성공:", payload);
    } catch (error) {
      console.error("❌ 메시지 전송 중 오류 발생:", error);
    }
  };

export {memberChat, chattingList, modifyChattingRoom, exitChattingRoom, fetchMessages, sendChatMessage};
