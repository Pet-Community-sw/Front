import React, {useState} from "react";
import {View, TextInput, StyleSheet, Text} from "react-native"
import Button from "../components/button";
import { useFindid } from "../hooks/useFindid";

const FindidScreen = () => {
  const [formData, setFormData] = useState({
    phonenumber: "", 
  })

const handleChange = (field, value) => {
  setFormData({...formData, [field]: value});
}

const {mutate, isLoading, error} = useFindid();
const handleSubmit = () => {
  mutate(formData, {
    onSuccess: (data) => {
      Alert.alert("아이디 찾기 성공! 아이디: " + data.email);
    },
    onError: (err) => {
      Alert.alert("아이디 찾기 실패: " + err.message);
    }, 
  });
};

  return(
    <View style={styles.container}>
      <Text style={styles.label}>핸드폰 번호 입력</Text>
      <TextInput
        style={styles.input}
        placeholder="phone number"
        value={formData.phonenumber}
        keyboardType="phone-pad"
        onChangeText={(text) => handleChange("phonenumber", text)}>
      </TextInput>
      <Button title={isLoading ? "찾는중.. " : "아이디 찾기"}
      onPress={handleSubmit}></Button>
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
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
})

export default FindidScreen;