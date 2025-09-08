import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const DelegateWriteModal = ({
  visible,
  title,
  setTitle,
  content,
  setContent,
  price,
  setPrice,
  scheduledTime,
  setDatePickerVisibility,
  isDatePickerVisible,
  handleConfirmDate,
  requireProfile,
  setRequireProfile,
  onSubmit,
  onClose,
  locationLatitude,
  locationLongitude,
  onOpenLocation, // 위치 선택 모달 열기
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalWrapper}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>대리 산책 글쓰기</Text>

          {/* 제목 */}
          <TextInput
            style={styles.input}
            placeholder="제목"
            value={title}
            onChangeText={setTitle}
          />

          {/* 내용 */}
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="내용"
            value={content}
            onChangeText={setContent}
            multiline
          />

          {/* 가격 */}
          <TextInput
            style={styles.input}
            placeholder="가격 (원)"
            keyboardType="number-pad"
            value={price}
            onChangeText={setPrice}
          />

          {/* 위치 선택 */}
          <TouchableOpacity style={styles.dateButton} onPress={onOpenLocation}>
            <Text>
              {locationLatitude && locationLongitude
                ? `위치: ${locationLatitude}, ${locationLongitude}`
                : "위치 선택"}
            </Text>
          </TouchableOpacity>

          {/* 날짜 선택 */}
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setDatePickerVisibility(true)}
          >
            <Text>
              {scheduledTime
                ? new Date(scheduledTime).toLocaleString()
                : "날짜/시간 선택"}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            onConfirm={handleConfirmDate}
            onCancel={() => setDatePickerVisibility(false)}
          />

          {/* 프로필 필수 여부 */}
          <View style={styles.row}>
            <Text style={{ marginRight: 8 }}>지원자 프로필 필수</Text>
            <Switch value={requireProfile} onValueChange={setRequireProfile} />
          </View>

          {/* 버튼들 */}
          <TouchableOpacity style={styles.button} onPress={onSubmit}>
            <Text style={styles.buttonText}>등록</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "gray" }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DelegateWriteModal;

const styles = StyleSheet.create({
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
    marginBottom: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  button: {
    backgroundColor: "#7EC8C2",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 6,
  },
  buttonText: { color: "white", fontWeight: "600" },
});
