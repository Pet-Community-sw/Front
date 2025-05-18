import React, {createContext, useState} from "react";

//새로운 알림 여부 전역 관리
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [newNoti, setNewNoti] = useState(false);  //빨간 뱃지 여부

  return (
  <NotificationContext.Provider value={{ newNoti, setNewNoti }}>
    {children}
  </NotificationContext.Provider>
  );
}