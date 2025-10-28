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
  const [showBubble, setShowBubble] = useState(true); // 말풍선 표시 여부 (기본값 true)

  // 🔹 위치 선택 및 작성 모드
  const [selectingLocationVisible, setSelectingLocationVisible] =
    useState(false); // 지도에서 위치 선택 모드
  const [selectedLocation, setSelectedLocation] = useState(region);
  const [writeModalVisible, setWriteModalVisible] = useState(false); // 추천글 작성 모달

  // 🔹 추천글 작성 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [locationName, setLocationName] = useState("");

  const mapRef = useRef(null);


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
    if (selectingLocationVisible) {
      // 위치 선택 모드일 때는 선택된 위치 업데이트
      handleSelectingRegion(newRegion);
    } else {
      // 일반 모드일 때는 기존 로직
      const latMoved = Math.abs(newRegion.latitude - region.latitude) > 0.0005;
      const lngMoved = Math.abs(newRegion.longitude - region.longitude) > 0.0005;
      if (latMoved || lngMoved) {
        setRegion(newRegion);
        setUsePlaceMode(false);
        debouncedRefetch();
      }
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
        <View style={styles.searchIconContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="원하시는 장소를 입력해주세요"
          value={searchInput}
          onChangeText={setSearchInput}
          placeholderTextColor="#9CA3AF"
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
            <View style={styles.customMarker}>
              <View style={[
                styles.markerIcon, 
                { backgroundColor: post.owner ? "#4A9B8E" : "#31326F" }
              ]}>
                <MaterialIcons 
                  name="pets" 
                  size={24} 
                  color="#FFFFFF" 
                />
              </View>
              <View style={styles.markerShadow} />
            </View>
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
            <MaterialCommunityIcons
              name="map-marker"
              size={50}
              color="#E53935"
            />
          </View>

          {/* 🔹 위치 선택 안내 카드 */}
          <View style={styles.locationSelectionCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="map-marker-radius" size={24} color="#7EC8C2" />
              <Text style={styles.cardTitle}>📍 위치 선택</Text>
            </View>
            <Text style={styles.cardDescription}>
              지도를 움직여서 산책길을 추가할 위치를 선택해주세요
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmLocation}
              >
                <MaterialCommunityIcons name="check" size={20} color="#fff" />
                <Text style={styles.confirmButtonText}>이 위치로 선택</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSelectingLocationVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={20} color="#666" />
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
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

      {/* 🔹 색깔 범례 */}
      {!selectingLocationVisible && !writeModalVisible && (
        <View style={styles.legendContainer}>
          <View style={styles.legendCard}>
            <Text style={styles.legendTitle}>마커 색깔 구분</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4A9B8E' }]} />
                <Text style={styles.legendText}>내가 쓴 글</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#31326F' }]} />
                <Text style={styles.legendText}>다른 사람이 쓴 글</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 🔹 귀여운 말풍선 */}
      {showBubble && !selectingLocationVisible && !writeModalVisible && (
        <View style={styles.bubbleContainer}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>🐕💕</Text>
            <Text style={styles.bubbleMessage}>
              산책길 코스 선택 후 {'\n'}산책 메이트를 찾아보세요!
            </Text>
            <TouchableOpacity 
              style={styles.bubbleCloseButton}
              onPress={() => setShowBubble(false)}
            >
              <Text style={styles.bubbleCloseText}>×</Text>
            </TouchableOpacity>
            <View style={styles.bubbleTail} />
          </View>
        </View>
      )}

      {/* 🔹 산책길 추가 버튼 */}
      {!selectingLocationVisible && !writeModalVisible && (
        <TouchableOpacity onPress={handleAddCourse} style={styles.addButton}>
          <Text style={styles.addButtonText}>산책길 코스 추가</Text>
        </TouchableOpacity>
      )}


      {/* 🔹 추천글 작성 모달 */}
      <Modal visible={writeModalVisible} animationType="slide" transparent>
        <View style={styles.writeModalWrapper}>
          <View style={styles.writeModalContent}>
            {/* 모달 헤더 */}
            <View style={styles.writeModalHeader}>
              <Text style={styles.writeModalTitle}>산책길 추천 코스 추가</Text>
              <TouchableOpacity 
                onPress={() => setWriteModalVisible(false)}
                style={styles.writeModalCloseButton}
              >
                <Text style={styles.writeModalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* 선택된 위치 표시 */}
            <View style={styles.selectedLocationCard}>
              <View style={styles.locationIcon}>
                <Text style={styles.locationEmoji}>📍</Text>
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>선택한 위치</Text>
                <Text style={styles.locationName}>
                  {locationName || "불러오는 중..."}
                </Text>
              </View>
            </View>

            {/* 입력 필드들 */}
            <View style={styles.inputSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>제목</Text>
                <TextInput
                  placeholder="산책길 제목을 입력하세요"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.writeTitleInput}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>내용</Text>
                <TextInput
                  placeholder="산책길에 대한 설명을 입력하세요"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={4}
                  style={styles.writeContentInput}
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* 버튼들 */}
            <View style={styles.writeButtonContainer}>
              <TouchableOpacity 
                style={styles.writeCancelButton} 
                onPress={() => setWriteModalVisible(false)}
              >
                <Text style={styles.writeCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.writeSubmitButton, (!title.trim() || !content.trim()) && styles.writeSubmitButtonDisabled]} 
                onPress={handleSubmit}
                disabled={!title.trim() || !content.trim()}
              >
                <Text style={styles.writeSubmitText}>등록하기</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 2,
    fontFamily: "font",
  },
  searchButton: {
    backgroundColor: "#7EC8C2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 8,
    shadowColor: "#7EC8C2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
  
  /* 📍 위치 선택 카드 스타일 */
  locationSelectionCard: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginLeft: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: "#6C757D",
    lineHeight: 18,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#7EC8C2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: "#7EC8C2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 4,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  cancelButtonText: {
    color: "#6C757D",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  
  /* 🐾 커스텀 마커 스타일 */
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  markerShadow: {
    width: 36,
    height: 18,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 18,
    marginTop: -6,
    zIndex: -1,
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
  
  // 🔹 말풍선 스타일
  bubbleContainer: {
    position: "absolute",
    top: 80,
    right: 20,
    zIndex: 1000,
  },
  bubble: {
    backgroundColor: "#FF6B9D",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    position: "relative",
  },
  bubbleText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 2,
  },
  bubbleMessage: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
  },
  bubbleCloseButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleCloseText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  bubbleTail: {
    position: "absolute",
    bottom: -6,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FF6B9D",
  },

  /* 📝 추천글 작성 모달 스타일 */
  writeModalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  writeModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  writeModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  writeModalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "cute",
  },
  writeModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  writeModalCloseText: {
    fontSize: 20,
    color: "#6B7280",
    fontWeight: "600",
  },
  selectedLocationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  locationEmoji: {
    fontSize: 20,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
    fontWeight: "500",
  },
  locationName: {
    fontSize: 18,
    color: "#1F2937",
    fontWeight: "600",
    fontFamily: "cute",
  },
  inputSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    fontFamily: "cute",
  },
  writeTitleInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
    fontFamily: "cute",
  },
  writeContentInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
    fontFamily: "cute",
    minHeight: 100,
  },
  writeButtonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  writeCancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  writeCancelText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: "cute",
  },
  writeSubmitButton: {
    flex: 2,
    backgroundColor: "#7EC8C2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#7EC8C2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  writeSubmitButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  writeSubmitText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "cute",
  },

  /* 🎨 색깔 범례 스타일 */
  legendContainer: {
    position: "absolute",
    top: 80,
    left: 16,
    zIndex: 10,
  },
  legendCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    fontFamily: "cute",
  },
  legendItems: {
    gap: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "cute",
  },

});
