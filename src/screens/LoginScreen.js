import React, {useContext, useEffect, useState} from "react";
import {View, TextInput, Text, StyleSheet, TouchableOpacity, Alert} from "react-native"
import Button from "../components/button";
import { useLogin } from "../hooks/useLogin";
import FindidScreen from "./FindidScreen";
import FindpasswordScreen from "./FindpasswordScreen";
import { UserContext } from "../context/User";


const LoginScreen = ({navigation}) => {
  const {token, login } = useContext(UserContext);
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
      // LoginScreen.jsx
onSuccess: (data) => {
  if (data && data.accessToken) {
    Alert.alert("로그인 성공!");
    login(data.accessToken, data.memberId, data.nickname);

    // 🔥 살짝 delay 줘서 navigation 타이밍 안정화
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "TabRoot" }],
      });
    }, 0);
  } else {
    Alert.alert("로그인 실패: 유효한 토큰이 없습니다.");
  }

      },
      onError: (err) => {
        Alert.alert("로그인 실패", err.response?.data?.message || err.message);
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
        style = {styles.findbutton}>
        <Text style={styles.text}>아이디를 잊으셨나요?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => navigation.navigate('Findpassword')}
        style = {styles.findbutton}>
        <Text style={styles.text}>비밀번호를 잊으셨나요?</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 20,
    justifyContent: "center", 
    backgroundColor: "white"
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
  findbutton: {
    backgroundColor: "transparent",
    alignItems: "center",
    padding: 10, 
    marginTop: 20, 
  },
  text: {
    textDecorationLine: "underline", 
    color: "black", 
    fontSize: 15,
  },
  })

export default LoginScreen;