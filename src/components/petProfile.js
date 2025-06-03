//홈 화면 펫 프로필
import React, { useContext, useEffect, useState, } from "react";
import { useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image, ActivityIndicator, Alert, Button } from "react-native";
import { Entypo, AntDesign } from '@expo/vector-icons';
import { useModifyProfile, useRemoveProfile, useAddProfile, useViewProfile, useViewOneProfile } from "../hooks/useProfile";
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from "@react-navigation/native";
import { TextInput } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";

const maxProfiles = 4;

const PetProfile = () => {
  const navigation = useNavigation();

  //각각의 프로필 데이터 구조 분해 할당
  const { data: profiles = [], refetch } = useViewProfile();
  const [selectProfile, setSelectProfile] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  //특정 프로필 조회 데이터
  const { data: profileDetail, isLoading } = useViewOneProfile(selectProfile?.profileId);

  //이 컴포넌트가 화면에 다시 나타날 때마다 프로필 목록 새로 가져옴
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const { mutate: modifyMutate } = useModifyProfile();
  const { mutate: removeMutate } = useRemoveProfile();
  const { mutate: addMutate } = useAddProfile();

  //프로필 추가 데이터
  const [formData, setFormData] = useState({
    petImageUrl: "",
    petName: "",
    petBreed: "",
    petBirthDate: "",
    avoidBreeds: "",
    extraInfo: ""
  });

  //추가 중 닫기 버튼 눌렀을 때, 입력값 초기화
  const resetData = () => {
    setFormData({
      petImageUrl: "",
      petName: "",
      petBreed: "",
      petBirthDate: "",
      avoidBreeds: "",
      extraInfo: ""
    });
  };

  //프로필 수정 데이터
  const [editData, setEditData] = useState({
    petImageUrl: "",
    petName: "",
    petBreed: "",
    petBirthDate: "",
    avoidBreeds: "",
    extraInfo: ""
  });

  //수정 중 닫기 버튼 눌렀을 때, 입력값 초기화
  const resetEditData = () => {
    if (profileDetail) {
      setEditData({
        petImageUrl: profileDetail.petImageUrl || "",
        petName: profileDetail.petName || "",
        petBreed: profileDetail.petBreed || "",
        petBirthDate: profileDetail.petBirthDate || "",
        avoidBreeds: profileDetail.avoidBreeds || "",
        extraInfo: profileDetail.extraInfo || ""
      });
    }
  };

  //선택한 프로필 id 가져옴
  useEffect(() => {
    if (selectProfile) {
      // viewOneProfileMutate(selectProfile.profileId); // 주석 유지 (사용 안 함)
    }
  }, [selectProfile]);

  useEffect(() => {
    if (profileDetail) {
      setEditData({
        petImageUrl: profileDetail.petImageUrl || "",
        petName: profileDetail.petName || "",
        petBreed: profileDetail.petBreed || "",
        petBirthDate: profileDetail.petBirthDate || "",
        avoidBreeds: profileDetail.avoidBreeds || "",
        extraInfo: profileDetail.extraInfo || ""
      });
    }
  }, [profileDetail]);

  const handleChange = (field, value) => {
    const isKoreanOnly = /^[가-힣\s,]*$/.test(value);
    const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(value);

    if (
      (["petName", "petBreed", "avoidBreeds", "extraInfo"].includes(field) && !isKoreanOnly) ||
      (field === "petBirthDate" && !isDateValid)
    ) {
      Alert.alert(
        "입력 오류",
        field === "petBirthDate"
          ? "생일은 YYYY-MM-DD 형식으로 입력해주세요."
          : "한글만 입력할 수 있습니다."
      );
      return;
    }

    setFormData({ ...formData, [field]: value });
  };

  const handleEditData = (field, value) => {
    const isKoreanOnly = /^[가-힣\s,]*$/.test(value);
    const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(value);

    if (
      (["petName", "petBreed", "avoidBreeds", "extraInfo"].includes(field) && !isKoreanOnly) ||
      (field === "petBirthDate" && !isDateValid)
    ) {
      Alert.alert(
        "입력 오류",
        field === "petBirthDate"
          ? "생일은 YYYY-MM-DD 형식으로 입력해주세요."
          : "한글만 입력할 수 있습니다."
      );
      return;
    }

    setEditData({ ...editData, [field]: value });
  };

  //프로필 클릭 시 모달 열음
  const openProfile = (profile) => {
    setSelectProfile(profile);  //useEffect 실행
    setDetailModalVisible(true);
  };

  //프로필 수정
  const handlemodify = () => {
    modifyMutate(editData, {
      onSuccess: (data) => {
        Alert.alert("프로필 수정 성공!");
        refetch();
        navigation.navigate("Home");
      },
      onError: (err) => {
        Alert.alert("프로필 수정 실패: ", err.message);
      },
    });
  };

  useEffect(() => {
    if (editModalVisible && profileDetail) {
      resetEditData();
    }
  }, [editModalVisible]);

  //프로필 추가
  //invalidateQueries 서버 데이터 연동
  const handleAddProfile = () => {
    if ((profiles || []).length >= maxProfiles) {
      Alert.alert("프로필은 최대 4개까지 등록 가능합니다!");
    }
    addMutate(formData, {
      onSuccess: (data) => {
        Alert.alert(`프로필 추가 성공! Id: ${data.profileId}`);
        refetch();
        navigation.navigate("Home");
      },
      onError: (err) => {
        Alert.alert("프로필 등록 실패: " + err.message);
      }
    });
  };

  useEffect(() => {
    if (addModalVisible) {
      resetData(); // 열릴 때도 무조건 초기화
    }
  }, [addModalVisible]);

  // 공통 이미지 선택 함수
  const handleImagePick = async (callback) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log("권한 상태:", permissionResult.status); // 여기까지 로그 나옴?

    if (permissionResult.status !== 'granted') {
      Alert.alert("권한 없음", "이미지 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log("ImagePicker result:", result);

    if (!result.canceled && result.assets.length > 0) {
      callback(result.assets[0]);
    } else {
      console.log("취소되었거나 assets 없음");
    }
  };


  // 펫 이미지 업로드
  const pickImage = () => {
    handleImagePick((asset) => {
      setFormData((prevData) => ({
        ...prevData,
        petImageUrl: {
          uri: asset.uri,
          name: asset.uri.split("/").pop(),
        }
      }));
    });
  };

  // 펫 이미지 수정
  const pickEditImage = () => {
    handleImagePick((asset) => {
      setEditData((prevData) => ({
        ...prevData,
        petImageUrl: {
          uri: asset.uri,
          name: asset.uri.split("/").pop(),
        },
      }));
    });
  };

  //프로필 삭제
  const handledelete = () => {
    Alert.alert("정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        onPress: () => {
          removeMutate(selectProfile.profileId, {
            onSuccess: () => {
              Alert.alert("프로필이 삭제되었습니다.");
              refetch();
            },
            onError: (err) => {
              Alert.alert("오류: ", err.message);
            },
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={{ width: "100%", alignItems: "flex-start" }}>
        <Text style={styles.title}>Your Pets 💕</Text>
      </View>
      <TouchableOpacity style={styles.add} onPress={() => setAddModalVisible(true)}>
        <Entypo name="plus" size={24} color="#EC5228" />
      </TouchableOpacity>

      {/*프로필 목록, 감성 카드 UI로 스타일 적용*/}
      <View style={styles.profileContainer}>
        {profiles.map((profile) => (
          <TouchableOpacity
            key={profile.profileId}
            onPress={() => openProfile(profile)}
            style={styles.profileCard}
          >
            <Image source={{ uri: profile.petImageUrl }} style={styles.profileImage} />
            <Text style={styles.profileName}>{profile.petName}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 프로필 상세 모달 */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#000" />
            ) : (
              <ScrollView>
                <Image source={{ uri: profileDetail?.petImageUrl }} style={styles.modalImage} />
                <Text style={styles.detailText}>이름: {profileDetail?.petName}</Text>
                <Text style={styles.detailText}>견종: {profileDetail?.petBreed}</Text>
                <Text style={styles.detailText}>생일: {profileDetail?.petBirthDate}</Text>
                <Text style={styles.detailText}>피해야 할 종: {profileDetail?.avoidBreeds}</Text>
                <Text style={styles.detailText}>기타 정보: {profileDetail?.extraInfo}</Text>
                <Button title="수정" onPress={() => { setEditModalVisible(true); setDetailModalVisible(false); }} />
                <Button title="삭제" color="red" onPress={handledelete} />
                <Button title="닫기" onPress={() => setDetailModalVisible(false)} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* 프로필 추가 모달 */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Button title="이미지 선택" onPress={pickImage} />
              {formData.petImageUrl?.uri && (
                <Image
                  source={{ uri: formData.petImageUrl.uri }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 12,
                    alignSelf: "center",
                    marginBottom: 16,
                  }}
                />
              )}

              <TextInput style={styles.input} placeholder="이름" value={formData.petName} onChangeText={(text) => handleChange("petName", text)} />
              <TextInput style={styles.input} placeholder="견종" value={formData.petBreed} onChangeText={(text) => handleChange("petBreed", text)} />
              <TextInput style={styles.input} placeholder="생일 (YYYY-MM-DD)" value={formData.petBirthDate} onChangeText={(text) => handleChange("petBirthDate", text)} />
              <TextInput style={styles.input} placeholder="피해야 할 종" value={formData.avoidBreeds} onChangeText={(text) => handleChange("avoidBreeds", text)} />
              <TextInput style={styles.input} placeholder="기타 정보" value={formData.extraInfo} onChangeText={(text) => handleChange("extraInfo", text)} />
              <Button title="추가" onPress={handleAddProfile} />
              <Button title="취소" onPress={() => setAddModalVisible(false)} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 프로필 수정 모달 */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Button title="이미지 변경" onPress={pickEditImage} />
              {editData.petImageUrl?.uri && (
                <Image
                  source={{ uri: editData.petImageUrl.uri }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 12,
                    alignSelf: "center",
                    marginBottom: 16,
                  }}
                />
              )}

              <TextInput style={styles.input} placeholder="이름" value={editData.petName} onChangeText={(text) => handleEditData("petName", text)} />
              <TextInput style={styles.input} placeholder="견종" value={editData.petBreed} onChangeText={(text) => handleEditData("petBreed", text)} />
              <TextInput style={styles.input} placeholder="생일 (YYYY-MM-DD)" value={editData.petBirthDate} onChangeText={(text) => handleEditData("petBirthDate", text)} />
              <TextInput style={styles.input} placeholder="피해야 할 종" value={editData.avoidBreeds} onChangeText={(text) => handleEditData("avoidBreeds", text)} />
              <TextInput style={styles.input} placeholder="기타 정보" value={editData.extraInfo} onChangeText={(text) => handleEditData("extraInfo", text)} />
              <Button title="저장" onPress={handlemodify} />
              <Button title="취소" onPress={() => setEditModalVisible(false)} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  profileContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 10,
  },
  profileCard: {
    width: 140,
    height: 180,
    backgroundColor: "#FFF5E4",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    padding: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#FFD8B1",
    marginBottom: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    textAlign: "left",
    alignSelf: "flex-start",
    width: "100%",
    paddingLeft: 0,
    marginLeft: 0,
    marginTop: 15,
    marginBottom: -8,
  },
  add: {
    padding: 5,
    backgroundColor: "transparent",
    borderRadius: 50,
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 20,
    top: -10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fefefe',
  },
});

export default PetProfile;
