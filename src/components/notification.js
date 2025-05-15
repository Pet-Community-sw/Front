import React from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const NotificationBell = ({ unreadCount, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={{ position: "relative", marginRight: -50, marginBottom: 5 }}>
      <Ionicons name="notifications" size={24} color="black" />
      {unreadCount > 0 && (
        <View style={{
          position: "absolute", top: -5, right: -5,
          backgroundColor: "red", borderRadius: 8,
          width: 16, height: 16, justifyContent: "center", alignItems: "center"
        }}>
          <Text style={{ color: "white", fontSize: 10 }}>{unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const NotificationModal = ({ visible, onClose, notifications }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: "#00000088", justifyContent: "center", alignItems: "center" }}>
        <View style={{ backgroundColor: "#fff", borderRadius: 12, width: "80%", padding: 16 }}>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>알림 목록</Text>
          <FlatList
            data={notifications}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 8, borderBottomWidth: 0.5, borderColor: "#ccc" }}>
                <Text>{item.message}</Text>
                <Text style={{ fontSize: 11, color: "#aaa" }}>{item.createdAt}</Text>
              </View>
            )}
          />
          <TouchableOpacity onPress={onClose} style={{ marginTop: 16, alignSelf: "center" }}>
            <Text style={{ color: "#007AFF" }}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export {NotificationBell, NotificationModal};
