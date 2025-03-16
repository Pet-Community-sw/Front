import React, {useState} from "react";
import {View, TextInput, Text, StyleSheet} from "react-native";
import { useSignup } from "../hooks/useSignup";
import Button from "../components/button";

const SignupScreen = () => {
  const [formData, setFormData] = useState({
    name: "", 
    email: "", 
    password: "", 
    phonenumber: "", 
  })

  const handleChange = (field, value) => {
    setFormData({...formData, [field]: value });
  }
  
  //mutate 함수 가져와라
  const {mutate, isLoading, error} = useSignup();

  //mutate 실제 호출
  const handleSubmit = () => {
    mutate(formData, {
      onSuccess: () => {
        alert("회원가입 성공!");
        navigation.navigate("Login");
      }, 
      onError: (err) => {
        alert("회원가입 실패: " + err.message);
      }, 
    });
  };

  return(
    <View style={styles.container}>
      <TextInput
        placeholder="name"
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
        onChangeText={(text) => handleChange("phone number", text)}
        keyboardType="phone-pad"
        style={styles.input}>
      </TextInput>

      <Button
        title={isLoading ? "가입중.." : "회원가입"}
        onPress={handleSubmit}
        disabled={isLoading}>
      </Button>

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
  }, 
})

export default SignupScreen;