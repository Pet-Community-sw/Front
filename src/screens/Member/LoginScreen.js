import React, { useState, useContext } from "react";
import { View, TextInput, Alert, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLogin } from "../../hooks/useMember";
import { UserContext } from "../../context/User";
import CustomButton from "../../components/button";
import { StyleSheet } from "react-native";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(UserContext);
  const navigation = useNavigation();

  const { mutate: loginMutate, isLoading } = useLogin();

  const handleLogin = () => {
    console.log("로그인 시도:", email, password);
    loginMutate(
      { email, password },
      {
        onSuccess: async (data) => {
          console.log("✅ 서버 응답:", data);
          await login(data.accessToken, data.name, data.memberId); // ✅ 저장
          console.log("✅ context 저장 완료 후 token 확인:", data.accessToken);
        },
        onError: (error) => {
          Alert.alert("로그인 실패", error.message);
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
        <Text style={styles.findtext} onPress={() => navigation.navigate("Findid")}>
          아이디 찾기
        </Text>
        <Text style={styles.divider}>|</Text>
        <Text style={styles.findtext} onPress={() => navigation.navigate("Findpassword")}>
          비밀번호 찾기
        </Text>
      </View>
    </View>
  );
}

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
