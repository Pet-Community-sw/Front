import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";


const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="paw" size={100} color="#015551" style={styles.icon} />

      <Text style={styles.title}>멍냥로드에 오신 것을 환영합니다!</Text>

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
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "black",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    width: "80%",
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },  
  signupBtn: {
    backgroundColor: "#E78F81",
  },
  loginBtn: {
    backgroundColor: "#99BC85",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default WelcomeScreen;
