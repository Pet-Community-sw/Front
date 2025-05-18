import React from "react";
import { View, TouchableOpacity, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";

const NotificationBell = ({ onPress }) => {
  const {newNoti} = useContext(NotificationContext);

  return (
    <TouchableOpacity onPress={onPress} style={{ position: "relative" }}>
      <Ionicons name="notifications" size={24} color="black" />
      {newNoti && (
        <View style={{
          position: "absolute", top: -4, right: -4,
          width: 10, height: 10,
          borderRadius: 5, backgroundColor: "red"
        }} />
      )}
    </TouchableOpacity>
  );
};


export {NotificationBell};
