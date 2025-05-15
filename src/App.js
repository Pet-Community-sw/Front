
import 'react-native-gesture-handler';
import React, { useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { UserProvider, UserContext } from "./context/User";
import { PetProvider } from './context/PetProfiles';

import SignupScreen from "./screens/SignupScreen";
import LoginScreen from "./screens/LoginScreen";
import FindidScreen from "./screens/FindidScreen";
import FindpasswordScreen from "./screens/FindpasswordScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import TabBar from "./components/tabBar";
import LoadingScreen from './components/Loading';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

//토큰 여부에 따라 무슨 화면 렌더링할지 정하는 컴포넌트
const MainNavigator = () => {
  const { token, loading } = useContext(UserContext);

  if (loading) return <LoadingScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      {token && (
      <Stack.Screen
        name="TabRoot"
        component={TabBar}
        options={{
          headerStyle: {
          backgroundColor: "#57B4BA",
          },
          headerTitleAlign: "center",
          headerTitle: () =>
            token ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons
                  name="paw"
                  size={22}
                  color="#FDFBEE"
                  style={{ marginRight: 6, marginTop: 4 }}
                />
                <Text style={{ color: "white", fontSize: 25, fontWeight: "bold" }}>
                  멍냥로드
                </Text>
              </View>
            ) : null,
        }}
      />
    )}

      {/* 비로그인 상태일 때만 인증 관련 스크린들 렌더 */}
      {!token && (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen}
            options={{ headerBackVisible: true }} />
          <Stack.Screen name="Signup" component={SignupScreen}
            options={{ headerBackVisible: true }} />
          <Stack.Screen name="Login" component={LoginScreen}
            options={{ headerBackVisible: true }} />
          <Stack.Screen name="Findid" component={FindidScreen}
            options={{ headerBackVisible: true }} />
          <Stack.Screen name="Findpassword" component={FindpasswordScreen}
            options={{ headerBackVisible: true }} />
        </>
      )}
    </Stack.Navigator>
  );
};

//토큰 상태 바뀌면 네비게이션 스택 초기화
const AppInner = () => {
  const { token } = useContext(UserContext);
  return (
    <NavigationContainer key={token ? "user" : "guest"}>
      <MainNavigator />
    </NavigationContainer>
  );
};

//앱 전역 환경 설정
const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
           <PetProvider>
            <AppInner />
          </PetProvider>
        </UserProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;



/*
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PostMock from "./screens/Community/PostDetailMock";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="PostMock" component={PostMock} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
*/


