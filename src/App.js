import "react-native-gesture-handler";
import React, { useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, StatusBar, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { UserProvider, UserContext } from "./context/User";
import { PetProvider } from "./context/PetProfiles";
import { useNotification } from "./hooks/useNotification";
import { ChatProvider } from "./context/Chatting";
import { NotificationProvider } from "./context/Notification";
import { useFonts } from "expo-font";
import { SelectProfileProvider } from "./context/SelectProfile";

// Screens
import WelcomeScreen from "./screens/Member/WelcomeScreen";
import SignupScreen from "./screens/Member/SignupScreen";
import LoginScreen from "./screens/Member/LoginScreen";
import FindidScreen from "./screens/Member/FindidScreen";
import FindpasswordScreen from "./screens/Member/FindpasswordScreen";
import NotificationScreen from "./screens/Member/NotificationListScreen";
import TabBar from "./components/tabBar";
import LoadingScreen from "./components/Loading";

// 네비게이터
const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

// 알림 권한 요청 및 채널 설정
const useNotificationSetup = () => {
  useEffect(() => {
    const setup = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("알림 권한이 없습니다.");
        return;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "기본 채널",
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
    };

    setup();
  }, []);
};

// SSE 알림 수신 후 표시
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

// 내부 라우팅
const AppInner = () => {
  console.log("🚀 App 컴포넌트 진입");

  const { token, loading } = useContext(UserContext);
  // useNotificationSetup();

  console.log("📦 AppInner 렌더링 중, token 상태:", token);
  console.log("📦 token typeof:", typeof token);

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer key={token ? "user" : "guest"}>
      {token && <Notification />}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="TabRoot" component={TabBar} />
            <Stack.Screen
              name="NotificationList"
              component={NotificationScreen}
              options={{ title: "알림 목록" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Findid" component={FindidScreen} />
            <Stack.Screen name="Findpassword" component={FindpasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// 최상위 앱
const App = () => {
  const [fontsLoaded] = useFonts({
    font: require("./assets/fonts/font.ttf"),
    fontBold: require("./assets/fonts/fontBold.ttf"),
    fontExtra: require("./assets/fonts/fontExtra.ttf"),
    cute: require("./assets/fonts/cute.ttf"),
  });

  if (!fontsLoaded) return <LoadingScreen />;

  console.log("🧩 AppInner 렌더 준비");

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar
        backgroundColor="black"
        barStyle="light-content"
      />
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <NotificationProvider>
            <SelectProfileProvider>
              <PetProvider>
                <ChatProvider>
                  <AppInner />
                </ChatProvider>
              </PetProvider>
            </SelectProfileProvider>
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
