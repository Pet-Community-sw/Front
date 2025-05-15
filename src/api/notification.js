import apiClient from './apiClient'; // 네가 만든 axios 설정 파일

// 알림 내역 조회
const fetchNotifications = async () => {
    const response = await apiClient.get('/notifications');
    return response.data;
};

export default fetchNotifications;
