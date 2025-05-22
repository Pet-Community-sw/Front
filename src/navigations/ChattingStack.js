import React from "react";
import ChattingScreen from "../screens/Chatting/ChattingScreen";
import chattingListScreen from "../screens/Chatting/ChattingListScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const ChattingStack = () => {
  return(
    <Stack.Navigator>
      <Stack.Screen name="ChattingList" component={chattingListScreen}></Stack.Screen>
      <Stack.Screen name="Chatting" component={ChattingScreen}></Stack.Screen>
    </Stack.Navigator>
  )
}

export default ChattingStack;