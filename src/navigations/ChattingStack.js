import React from "react";
import ChattingScreen from "../screens/Chatting/ChattingScreen";
import groupChattingListScreen from "../screens/Chatting/GroupChattingListScreen";
import personalChattingListScreen from "../screens/Chatting/PersonalChttingListScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const ChattingStack = () => {
  return(
    <Stack.Navigator>
      <Stack.Screen name="PersonalChattingList" component={personalChattingListScreen}></Stack.Screen>
      <Stack.Screen name="groupChattingList" component={groupChattingListScreen}></Stack.Screen>
      <Stack.Screen name="Chatting" component={ChattingScreen}></Stack.Screen>
    </Stack.Navigator>
  )
}

export default ChattingStack;