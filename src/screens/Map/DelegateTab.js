//지도 화면 대리 산책자 탭
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { 
  useAddDelegate, 
  useViewLocationDelegate, 
  useViewPlaceDelegate, 
  useViewDelegatePostDetail, 
  useModifyDelegatePost, 
  useRemoveDelegatePost, 
  useCheckProfile, 
  useApplicateDelegate, 
  useViewDelegateApplicants, 
  useSelectDelegateApplicant, 
  useAuthDelegateRecord, 
 } from '../../hooks/useDelegate';
 
 import { useViewProfile } from "../../hooks/useProfile";
 import { useProfileSession } from "../../context/SelectProfile";

export default function DelegateTab() {
  const [modalVisible, setModalVisible] = useState(false);
  const [writeModalVisible, setWriteModalVisible] = useState(false);
  const [selectProfileModalVisible, setSelectProfileModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [scheduledTime, setScheduledTime] = useState(null);
  const [limitCount, setLimitCount] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedPetProfileId, setSelectedPetProfileId] = useState(null);

  const { mutate: createDelegatePost } = useAddDelegate();
  const { data: profiles = [] } = useViewProfile();
  const { data: posts = [], refetch } = useViewLocationDelegate({});
  const { selectProfile } = useProfileSession();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const handleConfirmDate = (date) => {
    setScheduledTime(date);
    setDatePickerVisibility(false);
  };

  const handleSelectProfile = async () => {
    if (!selectedPetProfileId) return;
    try {
      await selectProfile(selectedPetProfileId);
      setSelectProfileModalVisible(false);
      setWriteModalVisible(true);
    } catch (error) {
      Alert.alert("오류", "프로필 선택에 실패했습니다.");
    }
  };

  const handleSubmit = () => {
    if (!scheduledTime || !limitCount) {
      Alert.alert("입력 오류", "날짜와 인원을 모두 입력하세요");
      return;
    }

    createDelegatePost(
      {
        scheduledTime: scheduledTime.toISOString(),
        limitCount: Number(limitCount),
      },
      {
        onSuccess: () => {
          Alert.alert("등록 완료", "게시글이 등록되었습니다");
          setWriteModalVisible(false);
          setScheduledTime(null);
          setLimitCount("");
          refetch();
        },
        onError: () => {
          Alert.alert("오류", "등록 실패");
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐕 대리 산책자</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setSelectProfileModalVisible(true)}
      >
        <Text style={styles.buttonText}>대리 산책 글 쓰기</Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.delegateWalkPostId?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              setSelectedPostId(item.delegateWalkPostId);
              setModalVisible(true);
            }}
          >
            <Text style={styles.meta}>{item.scheduledTime}</Text>
            <Text style={styles.meta}>작성자: {item.writerName}</Text>
          </TouchableOpacity>
        )}
      />

      {/* 프로필 선택 모달 */}
      <Modal visible={selectProfileModalVisible} animationType="slide" transparent>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>펫 선택</Text>
            {profiles.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={styles.card}
                onPress={() => setSelectedPetProfileId(profile.id)}
              >
                <Text>{profile.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.button} onPress={handleSelectProfile}>
              <Text style={styles.buttonText}>선택</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 글쓰기 모달 */}
      <Modal visible={writeModalVisible} animationType="slide" transparent>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>대리 산책 글쓰기</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setDatePickerVisibility(true)}
            >
              <Text>{scheduledTime ? scheduledTime.toLocaleString() : "날짜/시간 선택"}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="인원 수"
              keyboardType="number-pad"
              value={limitCount}
              onChangeText={setLimitCount}
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>등록</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  button: {
    backgroundColor: "#7EC8C2",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 6,
  },
  buttonText: { color: "white", fontWeight: "600" },
  card: {
    backgroundColor: "#F0F9F7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  meta: { fontSize: 14, color: "#333" },
  modalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
});
