//채팅방 아이디, 채팅방 타입 전역 관리
import { createContext, useState } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chatInfo, setChatInfo] = useState(null);   // { chatRoomId, chatRoomType }
  const [isConnected, setIsConnected] = useState(false);

  return (
    <ChatContext.Provider value={{ chatInfo, setChatInfo, isConnected, setIsConnected }}>
      {children}
    </ChatContext.Provider>
  );
};