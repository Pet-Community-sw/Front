import React, {useState} from "react";
import {View, TextInput, Text, StyleSheet, TouchableOpacity} from "react-native"
import Button from "../components/button";
import { useLogin } from "../hooks/useLogin";
import FindidScreen from "./FindidScreen";

const LoginScreen = ({navigation}) => {
  const [formData, setFormData] = useState({
    email: "", 
    password: "", 
  })

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  }

  const {mutate, isLoading, error } = useLogin();
  const handleSubmit = () => {
    mutate(formData, {
      onSuccess: () => {
        alert("로그인 성공!");
        navigation.navigate("Home");
      }, 
      onError: (err) => {
        alert("회원가입 실패: " + err.message);
      }, 
    });
  };

  return(
    <View style={styles.container}>
      <TextInput
        placeholder="email"
        value={formData.email}
        onChangeText={(text) => handleChange("email", text)}
        style={styles.input}
      ></TextInput>

      <TextInput
        placeholder="password"
        value={formData.password}
        onChangeText={(text) => handleChange("password", text)}
        secureTextEntry
        style={styles.input}
      ></TextInput>

      <Button
        title={isLoading ? "로그인중.." : "로그인"}
        onPress={handleSubmit}
        disabled={isLoading}>
      </Button>

      {error && <Text style={styles.errorText}>로그인 실패: {error.message}</Text>}

      <TouchableOpacity
        onPress={() => navigation.navigate('Findid')}
        style = {styles.findidbutton}>
        <Text style={styles.text}>아이디를 잊으셨나요?</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 20,
    justifyContent: "center", 
  }, 
  input: {
    height: 40, 
    borderBottomWidth: 1, 
    marginBottom: 10, 
    paddingHorizontal: 8, 
  }, 
  errorText: {
    color: "red", 
    marginTop: 10, 
  }, 
  findidbutton: {
    backgroundColor: "transparent", // 배경 투명
    alignItems: "center",
    padding: 10, 
    marginTop: 20, 
  },
  text: {
    textDecorationLine: "underline", // 밑줄
    color: "blue", // 원하는 색상
    fontSize: 16,
  },
  })

export default LoginScreen;