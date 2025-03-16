import React, {useState} from "react";
import {View, TextInput, Text, StyleSheet} from "react-native"
import Button from "../components/button";
import { useLogin } from "../hooks/useLogin";

const LoginScreen = () => {
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
})

export default LoginScreen;