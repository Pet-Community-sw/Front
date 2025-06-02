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
import Button from "../components/button";
import { useNavigation } from "@react-navigation/native";

const SignupScreen = () => {
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
        console.log("회원가입 실패:", err);
      },
    });
  };

  // 공통 이미지 선택 함수
  const handleImagePick = async (callback) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      alert("이미지 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      callback(result.assets[0].uri);
    } else {
      console.log("사용자가 선택을 취소함");
    }
  };

  // 회원 이미지 업로드
  const pickImage = () => {
    handleImagePick((imageUri) => {
      setFormData((prevData) => ({
        ...prevData,
        memberImageUrl: imageUri,
      }));
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="name"
        value={formData.name}
        onChangeText={(text) => handleChange("name", text)}
        style={styles.input}
      ></TextInput>

      <TextInput
        placeholder="email"
        value={formData.email}
        onChangeText={(text) => handleChange("email", text)}
        keyboardType="email-address"
        style={styles.input}
      ></TextInput>

      <TextInput
        placeholder="password"
        value={formData.password}
        onChangeText={(text) => handleChange("password", text)}
        secureTextEntry
        style={styles.input}
      ></TextInput>

      <TextInput
        placeholder="phone number"
        value={formData.phoneNumber}
        onChangeText={(text) => handleChange("phoneNumber", text)}
        //keyboardType="phone-pad"
        style={styles.input}
      ></TextInput>

      <TouchableOpacity
        onPress={pickImage}
        style={[styles.input, { backgroundColor: "#9ACBD0" }]}
      >
        <Text style={{ color: "white", fontSize: 20, textAlign: "center" }}>
          이미지 등록
        </Text>
      </TouchableOpacity>

      {/* 추가한 이미지 미리보기 */}
      {formData.memberImageUrl ? (
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: "#666", marginBottom: 6 }}>
            선택된 파일: {formData.memberImageUrl.split("/").pop()}
          </Text>
          <Image
            source={{ uri: formData.memberImageUrl }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#ccc",
            }}
          />
        </View>
      ) : null}

      <Button
        title={isLoading ? "가입중.." : "회원가입"}
        onPress={handleSubmit}
        disabled={isLoading}
      ></Button>

      {error && (
        <Text style={styles.errorText}>회원가입 실패: {error.message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "white",
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
});

export default SignupScreen;
