import React, { useState } from "react";
import { Modal, View, TouchableOpacity, Text, StyleSheet } from "react-native";
import MapView from "react-native-maps";

const SelectLocationModal = ({
  visible,
  initialLocation,
  onSelectLocation,
  onClose,
}) => {
  const [tempLocation, setTempLocation] = useState(initialLocation);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: tempLocation.latitude,
            longitude: tempLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onRegionChangeComplete={(region) => {
            setTempLocation({
              latitude: region.latitude,
              longitude: region.longitude,
            });
          }}
        />

        {/* 중앙 고정 마커 */}
        <View style={styles.marker}>
          <Text style={{ fontSize: 32 }}>📍</Text>
        </View>

        {/* 버튼 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              onSelectLocation(tempLocation.latitude, tempLocation.longitude);
              onClose();
            }}
          >
            <Text style={styles.buttonText}>이 위치로 선택</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "gray" }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SelectLocationModal;

const styles = StyleSheet.create({
  marker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -12,
    marginTop: -24,
  },
  buttonRow: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#7EC8C2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
