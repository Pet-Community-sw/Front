import React, { useState, useContext } from "react";
import { View, TextInput, Alert, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLogin } from "../../hooks/useMember";
import CustomButton from "../../components/button";
import { UserContext } from "../../context/User";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const { login } = useContext(UserContext); // ✅ Zustand 대신 Context 사용
  const { mutate: loginMutate, isLoading } = useLogin();

  const handleLogin = () => {
    console.log("로그인 시도:", email, password);
    loginMutate(
      { email, password },
      {
        onSuccess: async (data) => {
          console.log("✅ 서버 응답:", data);
          await login(data.accessToken);
          console.log("✅ Context 저장 완료 후 token 확인:", data.accessToken);
        },
        onError: (error) => {
          const message =
            error.response?.data?.message ||
            error.message ||
            "로그인 중 오류 발생";
          Alert.alert("로그인 실패", message);
          console.log("에러 상세:", error.response?.data || error.message);
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="이메일"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호"
        secureTextEntry
      />

      <CustomButton title="로그인" onPress={handleLogin} disabled={isLoading} />

      <View style={styles.findContainer}>
        <Text
          style={styles.findtext}
          onPress={() => navigation.navigate("Findid")}
        >
          아이디 찾기
        </Text>
        <Text style={styles.divider}>|</Text>
        <Text
          style={styles.findtext}
          onPress={() => navigation.navigate("Findpassword")}
        >
          비밀번호 찾기
        </Text>
      </View>
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
  findtext: {
    textDecorationLine: "underline",
    color: "#4A7B9D",
    fontSize: 15,
    fontFamily: "font",
  },
  findContainer: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    marginHorizontal: 8,
    color: "#999",
    fontSize: 15,
    fontFamily: "font",
  },
});

export default LoginScreen;
