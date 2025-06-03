import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Alert,
} from "react-native";
import { useFindId } from "../../hooks/useMember";
import CustomButton from "../../components/button";

const FindidScreen = () => {
  const [formData, setFormData] = useState({
    phonenumber: "",
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const { mutate, isLoading, error } = useFindId();

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 아이디 찾기</Text>
      <Text style={styles.subtitle}>가입한 전화번호를 입력해주세요</Text>

      <TextInput
        style={styles.input}
        placeholder="전화번호"
        value={formData.phonenumber}
        keyboardType="phone-pad"
        onChangeText={(text) => handleChange("phonenumber", text)}
      />

      <CustomButton
        title={isLoading ? "찾는중.." : "아이디 찾기"}
        onPress={handleSubmit}
      />

      {error && <Text style={styles.errorText}>에러: {error.message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 32,
    fontFamily: "fontExtra",
    color: "#333",
    marginBottom: 8,
    lineHeight: 50, 
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "font",
    color: "#666",
    marginBottom: 24,
  },
  input: {
    width: "90%",
    height: 50,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 14,
    fontFamily: "font",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    fontSize: 14,
  },
});

export default FindidScreen;
