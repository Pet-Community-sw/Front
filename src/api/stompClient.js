import { Client } from "@stomp/stompjs";
import { BASE_URL } from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
//웹소켓 연결, 구독, 전송 관리

const SOCKET_URL = BASE_URL.replace("http", "ws") + "/ws-stomp";

//메시지 구독, 전송, 연결 끊기 등 모든 행동의 중심 객체
let stompClient = null;  

//웹소켓 서버 연결
export const connectStomp = async (onConnect) => {
  const token = await AsyncStorage.getItem("accessToken");

  stompClient = new Client({
    brokerURL: SOCKET_URL, 
    connectHeaders: {
      Authorization: `Bearer ${token}`, 
    }, 
    reconnectDelay: 5000,
    onConnect: () => {    //연결 성공 후 실행할 코드
      console.log("STOMP 연결됨!");
      onConnect?.();
    }, 
  });

  stompClient.activate();   //연결 시작, new WebSocket(url)
  return stompClient;
};

//채팅방 구독 (사용자가 채팅방에 입장 시, 서버로부터 오는 메시지 실시간으로 받음)
export const subscribeChat = (chatRoomId, onMessage) => {
  if(!stompClient) return;

  stompClient.subscribe(`/sub/chat/${chatRoomId}`, (msg) => {
    const payload = JSON.parse(msg.body);
    onMessage(payload);
  });
}

//채팅방 구독 해제
export const unsubscribeChat = (chatRoomId) => {
  if(subscribeChat[chatRoomId]) {
    subscribeChat[chatRoomId].unsubscribeChat();
    delete subscribeChat[roomId];
  }
};

//메시지 전송, message: 서버에 보내는 객체
export const sendChat = (message) => {
  if(!stompClient) return;

  stompClient.publish({   //메시지 서버로 보냄
    destination: "/pub/chat/message", 
    body: JSON.stringify(message),    //전송할 실제 데이터
  });
};

//연결 해제
export const disconnectStomp = async () => {
  if(stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log("웹소켓 연결 해제")
  };
};