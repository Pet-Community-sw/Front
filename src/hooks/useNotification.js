import { useContext, useEffect, useRef } from 'react';
import { EventSource } from 'react-native-sse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/apiClient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';  
import axios from 'axios';              
import { NotificationContext } from '../context/Notification';
import NotificationList from '../api/notificationApi';
import { useQuery } from '@tanstack/react-query';

let eventSourceRef = null;  //전역 관리

export const disconnectNotification = () => {
  if (eventSourceRef) {
    eventSourceRef.close();
    eventSourceRef = null;
    console.log("🔌 SSE 연결 종료됨");
  }
};

//sse 알림
const useNotification = (onMessage) => {
  const { setNewNoti } = useContext(NotificationContext);  //알림 빨간 뱃지 전역 상태
  const retryRef = useRef(null);  //자동 재연결을 위한 타이머 반환 id

  useEffect(() => {
    const subscribe = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const memberId = await AsyncStorage.getItem('memberId');
      if (!token || !memberId) return;

      // FCM 토큰 등록 요청
      if (Device.isDevice) {
        try {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus === 'granted') {
            const fcmToken = (await Notifications.getExpoPushTokenAsync()).data;

            // FCM 토큰 서버에 등록
            await axios.post(`${BASE_URL}/members/fcm-token`, {
              memberId: Number(memberId),
              fcmToken,
            }, {
              headers: {
                accessToken: token,
              },
            });

            console.log("FCM 토큰 서버 등록 완료");
          } else {
            console.log("알림 권한 거부됨");
          }
        } catch (err) {
          console.error("FCM 토큰 등록 실패:", err);
        }
      } else {
        console.log("FCM 등록은 실기기에서만 가능");
      }

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

        setNewNoti(true); // 빨간 뱃지 표시 ON
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

      eventSourceRef = eventSource;
    };

    subscribe();

    //컴포넌트 언마운트 될 때 자동 실행
    return () => {
      disconnectNotification();
      if (retryRef.current) clearTimeout(retryRef.current);   //예약된 재연결 취소
    };
  }, []);
};

//알림 내역 조회
const useNotificationList = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: NotificationList,
  });
};

export {useNotification, useNotificationList};
