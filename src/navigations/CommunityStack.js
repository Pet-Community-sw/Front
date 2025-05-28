import PostDetailScreen from "../screens/Community/PostDetailScreen";
import PostListScreen from "../screens/Community/PostListScreen";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text } from "react-native";


const Stack = createNativeStackNavigator();

const CommunityStack = () => {
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
                자유게시판
              </Text>
            </View>
          ),
        }}>
      <Stack.Screen name="PostList" component={PostListScreen}></Stack.Screen>
      <Stack.Screen name="PostDetail" component={PostDetailScreen}></Stack.Screen>
    </Stack.Navigator>
  )
}

export default CommunityStack;