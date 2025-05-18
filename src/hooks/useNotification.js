import { useContext, useEffect, useRef } from 'react';
import { EventSource } from 'react-native-sse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/apiConfig';
import * as Notifications from 'expo-notifications';
import { NotificationContext } from '../context/Notification';

//sse 알림
const useNotification = (onMessage) => {
  const {setHasNewNoti} = useContext(NotificationContext);  //알림 빨간 뱃지 전역 상태
  const eventSourceRef = useRef(null);  //서버와 연결된 이벤트 객체 저장
  const retryRef = useRef(null);  //자동 재연결을 위한 타이머 반환 id

  useEffect(() => {
    const subscribe = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const url = `${BASE_URL}/notifications/subscribe?token=${token}`;
      const eventSource = new EventSource(url);

      //서버에서 알림 수신
      eventSource.addEventListener('notification', async (event) => {
        const data = JSON.parse(event.data);  //문자열을 객체로 변환

        // 상단 알림(푸시 스타일)으로 표시
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔔 알림:',
            body: data.message,
            sound: 'default',
          },
          trigger: null, //즉시 실행
        });

        setHasNewNoti(true); // 빨간 뱃지 표시 ON
        if (onMessage) onMessage(data);
      });

      //에러 발생 시 연결 종료 후 재연결 시도
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

export { useNotification };
