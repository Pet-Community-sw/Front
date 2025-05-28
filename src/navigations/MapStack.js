import React from "react";
import DelegateScreen from "../screens/Map/DelegateScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const MapStack = () => {
  return(
    <Stack.Navigator>
      <Stack.Screen name="mapDelegate" component={DelegateScreen}></Stack.Screen>
    </Stack.Navigator>
  )
}

export default MapStack;