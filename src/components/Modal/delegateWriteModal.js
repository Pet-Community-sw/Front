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
  allowedRadiusMeters,
  setAllowedRadiusMeters,
  locationName,
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🐕 대리 산책자 모집 글쓰기</Text>
            <Text style={styles.modalSubtitle}>반려동물 산책을 도와줄 분을 찾아보세요</Text>
          </View>

          {/* 제목 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📝 제목</Text>
            <TextInput
              style={styles.input}
              placeholder="모집글 제목을 입력하세요"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* 내용 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📄 내용</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="산책 요청 내용을 자세히 작성해주세요"
              value={content}
              onChangeText={setContent}
              multiline
            />
          </View>

          {/* 가격 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>💰 가격</Text>
            <TextInput
              style={styles.input}
              placeholder="예상 가격을 입력하세요"
              keyboardType="number-pad"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          {/* 위치 선택 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📍 위치</Text>
            <TouchableOpacity style={styles.locationButton} onPress={onOpenLocation}>
              <Text style={styles.locationButtonText}>
                {locationName || "📍 위치를 선택해주세요"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 허용 반경 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📏 허용 반경 (미터)</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 500"
              value={String(allowedRadiusMeters)}
              onChangeText={(value) => setAllowedRadiusMeters(value)}
              keyboardType="numeric"
            />
          </View>

          {/* 날짜 선택 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📅 산책 예정 시간</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setDatePickerVisibility(true)}
            >
              <Text style={styles.dateButtonText}>
                {scheduledTime
                  ? new Date(scheduledTime).toLocaleString()
                  : "📅 날짜/시간을 선택해주세요"}
              </Text>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            onConfirm={handleConfirmDate}
            onCancel={() => setDatePickerVisibility(false)}
          />

          {/* 프로필 필수 여부 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>👤 지원자 프로필 필수</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                {requireProfile ? "필수" : "선택사항"}
              </Text>
              <Switch 
                value={requireProfile} 
                onValueChange={setRequireProfile}
                trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
                thumbColor={requireProfile ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* 버튼들 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
              <Text style={styles.submitButtonText}>🐕 모집글 등록</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DelegateWriteModal;

const styles = StyleSheet.create({
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
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 4,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#6C757D",
    textAlign: "center",
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#FAFAFA",
    color: "#2C3E50",
  },
  textArea: {
    height: 60,
    textAlignVertical: "top",
  },
  locationButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FAFAFA",
  },
  locationButtonText: {
    fontSize: 14,
    color: "#2C3E50",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FAFAFA",
  },
  dateButtonText: {
    fontSize: 14,
    color: "#2C3E50",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 13,
    color: "#2C3E50",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 10,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#6C757D",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
