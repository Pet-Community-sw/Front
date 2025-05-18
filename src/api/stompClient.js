import { Client } from "@stomp/stompjs";
import { w3cwebsocket } from "websocket";
import { BASE_URL } from "./apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
//웹소켓 연결, 구독, 전송 관리

const SOCKET_URL = BASE_URL.replace("http", "ws") + "/ws-stomp";

//폴리필: 앱에서의 웹소켓을 브라우저 표준처럼 동작하게 만들어줌
global.WebSocket = w3cwebsocket;

//메시지 구독, 전송, 연결 끊기 등 모든 행동의 중심 객체
let stompClient = null;  

//웹소켓 서버에 연결할 때 호출됨
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