import React, { useState, useEffect } from "react";
import { Modal, View, TouchableOpacity, Text, StyleSheet } from "react-native";
import MapView from "react-native-maps";
import Geocoder from "react-native-geocoding";

// Geocoder 초기화
Geocoder.init("AIzaSyDEkqUwJoRAryq55TTOLdG4IfCqYn7ooC8");

const SelectLocationModal = ({
  visible,
  initialLocation,
  onSelectLocation,
  onClose,
}) => {
  const [tempLocation, setTempLocation] = useState(initialLocation);
  const [locationName, setLocationName] = useState("");

  // 위치 좌표를 주소로 변환하는 함수
  const convertLocationToAddress = async (latitude, longitude) => {
    try {
      const response = await Geocoder.from(latitude, longitude);
      const address = response.results[0].formatted_address;
      setLocationName(address);
    } catch (error) {
      console.error("❌ 위치 변환 실패:", error);
      setLocationName("위치 정보를 가져올 수 없습니다.");
    }
  };

  // 위치가 변경될 때마다 주소 변환
  useEffect(() => {
    if (tempLocation.latitude && tempLocation.longitude) {
      convertLocationToAddress(tempLocation.latitude, tempLocation.longitude);
    }
  }, [tempLocation]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          region={{
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
  locationInfo: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  locationText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
});
