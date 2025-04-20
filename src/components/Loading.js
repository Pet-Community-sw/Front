// components/LoadingScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../../assets/pet-loading.json")}
        autoPlay
        loop
        style={{ width: 180, height: 180 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingScreen;
