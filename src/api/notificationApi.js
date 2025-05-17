import apiClient from './apiClient'; 

// 알림 내역 조회
const NotificationList = async () => {
    const response = await apiClient.get('/notifications');
    return response.data;
};

export default NotificationList;
