import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";


const Tab = createBottomTabNavigator();

const TabBar = () => {
  return(
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "pets";

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 50,
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen}></Tab.Screen>
    </Tab.Navigator>
  )
}

export default TabBar;