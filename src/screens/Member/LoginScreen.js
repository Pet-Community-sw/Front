import React, { useContext, useEffect, useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLogin } from "../../hooks/useMember";
import FindidScreen from "./FindidScreen";
import FindpasswordScreen from "./FindpasswordScreen";
import { UserContext } from "../../context/User";
import CustomButton from "../../components/button";

const LoginScreen = ({ navigation }) => {
  const { token, login } = useContext(UserContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const { mutate, isLoading, error } = useLogin();

  const handleSubmit = () => {
    mutate(formData, {
      onSuccess: (data) => {
        if (data && data.accessToken) {
          Alert.alert("로그인 성공!");
          login(data.accessToken, data.memberId, data.nickname);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐾 로그인</Text>
      <Text style={styles.subtitle}>멍냥로드에 오신 것을 환영합니다!</Text>

      <TextInput
        placeholder="이메일"
        value={formData.email}
        onChangeText={(text) => handleChange("email", text)}
        style={styles.input}
      />

      <TextInput
        placeholder="비밀번호"
        value={formData.password}
        onChangeText={(text) => handleChange("password", text)}
        secureTextEntry
        style={styles.input}
      />

      <CustomButton
        title={isLoading ? "로그인중.." : "로그인"}
        onPress={handleSubmit}
        disabled={isLoading}
      />

      {error && <Text style={styles.errorText}>로그인 실패: {error.message}</Text>}

      <TouchableOpacity
        onPress={() => navigation.navigate("Findid")}
        style={styles.findbutton}
      >
        <Text style={styles.findtext}>아이디를 잊으셨나요?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Findpassword")}
        style={styles.findbutton}
      >
        <Text style={styles.findtext}>비밀번호를 잊으셨나요?</Text>
      </TouchableOpacity>
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
    fontSize: 36,
    fontFamily: "fontExtra",
    color: "#333",
    marginBottom: 8,
    lineHeight: 55, 
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "font",
    color: "#666",
    marginBottom: 28,
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
  },
  findbutton: {
    marginTop: 16,
    paddingVertical: 6,
  },
  findtext: {
    textDecorationLine: "underline",
    color: "#4A7B9D",
    fontSize: 15,
    fontFamily: "font",
  },
});

export default LoginScreen;
