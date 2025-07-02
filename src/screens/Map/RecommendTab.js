//지도 기반 산책 추천글, 산책 매칭 모달 이동
//마커 클릭 시 피드백, 함께 산책해요 탭으로 이동
//어떤 탭으로 보여줄지만 결정하는 역할.
//실제로 데이터 불러오는 탭은 FeedbackTab, WalkingTogetherTab
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { useFocusEffect } from '@react-navigation/native';
import {
  useViewLocation,
  useViewPlace,
  useViewRecommendPostDetail,
  useAddRecommend,
} from '../../hooks/useRecommend';
import { WalkingTogetherTab } from './WalkingTogetherTab';
import { FeedbackTab } from './FeedbackTab';
import { usePostComment } from '../../hooks/usePostComment';
import { useLikePost } from '../../hooks/useLikePost';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { debounce } from 'lodash';


Geocoder.init('AIzaSyDEkqUwJoRAryq55TTOLdG4IfCqYn7ooC8');

export default function RecommendTab() {
  const [region, setRegion] = useState({
    latitude: 37.648931,
    longitude: 127.064411,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [searchInput, setSearchInput] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [usePlaceMode, setUsePlaceMode] = useState(false);
  const [activeTab, setActiveTab] = useState('feedback');
  const [newComment, setNewComment] = useState('');
  const [like, setLike] = useState(false);
  const [writeModalVisible, setWriteModalVisible] = useState(false);
  const [selectingLocationVisible, setSelectingLocationVisible] = useState(false); // 모달 ON/OFF
  const [selectingLocation, setSelectingLocation] = useState({
    latitude: 37.648931,
    longitude: 127.064411,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  //산책길 추천 글
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [locationName, setLocationName] = useState("");

  const { mutate: addRecommendPost } = useAddRecommend();

  //지도 사각형 범위 계산 (지도 기반, 장소 검색 기반 동일)
  const { data: locationData = [], refetch: refetchLocation } = useViewLocation({
    minLatitude: region.latitude - region.latitudeDelta / 2,
    maxLatitude: region.latitude + region.latitudeDelta / 2,
    minLongitude: region.longitude - region.longitudeDelta / 2,
    maxLongitude: region.longitude + region.longitudeDelta / 2,
  });

  const { data: placeData = [], refetch: refetchPlace } = useViewPlace({
    latitude: region.latitude,
    longitude: region.longitude,
  });

  const { data: postDetail, refetch: refetchPostDetail } = useViewRecommendPostDetail(
    selectedPostId,
    { enabled: !!selectedPostId }
  );

  const { mutate: addComment } = usePostComment();
  const { mutate: toggleLike } = useLikePost();



  useFocusEffect(
    useCallback(() => {
      // 탭이 포커스될 때 region을 기본값으로 리셋
      setRegion({
        latitude: 37.648931,
        longitude: 127.064411,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setUsePlaceMode(false); // 검색 모드도 해제
    }, [])
  );

  useEffect(() => {
    if (postDetail) setLike(postDetail.like);
  }, [postDetail]);

  useFocusEffect(
    useCallback(() => {
      if (!usePlaceMode) refetchLocation();
    }, [usePlaceMode])
  );

  const handleSearch = async () => {
    if (!searchInput.trim()) return alert("장소를 입력해주세요.");
    try {
      const geo = await Geocoder.from(searchInput);
      const { lat, lng } = geo.results[0].geometry.location;
      setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 });
      await refetchPlace({ latitude: lat, longitude: lng });
      setUsePlaceMode(true);
      setSearchInput('');
      Keyboard.dismiss();
    } catch (err) {
      alert("장소를 찾을 수 없습니다.");
    }
  };

  const postList = usePlaceMode ? placeData : locationData;

  const debouncedRefetch = useCallback(
    debounce(() => {
      refetchLocation().then((res) => {
        console.log("🧪 [debounced] refetch 응답 결과:", res?.data ?? "없음");
      });
    }, 800),
    []
  );


  const handleRegionChange = (newRegion) => {
    const latMoved = Math.abs(newRegion.latitude - region.latitude) > 0.0005;
    const lngMoved = Math.abs(newRegion.longitude - region.longitude) > 0.0005;

    if (latMoved || lngMoved) {
      console.log("🧪 region 변화 감지:", newRegion);
      setRegion(newRegion);
      setUsePlaceMode(false);
      debouncedRefetch(); // ✅ 디바운스된 리패치 호출
    }
  };



  const handleSubmit = () => {
    if (!title || !content) {
      Alert.alert("제목과 내용을 입력해주세요.");
      return;
    }
    const postData = {
      locationLongitude: region.longitude,
      locationLatitude: region.latitude,
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

  useEffect(() => {
    Geocoder.from(region.latitude, region.longitude)
      .then((json) => {
        const address = json.results[0].formatted_address;
        setLocationName(address);
      })
      .catch((error) => console.warn(error));
  }, [region]);


  return (
    <View style={{ flex: 1 }}>
      {/* 검색창 */}
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

      <MapView
        provider="google"
        style={{ flex: 1 }}
        region={region}
        /*initialRegion={{
          latitude: 37.648931,
          longitude: 127.064411,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}*/
        onRegionChangeComplete={handleRegionChange}
      >
        {/* 마커 리스트 불러오기 */}
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
          />
        ))}

        {writeModalVisible && (
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title="선택한 위치"
          />
        )}
      </MapView>

      {/* 상세 정보 모달 */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <View style={{
            backgroundColor: '#fff',
            padding: 20,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '90%', // 원하는 높이 조절
          }}>
            {/* 탭 버튼 */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === "feedback" && styles.activeTab]}
                onPress={() => setActiveTab("feedback")}
              >
                <Text style={[styles.tabText, activeTab === "feedback" && styles.activeTabText]}>피드백</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === "walking" && styles.activeTab]}
                onPress={() => setActiveTab("walking")}
              >
                <Text style={[styles.tabText, activeTab === "walking" && styles.activeTabText]}>함께 산책해요</Text>
              </TouchableOpacity>
            </View>

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



      {/* 산책길 추천 추가 버튼 */}
      <TouchableOpacity
        onPress={() => setWriteModalVisible(true)}
        style={{
          position: 'absolute',
          bottom: 30,
          right: 20,
          backgroundColor: '#6A9C89',
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 24,
          elevation: 5,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>산책길 추천 추가</Text>
      </TouchableOpacity>

      {/* 등록 모달 */}
      <Modal visible={writeModalVisible} animationType="fade" transparent>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>산책길 추천 코스 추가</Text>

            {/* 위치 설정 버튼 */}
            <TouchableOpacity onPress={() => setSelectingLocationVisible(true)}>
              <Text style={{ color: "#4A90E2", marginBottom: 8 }}>
                📍 지도에서 위치 설정하기
              </Text>
              <Text style={{ color: "#444", marginBottom: 6 }}>
                📍 선택한 위치: {locationName || "불러오는 중..."}
              </Text>
            </TouchableOpacity>

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
              style={styles.closeBtn}
              onPress={() => setWriteModalVisible(false)}
            >
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 지도에서 위치 선택 모달 */}
      <Modal visible={selectingLocationVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            provider="google"
            style={{ flex: 1 }}
            region={selectingLocation}
            zoomControlEnabled={true} // ✅ 줌 버튼 보이기 (Android만)
            zoomEnabled={true}        // ✅ 터치 줌 허용
            scrollEnabled={true}
            /*initialRegion={{
              latitude: 37.648931,
              longitude: 127.064411,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}*/
            onRegionChangeComplete={(newRegion) => {
              setSelectingLocation(newRegion); // ✅ 사용자 조작에 따라 selectingLocation 업데이트
            }}
          />


          {/* 지도 움직이면서 마커 고정 */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginLeft: -24,
              marginTop: -48,
              zIndex: 10,
            }}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={48}
              color="red" // 원하는 색
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              setRegion(selectingLocation); // ✅ 메인 region으로 반영
              setSelectingLocationVisible(false);
            }}
            style={{
              backgroundColor: "#6A9C89",
              padding: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              이 위치로 선택
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setSelectingLocationVisible(false)}
          >
            <Text style={styles.closeText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

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
    zIndex: 10
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
    alignSelf: "center"
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 20,
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
  closeBtn: {
    marginTop: 10,
    alignItems: "center",
  },
  closeText: {
    color: "#666",
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
    fontFamily: "font",
    alignItems: "center",
    fontSize: 17,
    color: "#555",
  },
  activeTabText: {
    fontFamily: "fontExtra",
    alignItems: "center",
    color: "#6A9C89",
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

});
