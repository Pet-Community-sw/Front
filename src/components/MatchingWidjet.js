import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { usePetContext } from "../context/PetProfiles";

const MatchingWidget = () => {
  const { petProfiles: pets } = usePetContext();
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [desiredArea, setDesiredArea] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>산책 매칭</Text>

      {/* 희망 동네 입력 + 펫 선택 토글 버튼 나란히 */}
      <View style={styles.row}>
        {/* 희망 동네 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>희망 동네</Text>
          <TextInput
            placeholder="예: 송파구 잠실동"
            style={styles.input}
            value={desiredArea}
            onChangeText={setDesiredArea}
          />
        </View>

        {/* 산책할 펫 선택 */}
        <View style={styles.toggleSection}>
          <Text style={styles.label}>산책할 펫 선택</Text>
          {pets.length === 0 ? (
            <Text style={{ marginTop: 10 }}>등록된 펫이 없습니다 🐾</Text>
          ) : (
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
          )}
        </View>
      </View>

      {/* 매칭 신청 버튼 */}
      <TouchableOpacity
        style={styles.matchButton}
        onPress={() => {
          if (!desiredArea || !selectedPetId) {
            alert("희망 동네와 펫을 모두 선택해 주세요!");
            return;
          }
          console.log("✅ 신청됨:", { desiredArea, selectedPetId });
        }}
      >
        <Text style={styles.matchButtonText}>매칭 신청</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700", 
    color: "#333",
    textAlign: "left",  
    alignSelf: "flex-start",
    width: "100%", 
    paddingLeft: 0, 
    marginLeft: -25, 
    marginTop: -20, 
  }, 
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  inputSection: {
    flex: 1,
    minWidth: 140,
    marginTop: 15, 
    marginLeft: -20, 
  },
  toggleSection: {
    flex: 1,
    minWidth: 150,
    marginTop: 15, 
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: -10
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
    backgroundColor: "#015551",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    alignSelf: "center",
  },
  matchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default MatchingWidget;
