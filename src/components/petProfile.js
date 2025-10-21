//홈 화면 펫 프로필
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Button,
} from "react-native";
import {
  useModifyProfile,
  useRemoveProfile,
  useAddProfile,
  useViewProfile,
  useViewOneProfile,
  useViewPetBreeds,
} from "../hooks/useProfile";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { TextInput } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "../api/apiClient";
import DropDownPicker from "react-native-dropdown-picker";

const maxProfiles = 4;

const PetProfile = () => {
  const navigation = useNavigation();

  const { data: profiles = [], refetch: profileRefetch } = useViewProfile();
  const { data: breeds = [], refetch: breedsRefetch } = useViewPetBreeds();
  const [selectProfile, setSelectProfile] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [picking, setPicking] = useState(false);

  const { data: profileDetail, isLoading } = useViewOneProfile(
    selectProfile?.profileId
  );

  useFocusEffect(
    useCallback(() => {
      console.log("✅ useFocusEffect 진입 - refetch 실행");
      profileRefetch()
        .then((res) => {
          console.log("✅ refetch 성공:", res?.data);
        })
        .catch((err) => {
          console.log("❌ refetch 실패:", err.message);
        });
    }, []) // profileRefetch 의존성 제거하여 무한 루프 방지
  );

  const { mutate: modifyMutate } = useModifyProfile();
  const { mutate: removeMutate } = useRemoveProfile();
  const { mutate: addMutate } = useAddProfile();

  const [formData, setFormData] = useState({
    petImageUrl: "",
    petName: "",
    petBreedId: null,
    petBirthDate: "",
    avoidBreeds: [],
    extraInfo: "",
  });

  //입력창 초기화
  const resetData = () => {
    setFormData({
      petImageUrl: "",
      petName: "",
      petBreedId: null,
      petBirthDate: "",
      avoidBreeds: [],
      extraInfo: "",
    });
  };

  //수정 데이터
  const [editData, setEditData] = useState({
    petImageUrl: "",
    petName: "",
    petBreedId: null,
    petBirthDate: "",
    avoidBreeds: [],
    extraInfo: "",
  });

  // resetEditData 함수 제거 - useEffect에서 직접 처리

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [openAvoid, setOpenAvoid] = useState(false);

  // selectProfile이 변경될 때 자동으로 profileDetail이 업데이트됨 (useViewOneProfile 훅이 처리)
  // useEffect 제거 - useViewOneProfile 훅이 selectProfile.profileId를 의존성으로 사용

  const items = useMemo(() => {
    if (!Array.isArray(breeds)) return [];
    return breeds.map((b) => ({ label: b.petBreedName, value: b.petBreedId }));
  }, [breeds]);

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
        profileRefetch();
        navigation.navigate("Home");
      },
      onError: (err) => {
        Alert.alert("프로필 수정 실패: ", err.message);
      },
    });
  };

  useEffect(() => {
    if (editModalVisible && profileDetail) {
      setEditData({
        petImageUrl: profileDetail.petImageUrl || "",
        petName: profileDetail.petName || "",
        petBreedId: profileDetail.petBreedId || null,
        petBirthDate: profileDetail.petBirthDate || "",
        avoidBreeds: profileDetail.avoidBreeds || [],
        extraInfo: profileDetail.extraInfo || "",
      });
    }
  }, [editModalVisible, profileDetail]);

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
          profileRefetch();
          setAddModalVisible(false);
        }, 100);
      },
      onError: (err) => {
        Alert.alert("프로필 등록 실패: " + err.message);
      },
    });
  };

  useEffect(() => {
    if (addModalVisible) {
      breedsRefetch();
      resetData();
      setValue(null); 
      setOpen(false); 
      setOpenAvoid(false); 
    }
  }, [addModalVisible]);

  const handleImagePick = async (callback) => {
    if (picking) return; // 이미 실행 중이면 무시
    setPicking(true);

    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== "granted") {
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
        },
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
              profileRefetch();
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
        {profiles.map((profile) => {
          const finalUri = profile.petImageUrl
            ? `${BASE_URL}${profile.petImageUrl
                .replace(/^\/+/, "/")
                .replace(/\/profiles\/+profiles\//, "/profiles/")}`
            : undefined;

          // 이미지 URI 로그 제거 (콘솔 노이즈 방지)

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
                onError={(e) =>
                  console.log("❌ 이미지 로딩 실패:", e.nativeEvent)
                }
              />
              <Text style={styles.profileName}>{profile.petName}</Text>
            </TouchableOpacity>
          );
        })}
        
        {/* 플러스 버튼을 맨 뒤에 배치 */}
        <TouchableOpacity
          onPress={() => setAddModalVisible(true)}
          style={styles.plusButtonContainer}
        >
          <Text style={styles.plusText}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* 프로필 상세 모달 */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { overflow: "visible" }]}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#000" />
            ) : (
              <ScrollView>
                <Image
                  source={{ uri: profileDetail?.petImageUrl }}
                  style={styles.modalImage}
                />
                <Text style={styles.detailText}>
                  이름: {profileDetail?.petName}
                </Text>
                <Text style={styles.detailText}>
                  견종: {profileDetail?.petBreedId?.name}
                </Text>
                <Text style={styles.detailText}>
                  생일: {profileDetail?.petBirthDate}
                </Text>
                <Text style={styles.detailText}>
                  피해야 할 종: {profileDetail?.avoidBreeds?.name}
                </Text>
                <Text style={styles.detailText}>
                  기타 정보: {profileDetail?.extraInfo}
                </Text>
                <Button
                  title="수정"
                  onPress={() => {
                    setEditModalVisible(true);
                    setDetailModalVisible(false);
                  }}
                />
                <Button title="삭제" color="red" onPress={handledelete} />
                <Button
                  title="닫기"
                  onPress={() => setDetailModalVisible(false)}
                />
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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  반려동물의 정보를 입력해주세요 💕
                </Text>
              </View>
              {/* 이미지 선택 버튼 */}
              <TouchableOpacity
                style={styles.imageSelectBtn}
                onPress={pickImage}
              >
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
              <TextInput
                style={styles.inputRequired}
                placeholder="이름"
                value={formData.petName}
                onChangeText={(text) => handleChange("petName", text)}
              />
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={(callback) => {
                  const newValue = callback(value);
                  setValue(newValue);
                  handleChange("petBreedId", newValue);
                }}
                setItems={() => {}}
                placeholder="견종을 선택하세요"
                listMode="SCROLLVIEW"
                style={styles.dropdownRequired}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                zIndex={3000}
                zIndexInverse={1000}
              />

              <TextInput
                style={styles.inputRequired}
                placeholder="생일 (YYYY-MM-DD)"
                value={formData.petBirthDate}
                onChangeText={(text) => handleChange("petBirthDate", text)}
              />
              <DropDownPicker
                multiple={true}
                min={0}
                open={openAvoid}
                value={formData.avoidBreeds}
                items={items}
                setOpen={setOpenAvoid}
                setValue={(callback) => {
                  const newValues = callback(formData.avoidBreeds);
                  handleChange("avoidBreeds", newValues);
                }}
                setItems={() => {}}
                placeholder="피해야 할 견종을 선택하세요 (선택)"
                listMode="SCROLLVIEW"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                zIndex={2000}
                zIndexInverse={1000}
              />

              <TextInput
                style={styles.input}
                placeholder="기타 정보 (선택)"
                value={formData.extraInfo}
                onChangeText={(text) => handleChange("extraInfo", text)}
              />

              {/* 하단 버튼 */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={handleAddProfile}
                >
                  <Text style={styles.modalBtnText}>추가</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setAddModalVisible(false)}
                >
                  <Text style={[styles.modalBtnText, { color: "#666" }]}>
                    취소
                  </Text>
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
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 30 }}
            >
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

              <TextInput
                style={styles.input}
                placeholder="이름"
                value={editData.petName}
                onChangeText={(text) => handleEditData("petName", text)}
              />
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={(callback) => {
                  const newValue = callback(value);
                  setValue(newValue);
                  handleEditData("petBreedId", newValue);
                }}
                setItems={() => {}}
                placeholder="견종을 선택하세요"
                listMode="SCROLLVIEW"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                zIndex={3000}
                zIndexInverse={1000}
              />
              <TextInput
                style={styles.input}
                placeholder="생일 (YYYY-MM-DD)"
                value={editData.petBirthDate}
                onChangeText={(text) => handleEditData("petBirthDate", text)}
              />
              <DropDownPicker
                multiple={true}
                min={0}
                open={openAvoid}
                value={formData.avoidBreeds}
                items={items}
                setOpen={setOpenAvoid}
                setValue={(callback) => {
                  const newValues = callback(formData.avoidBreeds);
                  handleEditData("avoidBreeds", newValues);
                }}
                setItems={() => {}}
                placeholder="피해야 할 견종을 선택하세요 (선택)"
                listMode="SCROLLVIEW"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                zIndex={2000}
                zIndexInverse={1000}
              />
              <TextInput
                style={styles.input}
                placeholder="기타 정보 (선택)"
                value={editData.extraInfo}
                onChangeText={(text) => handleEditData("extraInfo", text)}
              />
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
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 2,
    paddingHorizontal: 4,
    marginTop: 0,
    flexWrap: "wrap",
  },
  profileCard: {
    width: 75,
    height: 75,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    marginTop: -45,
    marginLeft: -15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "#FFD8B1",
    marginBottom: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    fontFamily: "cute",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },

  imageSelectBtn: {
    backgroundColor: "#E4EFE7",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
  },
  imageSelectText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    maxHeight: "70%",
    flexGrow: 1,
    overflow: "visible",
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    height: 48,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
  },
  inputRequired: {
    height: 48,
    borderColor: "#9CA3AF", 
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: "#80CBC4",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelBtn: {
    backgroundColor: "#F3F4F6",
  },
  modalBtnText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  plusButtonContainer: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
    backgroundColor: "transparent",
    transform: [{ translateY: -13 }],
  },
  plusText: {
    fontSize: 25,
    color: "#7EC8C2",
    fontWeight: "500",
  },
  dropdown: {
    height: 48,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
  },
  dropdownContainer: {
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    maxHeight: 140,
  },
  dropdownText: {
    fontSize: 14,
    color: "#111827",
  },
  dropdownRequired: {
    height: 48,
    borderColor: "#9CA3AF", 
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
  },
  
  dropdownPlaceholder: {
    fontSize: 14,
    color: "#666",
  },
});

export default React.memo(PetProfile);
