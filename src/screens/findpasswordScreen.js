import React, { useState } from "react";
import { View, Text, TextInput, ActivityIndicator, StyleSheet } from "react-native";
import Button from "../components/button";
import { useSendemail } from "../hooks/useSendemail";
import { useResetpassword } from "../hooks/useResetpassword";
import { useVerify } from "../hooks/useVerify";

const FindpasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);

  // 1. 이메일로 인증번호 전송
  const { mutate: sendEmail, isLoading: sendingEmail } = useSendemail();
  const handleSendEmail = () => {
    sendEmail({ email }, {
      onSuccess: () => setStep(2),
      onError: (error) => Alert.alert(`에러 발생: ${error.message}`),
    });
  };

  // 2. 인증번호 검증
  const { mutate: verify, isLoading: verifying } = useVerify();
  const handleVerifyCode = () => {
    verify({ email, code: verifyCode }, {
      onSuccess: () => setStep(3),
      onError: (error) => Alert.alert(`인증 실패: ${error.message}`),
    });
  };

  // 3. 비밀번호 재설정
  const { mutate: resetPwd, isLoading: resetting } = useResetpassword();
  const handleResetPassword = () => {
    resetPwd({ email, newPassword }, {
      onSuccess: () => Alert.alert("비밀번호가 성공적으로 변경되었습니다."),
      onError: (error) => Alert.alert(`비밀번호 변경 실패: ${error.message}`),
    });
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <>
          <Text style={styles.label}>이메일 입력</Text>
          <TextInput
            placeholder="your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <Button title="전송" mode="contained" onPress={handleSendEmail} disabled={sendingEmail}>
            {sendingEmail ? <ActivityIndicator color="#fff" /> : "인증번호 전송"}
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.label}>인증번호 입력</Text>
          <TextInput
            value={verifyCode}
            onChangeText={setVerifyCode}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleVerifyCode} disabled={verifying}>
            {verifying ? <ActivityIndicator color="#fff" /> : "인증번호 확인"}
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.label}>새로운 비밀번호 입력</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={styles.input}
          />
          <Button mode="contained" onPress={handleResetPassword} disabled={resetting}>
            {resetting ? <ActivityIndicator color="#fff" /> : "비밀번호 변경"}
          </Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
});

export default FindpasswordScreen;