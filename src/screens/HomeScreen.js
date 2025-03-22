import React from "react";
import { View, Text, StyleSheet } from "react-native";

const HomeScreen = () => {
  return(
    <View style={styles.container}> 
      <Text>홈화면이에용</Text>
    </View>
  )
}

styles = StyleSheet.create({
  container: {
    flex: 1, 
  }
})

export default HomeScreen;