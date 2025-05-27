import PostDetailScreen from "../screens/Community/PostDetailScreen";
import PostListScreen from "../screens/Community/PostListScreen";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const CommunityStack = () => {
  return(
    <Stack.Navigator>
      <Stack.Screen name="PostList" component={PostListScreen} options={{ headerShown: false }}></Stack.Screen>
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ headerShown: false }}></Stack.Screen>
    </Stack.Navigator>
  )
}

export default CommunityStack;