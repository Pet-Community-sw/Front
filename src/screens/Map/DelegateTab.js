// screens/DelegateTab.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import {
  useAddDelegate,
  useViewLocationDelegate,
} from "../../hooks/useDelegate";
import { useViewProfile } from "../../hooks/useProfile";
import { useProfileSession } from "../../context/SelectProfile";

import DelegateWriteModal from "../../components/Modal/delegateWriteModal";
import SelectLocationModal from "../../components/Modal/selectLocationModal";

export default function DelegateTab() {
  // 📌 기본 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [writeModalVisible, setWriteModalVisible] = useState(false);
  const [selectProfileModalVisible, setSelectProfileModalVisible] =
    useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPetProfileId, setSelectedPetProfileId] = useState(null);

  // 📌 글쓰기 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");
  const [scheduledTime, setScheduledTime] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [requireProfile, setRequireProfile] = useState(false);

  // 📌 위치 선택 상태
  const [locationLatitude, setLocationLatitude] = useState(null);
  const [locationLongitude, setLocationLongitude] = useState(null);
  const [allowedRadiusMeters, setAllowedRadiusMeters] = useState("");
  const [selectLocationVisible, setSelectLocationVisible] = useState(false);

  // 📌 API Hooks
  const { mutate: createDelegatePost } = useAddDelegate();
  const { data: profiles = [] } = useViewProfile();
  const { data: posts = [], refetch } = useViewLocationDelegate({});
  const { selectProfile } = useProfileSession();

  // 📌 탭 진입 시 글 목록 새로고침
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  // 📌 날짜 선택
  const handleConfirmDate = (date) => {
    setScheduledTime(date);
    setDatePickerVisibility(false);
  };

  // 📌 프로필 선택
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

  // 📌 글 등록
  const handleSubmit = () => {
    if (
      !title ||
      !content ||
      !price ||
      !scheduledTime ||
      !locationLatitude ||
      !locationLongitude
    ) {
      Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
      return;
    }

    createDelegatePost(
      {
        profileId: selectedPetProfileId,
        title,
        content,
        price: Number(price),
        locationLongitude: Number(locationLongitude),
        locationLatitude: Number(locationLatitude),
        allowedRadiusMeters: Number(allowedRadiusMeters) || 500,
        scheduledTime: scheduledTime.toISOString(),
        requireProfile,
      },
      {
        onSuccess: () => {
          Alert.alert("등록 완료", "게시글이 등록되었습니다");
          setWriteModalVisible(false);
          resetForm();
          refetch();
        },
        onError: () => {
          Alert.alert("오류", "등록 실패");
        },
      }
    );
  };

  // 📌 폼 초기화
  const resetForm = () => {
    setTitle("");
    setContent("");
    setPrice("");
    setScheduledTime(null);
    setLocationLatitude(null);
    setLocationLongitude(null);
    setAllowedRadiusMeters("");
    setRequireProfile(false);
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

      {/* 글 목록 */}
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
      <Modal
        visible={selectProfileModalVisible}
        animationType="slide"
        transparent
      >
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
            <TouchableOpacity
              style={styles.button}
              onPress={handleSelectProfile}
            >
              <Text style={styles.buttonText}>선택</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setSelectProfileModalVisible(false)}
            >
              <Text style={styles.buttonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 글쓰기 모달 */}
      <DelegateWriteModal
        visible={writeModalVisible}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        price={price}
        setPrice={setPrice}
        scheduledTime={scheduledTime}
        setDatePickerVisibility={setDatePickerVisibility}
        isDatePickerVisible={isDatePickerVisible}
        handleConfirmDate={handleConfirmDate}
        requireProfile={requireProfile}
        setRequireProfile={setRequireProfile}
        onSubmit={handleSubmit}
        onClose={() => setWriteModalVisible(false)}
        locationLatitude={locationLatitude}
        locationLongitude={locationLongitude}
        onOpenLocation={() => setSelectLocationVisible(true)}
      />

      {/* 위치 선택 모달 */}
      <SelectLocationModal
        visible={selectLocationVisible}
        initialLocation={{ latitude: 37.49794, longitude: 127.02758 }}
        onSelectLocation={(lat, lng) => {
          setLocationLatitude(lat);
          setLocationLongitude(lng);
        }}
        onClose={() => setSelectLocationVisible(false)}
      />

      {/* 날짜 선택 모달 */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </View>
  );
}

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
});
