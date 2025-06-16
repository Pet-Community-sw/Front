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
import axios from "axios";
import { BASE_URL } from "../api/apiClient";
const maxProfiles = 4;

const PetProfile = () => {
  const navigation = useNavigation();

  const { data: profiles = [], refetch } = useViewProfile();
  const [selectProfile, setSelectProfile] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [picking, setPicking] = useState(false);

  const { data: profileDetail, isLoading } = useViewOneProfile(selectProfile?.profileId);

  useFocusEffect(
    useCallback(() => {
      console.log("✅ useFocusEffect 진입 - refetch 실행");
      refetch()
        .then((res) => {
          console.log("✅ refetch 성공:", res?.data);
        })
        .catch((err) => {
          console.log("❌ refetch 실패:", err.message);
        });
    }, [])
  );


  const { mutate: modifyMutate } = useModifyProfile();
  const { mutate: removeMutate } = useRemoveProfile();
  const { mutate: addMutate } = useAddProfile();

  const [formData, setFormData] = useState({
    petImageUrl: "",
    petName: "",
    petBreed: "",
    petBirthDate: "",
    avoidBreeds: "",
    extraInfo: ""
  });

  //입력창 초기화
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

  //수정 데이터
  const [editData, setEditData] = useState({
    petImageUrl: "",
    petName: "",
    petBreed: "",
    petBirthDate: "",
    avoidBreeds: "",
    extraInfo: ""
  });

  //수정 데이터 초기화
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

  useEffect(() => {
    if (selectProfile) {
      // viewOneProfileMutate(selectProfile.profileId);
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
    setFormData({ ...formData, [field]: value });
  };

  const handleEditData = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const openProfile = (profile) => {
    setSelectProfile(profile);
    setDetailModalVisible(true);
  };

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
  const handleAddProfile = () => {
    if ((profiles || []).length >= maxProfiles) {
      Alert.alert("프로필은 최대 4개까지 등록 가능합니다!");
      return;
    }
    addMutate(formData, {
      onSuccess: (data) => {
        Alert.alert(`프로필 추가 성공! Id: ${data.profileId}`);
        setTimeout(() => {
          refetch();
          setAddModalVisible(false);
        }, 100);
      },
      onError: (err) => {
        Alert.alert("프로필 등록 실패: " + err.message);
      }
    });
  };

  useEffect(() => {
    if (addModalVisible) {
      resetData();
    }
  }, [addModalVisible]);

  const handleImagePick = async (callback) => {
    if (picking) return; // 이미 실행 중이면 무시
    setPicking(true);

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert("권한 없음", "이미지 접근 권한이 필요합니다.");
        setPicking(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        callback(result.assets[0]);
      }
    } catch (err) {
      console.error("이미지 선택 중 오류:", err);
    } finally {
      setPicking(false);
    }
  };

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

      {/*프로필 목록*/}
      <View style={styles.profileContainer}>

        <TouchableOpacity
    onPress={() => setAddModalVisible(true)}
    style={styles.profileCard}
  >
    <View style={styles.plusCircle}>
      <Text style={styles.plusText}>＋</Text>
    </View>
    
  </TouchableOpacity>

        {profiles.map((profile) => {
          const finalUri = profile.petImageUrl
            ? `${BASE_URL}${profile.petImageUrl.replace(/^\/+/, "/").replace(/\/profiles\/+profiles\//, "/profiles/")}`
            : undefined;


          console.log("📸 최종 이미지 URI:", finalUri);

          return (
            <TouchableOpacity
              key={profile.profileId}
              onPress={() => openProfile(profile)}
              style={styles.profileCard}
            >
              <Image
                source={
                  finalUri
                    ? { uri: finalUri }
                    : require("../../assets/icon.png") // 로컬 기본 이미지
                }
                style={styles.profileImage}
                onError={(e) => console.log("❌ 이미지 로딩 실패:", e.nativeEvent)}
              />
              <Text style={styles.profileName}>{profile.petName}</Text>
            </TouchableOpacity>
          );
        })}
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
                <Text style={styles.detailText}>견종: {profileDetail?.petBreed?.name}</Text>
                <Text style={styles.detailText}>생일: {profileDetail?.petBirthDate}</Text>
                <Text style={styles.detailText}>피해야 할 종: {profileDetail?.avoidBreeds?.name}</Text>
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
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* 이미지 선택 버튼 */}
              <TouchableOpacity style={styles.imageSelectBtn} onPress={pickImage}>
                <Text style={styles.imageSelectText}>+ 프로필 사진 선택</Text>
              </TouchableOpacity>

              {/* 이미지 미리보기 */}
              {formData.petImageUrl?.uri && (
                <Image
                  source={{ uri: formData.petImageUrl.uri }}
                  style={styles.imagePreview}
                />
              )}

              {/* 입력 필드들 */}
              <TextInput style={styles.input} placeholder="이름" value={formData.petName} onChangeText={(text) => handleChange("petName", text)} />
              <TextInput style={styles.input} placeholder="견종" value={formData.petBreed} onChangeText={(text) => handleChange("petBreed", text)} />
              <TextInput style={styles.input} placeholder="생일 (YYYY-MM-DD)" value={formData.petBirthDate} onChangeText={(text) => handleChange("petBirthDate", text)} />
              <TextInput style={styles.input} placeholder="피해야 할 종" value={formData.avoidBreeds} onChangeText={(text) => handleChange("avoidBreeds", text)} />
              <TextInput style={styles.input} placeholder="기타 정보" value={formData.extraInfo} onChangeText={(text) => handleChange("extraInfo", text)} />

              {/* 하단 버튼 */}
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.modalBtn} onPress={handleAddProfile}>
                  <Text style={styles.modalBtnText}>추가</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setAddModalVisible(false)}>
                  <Text style={[styles.modalBtnText, { color: '#666' }]}>취소</Text>
                </TouchableOpacity>
              </View>
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
    justifyContent: "flex-start",
    padding: 10,
    paddingHorizontal: 6, 
    marginTop: 20,
  },
  profileCard: {
    width: 30,
    height: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "flex-start",
    margin: 5,
    marginTop: -20
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#FFD8B1",
    marginBottom: 10,
  },
  profileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    fontFamily: "cute",
  },
  

  imageSelectBtn: {
    backgroundColor: '#E4EFE7',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  imageSelectText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 16,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    maxHeight: '80%',
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
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: '#F9FAFB',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: '#80CBC4',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  modalBtnText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  plusCircle: {
  width: 45,
  height: 45,
  borderRadius: 30,
  borderWidth: 2,
  borderColor: "#CCD3CA",
  backgroundColor: "#FDFAF6",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 6,
},

plusText: {
  fontSize: 25,
  color: "#504B38",
  fontWeight: "bold",
},

});

export default PetProfile;
