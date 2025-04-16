//홈 화면 펫 프로필
import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image, ActivityIndicator, Alert, Button } from "react-native";
import { Entypo, AntDesign } from '@expo/vector-icons';
import { useModifyProfile, useRemoveProfile, useAddProfile, useViewMyPet, useViewProfile } from "../hooks/useProfile";
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { TextInput } from "react-native-gesture-handler";

const maxProfiles = 4;

const PetProfile = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  //각각의 프로필 데이터 구조 분해 할당
  const {data: profiles = []} = useViewProfile();
  const [selectProfile, setSelectProfile] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const { data: profileDetail, isLoading } = useViewMyPet(selectProfile?.profileId);

  //프로필 추가 데이터
  const [formData, setFormData] = useState({
    profileImageFile: "", 
    petName: "", 
    petBreed: "", 
    petBirthDate: "", 
    avoidBreeds: "", 
    extraInfo: ""
  });

   //프로필 수정 데이터
   const [editData, setEditData] = useState({
    profileImageFile: "", 
    petName: "", 
    petBreed: "", 
    petBirthDate: "", 
    avoidBreeds: "", 
    extraInfo: ""
  })

  const {mutate: modifyMutate} = useModifyProfile();
  const {mutate: removeMutate} = useRemoveProfile();
  const {mutate: addMutate} = useAddProfile();
  const {mutate: viewOneProfileMutate} = useViewMyPet();

  //선택한 프로필 id 가져옴
  useEffect(() => {
    if(selectProfile) {
      viewOneProfileMutate(selectProfile.profileId);
    }
  }, [selectProfile]);

  useEffect(() => {
    if(profileDetail) {
      setEditData({
        profileImageFile: profileDetail.profileImageFile || "", 
        petName: profileDetail.petName || "", 
        petBreed: profileDetail.petBreed || "", 
        petBirthDate: profileDetail.petBirthDate || "", 
        avoidBreeds: profileDetail.avoidBreeds || "", 
        extraInfo: profileDetail.extraInfo || ""
      })
    }
  }, [profileDetail])


  const handleChange = (field, value) => {
    setFormData({...formData, [field]: value});
  } 

  const handleEditData = (field, value) => {
    setEditData({...editData, [field]: value});
  }


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
        queryClient.invalidateQueries(["profiles"]);
        navigation.navigate("Home");
      }, 
      onError: (err) => {
        Alert.alert("프로필 수정 실패: ", err.message);
      }, 
    });
  };

  //프로필 추가
  //invalidateQueries 서버 데이터 연동
  const handlesave = () => {
    const profiles = queryClient.getQueryData(["profiles"] || []);
    if((profiles || []).length >= maxProfiles) return;
    addMutate(formData, {
      onSuccess: (data) => {
        Alert.alert(`프로필 추가 성공! Id: , ${data.profileId}`);
        queryClient.invalidateQueries(["profiles"]);  //프로필 목록 새로고침
        navigation.navigate("Home");
      }, 
      onError: (err) => {
        Alert.alert("프로필 등록 실패: " + err.message);
      }
    })
  };

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
      profileImageFile: imageUri,
    }));
  });
};

// 펫 이미지 수정
const pickEditImage = () => {
  handleImagePick((imageUri) => {
    setEditData((prevData) => ({
      ...prevData,
      profileImageFile: imageUri,
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
              queryClient.invalidateQueries(["profiles"]);  //프로필 목록 새로고침
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
      <Text style={styles.title}>Your Pets</Text>
      <TouchableOpacity style={styles.add} onPress={() => setAddModalVisible(true)}>
        <Entypo name="plus" size={24} color="black" />
      </TouchableOpacity>

        {/*프로필 목록, 프로필 이미지 리스트*/}
        <View style={styles.profileContainer}>
          {profiles.map((profile) => (
            <TouchableOpacity key={profile.profileId} onPress={() => openProfile(profile)}>
              <Image source={{uri: profile.profileImageFile}} style={styles.profileImage}></Image>
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
                <Image source = {{uri: profileDetail.profileImageFile}} style={styles.modalImage}></Image>
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
              onPress={handlesave} 
              disabled={profiles.length >= maxProfiles} 
              style={[styles.petAddButton, { backgroundColor: profiles.length >= maxProfiles ? "gray" : "#99BC85" }]}>
              <Text style={{ color: 'white', fontSize: 20, textAlign: 'center' }}>
                추가하기
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setAddModalVisible(false)} 
              style={[styles.petAddButton, { backgroundColor: "#FFC1B4" }]}>
              <Text style={{ color: 'white', fontSize: 20, textAlign: 'center' }}>
                Cancel
              </Text>
            </TouchableOpacity>
            </ScrollView> 
          </View>
        </View>
      </Modal>

      {/*프로필 수정 모달*/}
      <Modal animationType="slide" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
              <Text>펫 정보 수정</Text>
              <ScrollView style={{ maxHeight: '80%' }}>
              <Button title="이미지 변경" onPress={pickEditImage}></Button>
              <TextInput value={editData.petName} placeholder="pet name" onChangeText={(text) => handleEditData("petName", text)}></TextInput>
              <TextInput value={editData.petBreed} placeholder="pet breed" onChangeText={(text) => handleEditData("petBreed", text)}></TextInput>
              <TextInput value={editData.petBirthdate} placeholder="pet birthDate" onChangeText={(text) => handleEditData("petBirthDate", text)}></TextInput>
              <TextInput value={editData.avoidBreeds} placeholder="avoidBreeds" onChangeText={(text) => handleEditData("avoidBreeds", text)}></TextInput>
              <TextInput value={editData.extraInfo} placeholder="extraInfo" onChangeText={(text) => handleEditData("extraInfo", text)}></TextInput>
              <Button title={"저장"} onPress={handlemodify}></Button>
              <Button title={"닫기"} onPress={() => setEditModalVisible(false)}></Button>
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
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#fff",
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
    fontSize: 24,
    fontWeight: "700", 
    marginBottom: 16,
    color: "#333",
    textAlign: "left",  
    alignSelf: "flex-start",
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
    padding: 12,
    backgroundColor: "#ff9800",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    position: "absolute",
    right: 20,
    top: 20,
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