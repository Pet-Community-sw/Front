import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import SignupScreen from "./screens/SignupScreen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginScreen from "./screens/LoginScreen";
import FindidScreen from "./screens/FindidScreen";
import FindpasswordScreen from "./screens/FindpasswordScreen";
import { UserProvider } from "./context/User";
import WelcomeScreen from "./screens/WelcomeScreen";
import TabBar from "./components/tabBar";

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

const App = () => {
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={TabBar} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "회원가입" }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: "로그인" }} />
            <Stack.Screen name="Findid" component={FindidScreen} options={{ title: "아이디 찾기" }} />
            <Stack.Screen name="Findpassword" component={FindpasswordScreen} options={{ title: "비밀번호 찾기" }} />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </UserProvider>
  );
};

export default App;
