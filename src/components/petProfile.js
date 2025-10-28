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
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#7EC8C2" />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>🐕 펫 프로필 상세</Text>
                </View>

                <View style={styles.profileImageContainer}>
                  <Image
                    source={
                      profileDetail?.petImageUrl
                        ? { uri: `${BASE_URL}${profileDetail.petImageUrl}` }
                        : require("../../assets/icon.png")
                    }
                    style={styles.modalImage}
                  />
                </View>

                <View style={styles.detailInfoContainer}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>🐾 이름</Text>
                    <Text style={styles.detailValue}>{profileDetail?.petName}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>🏷️ 견종</Text>
                    <Text style={styles.detailValue}>{profileDetail?.petBreedName}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>🎂 생일</Text>
                    <Text style={styles.detailValue}>{profileDetail?.petBirthDate}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>⚠️ 피해야 할 종</Text>
                    <Text style={styles.detailValue}>
                      {Array.isArray(profileDetail?.avoidBreeds) &&
                      profileDetail.avoidBreeds.length > 0
                        ? profileDetail.avoidBreeds.map((b) => b.name).join(", ")
                        : "없음"}
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={() => {
                      setEditModalVisible(true);
                      setDetailModalVisible(false);
                    }}
                  >
                    <Text style={styles.submitButtonText}>✏️ 수정</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handledelete}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ 삭제</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setDetailModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>닫기</Text>
                  </TouchableOpacity>
                </View>
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
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🐕 펫 프로필 추가</Text>
                <Text style={styles.modalSubtitle}>반려동물의 정보를 입력해주세요</Text>
              </View>

              <View style={styles.profileImageContainer}>
                <TouchableOpacity
                  style={styles.imageSelectBtn}
                  onPress={pickImage}
                >
                  <Text style={styles.imageSelectText}>📷 프로필 사진 선택</Text>
                </TouchableOpacity>

                {formData.petImageUrl?.uri && (
                  <Image
                    source={{ uri: formData.petImageUrl.uri }}
                    style={styles.modalImage}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🐾 이름</Text>
                <TextInput
                  style={styles.inputRequired}
                  placeholder="이름을 입력하세요"
                  value={formData.petName}
                  onChangeText={(text) => handleChange("petName", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🏷️ 견종</Text>
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
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🎂 생일</Text>
                <TextInput
                  style={styles.inputRequired}
                  placeholder="생일 (YYYY-MM-DD)"
                  value={formData.petBirthDate}
                  onChangeText={(text) => handleChange("petBirthDate", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>⚠️ 피해야 할 종</Text>
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
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>📝 기타 정보</Text>
                <TextInput
                  style={styles.input}
                  placeholder="기타 정보를 입력하세요 (선택)"
                  value={formData.extraInfo}
                  onChangeText={(text) => handleChange("extraInfo", text)}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddProfile}
                >
                  <Text style={styles.submitButtonText}>➕ 추가</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setAddModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
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
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>✏️ 펫 프로필 수정</Text>
              </View>

              <View style={styles.profileImageContainer}>
                <TouchableOpacity
                  style={styles.imageSelectBtn}
                  onPress={pickEditImage}
                >
                  <Text style={styles.imageSelectText}>📷 이미지 변경</Text>
                </TouchableOpacity>
                
                {editData.petImageUrl?.uri && (
                  <Image
                    source={{ uri: editData.petImageUrl.uri }}
                    style={styles.modalImage}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🐾 이름</Text>
                <TextInput
                  style={styles.inputRequired}
                  placeholder="이름을 입력하세요"
                  value={editData.petName}
                  onChangeText={(text) => handleEditData("petName", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🏷️ 견종</Text>
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
                  style={styles.dropdownRequired}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.dropdownPlaceholder}
                  zIndex={3000}
                  zIndexInverse={1000}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🎂 생일</Text>
                <TextInput
                  style={styles.inputRequired}
                  placeholder="생일 (YYYY-MM-DD)"
                  value={editData.petBirthDate}
                  onChangeText={(text) => handleEditData("petBirthDate", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>⚠️ 피해야 할 종</Text>
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
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>📝 기타 정보</Text>
                <TextInput
                  style={styles.input}
                  placeholder="기타 정보를 입력하세요 (선택)"
                  value={editData.extraInfo}
                  onChangeText={(text) => handleEditData("extraInfo", text)}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handlemodify}
                >
                  <Text style={styles.submitButtonText}>💾 저장</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
              </View>
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
    fontSize: 20,
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
    paddingVertical: 12, 
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 10,
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
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "90%",
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    marginBottom: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 4,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6C757D",
    textAlign: "center",
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  modalImage: {
    width: 120,
    height: 120,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#7EC8C2",
  },
  detailInfoContainer: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "column",
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 8,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#A8E6CF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#A8E6CF",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: "#2C3E50",
    fontSize: 14,
    fontWeight: "700",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#FFB3BA",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#FFB3BA",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonText: {
    color: "#2C3E50",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#D4D4D4",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#2C3E50",
    fontSize: 14,
    fontWeight: "600",
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
    marginBottom: 6,
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
    marginBottom: 8,
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
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
  },

  dropdownPlaceholder: {
    fontSize: 14,
    color: "#666",
  },
});

export default React.memo(PetProfile);
