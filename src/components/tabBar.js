import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import CommunityStack from "../navigations/CommunityStack";
import ChattingStack from "../navigations/ChattingStack";
import MapScreen from "../screens/Map/MapScreen";
import { View, Text } from "react-native";

import Mock from "../screens/MockUI";

const Tab = createBottomTabNavigator();

const TabBar = () => {
  console.log("✅ TabBar 진입");
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          let IconComponent = MaterialIcons;

          if (route.name === "Home") {
            iconName = "pets";
            IconComponent = MaterialIcons;
          }
          else if (route.name === "Community") {
            iconName = "chatbubble-ellipses-sharp";
            IconComponent = Ionicons;
          }
          else if (route.name === "Map") {
            iconName = "map-marker";
            IconComponent = MaterialCommunityIcons;
          }
          else if (route.name === "Chatting") {
            iconName = "people";
            IconComponent = Ionicons;
          }
          return <IconComponent name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: "#7EC8C2",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen}
        options={{
          headerShown: true,
          headerTitleAlign: "center",
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="paw"
                size={30}
                color="#FDFBEE"
                style={{ marginRight: 6, marginTop: 4 }}
              />
              <Text style={{ color: "white", fontSize: 40, fontFamily: 'cute' }}>
                멍냥로드
              </Text>
            </View>
          ),
          headerStyle: {
            backgroundColor: "#57B4BA",
          },
        }}></Tab.Screen>
      <Tab.Screen name="Community" component={CommunityStack}></Tab.Screen>
      <Tab.Screen name="Map" component={MapScreen}
        options={{
          headerShown: true,
          headerTitleAlign: "center",
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "white", fontSize: 40, fontFamily: 'cute' }}>
                지도
              </Text>
            </View>
          ),
          headerStyle: {
            backgroundColor: "#57B4BA",
          },
        }}></Tab.Screen>
      <Tab.Screen name="Chatting" component={ChattingStack}></Tab.Screen>
    </Tab.Navigator>


  )
}

export default TabBar;