import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import { NavigationContainer } from "@react-navigation/native";
import SignupScreen from "./screens/SignupScreen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginScreen from "./screens/LoginScreen";
import FindidScreen from "./screens/FindidScreen";

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

 const App = () => {
  return(
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{title: "회원가입"}}/>
          <Stack.Screen name="Login" component={LoginScreen} options={{title: "로그인"}}/>
          <Stack.Screen name="Findid" component={FindidScreen} options={{title: "아이디 찾기"}}/>
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>

  )
 }

 export default App;