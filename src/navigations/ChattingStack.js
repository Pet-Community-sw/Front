import React from "react";
import ChattingScreen from "../screens/Chatting/ChattingScreen";
import GroupChattingListScreen from "../screens/Chatting/GroupChattingListScreen";
import PersonalChattingListScreen from "../screens/Chatting/PersonalChattingListScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text } from "react-native";

const Stack = createNativeStackNavigator();

const ChattingStack = () => {
  return(
    <Stack.Navigator
      screenOptions={{
          headerShown: true,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#57B4BA",
          },
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "white", fontSize: 40, fontFamily: "cute" }}>
                채팅
              </Text>
            </View>
          ),
        }}>
      <Stack.Screen name="groupChattingList" component={GroupChattingListScreen}></Stack.Screen>
      <Stack.Screen name="PersonalChattingList" component={PersonalChattingListScreen}></Stack.Screen>
      <Stack.Screen name="ChattingDetail" component={ChattingScreen}></Stack.Screen>
    </Stack.Navigator>
  )
}

export default ChattingStack;