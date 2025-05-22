import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    memberChat,
    chattingList,
    modifyChattingRoom,
    exitChattingRoom,
    fetchMessages,
} from "../api/chattingApi";

//개인 채팅방 생성
const useAddMemberChat = () => {
    const queryClient = useQueryClient();
    return useMutation ({
        mutationFn: memberChat, 
        onSuccess: (newChatRoom) => {
            queryClient.setQueryData(['chatting', 'ONE'], (oldchattingList = []) => {
                return ([...oldchattingList, newChatRoom]);
            });
        }
    });
};

//채팅 목록 가져오기 (단체)
const useGroupChattingList = () => {
    return useQuery({
        queryKey: ['chatting', 'MANY'], 
        queryFn: () => chattingList({chatRoomType: 'GROUP'}), 
        enabled: false, 
    });
};

//채팅 목록 가져오기 (개인)
const usePersonalChattingList = () => {
    return useQuery({
        queryKey: ['chatting', 'ONE'], 
        queryFn: () => chattingList({chatRoomType: 'ONE'}), 
        enabled: false,
    });
};

//채팅방 수정(단체 채팅방)
const useModifyChatting = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: modifyChattingRoom, 
        onSuccess: (modifyChattingRoom) => {
            queryClient.setQueryData(["chatting", 'MANY'], (oldchattingList = []) => {
                return [...oldchattingList, modifyChattingRoom];
            });
        }
    });
};

//채팅방 나가기
const useExitChatting = () => {
    return useMutation({
        mutationFn: exitChattingRoom, 
    });
};

//채팅 내역 불러오기
const useFetchMessages = ({ chatRoomId, chatRoomType, page = 0 }) => {
  return useQuery({
    queryKey: ["messages", { chatRoomId, chatRoomType, page }],
    queryFn: () => fetchMessages({ chatRoomId, chatRoomType, page }),
    enabled: false, 
  });
};


export {useAddMemberChat, useGroupChattingList, usePersonalChattingList, useExitChatting, useFetchMessages, useModifyChatting};
