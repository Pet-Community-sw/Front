import React, {useState} from "react";
import {View, TextInput, Button, Text, StyleSheet} from "react-native";
import { useSignup } from "../hooks/useSignup";

const SignupScreen = () => {
  const [formData, setFormData] = useState({
    name: "", 
    email: "", 
    password: "", 
    phonenumber: "", 
  })

  const {mutate, isLoading, error} = useSignup();

  const handleChange = (name, value) => {
    setFormData({...formData, [name]: value });
  }
  const handleSubmit = () => {

  }

  return(
    <View style={styles.container}>
      <TextInput
      placeholder="이름"
      value={formData.name}
      onChangeText={(text) => handleChange("name", text)}
      style={styles.input}>
      </TextInput>

      <TextInput
      placeholder="email"
      value={formData.email}
      onChangeText={(text) => handleChange("email", text)}
      keyboardType="email-address"
      style={styles.input}>
      </TextInput>

      <TextInput
      placeholder="password"
      value={formData.password}
      onChangeText={(text) => handleChange("password", text)}
      secureTextEntry
      style={styles.input}>
      </TextInput>

      <TextInput
      placeholder="phonenumber"
      value={formData.phonenumber}
      onChangeText={(text) => handleChange("phonenumber", text)}
      keyboardType="phone-pad"
      style={styles.input}>
      </TextInput>

      <Button title={isLoading ? "가입중.." : "회원가입"}
      onPress={handleSubmit}
      disabled={isLoading}></Button>

      {error && <Text style={styles.errorText}>회원가입 실패: {error.message}</Text>}

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
  }
})

export default SignupScreen;