import apiClient from "./apiClient";
//채팅 api 연동, 개인 or 단체에 따라 조건부로 연동

//채팅방 생성
const memberChat = async () => {
    const response = await apiClient.post("/member-chat-rooms");
    return response.data;
}

//채팅방 목록
const chattingList = async ({ chatRoomType }) => {
    const url = chatRoomType === "ONE" 
    ? "/member-chat-rooms"
    : "/chat-rooms"  
    const response = await apiClient.get(url);
    return response.data;
}

//채팅방 수정, 단체 채팅방만 가능
const modifyChattingRoom = async ({ chatRoomId, chatRoomName, limitCount }) => {
    const response = await apiClient.put(`/chat-rooms/${chatRoomId}`, {
        chatRoomName, 
        limitCount, 
    })
    return response.data;
}

//채팅방 나가기
const exitChattingRoom = async ({ memberChatRoomId, chatRoomId, chatRoomType }) => {
    const url = chatRoomType === "ONE"
    ? `/member-chat-rooms/${memberChatRoomId}`
    : `/chat-rooms/${chatRoomId}`
    const response = await apiClient.delete(url);
    return response.data;
}

//채팅 내역 불러오기
const fetchMessages = async ({ memberChatRoomId, chatRoomId, chatRoomType }) => {
    const url = chatRoomType === "ONE"
    ? `/member-chat-rooms/${memberChatRoomId}`
    : `/chat-rooms/${chatRoomId}`
    const response = await apiClient.get(url);
    return response.data;
}

export {memberChat, chattingList, modifyChattingRoom, exitChattingRoom, fetchMessages};
