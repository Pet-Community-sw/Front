import { useEffect, useRef } from 'react';
import { EventSource } from 'react-native-sse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/apiConfig';
import { Alert } from 'react-native';

const useNotification = (onMessage) => {
  const eventSourceRef = useRef(null);
  const retryRef = useRef(null);

  useEffect(() => {
    const subscribe = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const url = `${BASE_URL}/notifications/subscribe?accessToken=${token}`;
      const es = new EventSource(url);

      es.addEventListener('notification', (event) => {
        const data = JSON.parse(event.data);
        Alert.alert('🔔 알림 수신:', data.message);
        if (onMessage) onMessage(data);
      });

      es.addEventListener('error', (err) => {
        console.error('SSE 에러:', err.message);
        es.close();
        retryRef.current = setTimeout(() => {
          subscribe(); // 재연결
        }, 5000);
      });

      eventSourceRef.current = es;
    };

    subscribe();

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, []);
};

export default useNotification;
