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

import HomeScreen from "./screens/HomeScreen";
import SignupScreen from "./screens/SignupScreen";
import LoginScreen from "./screens/LoginScreen";
import FindidScreen from "./screens/FindidScreen";
import FindpasswordScreen from "./screens/FindpasswordScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import TabBar from "./components/tabBar";
import LoadingScreen from './components/Loading';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

const MainNavigator = () => {
  const { token, loading } = useContext(UserContext);

  if (loading) return <LoadingScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      {/* ✅ TabRoot는 항상 등록 */}
      <Stack.Screen
        name="TabRoot"
        component={TabBar}
        options={{
          headerShown: token ? true : false, // 로그인 상태에서만 헤더 보이게
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

      {/* ✅ 비로그인 상태일 때만 인증 관련 스크린들 렌더 */}
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


const AppInner = () => {
  const { token } = useContext(UserContext);

  return (
    <NavigationContainer key={token ? "user" : "guest"}>
      <MainNavigator />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <UserProvider>
        <QueryClientProvider client={queryClient}>
            <PetProvider>
            <AppInner />
            </PetProvider>
          
        </QueryClientProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App; 
