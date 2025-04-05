//홈 화면 펫 프로필
import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ActivityIndicator } from "react-native";
import { Entypo, AntDesign } from '@expo/vector-icons';
import { useModifyProfile, useRemoveProfile, useAddProfile, useViewMyPet, useViewProfile } from "../hooks/useProfile";
import { launchImageLibrary } from "react-native-image-picker";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { TextInput } from "react-native-gesture-handler";

const maxProfiles = 4;

const petProfile = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  //각각의 프로필 데이터 구조 분해 할당
  const {data: profiles = []} = useViewProfile();
  const [selectProfile, setSelectProfile] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  //수정할 것들
  const [editName, setEditName] = useState(profileDatail.petName || "");
  const [editBreed, setEditBreed] = useState(profileDatail.petBreed || "");
  const [editBirthdate, setEditBirthdate] = useState(profileDatail.petBirthDate || "");
  const [editAvoidBreeds, setEditAvoidBreeds] = useState(profileDatail.avoidBreeds || "");
  const [editExtraInfo, setEditExtraInfo] = useState(profileDatail.extraInfo || "");

  const { data: profileDatail, isLoading } = useViewMyPet(selectProfile?.profileId);

  const [formData, setFormData] = useState({
    profileImageFile: "", 
    petBreed: "", 
    petBirthDate: "", 
    petName: "", 
    avoidBreeds: "", 
    extraInfo: "", 
  });

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


  const handleChange = (field, value) => {
    setFormData({...formData, [field]: value});
  } 

  /*
  const handleEdit = () => {
    if (!profileDetail) return;
  
    const updatedData = {};
  
    if (editName !== profileDetail.petName) updatedData.petName = editName;
    if (editBreed !== profileDetail.petBreed) updatedData.petBreed = editBreed;
    if (editBirthDate !== profileDetail.petBirthDate) updatedData.petBirthDate = editBirthDate;
  
    if (Object.keys(updatedData).length === 0) {
      Alert.alert("변경된 내용이 없습니다.");
      return;
    }
  
    modifyMutate({ profileId: profileDetail.profileId, ...updatedData }, {
      onSuccess: () => {
        Alert.alert("수정 완료!");
        setEditModalVisible(false); // 수정 모달 닫기
      }
    });
  };*/

  //프로필 클릭 시 모달 열음
  const openProfile = (profile) => {
    setSelectProfile(profile);  //useEffect 실행
    setDetailModalVisible(true);
  }

  //프로필 추가
  //invalidateQueries 서버 데이터 연동
  const handlesave = () => {
    const profiles = queryClient.getQueryData(["profiles"] || []);
    if(profiles.length >= maxProfiles) return;
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

   //펫 이미지 사진 업로드
   const pickImage = () => {
    launchImageLibrary({mediaType: "photo"}, (response) => {{
      if (response.didCancel) {
        console.log("사용자가 선택을 취소함"); 
      } else if (response.errorMessage) {
        console.error("에러 발생:", response.errorMessage);  
      } else if (response.assets && response.assets.length > 0) {
        setFormData((prevData) => ({
          ...prevData, 
          profileImageFile: response.assets[0].uri,
        }));
      }
    }});
  }

  //프로필 삭제
  const handledelete = () => {
    alert("정말 삭제하시겠습니까?", [
      {text: "취소", style: "cancel"}, 
      {text: "삭제", 
        onPress: () => {
          removeMutate(selectProfile.profileId, {
            onSuccess: () => {
              alert("프로필이 삭제되었습니다.");
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

        {/*프로필 목록*/}
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
              ): profileDatail ? (
                <>
                <Image source = {{uri: profileDatail.profileImage}} style={styles.modalImage}></Image>
                <Text>이름: {profileDatail.petName}</Text>
                <Text>종: {profileDatail.petBreed}</Text>
                <Text>생일: {profileDatail.petBirthDate}</Text>
                <TouchableOpacity style={styles.modify} onPress={handlemodify}>
                 <Entypo name="pencil" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.delete} onPress={handledelete}>
                  <AntDesign name="delete" size={24} color="red" />
                </TouchableOpacity>
                <Button title="닫기" onPress={() => setDetailModalVisible(false)}></Button>
                </>
              ) : (
                <Text>해당 프로필은 없습니다.</Text>
              )}
            </View>
          </View>
        </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>펫 추가하기</Text>

            <Button title="이미지 등록하기" onPress={pickImage}></Button>
        
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

            <Button title="추가하기" onPress={handlesave} disabled={profiles.length >= maxProfiles} color={profiles.length >= maxProfiles ? "gray" : "orange"}/>
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      {/*프로필 수정 모달*/}
      <Modal animationType="slide" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
              <Text>펫 정보 수정</Text>
              <TextInput value={editName} placeholder="pet name" onChangeText={setEditName}></TextInput>
              <TextInput value={editBreed} placeholder="pet breed" onChangeText={setEditBreed}></TextInput>
              <TextInput value={editBirthdate} placeholder="pet birthdate" onChangeText={setEditBirthdate}></TextInput>
              <TextInput value={editAvoidBreeds} placeholder="avoidBreeds" onChangeText={setEditAvoidBreeds}></TextInput>
              <TextInput value={editExtraInfo} placeholder="extraInfo" onChangeText={setEditExtraInfo}></TextInput>
              <Button title={"저장"} onPress={handleEdit}></Button>
              <Button title={"닫기"} onPress={() => setEditModalVisible(false)}></Button>
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
  }, 
  profileContainer: {

  }, 
  profileImage: {

  }, 
  modalImage: {

  }, 

  title: {
    fontWeight: "bold", 
  }, 
  modify: {
    padding: 10,
  }, 
  add: {
    padding: 10, 
  }, 
  delete: {
    padding: 10, 
  }, 
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 투명한 배경
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 8,
  },
});

export default petProfile;