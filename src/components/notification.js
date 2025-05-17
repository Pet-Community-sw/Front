import React from "react";
import { View, Text, TouchableOpacity, } from "react-native";
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


export {NotificationBell};
