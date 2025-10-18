// 지도 기반 산책 추천글 & 산책 매칭 탭 이동
// 마커 클릭 시 피드백 / 함께 산책해요 탭으로 이동
// 실제 데이터 로드는 FeedbackTab, WalkingTogetherTab이 담당

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import { useFocusEffect } from "@react-navigation/native";
import {
  useViewLocation,
  useViewPlace,
  useViewRecommendPostDetail,
  useAddRecommend,
} from "../../hooks/useRecommend";
import { WalkingTogetherTab } from "./WalkingTogetherTab";
import { FeedbackTab } from "./FeedbackTab";
import { usePostComment } from "../../hooks/usePostComment";
import { useLikePost } from "../../hooks/useLikePost";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { debounce } from "lodash";

Geocoder.init("AIzaSyDEkqUwJoRAryq55TTOLdG4IfCqYn7ooC8");

export default function RecommendTab() {
  // 🔹 지도 기본 좌표 상태
  const [region, setRegion] = useState({
    latitude: 37.648931,
    longitude: 127.064411,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // 🔹 UI 상태
  const [searchInput, setSearchInput] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); // 게시글 상세 모달
  const [usePlaceMode, setUsePlaceMode] = useState(false); // 장소 검색 모드 여부
  const [activeTab, setActiveTab] = useState("feedback"); // 탭 (피드백 / 함께 산책)
  const [like, setLike] = useState(false); // 좋아요 상태

  // 🔹 위치 선택 및 작성 모드
  const [selectingLocationVisible, setSelectingLocationVisible] =
    useState(false); // 지도에서 위치 선택 모드
  const [selectedLocation, setSelectedLocation] = useState(region);
  const [writeModalVisible, setWriteModalVisible] = useState(false); // 추천글 작성 모달

  // 🔹 추천글 작성 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [locationName, setLocationName] = useState("");

  const mapRef = useRef < MapView > null;

  // 🔹 API Hooks
  const { mutate: addRecommendPost } = useAddRecommend();
  const { mutate: addComment } = usePostComment();
  const { mutate: toggleLike } = useLikePost();

  // 🔹 지도 내 마커 조회 API
  const { data: locationData = [], refetch: refetchLocation } = useViewLocation(
    {
      minLatitude: region.latitude - region.latitudeDelta / 2,
      maxLatitude: region.latitude + region.latitudeDelta / 2,
      minLongitude: region.longitude - region.longitudeDelta / 2,
      maxLongitude: region.longitude + region.longitudeDelta / 2,
    }
  );

  // 🔹 장소 검색 결과 API
  const { data: placeData = [], refetch: refetchPlace } = useViewPlace({
    latitude: region.latitude,
    longitude: region.longitude,
  });

  // 🔹 게시글 상세 조회 API
  const { data: postDetail } = useViewRecommendPostDetail(selectedPostId, {
    enabled: !!selectedPostId,
  });

  // ✅ 탭 포커스 시 지도 초기화
  useFocusEffect(
    useCallback(() => {
      setRegion({
        latitude: 37.648931,
        longitude: 127.064411,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setUsePlaceMode(false);
    }, [])
  );

  // ✅ 게시글 상세 데이터 변경 시 좋아요 반영
  useEffect(() => {
    if (postDetail) setLike(postDetail.like);
  }, [postDetail]);

  // ✅ 탭 포커스 시 지도 데이터 갱신
  useFocusEffect(
    useCallback(() => {
      if (!usePlaceMode) refetchLocation();
    }, [usePlaceMode])
  );

  // 🔹 장소 검색 (지오코딩 → 좌표 이동)
  const handleSearch = async () => {
    if (!searchInput.trim()) return alert("장소를 입력해주세요.");
    try {
      const geo = await Geocoder.from(searchInput);
      const { lat, lng } = geo.results[0].geometry.location;
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      await refetchPlace({ latitude: lat, longitude: lng });
      setUsePlaceMode(true);
      setSearchInput("");
      Keyboard.dismiss();
    } catch {
      alert("장소를 찾을 수 없습니다.");
    }
  };

  const postList = usePlaceMode ? placeData : locationData;

  // 🔹 지도 이동 시 디바운스로 데이터 리패치
  const debouncedRefetch = useCallback(
    debounce(() => {
      refetchLocation();
    }, 800),
    []
  );

  const handleRegionChange = (newRegion) => {
    const latMoved = Math.abs(newRegion.latitude - region.latitude) > 0.0005;
    const lngMoved = Math.abs(newRegion.longitude - region.longitude) > 0.0005;
    if (latMoved || lngMoved) {
      setRegion(newRegion);
      setUsePlaceMode(false);
      debouncedRefetch();
    }
  };

  // 🔹 선택 중인 지도 좌표 업데이트
  const handleSelectingRegion = (newRegion) => {
    if (selectingLocationVisible) setSelectedLocation(newRegion);
  };

  // 🔹 선택된 좌표 → 주소 변환
  useEffect(() => {
    if (selectingLocationVisible) {
      Geocoder.from(selectedLocation.latitude, selectedLocation.longitude)
        .then((json) => {
          const address = json.results[0].formatted_address;
          setLocationName(address);
        })
        .catch((error) => console.warn(error));
    }
  }, [selectedLocation, selectingLocationVisible]);

  // 🔹 산책길 추가 → 지도에서 위치 선택
  const handleAddCourse = () => {
    setSelectingLocationVisible(true);
  };

  // 🔹 “이 위치로 선택” → 작성 모달 열기
  const handleConfirmLocation = () => {
    setSelectingLocationVisible(false);
    setWriteModalVisible(true);
  };

  // 🔹 추천글 등록
  const handleSubmit = () => {
    if (!title || !content) {
      Alert.alert("제목과 내용을 입력해주세요.");
      return;
    }
    const postData = {
      locationLongitude: selectedLocation.longitude,
      locationLatitude: selectedLocation.latitude,
      locationName: locationName || "사용자 선택 위치",
      content,
      title,
    };
    addRecommendPost(postData, {
      onSuccess: () => {
        Alert.alert("등록 완료", "산책길 추천이 등록되었습니다.");
        setWriteModalVisible(false);
        setTitle("");
        setContent("");
        refetchLocation();
      },
      onError: () => {
        Alert.alert("등록 실패", "다시 시도해주세요.");
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 🔹 상단 검색창 */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="📍 원하시는 장소를 입력해주세요"
          value={searchInput}
          onChangeText={setSearchInput}
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 지도 본체 */}
      <MapView
        provider="google"
        style={{ flex: 1 }}
        region={selectingLocationVisible ? selectedLocation : region}
        zoomControlEnabled
        zoomEnabled
        onRegionChangeComplete={handleRegionChange}
      >
        {/* 🔹 추천글 마커 표시 */}
        {postList.map((post) => (
          <Marker
            key={post.recommendRoutePostId}
            coordinate={{
              latitude: Number(post.locationLatitude),
              longitude: Number(post.locationLongitude),
            }}
            title={post.title}
            description={post.memberName}
            onPress={() => {
              setSelectedPostId(post.recommendRoutePostId);
              setModalVisible(true);
            }}
            tracksViewChanges={false}
          >
            <MaterialIcons name="place" size={40} color="#31326F" />
          </Marker>
        ))}
      </MapView>

     
{/* ✅ 중앙 고정 마커 (지도 밖 오버레이로 추가) */}
{selectingLocationVisible && (
  <>
    <View
      pointerEvents="none" // 지도 드래그 막지 않음
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -20 }, { translateY: -40 }],
        zIndex: 10,
      }}
    >
      <MaterialCommunityIcons name="map-marker" size={50} color="#E53935" />
    </View>

    {/* 🔹 위치 선택 안내 / 버튼 */}
    <View style={styles.overlayBottom}>
      <Text style={styles.overlayText}>
        📍 지도를 움직여 위치를 선택하세요
      </Text>
      <TouchableOpacity
        style={styles.applyBtn}
        onPress={handleConfirmLocation}
      >
        <Text style={styles.applyText}>이 위치로 선택</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginTop: 10 }}
        onPress={() => setSelectingLocationVisible(false)}
      >
        <Text style={styles.closeBtn}>닫기</Text>
      </TouchableOpacity>
    </View>
  </>
)}

      {/* 🔹 추천글 상세 모달 */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalInner}>
            {/* 탭 전환 */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === "feedback" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("feedback")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "feedback" && styles.activeTabText,
                  ]}
                >
                  피드백
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === "walking" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("walking")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "walking" && styles.activeTabText,
                  ]}
                >
                  함께 산책해요
                </Text>
              </TouchableOpacity>
            </View>

            {/* 탭 내용 */}
            <View style={{ minHeight: 500 }}>
              {activeTab === "feedback" && selectedPostId && (
                <FeedbackTab recommendRoutePostId={selectedPostId} />
              )}
              {activeTab === "walking" && selectedPostId && (
                <WalkingTogetherTab recommendRoutePostId={selectedPostId} />
              )}
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeArea}
            >
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🔹 산책길 추가 버튼 */}
      {!selectingLocationVisible && !writeModalVisible && (
        <TouchableOpacity onPress={handleAddCourse} style={styles.addButton}>
          <Text style={styles.addButtonText}>산책길 코스 추가</Text>
        </TouchableOpacity>
      )}

      {/* 🔹 추천글 작성 모달 */}
      <Modal visible={writeModalVisible} animationType="fade" transparent>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>산책길 추천 코스 추가</Text>
            <Text style={{ color: "#444", marginBottom: 6 }}>
              📍 선택한 위치: {locationName || "불러오는 중..."}
            </Text>

            <TextInput
              placeholder="제목을 입력하세요"
              value={title}
              onChangeText={setTitle}
              style={styles.titleInput}
            />
            <TextInput
              placeholder="내용을 입력하세요"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              style={styles.contentInput}
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleSubmit}>
              <Text style={styles.applyText}>등록</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={() => setWriteModalVisible(false)}
            >
              <Text style={{ color: "#666" }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ===================== 🎨 스타일 ===================== //
const styles = StyleSheet.create({
  searchBox: {
    position: "absolute",
    top: 15,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 4,
  },
  searchButton: {
    backgroundColor: "#8DB596",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: "20%",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 15,
    alignSelf: "center",
  },
  overlayTop: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  overlayText: {
    fontSize: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    color: "#333",
  },
  overlayBottom: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: "#6A9C89",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    elevation: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalInner: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: "#6A9C89",
  },
  tabText: {
    fontSize: 17,
    color: "#555",
  },
  activeTabText: {
    color: "#6A9C89",
    fontWeight: "bold",
  },
  closeArea: {
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#eee",
  },
  closeText: {
    fontWeight: "bold",
    color: "#444",
  },
  closeBtn: {
    marginTop: 10,
    alignItems: "center",
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  applyBtn: {
    backgroundColor: "#6A9C89",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyText: {
    color: "white",
    fontSize: 16,
  },
  titleInput: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 12,
  },
  contentInput: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    height: 100,
    textAlignVertical: "top",
    marginBottom: 12,
  },
});
