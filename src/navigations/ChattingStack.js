import React from "react";
import ChattingScreen from "../screens/Chatting/ChattingScreen";
import GroupChattingListScreen from "../screens/Chatting/GroupChattingListScreen";
import PersonalChattingListScreen from "../screens/Chatting/PersonalChattingListScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const ChattingStack = () => {
  return(
    <Stack.Navigator>
      <Stack.Screen name="PersonalChattingList" component={PersonalChattingListScreen}></Stack.Screen>
      <Stack.Screen name="groupChattingList" component={GroupChattingListScreen}></Stack.Screen>
      <Stack.Screen name="Chatting" component={ChattingScreen}></Stack.Screen>
    </Stack.Navigator>
  )
}

export default ChattingStack;