//홈 화면 펫 프로필
import React, { useContext, useEffect, useState, useFocusEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image, ActivityIndicator, Alert, Button } from "react-native";
import { Entypo, AntDesign } from '@expo/vector-icons';
import { useModifyProfile, useRemoveProfile, useAddProfile, useViewProfile, useViewOneProfile } from "../hooks/useProfile";
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { TextInput } from "react-native-gesture-handler";

const maxProfiles = 4;

const PetProfile = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  //각각의 프로필 데이터 구조 분해 할당
  const {data: profiles = [], refetch} = useViewProfile();
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

  const {mutate: modifyMutate} = useModifyProfile();
  const {mutate: removeMutate} = useRemoveProfile();
  const {mutate: addMutate} = useAddProfile();

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
  })

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
    if(selectProfile) {
      viewOneProfileMutate(selectProfile.profileId);
    }
  }, [selectProfile]);

  useEffect(() => {
    if(profileDetail) {
      setEditData({
        profileImageFile: profileDetail.petImageUrl || "", 
        petName: profileDetail.petName || "", 
        petBreed: profileDetail.petBreed || "", 
        petBirthDate: profileDetail.petBirthDate || "", 
        avoidBreeds: profileDetail.avoidBreeds || "", 
        extraInfo: profileDetail.extraInfo || ""
      })
    }
  }, [profileDetail])


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
  }

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
    const profiles = queryClient.getQueryData(["profiles"] || []);
    if((profiles || []).length >= maxProfiles) {
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
    })
  };

  useEffect(() => {
    if (addModalVisible) {
      resetData(); // 열릴 때도 무조건 초기화
    }
  }, [addModalVisible]);
  

// 공통 이미지 선택 함수
const handleImagePick = async (callback) => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permissionResult.status !== 'granted') {
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

// 펫 이미지 업로드
const pickImage = () => {
  handleImagePick((imageUri) => {
    setFormData((prevData) => ({
      ...prevData,
      petImageUrl: imageUri,
    }));
  });
};

// 펫 이미지 수정
const pickEditImage = () => {
  handleImagePick((imageUri) => {
    setEditData((prevData) => ({
      ...prevData,
      petImageUrl: imageUri,
    }));
  });
};


  //프로필 삭제
  const handledelete = () => {
    Alert.alert("정말 삭제하시겠습니까?", [
      {text: "취소", style: "cancel"}, 
      {text: "삭제", 
        onPress: () => {
          removeMutate(selectProfile.profileId, {
            onSuccess: () => {
              Alert.alert("프로필이 삭제되었습니다.");
              refetch();
            }, 
            onError: (err) => {
              alert("오류: ", err.message);
            }, 
          });
        }, 
      }, 
    ]);
  };


  return(
    <View style={styles.container}>
      <View style={{width: "100%", alignItems: "flex-start"}}>
      <Text style={styles.title}>Your Pets 💕</Text>
      </View>
      <TouchableOpacity style={styles.add} onPress={() => setAddModalVisible(true)}>
        <Entypo name="plus" size={24} color="#EC5228" />
      </TouchableOpacity>

        {/*프로필 목록, 프로필 이미지 리스트*/}
        <View style={styles.profileContainer}>
          {profiles.map((profile) => (
            <TouchableOpacity key={profile.profileId} onPress={() => openProfile(profile)}>
              <Image source={{uri: profile.petImageUrl}} style={styles.profileImage}></Image>
            </TouchableOpacity>
          ))}
        </View>

        {/*프로필 상세 보기 모달*/}
        <Modal animationType="slide" transparent={true} visible={detailModalVisible} onRequestClose={() => setDetailModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff"></ActivityIndicator>
              ): profileDetail ? (
                <ScrollView style={{ maxHeight: '80%' }}>
                <Image source = {{uri: profileDetail.petImageUrl}} style={styles.modalImage}></Image>
                <Text>이름: {profileDetail.petName}</Text>
                <Text>종: {profileDetail.petBreed}</Text>
                <Text>생일: {profileDetail.petBirthDate}</Text>
                <Text>피해야 하는 종: {profileDetail.avoidBreeds}</Text>
                <Text>기타사항: {profileDetail.extraInfo}</Text>
                <TouchableOpacity style={styles.modify} onPress={() => setEditModalVisible(true)}>
                 <Entypo name="pencil" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.delete} onPress={handledelete}>
                  <AntDesign name="delete" size={24} color="red" />
                </TouchableOpacity>
                <Button title="닫기" onPress={() => setDetailModalVisible(false)}></Button>
                </ScrollView>
              ) : (
                <Text>해당 프로필은 없습니다.</Text>
              )}
            </View>
          </View>
        </Modal>

      {/* 프로필 추가 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>펫 추가하기</Text>
            <ScrollView style={{ maxHeight: '80%' }}>
            <TouchableOpacity 
              onPress={pickImage}
              style={[styles.petAddButton, { backgroundColor: "#9ACBD0" }]}>
              <Text style={{ color: 'white', fontSize: 20, textAlign: 'center' }}>이미지 등록</Text>
            </TouchableOpacity>

             {/* 추가한 이미지 미리보기 */} 
            {formData.petImageUrl ? (
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: "#666", marginBottom: 6 }}>
                  선택된 파일: {formData.petImageUrl.split("/").pop()}
                </Text>
                <Image
                  source={{ uri: formData.petImageUrl }}
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
        
            <TextInput
              style={styles.input}
              placeholder="Pet Name"
              value={formData.petName}
              onChangeText={(text) => handleChange("petName", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Pet Breed"
              value={formData.petBreed}
              onChangeText={(text) => handleChange("petBreed", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Pet BirthDate"
              value={formData.petBirthDate}
              onChangeText={(text) => handleChange("petBirthDate", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="avoid Breeds"
              value={formData.avoidBreeds}
              onChangeText={(text) => handleChange("avoidBreeds", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="extra Info"
              value={formData.extraInfo}
              onChangeText={(text) => handleChange("extraInfo", text)}
            />

            <TouchableOpacity 
              onPress={handleAddProfile} 
              disabled={profiles.length >= maxProfiles} 
              style={[styles.petAddButton, { backgroundColor: profiles.length >= maxProfiles ? "gray" : "#99BC85" }]}>
              <Text style={{ color: 'white', fontSize: 20, textAlign: 'center' }}>
                추가
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {resetData(); setAddModalVisible(false)}} 
              style={[styles.petAddButton, { backgroundColor: "#FFC1B4" }]}>
              <Text style={{ color: 'white', fontSize: 20, textAlign: 'center' }}>
                취소
              </Text>
            </TouchableOpacity>
            </ScrollView> 
          </View>
        </View>
      </Modal>

      {/*프로필 수정 모달*/}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text>펫 정보 수정</Text>
            <ScrollView style={{ maxHeight: "80%" }}>
              <Button title="이미지 변경" onPress={pickEditImage} />

              {/* 추가한 이미지 미리보기 */}
              {editData.petImageUrl ? (
                <View style={{ alignItems: "center", marginVertical: 10 }}>
                  <Text style={{ color: "#666", marginBottom: 6 }}>
                    선택된 파일: {editData.petImageUrl.split("/").pop()}
                  </Text>
                  <Image
                    source={{ uri: editData.petImageUrl }}
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

              <TextInput
                value={editData.petName}
                placeholder="pet name"
                onChangeText={(text) => handleEditData("petName", text)}
              />
              <TextInput
                value={editData.petBreed}
                placeholder="pet breed"
                onChangeText={(text) => handleEditData("petBreed", text)}
              />
              <TextInput
                value={editData.petBirthDate}
                placeholder="pet birthDate"
                onChangeText={(text) => handleEditData("petBirthDate", text)}
              />
              <TextInput
                value={editData.avoidBreeds}
                placeholder="avoidBreeds"
                onChangeText={(text) => handleEditData("avoidBreeds", text)}
              />
              <TextInput
                value={editData.extraInfo}
                placeholder="extraInfo"
                onChangeText={(text) => handleEditData("extraInfo", text)}
              />
              <Button title={"저장"} onPress={handlemodify} />
              <Button title={"취소"} onPress={() => {resetEditData(); setEditModalVisible(false)}} />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  )
}

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
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    height: "60", 
    
  }, 
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    marginHorizontal: 10,
    borderWidth: 3,
    borderColor: "#ff9800",
  }, 
  modalImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
    borderRadius: 16,
    marginBottom: 20,
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
  modify: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginVertical: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
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
  delete: {
    padding: 12,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    marginVertical: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  }, 
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
    detailText: {
    fontSize: 16,
    marginBottom: 12,
    color: "#333",
    fontWeight: "500",
  },
  detailLabel: {
    fontWeight: "700",
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: "#ff9800",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  saveButtonText: {
    color: "#fff",
  },
  cancelButtonText: {
    color: "#666",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
    petAddButton: {
      marginBottom: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    }
  });
  

export default PetProfile;