// import React, { useEffect, useState } from "react";
// import { View, Text } from "react-native";
// import { Client } from "@stomp/stompjs";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export const WebSocketClient = () => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [stompClient, setStompClient] = useState(null);

//   useEffect(() => {
//     // 🔹 단순 WebSocket 연결 테스트
//     const ws = new WebSocket("ws://10.0.2.2:8080/ws-stomp");
//     ws.onopen = () => console.log("✅ WS 연결 성공 (로우 테스트)");
//     ws.onerror = (e) => console.log("❌ WS 연결 실패", e.message);
//     ws.onclose = () => console.log("🔌 WS 닫힘");
//     return () => ws.close();
//   }, []);

//   useEffect(() => {
//     const connectStomp = async () => {
//       const token = await AsyncStorage.getItem("accessToken");
//       const userId = await AsyncStorage.getItem("userId");
//       const chatRoomId = route.params?.chatRoomId; // ✅ 실제 테스트용 채팅방 ID
//       const testMessage = "테스트 메시지입니다";

//         if (!token || !userId) {
//         console.warn("⚠️ 토큰 또는 userId가 없습니다.");
//         return;
//       }

//       console.log("🧩 STOMP 연결 시도... token:", token.slice(0, 20) + "...");

//       const client = new Client({
//         brokerURL: "ws://10.0.2.2:8080/ws-stomp",
//         connectHeaders: {
//           Authorization: `Bearer ${token}`,
//         },
//         debug: (str) => console.log("🐛 STOMP Debug:", str),
//         reconnectDelay: 5000,
//         onConnect: () => {
//           console.log("✅ STOMP 연결 성공");
//           setIsConnected(true);

//           // ✅ 채팅방 구독
//           const destination = `/sub/chat/${chatRoomId}`;
//           console.log(`📩 채팅방 구독: ${destination}`);

//           client.subscribe(destination, (message) => {
//             const body = JSON.parse(message.body);
//             console.log("💬 새 메시지 수신:", body);
//           });

//           // ✅ 테스트 메시지 발행
//           client.publish({
//             destination: "/pub/chat",
//             body: JSON.stringify({
//               chatRoomId: chatRoomId,
//               message: testMessage,
//               messageType: "TALK",
//             }),
//           });
//           console.log("📤 테스트 메시지 발행 완료");
//         },
//         onStompError: (frame) => {
//           console.error("❌ STOMP Error:", frame);
//           setIsConnected(false);
//         },
//         onWebSocketError: (error) => {
//           console.error("💣 WebSocket Error:", error.message);
//           setIsConnected(false);
//         },
//       });

//       setStompClient(client);
//       client.activate();

//       // cleanup
//       return () => {
//         console.log("🧹 STOMP 연결 해제");
//         client.deactivate();
//       };
//     };

//     connectStomp();
//   }, []);

//   return (
//     <View style={{ padding: 20 }}>
//       <Text style={{ fontSize: 16 }}>
//         {isConnected ? "✅ STOMP 연결됨" : "❌ STOMP 연결 안 됨"}
//       </Text>
//     </View>
//   );
// };
