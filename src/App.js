import "react-native-gesture-handler";
import React, { useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View, Text, Platform } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as Notifications from "expo-notifications";
import { UserProvider, UserContext } from "./context/User";
import { PetProvider } from "./context/PetProfiles";
import useNotification from "./hooks/useNotification";
import { ChatProvider } from "./context/Chatting";
import { NotificationProvider } from "./context/Notification";

import SignupScreen from "./screens/SignupScreen";
import LoginScreen from "./screens/LoginScreen";
import FindidScreen from "./screens/FindidScreen";
import FindpasswordScreen from "./screens/FindpasswordScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import NotificationScreen from "./screens/NotificationListScreen";
import TabBar from "./components/tabBar";
import LoadingScreen from "./components/Loading";

import Mock from "./screens/MockUI";

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
              headerStyle: { backgroundColor: "#57B4BA" },
              headerTitleAlign: "center",
              headerTitle: () => (
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
              ),
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
  return (
    <GestureHandlerRootView style={styles.container}>
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
