import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';

export const WebSocketClient = () => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 단순 WebSocket 테스트
useEffect(() => {
  const ws = new WebSocket("ws://10.0.2.2:8080/ws-stomp");
  ws.onopen = () => console.log("✅ WS 연결 성공");
  ws.onerror = (e) => console.log("❌ WS 연결 실패", e);
  ws.onclose = () => console.log("🔌 WS 닫힘");
  return () => ws.close();
}, []);


  useEffect(() => {
    const token = 'yourTokenHere'; // 실제 토큰으로 교체

    const client = new Client({
      brokerURL: 'ws://10.0.2.2:8080/ws-stomp', 
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => console.log('STOMP Debug:', str),
      onConnect: () => {
        console.log('웹소켓 연결 성공');
        setIsConnected(true);
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
        setIsConnected(false);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket Error:', error);
        setIsConnected(false);
      },
      reconnectDelay: 5000, // 5초 후 자동 재연결
    });

    setStompClient(client);
    client.activate();

    // cleanup (컴포넌트 unmount 시 연결 해제)
    return () => {
      client.deactivate();
    };
  }, []);

  return (
    <div>
      <Text>{isConnected ? "✅ STOMP 연결됨" : "❌ STOMP 연결 안 됨"}</Text>
    </div>
  );
};
