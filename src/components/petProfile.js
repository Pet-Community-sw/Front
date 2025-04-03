//홈 화면 펫 프로필
import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Entypo, AntDesign } from '@expo/vector-icons';
import { UserContext } from "../context/User";
import { useModifyProfile, useRemoveProfile, useAddProfile, useViewProfile, useViewMyPet } from "../hooks/useProfile";
import { launchImageLibrary } from "react-native-image-picker";
import { viewMyPet } from "../api/profileApi";

const maxProfiles = 4;

const petProfile = () => {
  const [formData, setFormData] = useState({
    profileImageFile: "", 
    petBreed: "", 
    petBirthDate: "", 
    petName: "", 
    avoidBreeds: "", 
    extraInfo: "", 
  });

  const [selectRemove, setSelectRemove] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [profiles, setProfiles] = useState([]);

  const {mutate: modifyMutate} = useModifyProfile();
  const {mutate: removeMutate} = useRemoveProfile();
  const {mutate: addMutate} = useAddProfile();
  const {mutate: viewMutate} = useViewProfile();
  const {mutate: viewoneMutate} = useViewMyPet();

  const saveProfile = (response) => {
    setProfiles(response.data);
  }

  const handleChange = (field, value) => {
    setFormData({...formData, [field]: value});
  } 

  //프로필 조회
  useEffect(() => {
    viewMyPet(null, {
      onSuccess: (data) => setProfiles(data), 
      onError: (err) => Alert.alert("오류: ", err.message), 
    });
  }, []);


  const handlemodify = () => {

  };

  //프로필 추가
  const handlesave = () => {
    addMutate(formData, {
      onSuccess: () => {
        Alert.alert("프로필 추가 성공!");
        navigation.navigate("Home");
      }, 
      onError: (err) => {
        Alert.alert("프로필 등록 실패: " + err.message);
      }
    })
  };

  
  const handledelete = () => {
    alert("정말 삭제하시겠습니까?", [
      {text: "취소", style: "cancel"}, 
      {text: "삭제", 
        onPress: () => {
          removeMutate(profileId, {
            onSuccess: () => {
              alert("프로필이 삭제되었습니다.");
            }, 
            onError: (err) => {
              alert("오류: ", err.message);
            }, 
          });
        }, 
      }, 
    ]);
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

  return(
    <View style={styles.container}>
      <Text style={styles.title}>Your Pets</Text>
      <TouchableOpacity style={styles.modify} onPress={handlemodify}>
        <Entypo name="pencil" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.delete} onPress={handledelete}>
        <AntDesign name="delete" size={24} color="red" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.add} onPress={() => setModalVisible(true)}>
        <Entypo name="plus" size={24} color="black" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
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

            <Button title="추가하기" onPress={handlesave} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
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