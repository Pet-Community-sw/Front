import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useSendemail } from "../../hooks/useMember";
import { useResetpassword } from "../../hooks/useMember";
import { useVerify } from "../../hooks/useMember";
import CustomButton from "../../components/button";

const FindpasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);

  const { mutate: sendEmail, isLoading: sendingEmail } = useSendemail();
  const handleSendEmail = () => {
    sendEmail(
      { email },
      {
        onSuccess: () => setStep(2),
        onError: (error) => Alert.alert(`에러 발생: ${error.message}`),
      }
    );
  };

  const { mutate: verify, isLoading: verifying } = useVerify();
  const handleVerifyCode = () => {
    verify(
      { email, code: verifyCode },
      {
        onSuccess: () => setStep(3),
        onError: (error) => Alert.alert(`인증 실패: ${error.message}`),
      }
    );
  };

  const { mutate: resetPwd, isLoading: resetting } = useResetpassword();
  const handleResetPassword = () => {
    resetPwd(
      { newPassword },
      {
        onSuccess: () => Alert.alert("비밀번호가 성공적으로 변경되었습니다."),
        onError: (error) => Alert.alert(`비밀번호 변경 실패: ${error.message}`),
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 비밀번호 재설정</Text>
      <Text style={styles.subtitle}>이메일 인증 후 새 비밀번호를 설정하세요</Text>

      {step === 1 && (
        <>
          <TextInput
            placeholder="이메일 입력"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <CustomButton title="인증번호 전송" onPress={handleSendEmail} disabled={sendingEmail} />
        </>
      )}

      {step === 2 && (
        <>
          <TextInput
            placeholder="인증번호 입력"
            value={verifyCode}
            onChangeText={setVerifyCode}
            keyboardType="numeric"
            style={styles.input}
          />
          <CustomButton title="인증번호 확인" onPress={handleVerifyCode} disabled={verifying} />
        </>
      )}

      {step === 3 && (
        <>
          <TextInput
            placeholder="새 비밀번호 입력"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={styles.input}
          />
          <CustomButton title="비밀번호 변경" onPress={handleResetPassword} disabled={resetting} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 30,
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
});

export default FindpasswordScreen;
