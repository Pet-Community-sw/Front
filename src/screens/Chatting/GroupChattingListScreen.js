import React, { useCallback } from "react";
import { View, TouchableOpacity, Text, FlatList } from "react-native";
import { useGroupChattingList } from "../../hooks/useChatting";
import { useFocusEffect } from "@react-navigation/native";

const GroupChattingListScreen = ({ navigation }) => {
  const { data: chatRooms = [], refetch } = useGroupChattingList();

  // 화면 포커스 시 목록 다시 불러오기
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.chatRoomId.toString()}
        contentContainerStyle={{ paddingBottom: 32 }}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 8 }} />
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Chatting", {
                chatRoomId: item.chatRoomId,
                chatRoomType: "MANY",
                chatName: item.chatName, 
              });
            }}
            style={{
              flexDirection: "column",
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: "#f9f9f9",
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 4 }}>
              {item.chatName} ({item.crrentCount}/{item.chatLimitCount})
            </Text>
            <Text numberOfLines={1} style={{ color: "#666", marginBottom: 2 }}>
              {item.lastMessage || "메시지 없음"}
            </Text>
            <Text style={{ fontSize: 12, color: "#aaa" }}>
              {item.lastMessageTime}
              {item.unReadCount > 0 && `  ·  안읽음 ${item.unReadCount}개`}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        onPress={() => {
          navigation.navigate("PersonalChattingListScreen");
        }}
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: "#0066cc",
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>개인 채팅방 보기</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GroupChattingListScreen;
