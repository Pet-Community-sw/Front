import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSignup } from "../../hooks/useMember";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../../components/button";
import * as ImagePicker from 'expo-image-picker';
import { useEffect } from "react";

const SignupScreen = () => {

  useEffect(() => {
    (async () => {
      const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log("현재 권한 상태:", status, "재요청 가능:", canAskAgain);
    })();
  }, []);

  useEffect(() => {
  console.log("isLoading:", isLoading);
}, [isLoading]);



  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    memberImageUrl: "",
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  const navigation = useNavigation();

  //mutate 함수 가져와라
  const { mutate, isLoading, error } = useSignup();

  //mutate 실제 호출
  const handleSubmit = () => {
    console.log("회원가입 요청 보냄");
    mutate(formData, {
      onSuccess: () => {
        Alert.alert("회원가입 성공!");
        navigation.navigate("Login");
        console.log("token");
      },
      onError: (err) => {
        console.log("회원가입 실패:", err.message);
      },
    });
  };


  // 회원 이미지 업로드
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("권한 필요", "이미지 접근 권한을 허용해주세요.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setFormData((prev) => ({
        ...prev,
        memberImageUrl: {
          uri: asset.uri,
          name: asset.uri.split("/").pop(), // 파일 이름 추출
        },
      }));
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>
      <Text style={styles.subtitle}>멍냥로드에 오신 것을 환영합니다!</Text>

      <TextInput
        placeholder="이름"
        value={formData.name}
        onChangeText={(text) => handleChange("name", text)}
        style={styles.input}
      />

      <TextInput
        placeholder="이메일"
        value={formData.email}
        onChangeText={(text) => handleChange("email", text)}
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="비밀번호"
        value={formData.password}
        onChangeText={(text) => handleChange("password", text)}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        placeholder="전화번호"
        value={formData.phoneNumber}
        onChangeText={(text) => handleChange("phoneNumber", text)}
        style={styles.input}
      />

      <TouchableOpacity
        onPress={pickImage}
        style={[styles.imageButton]}
      >
        <Text style={styles.imageButtonText}>이미지 등록</Text>
      </TouchableOpacity>

      {formData.memberImageUrl ? (
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: "#666", marginBottom: 6 }}>
            선택된 파일: {formData.memberImageUrl.name}
          </Text>
          <Image
            source={{ uri: formData.memberImageUrl.uri }}
            style={styles.imagePreview}
          />
        </View>
      ) : null}

      <CustomButton
        title={isLoading ? "가입중.." : "회원가입"}
        onPress={handleSubmit}
        disabled={isLoading}
      />

      {error && (
        <Text style={styles.errorText}>회원가입 실패: {error.message}</Text>
      )}
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
  imageButton: {
    width: "90%",
    paddingVertical: 12,
    backgroundColor: "#F7B4C3",
    borderRadius: 12,
    marginBottom: 20,
  },
  imageButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "font",
    textAlign: "center",
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});

export default SignupScreen;
