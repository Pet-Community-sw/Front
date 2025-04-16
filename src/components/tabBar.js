import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import CommunityScreen from "../screens/CommunityScreen";
import MapScreen from "../screens/MapScreen";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import ChattingScreen from "../screens/ChattingScreen";


const Tab = createBottomTabNavigator();

const TabBar = () => {
  return(
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          let IconComponent = MaterialIcons;

          if (route.name === "HomeTab") {
            iconName = "pets"; 
            IconComponent = MaterialIcons;
          }
          else if(route.name === "Community") {
            iconName = "chatbubble-ellipses-sharp";
            IconComponent = Ionicons;
          }
          else if(route.name === "Map") {
            iconName = "map-marker-star";
            IconComponent = MaterialCommunityIcons;
          }
          else if(route.name === "Chatting") {
            iconName = "people";
            IconComponent = Ionicons;
          }
          return <IconComponent name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 50,
          paddingBottom: 5,
        },
        tabBarActiveTintColor: "#6A9C89", 
        tabBarInactiveTintColor: "#BDBDBD", 
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen}></Tab.Screen>
      <Tab.Screen name="Community" component={CommunityScreen}></Tab.Screen>
      <Tab.Screen name="Map" component={MapScreen}></Tab.Screen>
      <Tab.Screen name="Chatting" component={ChattingScreen}></Tab.Screen>
    </Tab.Navigator>

    
  )
}

export default TabBar;