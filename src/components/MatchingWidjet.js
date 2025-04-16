import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const MatchingWidget = ({ pets = [] }) => {
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [desiredArea, setDesiredArea] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>산책 매칭</Text>

      {/* 희망 동네 입력 */}
      <Text style={styles.label}>희망 동네</Text>
      <TextInput
        placeholder="예: 송파구 잠실동"
        style={styles.input}
        value={desiredArea}
        onChangeText={setDesiredArea}
      />

      {/* 펫 프로필 선택 */}
      <Text style={styles.label}>산책할 펫 선택</Text>
      <View style={styles.toggleGroup}>
        {pets.map((pet) => (
          <TouchableOpacity
            key={pet.profileId}
            style={[
              styles.toggleButton,
              selectedPetId === pet.profileId && styles.toggleButtonSelected,
            ]}
            onPress={() => setSelectedPetId(pet.profileId)}
          >
            <Text
              style={[
                styles.toggleText,
                selectedPetId === pet.profileId && styles.toggleTextSelected,
              ]}
            >
              {pet.petName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 매칭 신청 버튼 */}
      <TouchableOpacity style={styles.matchButton} onPress={() => {
        if (!desiredArea || !selectedPetId) {
          alert("희망 동네와 펫을 모두 선택해 주세요!");
          return;
        }
        // 매칭 신청 로직 연결 예정
        console.log("✅ 신청됨:", { desiredArea, selectedPetId });
      }}>
        <Text style={styles.matchButtonText}>매칭 신청</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    marginRight: 8,
    marginBottom: 8,
  },
  toggleButtonSelected: {
    backgroundColor: "#6A9C89",
    borderColor: "#6A9C89",
  },
  toggleText: {
    color: "#333",
    fontWeight: "500",
  },
  toggleTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  matchButton: {
    marginTop: 20,
    backgroundColor: "#6A9C89",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  matchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default MatchingWidget;
