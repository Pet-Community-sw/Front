import { useEffect, useRef } from 'react';
import { EventSource } from 'react-native-sse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/apiConfig';
import { Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import NotificationList from '../api/notificationApi';

//sse 알림
const useNotification = (onMessage) => {
  const eventSourceRef = useRef(null);  //서버와 연결된 이벤트 객체 저장
  const retryRef = useRef(null);  //자동 재연결을 위한 타이머 반환 id

  useEffect(() => {
    const subscribe = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const url = `${BASE_URL}/notifications/subscribe?token=${token}`;
      const eventSource = new EventSource(url);

      eventSource.addEventListener('notification', (event) => {
        const data = JSON.parse(event.data);  //문자열을 객체로 변환
        Alert.alert('🔔 알림:', data.message);
        if (onMessage) onMessage(data);
      });

      eventSource.addEventListener('error', (err) => {
        console.error('SSE 에러:', err.message);
        eventSource.close();
        retryRef.current = setTimeout(() => {
          subscribe(); // 재연결
        }, 5000);
      });

      eventSourceRef.current = eventSource;
    };

    subscribe();

    //컴포넌트 언마운트 될 때 자동 실행
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();   //서버 연결 종료
      if (retryRef.current) clearTimeout(retryRef.current);   //예약된 재연결 취소
    };
  }, []);
};

const useNotificationList = () => {
  return useQuery({
    queryKey: [notis], 
    queryFn: NotificationList, 
  })
}

export {useNotification, useNotificationList};
