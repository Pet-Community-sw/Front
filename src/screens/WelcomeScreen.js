import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="paw"
        size={100}
        color="#57B4BA"
        style={styles.icon}
      />

      <Text style={styles.title}>멍냥로드</Text>

      <Text style={styles.subtitle}>오늘도 산책 함께할까요? 💕</Text>

      <TouchableOpacity
        style={[styles.button, styles.signupBtn]}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={styles.buttonText}>회원가입 🐶</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.loginBtn]}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>로그인 🐱</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white", 
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 45,
    fontFamily: "fontExtra", 
    color: "#333",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: "font",
    color: "#666",
    marginBottom: 40,
  },
  button: {
    width: "80%",
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  signupBtn: {
    backgroundColor: "#7EC8C2", // 민트
    marginBottom: 15, 
  },
  loginBtn: {
    backgroundColor: "#F7B4C3", // 핑크
  },
  buttonText: {
    color: "#333",
    fontSize: 20,
    fontFamily: "cute",
  },
});

export default WelcomeScreen;
