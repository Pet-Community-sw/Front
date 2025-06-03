import "react-native-gesture-handler";
import React, { useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View, Text, Platform, StatusBar } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as Notifications from "expo-notifications";
import { UserProvider, UserContext } from "./context/User";
import { PetProvider } from "./context/PetProfiles";
import { useNotification } from "./hooks/useNotification";
import { ChatProvider } from "./context/Chatting";
import { NotificationProvider } from "./context/Notification";
import { useFonts } from "expo-font";

import WelcomeScreen from "./screens/Member/WelcomeScreen";
import SignupScreen from "./screens/Member/SignupScreen";
import LoginScreen from "./screens/Member/LoginScreen";
import FindidScreen from "./screens/Member/FindidScreen";
import FindpasswordScreen from "./screens/Member/FindpasswordScreen";

import NotificationScreen from "./screens/Member/NotificationListScreen";
import TabBar from "./components/tabBar";
import LoadingScreen from "./components/Loading";

import MockUI from "./screens/MockUI";

//npx expo run:android

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

// 알림 권한 요청 및 안드로이드 채널 설정
const useNotificationSetup = () => {
  useEffect(() => {
    const setup = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert("알림 권한이 없습니다.");
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: '기본 채널',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
    };

    setup();
  }, []);
};

// SSE 알림 수신 후 알림 표시
function Notification() {
  useNotification(async (data) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 알림 도착",
        body: data.message,
        sound: "default",
      },
      trigger: null,
    });
  });
  return null;
}

// 로그인 여부에 따라 화면 구성
const MainNavigator = () => {
  const { token, loading } = useContext(UserContext);

  if (loading) return <LoadingScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token && (
        <>
          <Stack.Screen
            name="TabRoot"
            component={TabBar}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="NotificationList"
            component={NotificationScreen}
            options={{ title: "알림 목록" }}
          />
        </>
      )}

      {!token && (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Findid" component={FindidScreen} />
          <Stack.Screen name="Findpassword" component={FindpasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

// 앱 내부 라우팅 및 알림 초기 설정
const AppInner = () => {
  const { token } = useContext(UserContext);
  useNotificationSetup();
  return (
    <NavigationContainer key={token ? "user" : "guest"}>
      {token && <Notification />}
      <MainNavigator />
    </NavigationContainer>
  );
};

// 앱 전역 설정 
const App = () => {
  const [fontsLoaded] = useFonts({
    font: require("./assets/fonts/font.ttf"),
    fontBold: require("./assets/fonts/fontBold.ttf"),
    fontExtra: require("./assets/fonts/fontExtra.ttf"),
    cute: require("./assets/fonts/cute.ttf"),
  });

  if (!fontsLoaded) return <LoadingScreen />;

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar
        backgroundColor="black"
        barStyle="light-content"  // ← 흰 배경이면 dark-content / 어두운 배경이면 light-content
      />
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <NotificationProvider>
            <PetProvider>
              <ChatProvider>
                <AppInner />
              </ChatProvider>
            </PetProvider>
          </NotificationProvider>
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
